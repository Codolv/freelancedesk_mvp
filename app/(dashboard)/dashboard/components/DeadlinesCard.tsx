"use client";

import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { isPast, isToday, isFuture, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";

interface Project {
  id: string;
  name: string;
  description?: string | null;
  deadline: string | null;
  created_at: string;
  status: string;
}

interface DeadlinesCardProps {
  projects: Project[];
}

export default function DeadlinesCard({ projects }: DeadlinesCardProps) {
  const { t } = useT();
  const now = new Date();
  const twoWeeksFromNow = addDays(now, 14);

  // Filter projects with deadlines in the next two weeks
  const upcomingDeadlines = projects.filter(project => {
    if (!project.deadline) return false;
    const deadlineDate = new Date(project.deadline);
    return isFuture(deadlineDate) && deadlineDate <= twoWeeksFromNow;
  });

  // Sort by deadline date (soonest first)
  const sortedDeadlines = [...upcomingDeadlines].sort((a, b) => {
    if (!a.deadline || !b.deadline) return 0;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
 });

  // Count projects that are overdue (if any)
  const overdueProjects = projects.filter(project => {
    if (!project.deadline) return false;
    return isPast(new Date(project.deadline));
  });

  const getProjectStatus = (project: Project) => {
    if (!project.deadline) return "no-deadline";
    const deadlineDate = new Date(project.deadline);
    if (isPast(deadlineDate)) return "overdue";
    if (isToday(deadlineDate)) return "due-today";
    if (deadlineDate <= addDays(new Date(), 7)) return "due-soon";
    return "due-later";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-90 dark:text-foreground text-xs">{t("dashboard.overdue")}</Badge>;
      case "due-today":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-foreground text-xs">{t("dashboard.due.today")}</Badge>;
      case "due-soon":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-90 dark:text-foreground text-xs">{t("dashboard.due.soon")}</Badge>;
      case "due-later":
        return <Badge variant="outline" className="dark:bg-muted dark:text-foreground text-xs">{t("dashboard.due.later")}</Badge>;
      default:
        return <Badge variant="outline" className="dark:bg-muted dark:text-foreground text-xs">{t("dashboard.no.date")}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "due-today":
      case "due-soon":
      case "due-later":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-400" />;
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
            <CardTitle className="text-sm text-muted-foreground">{t("dashboard.deadlines")}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {sortedDeadlines.length} {t("dashboard.in.2.weeks")}
              </span>
              {getStatusIcon("due-soon")}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedDeadlines.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">{t("dashboard.no.deadlines.2.weeks")}</p>
            </div>
          ) : (
            <>
              {sortedDeadlines.slice(0, 5).map((project, index) => {
                const status = getProjectStatus(project);
                const deadlineDate = project.deadline ? new Date(project.deadline) : null;
                
                return (
                  <div
                    key={project.id}
                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    <div className="mt-0.5">
                      {getStatusIcon(status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {deadlineDate && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(deadlineDate, "MM/dd/yyyy")}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {getStatusBadge(status)}
                    </div>
                  </div>
                );
              })}
              {sortedDeadlines.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{sortedDeadlines.length - 5} {t("dashboard.more")}
                </p>
              )}
            </>
          )}
          <div className="pt-3 border-t border-border/30">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/projects">
                <Calendar className="h-4 w-4 mr-2" />
                {t("dashboard.manage.projects")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Motion>
  );
}
