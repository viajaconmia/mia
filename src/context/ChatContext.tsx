// src/context/ChatContext.tsx
import React, { createContext, useState, useContext, useCallback } from "react";
import { sendMessage } from "../services/chatService";
import { ChatContent, Reservation } from "../types/chat";

interface ChatState {
  messages: ChatContent[];
  taskQueue: string[];
  isLoading: boolean;
  promptCount: number;
  thread: string | null;
  bookingData: Reservation | null;
}

interface ChatContextType {
  chatState: ChatState;
  handleSendMessage: (message: string, userId?: string | null) => Promise<void>;
  clearMessages: () => void;
  updateBookingData: (bookingData: Reservation | null) => void;
  incrementPromptCount: () => void;
}

const initialChatState: ChatState = {
  messages: [] as ChatContent[],
  taskQueue: [] as string[],
  isLoading: false,
  promptCount: 0,
  thread: null,
  bookingData: null,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatState, setChatState] = useState<ChatState>(initialChatState);

  const handleSendMessage = useCallback(async (message: string, userId?: string | null) => {
    if (!message.trim() || chatState.isLoading) return;

    // Iniciar carga y agregar mensaje del usuario
    setChatState(prev => ({
      ...prev,
      isLoading: true,
      taskQueue: ["Procesando tu mensaje..."],
      messages: [
        ...prev.messages,
        {
          component_type: "user",
          content: message,
        },
      ],
    }));

    try {
      await new Promise<void>((resolve, reject) => {
        sendMessage(message, chatState.thread, userId, (data) => {
          try {
            if (data.error) {
              reject(new Error(JSON.stringify(data.error)));
              return;
            }

            // Actualizar estado con la respuesta
            setChatState(prev => ({
              ...prev,
              thread: data.thread || null,
              messages: [
                ...prev.messages,
                ...(Array.isArray(data.response)
                  ? data.response
                  : [{
                    component_type: "error",
                    content: "Lo siento, no puedo ayudarte con eso."
                  }]
                )
              ],
              bookingData: data.reserva ? data.reserva[0] : prev.bookingData,
              taskQueue: [], // Limpiar cola de tareas al terminar
            }));
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error(error);
      setChatState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            component_type: "error",
            content: "Hubo un error al procesar el mensaje."
          },
        ],
        taskQueue: [],
      }));
    } finally {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [chatState.thread, chatState.isLoading]);

  const clearMessages = useCallback(() => {
    setChatState(initialChatState);
  }, []);

  const updateBookingData = useCallback((bookingData: Reservation | null) => {
    setChatState(prev => ({
      ...prev,
      bookingData,
    }));
  }, []);

  const incrementPromptCount = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      promptCount: prev.promptCount + 1,
    }));
  }, []);

  return (
    <ChatContext.Provider value={{
      chatState,
      handleSendMessage,
      clearMessages,
      updateBookingData,
      incrementPromptCount,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};