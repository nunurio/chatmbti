import { ChatOpenAI } from "@langchain/openai";
import {
  StateGraph,
  MessagesAnnotation,
  START,
  END,
} from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { RunnableConfig } from "@langchain/core/runnables";

/**
 * システムプロンプトは RunnableConfig.configurable.systemPrompt から受け取る。
 * UIでの「性格」変更はこの値になる。
 */
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "{systemPrompt}"],
  ["placeholder", "{messages}"],
]);

async function callModel(
  state: typeof MessagesAnnotation.State,
  config?: RunnableConfig
) {
  const model = new ChatOpenAI({
    // 安定した現行モデルに変更し、トークンの逐次ストリーミングを有効化
    model: "gpt-5",
    streaming: true,
  });
  const systemPrompt =
    (config?.configurable as { systemPrompt?: string })?.systemPrompt ??
    "You are a helpful assistant.";

  const chain = prompt.pipe(model);
  const aiMsg = await chain.invoke(
    { messages: state.messages, systemPrompt },
    config
  );

  // MessagesAnnotation なので { messages: [aiMsg] } を返せば履歴に追記される
  return { messages: [aiMsg] };
}

// グラフ定義（1ノードのみ）
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addEdge("agent", END);

export const app = workflow.compile();