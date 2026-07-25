import React, { createContext, useContext, useMemo } from "react";
import { useCrudStore, generateId } from "@/hooks/use-crud-store";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string, senderId: string, senderName: string, senderAvatar?: string) => void;
  clearMessages: () => void;
}

const defaultMessages: ChatMessage[] = [];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { items: messages, create, reset } = useCrudStore<ChatMessage>("chatMessages", defaultMessages);

  const sendMessage = (content: string, senderId: string, senderName: string, senderAvatar?: string) => {
    const validSenderId = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(senderId)
      ? senderId
      : generateId();

    create({
      id: generateId("msg"),
      senderId: validSenderId,
      senderName,
      senderAvatar,
      content,
      timestamp: new Date(),
      isCurrentUser: true,
    });
  };

  const value = useMemo(() => ({
    messages,
    sendMessage,
    clearMessages: reset,
  }), [messages, reset]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
}
