"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PromptEditor } from "./PromptEditor";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { parseSSE } from "@/lib/sse";
import type { ChatSession, Message } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, Send, StopCircle, Menu, Bot, UserRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const LS_SESSIONS = "chat-mvp:sessions";
const LS_SYSTEM = "chat-mvp:system";

export function Chat() {
  const t = useTranslations('Chat');
  
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>(LS_SESSIONS, []);
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string>(LS_SYSTEM, "You are a helpful assistant.");
  const [currentId, setCurrentId] = useState<string>(() => sessions[0]?.id ?? nanoid());
  const current = useMemo<ChatSession>(() => {
    const found = sessions.find((s) => s.id === currentId);
    return (
      found ?? {
        id: currentId,
        title: t('newChat'),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      }
    );
  }, [sessions, currentId, t]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [, forceRerender] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // セッションの保存
  useEffect(() => {
    setSessions((prev) => {
      const others = prev.filter((s) => s.id !== current.id);
      return [current, ...others].sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }, [current, setSessions]);

  // 自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [current.messages.length, isStreaming]);

  const pushMessage = (m: Omit<Message, "id">) => {
    current.messages.push({ id: nanoid(), ...m });
    current.updatedAt = Date.now();
    if (current.title === t('newChat') && m.role === "user") {
      current.title = m.content.slice(0, 30);
    }
  };

  async function send() {
    if (!input.trim() || isStreaming) return;

    const user: Omit<Message, "id"> = { role: "user", content: input.trim() };
    pushMessage(user);
    setInput("");

    // 空のassistantメッセージを用意してストリームで埋めていく
    const assistant: Message = { id: nanoid(), role: "assistant", content: "" };
    current.messages.push(assistant);

    setIsStreaming(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: current.messages.map(({ role, content }) => ({ role, content })),
          systemPrompt,
        }),
        signal: abortRef.current.signal,
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      for await (const ev of parseSSE(reader)) {
        const anyEv = ev as { type?: string; text?: string; message?: string };
        if (anyEv?.type === "token") {
          assistant.content += anyEv.text ?? "";
          current.updatedAt = Date.now();
          forceRerender((n) => n + 1);
        } else if (anyEv?.type === "error") {
          assistant.content = `${t('errors.generic')}: ${anyEv.message ?? "unknown"}`;
          current.updatedAt = Date.now();
          forceRerender((n) => n + 1);
          toast.error(anyEv.message ?? t('errors.generic'));
        }
      }
    } catch {
      toast.error(t('errors.networkError'));
    } finally {
      setIsStreaming(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setIsStreaming(false);
  }

  function newChat() {
    const id = nanoid();
    setCurrentId(id);
  }

  return (
    <div className="h-dvh w-full bg-white">
      <div className="mx-auto max-w-5xl h-full flex flex-col p-4 md:p-6 gap-4 rounded-3xl border bg-background/70 backdrop-blur-md shadow-xl">
        {/* ヘッダ */}
        <div className="flex items-center gap-2 rounded-xl border bg-background/60 px-3 py-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label={t('conversationsAriaLabel')}>
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader>
                <SheetTitle>{t('conversations')}</SheetTitle>
              </SheetHeader>
              <div className="p-2 flex flex-col gap-1">
                <Button variant="secondary" onClick={newChat} className="justify-start">
                  <Plus className="size-4" /> {t('newChatButton')}
                </Button>
                <Separator className="my-2" />
                <div className="flex flex-col">
                  {sessions.map((s) => (
                    <Button
                      key={s.id}
                      variant={s.id === currentId ? "outline" : "ghost"}
                      className="justify-start truncate"
                      onClick={() => setCurrentId(s.id)}
                    >
                      <MessageTitle title={s.title} />
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="secondary" onClick={newChat} className="hidden sm:flex">
            <Plus className="size-4" /> {t('newChatButton')}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="text-sm text-muted-foreground hidden md:block">{t('conversationsSaved')}</div>
          <div className="flex-1" />
          <PromptEditor
            value={systemPrompt}
            onSave={setSystemPrompt}
            trigger={<Button variant="ghost" size="icon" aria-label={t('systemPromptAriaLabel')}><Sparkles className="size-4" /></Button>}
          />
          <ThemeToggle />
        </div>

        {/* メッセージ */}
        <ScrollArea className="flex-1 rounded-2xl border p-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="space-y-4">
            {current.messages.length === 0 ? (
              <EmptyState onPick={(t) => setInput(t)} />
            ) : (
              current.messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* 入力欄 */}
        <div className="flex flex-col gap-2 rounded-2xl border bg-primary/5 p-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className="min-h-16"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="flex items-center gap-2">
            <Button onClick={() => void send()} disabled={isStreaming || !input.trim()}>
              <Send className="size-4" /> {t('sendButton')}
            </Button>
            <Button variant="secondary" onClick={stop} disabled={!isStreaming}>
              <StopCircle className="size-4" /> {t('stopButton')}
            </Button>
            <div className="ml-auto text-xs text-muted-foreground">System: {systemPrompt.slice(0, 24)}{systemPrompt.length > 24 ? "…" : ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageTitle({ title }: { title: string }) {
  const t = useTranslations('Chat');
  return <span className="truncate">{title || t('newChat')}</span>;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="size-7 rounded-full bg-secondary flex items-center justify-center border">
          <Bot className="size-4" />
        </div>
      )}
      <div
        className={`whitespace-pre-wrap rounded-3xl px-4 py-3 max-w-[80%] shadow-md ${
          isUser
            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
            : "bg-accent/60 border"
        }`}
      >
        {message.content}
      </div>
      {isUser && (
        <div className="size-7 rounded-full bg-secondary flex items-center justify-center border">
          <UserRound className="size-4" />
        </div>
      )}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (t: string) => void }) {
  const t = useTranslations('Chat');
  const suggestions = [
    t('prompts.suggestion1'),
    t('prompts.suggestion2'),
    t('prompts.suggestion3'),
  ];
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center border">
        <MessageSquareIcon />
      </div>
      <div className="text-sm text-muted-foreground">{t('emptyStateMessage')}</div>
      <div className="grid gap-2 w-full sm:grid-cols-3">
        {suggestions.map((s) => (
          <Button key={s} variant="outline" className="justify-start rounded-xl" onClick={() => onPick(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MessageSquareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
    </svg>
  );
}