import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Book } from "@/lib/types";

export async function exportLibraryToPDF(books: Book[], userName: string) {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString("pt-PT");

  // Title
  doc.setFontSize(22);
  doc.setTextColor(66, 102, 241); // Indigo color
  doc.text("Anuário Literário", 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Utilizador: ${userName}`, 14, 32);
  doc.text(`Data de Exportação: ${today}`, 14, 38);

  const finishedBooks = books.filter(b => b.finish_reading_date);
  const readingBooks = books.filter(b => b.start_reading_date && !b.finish_reading_date);

  // Statistics
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Resumo da Biblioteca", 14, 50);
  
  doc.setFontSize(10);
  doc.text(`- Livros Concluídos: ${finishedBooks.length}`, 14, 58);
  doc.text(`- Livros a Ler: ${readingBooks.length}`, 14, 64);
  doc.text(`- Total na Coleção: ${books.length}`, 14, 70);

  // Table of Books
  const tableData = finishedBooks.map(b => [
    b.title,
    b.author || (b.authors as any)?.[0]?.name || "N/A",
    b.rating ? `${b.rating}/10` : "—",
    b.finish_reading_date ? new Date(b.finish_reading_date).toLocaleDateString("pt-PT") : "—"
  ]);

  autoTable(doc, {
    startY: 80,
    head: [["Título", "Autor", "Nota", "Data de Conclusão"]],
    body: tableData,
    headStyles: { fillColor: [66, 102, 241] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 80 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `BookManager — Gerado automaticamente em ${today} — Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`anuario-literario-${userName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
