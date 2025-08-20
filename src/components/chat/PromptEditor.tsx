"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

type Props = {
  value: string;
  onSave: (v: string) => void;
  trigger?: React.ReactNode;
};

export function PromptEditor({ value, onSave, trigger }: Props) {
  const t = useTranslations('Chat.promptEditor');
  const [draft, setDraft] = useState(value);

  // 親状態と同期
  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="ml-auto">{t('triggerButton')}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="sys">{t('label')}</Label>
          <Textarea
            id="sys"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-40"
            placeholder={t('placeholder')}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => setDraft("You are a helpful assistant.")}>
            {t('resetButton')}
          </Button>
          <Button onClick={() => onSave(draft)}>{t('saveButton')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}