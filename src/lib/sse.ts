export async function* parseSSE(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      // event: <name> も拾えるように
      const lines = chunk.split("\n");
      const eventLine = lines.find((l) => l.startsWith("event: "));
      const dataLine = lines.find((l) => l.startsWith("data: "));
      if (!dataLine) continue;

      const data = dataLine.slice(6);
      try {
        const parsed: unknown = JSON.parse(data);
        if (eventLine && typeof parsed === "object" && parsed && !Object.hasOwn(parsed, "type")) {
          const evt = eventLine.slice(7).trim();
          // 元のオブジェクトをそのまま data に格納して返す（型アサーション不要）
          yield { type: evt, data: parsed };
        } else {
          yield parsed;
        }
      } catch {
        // ignore
      }
    }
  }
}