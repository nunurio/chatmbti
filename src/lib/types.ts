export type Role = "user" | "assistant" | "system";
export type Message = { id: string; role: Role; content: string };

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};