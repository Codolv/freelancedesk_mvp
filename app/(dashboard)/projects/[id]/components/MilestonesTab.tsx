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
import { CalendarIcon, Edit, Trash2, Plus, Clock, Search, CheckCircle2, Circle, AlertCircle, RefreshCw, Play, Flag } from "lucide-react";
import { format, isToday, isPast, isFuture, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { formatTodoDate } from "@/lib/i18n/date-format";
import { useT } from "@/lib/i18n/client";
import { motion, AnimatePresence } from "framer-motion";
import { Motion } from "@/components/custom/Motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  due_date: string | null;
  target_date: string | null;
  actual_completion_date: string | null;
  order_number: number;
  created_at: string;
  created_by: string;
  profiles: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface MilestonesTabProps {
  projectId: string;
  isFreelancer: boolean;
  initialMilestones?: Milestone[];
}

type FilterStatus = "all" | "pending" | "in_progress" | "completed" | "overdue";
type SortBy = "created" | "due_date" | "target_date" | "title" | "order";

export function MilestonesTab({ projectId, isFreelancer, initialMilestones = [] }: MilestonesTabProps) {
  const { t } = useT();
  const supabase = getBrowserSupabase();
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [loading, setLoading] = useState(!initialMilestones.length);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("order");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    target_date: "",
    order_number: 0,
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    target_date: "",
    order_number: 0,
    status: "pending" as 'pending' | 'in_progress' | 'completed' | 'overdue',
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Fetch milestones on mount
  useEffect(() => {
    if (!initialMilestones.length) {
      fetchMilestones();
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('project-milestones-' + projectId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_milestones", filter: 'project_id=eq.' + projectId },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Only add if it's not already in the list (prevent duplicates)
            setMilestones(prev => {
              const exists = prev.some(milestone => milestone.id === payload.new.id);
              if (exists) return prev;
              return [payload.new as Milestone, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setMilestones(prev => prev.map(milestone =>
              milestone.id === payload.new.id ? payload.new as Milestone : milestone
            ));
          } else if (payload.eventType === "DELETE") {
            setMilestones(prev => prev.filter(milestone => milestone.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  const fetchMilestones = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setIsRefreshing(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("project_milestones")
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
        .order("order_number", { ascending: true })
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Supabase error fetching milestones:", fetchError);
        throw fetchError;
      }
      setMilestones(data || []);
    } catch (err) {
      console.error("Error fetching milestones:", err);
      setError(t("project.milestones.error.loading"));
    } finally {
      if (showLoading) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter and sort milestones
  const filteredAndSortedMilestones = useMemo(() => {
    const filtered = milestones.filter(milestone => {
      // Search filter
      const matchesSearch = searchQuery === "" ||
        milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (milestone.description && milestone.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      let matchesFilter = true;
      if (filterStatus !== "all") {
        matchesFilter = milestone.status === filterStatus;
      }

      return matchesSearch && matchesFilter;
    });

    // Sort milestones
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "order":
          return a.order_number - b.order_number;
        case "due_date":
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case "target_date":
          if (!a.target_date && !b.target_date) return 0;
          if (!a.target_date) return 1;
          if (!b.target_date) return -1;
          return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [milestones, searchQuery, filterStatus, sortBy]);

  // Helper functions would go here if needed, but they already exist in the component

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || isCreating) return;

    try {
      setError(null);
      setIsCreating(true);
      
      const { data, error: insertError } = await supabase
        .from("project_milestones")
        .insert([{
          project_id: projectId,
          title: formData.title,
          description: formData.description || null,
          due_date: formData.due_date || null,
          target_date: formData.target_date || null,
          order_number: formData.order_number,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Refresh milestones after successful creation
      await fetchMilestones(false);

      // Reset form
      setFormData({ title: "", description: "", due_date: "", target_date: "", order_number: 0 });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding milestone:", err);
      setError(t("project.milestones.error.creating"));
    } finally {
      setIsCreating(false);
    }
 };

  const handleUpdateMilestone = async (milestoneId: string) => {
    if (!editFormData.title.trim()) return;

    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from("project_milestones")
        .update({
          title: editFormData.title,
          description: editFormData.description || null,
          due_date: editFormData.due_date || null,
          target_date: editFormData.target_date || null,
          order_number: editFormData.order_number,
          status: editFormData.status,
          updated_at: new Date().toISOString()
        })
        .eq("id", milestoneId);

      if (updateError) throw updateError;

      // Refresh milestones after successful update
      await fetchMilestones(false);

      setEditingId(null);
    } catch (err) {
      console.error("Error updating milestone:", err);
      setError(t("project.milestones.error.updating"));
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm(t("project.milestones.confirm.delete"))) return;

    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from("project_milestones")
        .delete()
        .eq("id", milestoneId);

      if (deleteError) throw deleteError;

      // Refresh milestones after successful deletion
      await fetchMilestones(false);
    } catch (err) {
      console.error("Error deleting milestone:", err);
      setError(t("project.milestones.error.deleting"));
    }
  };

  const handleToggleMilestoneStatus = async (milestoneId: string, currentStatus: string) => {
    try {
      setError(null);
      let newStatus: 'pending' | 'in_progress' | 'completed' | 'overdue' = 'pending';
      
      if (currentStatus === 'pending') newStatus = 'in_progress';
      else if (currentStatus === 'in_progress') newStatus = 'completed';
      else if (currentStatus === 'completed') newStatus = 'pending';

      // Optimistic UI update
      setMilestones(prev => prev.map(milestone =>
        milestone.id === milestoneId ? { ...milestone, status: newStatus } : milestone
      ));

      const { error: updateError } = await supabase
        .from("project_milestones")
        .update({
          status: newStatus,
          actual_completion_date: newStatus === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", milestoneId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error("Error updating milestone status:", err);
      setError(t("project.milestones.error.updating"));
      // Revert optimistic update on error
      setMilestones(prev => prev.map(milestone =>
        milestone.id === milestoneId ? { ...milestone, status: currentStatus as 'pending' | 'in_progress' | 'completed' | 'overdue' } : milestone
      ));
    }
  };

  const startEditing = (milestone: Milestone) => {
    setEditingId(milestone.id);
    setEditFormData({
      title: milestone.title,
      description: milestone.description || "",
      due_date: milestone.due_date || "",
      target_date: milestone.target_date || "",
      order_number: milestone.order_number,
      status: milestone.status,
    });
  };

  const getMilestoneStatus = useCallback((milestone: Milestone) => {
    if (milestone.status === 'completed') return "completed";
    if (milestone.status === 'in_progress') return "in_progress";
    if (milestone.due_date && isPast(startOfDay(new Date(milestone.due_date)))) return "overdue";
    if (milestone.due_date && isToday(new Date(milestone.due_date))) return "due-today";
    return "pending";
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-foreground">{t("project.milestones.completed")}</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-foreground">{t("project.milestones.in.progress")}</Badge>;
      case "overdue":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-foreground">{t("project.milestones.overdue")}</Badge>;
      case "due-today":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-foreground">{t("project.milestones.due.today")}</Badge>;
      default:
        return <Badge variant="outline" className="dark:bg-muted dark:text-foreground">{t("project.milestones.pending")}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Play className="h-5 w-5 text-blue-600" />;
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
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Flag className="h-5 w-5" />
            {t("dashboard.milestones")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("project.manage.milestones")}
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
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Flag className="h-5 w-5" />
              {t("dashboard.milestones")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("project.manage.milestones")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchMilestones(false)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={Boolean(isRefreshing)}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? t("project.refreshing") : t("project.refresh")}
            </Button>
            {isFreelancer && (
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("project.new.milestone")}
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
                placeholder={t("project.milestones.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t("project.filter.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("project.filter.all")}</SelectItem>
                  <SelectItem value="pending">{t("project.filter.pending")}</SelectItem>
                  <SelectItem value="in_progress">{t("project.milestones.in.progress")}</SelectItem>
                  <SelectItem value="completed">{t("project.filter.completed")}</SelectItem>
                  <SelectItem value="overdue">{t("project.filter.overdue")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t("project.sort.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">{t("project.sort.order")}</SelectItem>
                  <SelectItem value="due_date">{t("project.sort.due.date")}</SelectItem>
                  <SelectItem value="target_date">{t("project.sort.target.date")}</SelectItem>
                  <SelectItem value="title">{t("project.sort.title")}</SelectItem>
                  <SelectItem value="created">{t("project.sort.created")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Add Milestone Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleAddMilestone}
              className="mb-6 p-4 border rounded-lg bg-muted/30 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="new-title">{t("project.milestones.title.label")} *</Label>
                <Input
                  id="new-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t("project.milestones.title.placeholder")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-description">{t("project.milestones.description.label")}</Label>
                <Textarea
                  id="new-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t("project.milestones.description.placeholder")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("project.milestones.due.date.label")}</Label>
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
                          ? formatTodoDate(formData.due_date, "de")
                          : t("project.milestones.no.due.date")}
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

                <div className="space-y-2">
                  <Label>{t("project.milestones.target.date.label")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.target_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.target_date
                          ? formatTodoDate(formData.target_date, "de")
                          : t("project.milestones.no.target.date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.target_date ? new Date(formData.target_date) : undefined}
                        onSelect={(date) => setFormData(prev => ({
                          ...prev,
                          target_date: date ? format(date, "yyyy-MM-dd") : ""
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={Boolean(isCreating)}>
                  {isCreating ? t("project.milestones.creating") : t("project.milestones.add")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ title: "", description: "", due_date: "", target_date: "", order_number: 0 });
                  }}
                  disabled={Boolean(isCreating)}
                >
                  {t("project.cancel")}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Milestones List */}
        <Motion layout className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {filteredAndSortedMilestones.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("project.milestones.none.found")}</p>
              {searchQuery && (
                <p className="text-sm mt-1">{t("project.milestones.try.different.search")}</p>
              )}
              {filterStatus !== "all" && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="mt-2"
                >
                  {t("project.milestones.show.all")}
                </Button>
              )}
            </div>
          )}

          <AnimatePresence>
            {filteredAndSortedMilestones.map((milestone, index) => {
              const status = getMilestoneStatus(milestone);
              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 border rounded-lg bg-card hover:bg-muted/40 transition-all",
                    status === "overdue" && "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
                    status === "due-today" && "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20",
                    status === "in_progress" && "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
                  )}
                >
                  {editingId === milestone.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-title-${milestone.id}`}>{t("project.milestones.title.label")} *</Label>
                        <Input
                          id={`edit-title-${milestone.id}`}
                          value={editFormData.title}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`edit-description-${milestone.id}`}>{t("project.milestones.description.label")}</Label>
                        <Textarea
                          id={`edit-description-${milestone.id}`}
                          value={editFormData.description}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("project.milestones.due.date.label")}</Label>
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
                                  ? formatTodoDate(editFormData.due_date, "de")
                                  : t("project.milestones.no.due.date")}
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

                        <div className="space-y-2">
                          <Label>{t("project.milestones.target.date.label")}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !editFormData.target_date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editFormData.target_date
                                  ? formatTodoDate(editFormData.target_date, "de")
                                  : t("project.milestones.no.target.date")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={editFormData.target_date ? new Date(editFormData.target_date) : undefined}
                                onSelect={(date) => setEditFormData(prev => ({
                                  ...prev,
                                  target_date: date ? format(date, "yyyy-MM-dd") : ""
                                }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("project.sort.order")}</Label>
                        <Input
                          type="number"
                          value={editFormData.order_number}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, order_number: parseInt(e.target.value) || 0 }))}
                          placeholder={t("project.sort.order")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t("project.milestones.status.label")}</Label>
                        <Select value={editFormData.status} onValueChange={(value: 'pending' | 'in_progress' | 'completed' | 'overdue') => setEditFormData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t("project.milestones.pending")}</SelectItem>
                            <SelectItem value="in_progress">{t("project.milestones.in.progress")}</SelectItem>
                            <SelectItem value="completed">{t("project.milestones.completed")}</SelectItem>
                            <SelectItem value="overdue">{t("project.milestones.overdue")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateMilestone(milestone.id)}
                        >
                          {t("project.save")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          {t("project.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleMilestoneStatus(milestone.id, milestone.status)}
                        className="mt-1 flex-shrink-0"
                        aria-label={
                          milestone.status === 'completed' 
                            ? t("project.milestones.mark.in.progress") 
                            : t("project.milestones.mark.completed")
                        }
                      >
                        {getStatusIcon(status)}
                      </button>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={cn(
                              "font-medium",
                              milestone.status === 'completed' && "line-through text-muted-foreground"
                            )}>
                              {milestone.title}
                            </h3>
                            {getStatusBadge(status)}
                          </div>

                          {isFreelancer && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => startEditing(milestone)}
                                aria-label={t("project.milestones.edit.label")}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteMilestone(milestone.id)}
                                aria-label={t("project.milestones.delete.label")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {milestone.description && (
                          <p className={cn(
                            "text-sm text-muted-foreground",
                            milestone.status === 'completed' && "line-through"
                          )}>
                            {milestone.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {milestone.due_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {t("project.milestones.due.date")}: {formatTodoDate(milestone.due_date, "de")}
                            </div>
                          )}

                          {milestone.target_date && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {t("project.milestones.target.date")}: {formatTodoDate(milestone.target_date, "de")}
                            </div>
                          )}

                          <span>
                            {t("project.milestones.created.by")} {milestone.profiles?.name || t("project.unknown")} {t("project.milestones.on.date")}{" "}
                            {formatTodoDate(milestone.created_at, "de")}
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
