"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit, Trash2, Plus, Clock, Search, Filter, CheckCircle2, Circle, AlertCircle, RefreshCw } from "lucide-react";
import { format, isToday, isPast, isFuture, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Motion } from "@/components/custom/Motion";
import { addTodoAction, toggleTodoAction, updateTodoAction, deleteTodoAction } from "../actions/todos";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  created_by: string;
  profiles: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface TodosTabProps {
  projectId: string;
  isFreelancer: boolean;
  initialTodos?: Todo[];
}

type FilterStatus = "all" | "pending" | "completed" | "overdue";
type SortBy = "created" | "due_date" | "title";

export function TodosTab({ projectId, isFreelancer, initialTodos = [] }: TodosTabProps) {
  const supabase = getBrowserSupabase();
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [loading, setLoading] = useState(!initialTodos.length);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("created");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);


  // Fetch todos on mount
  useEffect(() => {
    if (!initialTodos.length) {
      fetchTodos();
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('project-todos-' + projectId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_todos", filter: 'project_id=eq.' + projectId },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Only add if it's not already in the list (prevent duplicates)
            setTodos(prev => {
              const exists = prev.some(todo => todo.id === payload.new.id);
              if (exists) return prev;
              return [payload.new as Todo, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setTodos(prev => prev.map(todo =>
              todo.id === payload.new.id ? payload.new as Todo : todo
            ));
          } else if (payload.eventType === "DELETE") {
            setTodos(prev => prev.filter(todo => todo.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  const fetchTodos = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setIsRefreshing(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("project_todos")
        .select(`
          *,
          profiles (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setTodos(
        (data || []).map((todo) => ({
          ...todo,
          completed: !!todo.completed,
        }))
      );

    } catch (err) {
      console.error("Error fetching todos:", err);
      setError("Fehler beim Laden der Aufgaben. Bitte versuche es erneut.");
    } finally {
      if (showLoading) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter and sort todos
  const filteredAndSortedTodos = useMemo(() => {
    const filtered = todos.filter(todo => {
      // Search filter
      const matchesSearch = searchQuery === "" ||
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      let matchesFilter = true;
      if (filterStatus === "pending") {
        matchesFilter = !todo.completed;
      } else if (filterStatus === "completed") {
        matchesFilter = todo.completed;
      } else if (filterStatus === "overdue") {
        matchesFilter = !todo.completed && !!todo.due_date && isPast(startOfDay(new Date(todo.due_date)));
      }

      return matchesSearch && matchesFilter;
    });

    // Sort todos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "due_date":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [todos, searchQuery, filterStatus, sortBy]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || isCreating) return;

    try {
      setError(null);
      setIsCreating(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("due_date", formData.due_date);

      await addTodoAction(projectId, formDataToSend);

      // Refresh todos after successful creation
      await fetchTodos(false);

      // Reset form
      setFormData({ title: "", description: "", due_date: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding todo:", err);
      setError("Fehler beim Erstellen der Aufgabe. Bitte versuche es erneut.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    try {
      setError(null);
      // Optimistic UI update
      setTodos(prev => prev.map(todo =>
        todo.id === todoId ? { ...todo, completed } : todo
      ));

      await toggleTodoAction(todoId, completed);
    } catch (err) {
      console.error("Error toggling todo:", err);
      setError("Fehler beim Aktualisieren der Aufgabe. Bitte versuche es erneut.");
      // Revert optimistic update on error
      setTodos(prev => prev.map(todo =>
        todo.id === todoId ? { ...todo, completed: !completed } : todo
      ));
    }
  };

  const handleUpdateTodo = async (todoId: string) => {
    if (!editFormData.title.trim()) return;

    try {
      setError(null);
      const formDataToSend = new FormData();
      formDataToSend.append("title", editFormData.title);
      formDataToSend.append("description", editFormData.description);
      formDataToSend.append("due_date", editFormData.due_date);

      await updateTodoAction(todoId, formDataToSend);

      // Refresh todos after successful update
      await fetchTodos(false);

      setEditingId(null);
    } catch (err) {
      console.error("Error updating todo:", err);
      setError("Fehler beim Aktualisieren der Aufgabe. Bitte versuche es erneut.");
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm("Möchtest du diese Aufgabe wirklich löschen?")) return;

    try {
      setError(null);
      await deleteTodoAction(todoId);

      // Refresh todos after successful deletion
      await fetchTodos(false);
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Fehler beim Löschen der Aufgabe. Bitte versuche es erneut.");
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditFormData({
      title: todo.title,
      description: todo.description || "",
      due_date: todo.due_date || "",
    });
  };

  const getTodoStatus = useCallback((todo: Todo) => {
    if (todo.completed) return "completed";
    if (todo.due_date && isPast(startOfDay(new Date(todo.due_date)))) return "overdue";
    if (todo.due_date && isToday(new Date(todo.due_date))) return "due-today";
    return "pending";
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Erledigt</Badge>;
      case "overdue":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Überfällig</Badge>;
      case "due-today":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Heute fällig</Badge>;
      default:
        return <Badge variant="outline">Offen</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "due-today":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <h2 className="text-xl font-semibold">Aufgaben</h2>
          <p className="text-sm text-muted-foreground">
            Verwalte die Aufgaben für dieses Projekt.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Aufgaben</h2>
            <p className="text-sm text-muted-foreground">
              Verwalte die Aufgaben für dieses Projekt.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchTodos(false)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={Boolean(isRefreshing)}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Aktualisieren..." : "Aktualisieren"}
            </Button>
            {isFreelancer && (
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Neue Aufgabe
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Aufgaben suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="pending">Offen</SelectItem>
                  <SelectItem value="completed">Erledigt</SelectItem>
                  <SelectItem value="overdue">Überfällig</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sortierung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Erstellt</SelectItem>
                  <SelectItem value="due_date">Fälligkeitsdatum</SelectItem>
                  <SelectItem value="title">Titel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Add Todo Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleAddTodo}
              className="mb-6 p-4 border rounded-lg bg-muted/30 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="new-title">Titel *</Label>
                <Input
                  id="new-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Aufgabentitel..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-description">Beschreibung</Label>
                <Textarea
                  id="new-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreibung (optional)..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Fälligkeitsdatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date
                        ? format(new Date(formData.due_date), "PPP", { locale: de })
                        : "Kein Datum festgelegt"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date ? new Date(formData.due_date) : undefined}
                      onSelect={(date) => setFormData(prev => ({
                        ...prev,
                        due_date: date ? format(date, "yyyy-MM-dd") : ""
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={Boolean(isCreating)}>
                  {isCreating ? "Wird erstellt..." : "Hinzufügen"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ title: "", description: "", due_date: "" });
                  }}
                  disabled={Boolean(isCreating)}
                >
                  Abbrechen
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Todos List */}
        <Motion layout className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {filteredAndSortedTodos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Keine Aufgaben gefunden.</p>
              {searchQuery && (
                <p className="text-sm mt-1">Versuche es mit einem anderen Suchbegriff.</p>
              )}
              {filterStatus !== "all" && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="mt-2"
                >
                  Alle Aufgaben anzeigen
                </Button>
              )}
            </div>
          )}

          <AnimatePresence>
            {filteredAndSortedTodos.map((todo, index) => {
              const status = getTodoStatus(todo);
              return (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 border rounded-lg bg-card hover:bg-muted/40 transition-all",
                    status === "overdue" && "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
                    status === "due-today" && "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20"
                  )}
                >
                  {editingId === todo.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-title-${todo.id}`}>Titel *</Label>
                        <Input
                          id={`edit-title-${todo.id}`}
                          value={editFormData.title}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`edit-description-${todo.id}`}>Beschreibung</Label>
                        <Textarea
                          id={`edit-description-${todo.id}`}
                          value={editFormData.description}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fälligkeitsdatum</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !editFormData.due_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editFormData.due_date
                                ? format(new Date(editFormData.due_date), "PPP", { locale: de })
                                : "Kein Datum festgelegt"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={editFormData.due_date ? new Date(editFormData.due_date) : undefined}
                              onSelect={(date) => setEditFormData(prev => ({
                                ...prev,
                                due_date: date ? format(date, "yyyy-MM-dd") : ""
                              }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateTodo(todo.id)}
                        >
                          Speichern
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTodo(todo.id, !todo.completed)}
                        className="mt-1 flex-shrink-0"
                        aria-label={todo.completed ? "Als unerledigt markieren" : "Als erledigt markieren"}
                      >
                        {getStatusIcon(status)}
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={cn(
                              "font-medium",
                              todo.completed && "line-through text-muted-foreground"
                            )}>
                              {todo.title}
                            </h3>
                            {getStatusBadge(status)}
                          </div>

                          {isFreelancer && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => startEditing(todo)}
                                aria-label="Aufgabe bearbeiten"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteTodo(todo.id)}
                                aria-label="Aufgabe löschen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {todo.description && (
                          <p className={cn(
                            "text-sm text-muted-foreground",
                            todo.completed && "line-through"
                          )}>
                            {todo.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {todo.due_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(todo.due_date), "PPP", { locale: de })}
                            </div>
                          )}

                          <span>
                            Erstellt von {todo.profiles?.name || "Unbekannt"} am{" "}
                            {format(new Date(todo.created_at), "PPP", { locale: de })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Motion>
      </CardContent>
    </Card>
  );
}
