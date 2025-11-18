// src/hooks/useChatLogic.ts
import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "../context/userContext";
import { useChat } from "../context/ChatContext";

export const useChatLogic = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"reserva" | "carrito">("reserva");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(true);
  const [_, setLocation] = useLocation();
  
  const { authState } = useUser();
  const { 
    chatState, 
    handleSendMessage, 
    incrementPromptCount 
  } = useChat();

  const handleSend = async () => {
    if (!inputMessage.trim() || chatState.isLoading) return;

    // Verificar límite de prompts para usuarios no autenticados
    if (!authState?.isAuthenticated && chatState.promptCount >= 2) {
      setLocation("/registration");
      return;
    }

    incrementPromptCount();
    
    try {
      await handleSendMessage(inputMessage, authState?.user?.id || null);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const promptLimitReached = !authState.isAuthenticated && chatState.promptCount >= 2;

  return {
    // Estado
    inputMessage,
    setInputMessage,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    activeChat,
    setActiveChat,
    
    // Datos del contexto
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    taskQueue: chatState.taskQueue,
    bookingData: chatState.bookingData,
    thread: chatState.thread,
    promptCount: chatState.promptCount,
    
    // Métodos
    handleSend,
    promptLimitReached,
  };
};