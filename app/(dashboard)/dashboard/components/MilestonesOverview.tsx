"use client";

import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, Calendar, Clock, AlertCircle, CheckCircle2, Circle, Play, ArrowRight } from "lucide-react";
import { isPast, isToday, isFuture, addDays, format } from "date-fns";
import { formatTodoDate } from "@/lib/i18n/date-format";
import { useT } from "@/lib/i18n/client";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  project_id: string;
  projects: {
    id: string;
    name: string;
  } | null;
}

interface MilestonesOverviewProps {
  milestones: Milestone[];
}

type FilterStatus = "all" | "pending" | "in_progress" | "completed" | "overdue";

export default function MilestonesOverview({ milestones }: MilestonesOverviewProps) {
  const { t } = useT();
  const now = new Date();
  const twoWeeksFromNow = addDays(now, 14);

  // Filter milestones by status
  const statusCounts = {
    pending: milestones.filter(m => m.status === 'pending').length,
    in_progress: milestones.filter(m => m.status === 'in_progress').length,
    completed: milestones.filter(m => m.status === 'completed').length,
    overdue: milestones.filter(m => m.status === 'overdue').length
  };

  // Get upcoming milestones (due in next 2 weeks)
  const upcomingMilestones = milestones.filter(milestone => {
    if (!milestone.due_date) return false;
    const dueDate = new Date(milestone.due_date);
    return isFuture(dueDate) && dueDate <= twoWeeksFromNow;
  });

  // Sort upcoming milestones by due date (soonest first)
  const sortedUpcomingMilestones = [...upcomingMilestones].sort((a, b) => {
    if (!a.due_date || !b.due_date) return 0;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  // Get recent milestones (created in last 7 days)
  const recentMilestones = milestones.filter(milestone => {
    const createdDate = new Date(milestone.created_at);
    const sevenDaysAgo = addDays(now, -7);
    return createdDate >= sevenDaysAgo;
  });

  const getMilestoneStatus = (milestone: Milestone) => {
    if (milestone.status === 'completed') return "completed";
    if (milestone.status === 'in_progress') return "in_progress";
    if (milestone.due_date && isPast(new Date(milestone.due_date))) return "overdue";
    if (milestone.due_date && isToday(new Date(milestone.due_date))) return "due-today";
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-foreground text-xs">{t("project.milestones.completed")}</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-foreground text-xs">{t("project.milestones.in.progress")}</Badge>;
      case "overdue":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-foreground text-xs">{t("project.milestones.overdue")}</Badge>;
      case "due-today":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-foreground text-xs">{t("project.milestones.due.today")}</Badge>;
      default:
        return <Badge variant="outline" className="dark:bg-muted dark:text-foreground text-xs">{t("project.milestones.pending")}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "due-today":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusCountBadge = (count: number, status: string) => {
    if (count === 0) return null;
    
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case "completed":
        return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100`}>{count}</span>;
      case "in_progress":
        return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100`}>{count}</span>;
      case "overdue":
        return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100`}>{count}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100`}>{count}</span>;
    }
  };

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
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm text-muted-foreground">{t("dashboard.milestones")}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {milestones.length} {t("dashboard.total")}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 text-gray-400" />
                <span className="text-xs">{t("project.milestones.pending")}</span>
              </div>
              {getStatusCountBadge(statusCounts.pending, "pending")}
            </div>
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <Play className="h-3 w-3 text-blue-600" />
                <span className="text-xs">{t("project.milestones.in.progress")}</span>
              </div>
              {getStatusCountBadge(statusCounts.in_progress, "in_progress")}
            </div>
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-xs">{t("project.milestones.completed")}</span>
              </div>
              {getStatusCountBadge(statusCounts.completed, "completed")}
            </div>
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-red-600" />
                <span className="text-xs">{t("project.milestones.overdue")}</span>
              </div>
              {getStatusCountBadge(statusCounts.overdue, "overdue")}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t("dashboard.upcoming.milestones")}
              </h3>
              <span className="text-xs text-muted-foreground">
                {sortedUpcomingMilestones.length}
              </span>
            </div>
            
            {sortedUpcomingMilestones.length === 0 ? (
              <div className="text-center py-3 text-muted-foreground">
                <p className="text-xs">{t("dashboard.no.upcoming.milestones")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedUpcomingMilestones.slice(0, 5).map((milestone, index) => {
                  const status = getMilestoneStatus(milestone);
                  const dueDate = milestone.due_date ? new Date(milestone.due_date) : null;
                  
                  return (
                    <div
                      key={milestone.id}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-md hover:bg-muted/40 transition-colors",
                        status === "overdue" && "border-l-2 border-red-400",
                        status === "due-today" && "border-l-2 border-yellow-400"
                      )}
                    >
                      <div className="mt-0.5">
                        {getStatusIcon(status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{milestone.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {milestone.projects && (
                            <span className="text-xs text-muted-foreground">
                              {milestone.projects.name}
                            </span>
                          )}
                          {milestone.due_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatTodoDate(milestone.due_date, "de")}
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
                {sortedUpcomingMilestones.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{sortedUpcomingMilestones.length - 5} {t("dashboard.more")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {recentMilestones.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border/30">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("dashboard.recent.milestones")}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {recentMilestones.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {recentMilestones.slice(0, 3).map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    <div className="mt-0.5">
                      {getStatusIcon(getMilestoneStatus(milestone))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{milestone.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {milestone.projects && (
                          <span className="text-xs text-muted-foreground">
                            {milestone.projects.name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(milestone.created_at), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border/30 space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/projects">
                <Flag className="h-4 w-4 mr-2" />
                {t("dashboard.manage.milestones")}
              </Link>
            </Button>
            {sortedUpcomingMilestones.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/projects">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t("dashboard.view.all.milestones")}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Motion>
  );
}
