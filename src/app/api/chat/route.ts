import { NextRequest } from "next/server";
import { app } from "@/ai/graph";

export const runtime = "nodejs"; // Nodeランタイムの方がSDK/ライブラリ互換が広い

type Msg = { role: "user" | "assistant" | "system"; content: string };
type Body = {
  messages: Msg[];
  systemPrompt?: string;
  verbosity?: "low" | "medium" | "high";
  reasoning_effort?: "minimal" | "medium" | "high";
};

type LLMContentPart = {
  type?: string;
  text?: string;
  content?: string;
};

type LLMChunk = {
  content?: string | (LLMContentPart | string)[];
  delta?: { content?: string };
  kwargs?: { content?: string };
};

// LangGraphのイベント型は内部で管理しているため、ここでは使用しない

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = (await req.json()) as Body;

  const encoder = new TextEncoder();

  // OPENAI_API_KEY がないとLangChainが失敗して無音になりがちなので先に通知
  if (!process.env.OPENAI_API_KEY) {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ type: "error", message: "OPENAI_API_KEY is not set" })}\n\n`
          )
        );
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // LangGraph のイベントストリームを SSE に変換
        const iterator = app.streamEvents(
          { messages },
          {
            version: "v2",
            configurable: { systemPrompt },
          }
        );

        // chunk からテキストを頑健に抽出
        const isLLMContentPart = (v: unknown): v is LLMContentPart => {
          return (
            typeof v === "object" &&
            v !== null &&
            ("text" in (v as Record<string, unknown>) ||
              "content" in (v as Record<string, unknown>) ||
              "type" in (v as Record<string, unknown>))
          );
        };
        const extractText = (chunk: unknown): string => {
          if (!chunk || typeof chunk !== "object") return "";
          const c = chunk as LLMChunk;
          if (typeof c.content === "string") return c.content;
          if (Array.isArray(c.content)) {
            return c.content
              .map((part) => {
                if (typeof part === "string") return part;
                if (isLLMContentPart(part)) {
                  if (part.type === "text" && typeof part.text === "string") return part.text;
                  if (typeof part.content === "string") return part.content;
                }
                return "";
              })
              .join("");
          }
          if (c.delta && typeof c.delta.content === "string") return c.delta.content;
          if (c.kwargs && typeof c.kwargs.content === "string") return c.kwargs.content;
          return "";
        };

        for await (const event of iterator) {
          // LLMのトークン進捗（event名の差異を吸収）
          if (
            event.event === "on_chat_model_stream" ||
            event.event === "on_llm_stream" ||
            event.event === "on_chain_stream"
          ) {
            const text = extractText(event.data?.chunk);
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "token", text })}\n\n`)
              );
            }
          }
        }
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : typeof e === "string" ? e : "unknown";
        const payload = { type: "error", message } as const;
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify(payload)}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}