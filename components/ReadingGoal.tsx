
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Edit2, Check, X, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ReadingGoalProps {
  initialGoal: number;
  currentCount: number;
  year: number;
}

export function ReadingGoal({ initialGoal, currentCount, year }: ReadingGoalProps) {
  const [goal, setGoal] = useState(initialGoal);
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(initialGoal.toString());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const progress = goal > 0 ? Math.min(Math.round((currentCount / goal) * 100), 100) : 0;
  const isCompleted = goal > 0 && currentCount >= goal;

  const handleSave = async () => {
    const newGoal = parseInt(tempGoal);
    if (isNaN(newGoal) || newGoal < 0) {
      toast({ title: "Erro", description: "Por favor insira um número válido.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/users/reading-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: newGoal })
      });

      if (res.ok) {
        setGoal(newGoal);
        setIsEditing(false);
        toast({ title: "Meta Atualizada!", description: `A tua meta para ${year} foi definida para ${newGoal} livros.` });
      } else {
        throw new Error();
      }
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível atualizar a meta.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass border-0 shadow-xs ring-1 ring-border/50 overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${isCompleted ? 'bg-amber-500' : 'bg-primary'}`} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Target className={`h-5 w-5 ${isCompleted ? 'text-amber-500' : 'text-primary'}`} />
            Meta de Leitura {year}
          </CardTitle>
          {!isEditing ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setTempGoal(goal.toString());
                setIsEditing(true);
              }}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
        <CardDescription>
          {goal > 0 
            ? `${currentCount} de ${goal} livros lidos` 
            : "Define uma meta para este ano!"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="editing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Input 
                type="number" 
                value={tempGoal} 
                onChange={(e) => setTempGoal(e.target.value)}
                className="h-9 w-20"
                autoFocus
              />
              <Button size="sm" onClick={handleSave} disabled={isLoading} className="h-9 w-9 p-0">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-9 w-9 p-0">
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Progresso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className={`h-2 ${isCompleted ? 'bg-amber-100 dark:bg-amber-950' : ''}`} />
              </div>
              
              {isCompleted ? (
                <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 p-2 rounded-lg text-xs font-bold animate-bounce">
                  <Trophy className="h-4 w-4" />
                  Meta Atingida! Parabéns!
                </div>
              ) : goal > 0 && (
                <p className="text-[10px] text-muted-foreground italic">
                  Faltam {Math.max(0, goal - currentCount)} livros para atingires o teu objetivo.
                </p>
              )}
              
              {goal === 0 && !isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs gap-2 border-dashed"
                  onClick={() => setIsEditing(true)}
                >
                  <Plus className="h-3 w-3" /> Definir Meta
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
