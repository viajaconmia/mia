"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChatMessagesController } from "../ChatMessage";
import {
  Building2,
  ArrowRight,
  ShoppingCart,
  Send,
  Plus,
  ArrowLeft,
  Luggage,
  Calendar,
  Plane,
  Clock,
  MapPin,
} from "lucide-react";
import { ReservationPanel } from "../ReservationPanel";
import { NavigationLink } from "../atom/NavigationLink";
import ROUTES from "../../constants/routes";
import { TabsList } from "../molecule/TabsList";
import { Cart } from "../Cart";
import Button from "../atom/Button";
import { InputText } from "../atom/Input";
import useResize from "../../hooks/useResize";
import Task from "../organism/task";
import { useChat } from "../../hooks/useChat";
import {
  FlightOptions,
  ItemStack,
  MessageChat,
  Segment,
} from "../../context/ChatContext";
import Loader from "../atom/Loader";

// =====================
// Encabezado del chat
// =====================

type ChatHeaderProps = {
  activeChat: boolean;
  onToggleChat: () => void;
};

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChat,
  onToggleChat,
}) => {
  return (
    <div className="p-4 bg-white/20 backdrop-blur-sm flex flex-col gap-2">
      <Button size="md" className="md:hidden" onClick={onToggleChat}>
        {activeChat ? `Ver datos de la reserva` : `Volver al chat`}{" "}
        {activeChat ? (
          <ArrowRight className="w-5 h-5" />
        ) : (
          <ArrowLeft className="w-5 h-5" />
        )}
      </Button>
      {activeChat && (
        <NavigationLink
          className="text-blue-600"
          href={ROUTES.HOTELS.SEARCH}
          variant="secondary"
          size="md"
        >
          <Plus className="w-5 h-5" />
          <span>Crear Reserva Manualmente</span>
        </NavigationLink>
      )}
    </div>
  );
};

// =====================
// Área de mensajes
// =====================

type ChatMessagesAreaProps = {
  messages: MessageChat[];
  isLoading: boolean;
  endRef: React.RefObject<HTMLDivElement>;
  tasks: ItemStack[];
};

const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  messages,
  isLoading,
  endRef,
  tasks = [],
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={endRef}>
      <div className="w-full max-w-screen-md md:max-w-screen-2xl mx-auto space-y-4">
        {messages.length > 0 && <ChatMessagesController messages={messages} />}
        {isLoading && (
          <div className="flex gap-2 w-full">
            <div className="w-12 h-12 flex-shrink-0 bg-white/80 rounded-full flex items-center justify-center">
              <Loader className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-2 w-full">
              {tasks.map((task, index) => (
                <Task
                  key={index}
                  label={task.functionCall.tarea}
                  status={task.functionCall.status}
                  loadingMessage="Estamos procesando tu solicitud."
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================
// Input del chat
// =====================

type ChatInputAreaProps = {
  inputMessage: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  setSize: ReturnType<typeof useResize>["setSize"];
};

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputMessage,
  onChange,
  onSend,
  disabled,
  setSize,
}) => {
  return (
    <div className="border-t border-white/10 backdrop-blur-lg p-2 py-4 md:p-6 bg-blue-700">
      <div className="w-full mx-auto">
        <div className="grid grid-cols-7 space-x-2">
          <div className="flex-1 relative col-span-6">
            <InputText
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSend();
                }
              }}
              onChange={onChange}
              value={inputMessage}
              placeholder="Hola MIA, quiero ir a Monterrey..."
            />
          </div>
          <div className="pt-1">
            <Button
              onClick={onSend}
              icon={Send}
              size={
                setSize([
                  { size: "base", obj: "rounded" },
                  { size: "sm", obj: "md" },
                ]) as unknown as "rounded" | "md"
              }
              className="md:w-full md:h-full"
              disabled={disabled}
            >
              Enviar
            </Button>
          </div>
        </div>
        <p className="w-full text-center text-[10px] mt-2 text-gray-200/80">
          MIA puede cometer errores. Considera verificar la información
          importante.
        </p>
      </div>
    </div>
  );
};

// =====================
// Panel reserva / carrito
// =====================

type ReservationCartPanelProps = {
  activeTab: "reserva" | "carrito";
  onTabChange: (tab: "reserva" | "carrito") => void;
};

const ReservationCartPanel: React.FC<ReservationCartPanelProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-white h-full rounded-lg shadow-lg border overflow-hidden w-full flex flex-col">
      <TabsList
        activeTab={activeTab}
        onChange={(tab) => onTabChange(tab as "reserva" | "carrito")}
        tabs={[
          { tab: "reserva", icon: Building2 },
          { tab: "carrito", icon: ShoppingCart },
        ]}
      />
      {activeTab === "reserva" && <ReservationPanel />}
      {activeTab === "carrito" && <Cart />}
    </div>
  );
};

// =====================
// Componente principal Chat
// =====================

