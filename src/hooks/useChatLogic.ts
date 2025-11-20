// src/hooks/useChatLogic.ts
import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "../context/userContext";
import { ChatContent } from "../types/chat";
import { useChat } from "../context/ChatContext";

export const useChatLogic = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"reserva" | "carrito">("reserva");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(true);
  const [_, setLocation] = useLocation();

  const { authState } = useUser();
  const { chatState, handleSendMessage, incrementPromptCount } = useChat();

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

  const promptLimitReached =
    !authState.isAuthenticated && chatState.promptCount >= 2;

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
    messages: messagesWithDemo, // 👈 usamos esto, no chatState.messages
    isLoading: chatState.isLoading,
    taskQueue: chatState.taskQueue,
    bookingData: chatState.bookingData,
    thread: chatState.thread,
    promptCount: chatState.promptCount,

    // Métodos
    handleSend,
  };
};

export const demoFlightMessage: ChatContent = {
  component_type: "flight",
  payload: {
    type: "flight_options",
    searchId: "search-demo-123",
    options: [
      {
        id: "opt-1",
        itineraryType: "round_trip",
        segments: [
          {
            origin: {
              airportCode: "MEX",
              city: "Ciudad de México",
              airportName: "AICM T2",
            },
            destination: {
              airportCode: "MTY",
              city: "Monterrey",
              airportName: "Aeropuerto Internacional de Monterrey",
            },
            departureTime: "2025-12-10T08:30:00-06:00",
            arrivalTime: "2025-12-10T10:05:00-06:00",
            airline: "Aeroméxico",
            flightNumber: "AM1234",
          },
          {
            origin: {
              airportCode: "MTY",
              city: "Monterrey",
              airportName: "Aeropuerto Internacional de Monterrey",
            },
            destination: {
              airportCode: "MEX",
              city: "Ciudad de México",
              airportName: "AICM T2",
            },
            departureTime: "2025-12-15T18:45:00-06:00",
            arrivalTime: "2025-12-15T20:20:00-06:00",
            airline: "Aeroméxico",
            flightNumber: "AM5678",
          },
        ],
        seat: {
          isDesiredSeat: true,
          requestedSeatLocation: "window",
          assignedSeatLocation: "window",
        },
        baggage: {
          hasCheckedBaggage: true,
          pieces: 1,
        },
        price: {
          currency: "MXN",
          total: 3250.99,
        },
      },
      {
        id: "opt-2",
        itineraryType: "one_way",
        segments: [
          {
            origin: {
              airportCode: "MEX",
              city: "Ciudad de México",
            },
            destination: {
              airportCode: "CUN",
              city: "Cancún",
            },
            departureTime: "2025-12-11T12:00:00-06:00",
            arrivalTime: "2025-12-11T15:10:00-05:00",
            airline: "Volaris",
            flightNumber: "Y4235",
          },
        ],
        seat: {
          isDesiredSeat: false,
          requestedSeatLocation: "aisle",
          assignedSeatLocation: "middle",
        },
        baggage: {
          hasCheckedBaggage: false,
          pieces: 0,
        },
        price: {
          currency: "MXN",
          total: 1899,
        },
      },
    ],
  },
};
