"use client";

import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { isPast, isToday, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  project_id: string;
  projects: {
    name: string;
  } | null;
}

interface TodosCardProps {
 todos: Todo[];
}

export default function TodosCard({ todos }: TodosCardProps) {
  const getTodoStatus = (todo: Todo) => {
    if (todo.completed) return "completed";
    if (todo.due_date && isPast(startOfDay(new Date(todo.due_date)))) return "overdue";
    if (todo.due_date && isToday(new Date(todo.due_date))) return "due-today";
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-10 text-xs">Erledigt</Badge>;
      case "overdue":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 text-xs">Überfällig</Badge>;
      case "due-today":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">Heute fällig</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Offen</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "due-today":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <Motion
      className="rounded-xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <Card className="bg-background/80 border-border/60 backdrop-blur-sm h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground">Aufgaben</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {activeTodos.length} offen
              </span>
              {getStatusIcon("pending")}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Keine Aufgaben</p>
            </div>
          ) : (
            <>
              {activeTodos.slice(0, 5).map((todo, index) => {
                const status = getTodoStatus(todo);
                return (
                  <div
                    key={todo.id}
                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    <div className="mt-0.5">
                      {getStatusIcon(status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{todo.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {todo.due_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(todo.due_date), "dd.MM.yyyy", { locale: de })}
                          </span>
                        )}
                        {todo.projects?.name && (
                          <span className="text-xs text-muted-foreground truncate">
                            aus {todo.projects.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {getStatusBadge(status)}
                    </div>
                  </div>
                );
              })}
              {activeTodos.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{activeTodos.length - 5} weitere
                </p>
              )}
            </>
          )}
          <div className="pt-3 border-t border-border/30">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/projects">
                <Plus className="h-4 w-4 mr-2" />
                Aufgaben verwalten
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Motion>
  );
}
