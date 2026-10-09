export type TAssistantRole = "user" | "model";

export interface IAssistantHistoryItem {
  role: TAssistantRole;
  text: string;
}

export interface IAssistantMessage extends IAssistantHistoryItem {
  id: string;
  isFailed?: boolean;
}

export interface IAssistantChatPayload {
  message: string;
  history: IAssistantHistoryItem[];
}

export interface IAssistantReply {
  reply: string;
  toolsUsed: string[];
}
