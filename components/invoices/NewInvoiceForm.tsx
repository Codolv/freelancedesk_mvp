"use client";

import { Motion } from "@/components/custom/Motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ItemsField } from "@/components/invoices/ItemsField";
import { FileText } from "lucide-react";
import { useT } from '@/lib/i18n/client';

export default function NewInvoiceForm({
  projectId,
  projectName,
  createAction,
}: {
  projectId: string;
  projectName?: string;
  createAction: (projectId: string, formData: FormData) => void;
}) {
  const { t } = useT();

  return (
    <Motion
      className="w-full max-w-4xl mx-auto py-10 px-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          {t('invoice.new.title').replace('{projectName}', projectName ?? "Projekt")}
        </h1>
        <p className="text-muted-foreground">
          {t('invoice.new.description')}
        </p>
      </div>

      <Card className="border-border/60 bg-background/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            {t('invoice.new.details')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction.bind(null, projectId)} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="title">{t('invoice.new.title.label')}</Label>
              <Input id="title" name="title" placeholder={t('invoice.new.title.placeholder')} />
            </div>

            {/* Interactive items field */}
            <ItemsField />

            <div className="flex gap-3">
              <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => window.history.back()}>
                {t('invoice.new.cancel')}
              </Button>
              <Button type="submit" size="lg" className="flex-1">
                {t('invoice.new.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Motion>
  );
}
