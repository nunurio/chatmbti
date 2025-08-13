"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  value: string;
  onSave: (v: string) => void;
  trigger?: React.ReactNode;
};

export function PromptEditor({ value, onSave, trigger }: Props) {
  const [draft, setDraft] = useState(value);

  // 親状態と同期
  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="ml-auto">性格を変更</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>モデルの性格（System Prompt）</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="sys">System prompt</Label>
          <Textarea
            id="sys"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-40"
            placeholder="例: あなたは簡潔かつ丁寧に返答する日本語アシスタントです。..."
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => setDraft("You are a helpful assistant.")}>
            デフォルトに戻す
          </Button>
          <Button onClick={() => onSave(draft)}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}