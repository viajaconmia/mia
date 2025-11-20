import { useEffect, useRef } from "react";
import { ChatMessagesController } from "../ChatMessage";
import {
  Building2,
  ArrowRight,
  ShoppingCart,
  Send,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { ReservationPanel } from "../ReservationPanel";
import { ChatContent, Reservation } from "../../types/chat";
import { NavigationLink } from "../atom/NavigationLink";
import ROUTES from "../../constants/routes";
import { TabsList } from "../molecule/TabsList";
import { Cart } from "../Cart";
import Button from "../atom/Button";
import { AuthModal } from "../AuthModal";
import { InputText } from "../atom/Input";
import useResize from "../../hooks/useResize";
import Task from "../organism/task";
import { Logo } from "../atom/Logo";

// ---------- ÁTOMOS / MOLÉCULAS UI ---------- //

type ChatHeaderProps = {
  activeChat: boolean;
  onToggleChat: () => void;
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ activeChat, onToggleChat }) => {
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

type ChatMessagesAreaProps = {
  messages: ChatContent[];
  isLoading: boolean;
  endRef: React.RefObject<HTMLDivElement>;
};

const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  messages,
  isLoading,
  endRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={endRef}>
      <div className="w-full max-w-screen-md md:max-w-screen-2xl mx-auto space-y-4">
        {messages.length > 0 && <ChatMessagesController messages={messages} />}
        {isLoading && (
          <div className="flex gap-2 w-full">
            <div className="w-14 h-14 flex-shrink-0 bg-white/80 rounded-full flex items-center justify-center">
              <Logo className="w-10 h-10" />
            </div>
            <Task
              label="Esperando respuesta..."
              status="loading"
              loadingMessage="Estamos procesando tu solicitud."
            />
          </div>
        )}
      </div>
    </div>
  );
};

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
                  { size: "sm", obj: "md" }
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

type ReservationCartPanelProps = {
  activeTab: "reserva" | "carrito";
  onTabChange: (tab: "reserva" | "carrito") => void;
  bookingData: Reservation | null;
};

const ReservationCartPanel: React.FC<ReservationCartPanelProps> = ({
  activeTab,
  onTabChange,
  bookingData,
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
      {activeTab === "reserva" && (
        <ReservationPanel booking={bookingData || null} />
      )}
      {activeTab === "carrito" && <Cart />}
    </div>
  );
};

// src/components/Chat/index.tsx
import { useChatLogic } from "../../hooks/useChatLogic";

const Chat: React.FC = () => {
  const {
    inputMessage,
    setInputMessage,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    activeChat,
    setActiveChat,
    messages,
    isLoading,
    taskQueue,
    bookingData,
    handleSend,
    promptLimitReached,
  } = useChatLogic();

  const { setSize } = useResize();
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollTop = endRef.current.scrollHeight;
    }
  }, [messages, taskQueue, isLoading]);

  return (
    <>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

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
                  taskQueue={taskQueue}
                  isLoading={isLoading}
                  endRef={endRef}
                />
                <ChatInputArea
                  inputMessage={inputMessage}
                  onChange={setInputMessage}
                  onSend={handleSend}
                  disabled={promptLimitReached || !inputMessage.trim() || isLoading}
                  setSize={setSize}
                />
              </>
            ) : (
              <div className="p-4 flex justify-center">
                <div className="w-full h-[70vh]">
                  <ReservationCartPanel
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    bookingData={bookingData}
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
            bookingData={bookingData}
          />
        </div>
      </div>
    </>
  );
};

export default Chat;