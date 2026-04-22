import { sql } from './db/client';
import { format, subDays, differenceInDays } from 'date-fns';

export function calculateStreak(progressDates: string[]) {
  if (progressDates.length === 0) return { current: 0, best: 0 };

  const sortedDates = Array.from(new Set(progressDates))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i]);
      const next = new Date(sortedDates[i + 1]);
      if (differenceInDays(current, next) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Best streak
  for (let i = 0; i < sortedDates.length; i++) {
    tempStreak = 1;
    for (let j = i; j < sortedDates.length - 1; j++) {
      const current = new Date(sortedDates[j]);
      const next = new Date(sortedDates[j + 1]);
      if (differenceInDays(current, next) === 1) {
        tempStreak++;
      } else {
        break;
      }
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;
  }

  return { current: currentStreak, best: bestStreak };
}

export async function checkAndGrantBadges(userId: string) {
  try {
    // 1. Fetch user data for badge logic
    const books = await sql`SELECT * FROM books WHERE user_id = ${userId}`;
    const completedBooks = books.filter(b => b.finish_reading_date).length;
    
    const progress = await sql`SELECT * FROM reading_progress WHERE user_id = ${userId}`;
    const totalPages = progress.reduce((sum, p) => sum + p.pages_read, 0);
    const progressDates = progress.map(p => format(new Date(p.date), "yyyy-MM-dd"));
    const { best: bestStreak } = calculateStreak(progressDates);

    // 2. Fetch all badges
    const badges = await sql`SELECT * FROM badges`;
    
    // 3. Fetch already earned badges
    const earnedBadgesResult = await sql`SELECT badge_id FROM user_badges WHERE user_id = ${userId}`;
    const earnedBadgeIds = new Set(earnedBadgesResult.map(b => b.badge_id));

    const newBadges = [];

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let meetsRequirement = false;

      switch (badge.requirement_type) {
        case 'books_read':
          if (completedBooks >= badge.requirement_value) meetsRequirement = true;
          break;
        case 'pages_read':
          if (totalPages >= badge.requirement_value) meetsRequirement = true;
          break;
        case 'long_book':
          const hasLongBook = books.some(b => b.finish_reading_date && (Number(b.pages) || 0) >= badge.requirement_value);
          if (hasLongBook) meetsRequirement = true;
          break;
        case 'streak':
          if (bestStreak >= badge.requirement_value) meetsRequirement = true;
          break;
        case 'fast_read':
          const hasFastRead = books.some(b => {
             if (!b.start_reading_date || !b.finish_reading_date) return false;
             const start = new Date(b.start_reading_date);
             const finish = new Date(b.finish_reading_date);
             const days = Math.max(Math.ceil(Math.abs(finish.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
             return days <= badge.requirement_value;
          });
          if (hasFastRead) meetsRequirement = true;
          break;
      }

      if (meetsRequirement) {
        await sql`
          INSERT INTO user_badges (user_id, badge_id, earned_at)
          VALUES (${userId}, ${badge.id}, NOW())
          ON CONFLICT DO NOTHING
        `;
        newBadges.push(badge);
      }
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}