const Chat: React.FC = () => {
  const { setSize } = useResize();
  const endRef = useRef<HTMLDivElement>(null);
  const [activeChat, setActiveChat] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"reserva" | "carrito">("reserva");
  const {
    sendMessage,
    setInput,
    input,
    loading,
    stack,
    waitChatResponse,
    messages,
  } = useChat();

  useEffect(() => {
    if (stack.length === 0) return;
    waitChatResponse();
  }, [stack, waitChatResponse]);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollTop = endRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="flex justify-end">
        {/* Panel principal del chat */}
        <div className="w-full md:w-2/3 transition-all duration-500 fixed left-0 h-[calc(100dvh-3rem)]">
          <div className="flex flex-col h-full border-r">
            <ChatHeader
              activeChat={activeChat}
              onToggleChat={() => setActiveChat(!activeChat)}
            />

            {activeChat ? (
              <>
                <ChatMessagesArea
                  messages={messages}
                  tasks={stack}
                  isLoading={loading}
                  endRef={endRef}
                />
                <ChatInputArea
                  inputMessage={input}
                  onChange={setInput}
                  onSend={sendMessage}
                  disabled={!input.trim() || loading}
                  setSize={setSize}
                />
              </>
            ) : (
              <div className="p-4 flex justify-center">
                <div className="w-full h-[70vh]">
                  <ReservationCartPanel
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral de reservas/carrito */}
        <div className="hidden md:flex md:w-1/3 h-[calc(100dvh-4rem)] p-6 justify-center">
          <ReservationCartPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </>
  );
};

interface FlightOptionsDisplayProps {
  flightOptions: FlightOptions;
}

export const FlightOptionsDisplay = ({
  flightOptions,
}: FlightOptionsDisplayProps) => {
  const { setSelected } = useChat(); // igual que en CarRentalDisplay

  const options = Array.isArray(flightOptions.options.option)
    ? flightOptions.options.option
    : [flightOptions.options.option];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const shortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const renderSegment = (
    segment: Segment,
    index: number,
    totalSegments: number
  ) => (
    <div key={index} className="relative">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-slate-900">
                  {formatTime(segment.departureTime)}
                </span>
                <span className="text-sm text-slate-500">
                  {shortDate(segment.departureTime)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">
                  {segment.origin.airportCode}
                </span>
                <span className="text-sm">· {segment.origin.city}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {segment.origin.airportName}
              </p>
            </div>

            <div className="flex flex-col items-center px-6">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <div className="h-px w-12 bg-slate-300" />
                <Plane className="w-5 h-5" />
                <div className="h-px w-12 bg-slate-300" />
              </div>
              <span className="text-xs font-medium text-slate-500">
                {calculateDuration(segment.departureTime, segment.arrivalTime)}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {segment.airline} {segment.flightNumber}
              </span>
            </div>

            <div className="flex-1 text-right">
              <div className="flex items-baseline gap-2 mb-1 justify-end">
                <span className="text-3xl font-bold text-slate-900">
                  {formatTime(segment.arrivalTime)}
                </span>
                <span className="text-sm text-slate-500">
                  {shortDate(segment.arrivalTime)}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end text-slate-600">
                <span className="text-sm">{segment.destination.city} ·</span>
                <span className="font-medium">
                  {segment.destination.airportCode}
                </span>
                <MapPin className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {segment.destination.airportName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {index < totalSegments - 1 && (
        <div className="flex items-center gap-2 py-4 px-4 my-4 bg-amber-50 border border-amber-200 rounded-lg">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            Layover in {segment.destination.city}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          {options.map((option) => {
            const segments = Array.isArray(option.segments.segment)
              ? option.segments.segment
              : [option.segments.segment];

            return (
              <div
                key={option.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Plane className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 capitalize">
                          {option?.itineraryType?.replace("_", " ") || ""} Trip
                        </h2>
                        <p className="text-sm text-slate-500">
                          {segments.length}{" "}
                          {segments.length === 1 ? "segment" : "segments"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-sm text-slate-500">
                          {option?.price?.currency || ""}
                        </span>
                        <span className="text-4xl font-bold text-slate-900">
                          {option?.price?.total || ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Total price</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {segments.map((segment, index) =>
                      renderSegment(segment, index, segments.length)
                    )}
                  </div>

                  <div className="flex items-center gap-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Luggage className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {option?.baggage?.hasCheckedBaggage === "true"
                          ? `${option?.baggage?.pieces} checked bag${
                              option?.baggage?.pieces !== "1" ? "s" : ""
                            }`
                          : "No checked baggage"}
                      </span>
                    </div>

                    {option?.seat?.assignedSeatLocation &&
                      option?.seat?.assignedSeatLocation !== "null" && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Seat: {option?.seat?.assignedSeatLocation}
                          </span>
                        </div>
                      )}

                    <div className="flex-1" />

                    {/* Botón para seleccionar este vuelo */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelected({ type: "vuelo", item: option })
                      }
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                    >
                      Seleccionar este vuelo
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Chat;
