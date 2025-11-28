"use client";

import { useState, useTransition } from "react";
import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useT } from '@/lib/i18n/client';

export default function NewProjectForm({
  createAction,
}: {
  createAction: (formData: FormData) => Promise<void>;
}) {
  const { t } = useT();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setSuccess(false);
    startTransition(async () => {
      await createAction(formData);
      setSuccess(true);
    });
  };

  return (
    <Motion
      className="w-full max-w-4xl mx-auto py-10 px-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          {t('project.new.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('project.new.description')}
        </p>
      </div>

      {/* Form */}
      <Card className="border-border/60 bg-background/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            {t('project.new.details')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('project.new.name.label')}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t('project.new.name.placeholder')}
                required
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t('project.new.description.label')}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t('project.new.description.placeholder')}
                rows={4}
                disabled={isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deadline">{t('project.new.deadline.label')}</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="pl-8"
                  disabled={isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('project.new.creating')}
                </>
              ) : (
                t('project.new.create')
              )}
            </Button>

            {success && (
              <div className="flex items-center justify-center text-green-600 dark:text-green-400 mt-3 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('project.new.success')}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </Motion>
  );
}
