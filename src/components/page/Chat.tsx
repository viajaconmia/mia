import { useState, useEffect, useRef } from "react";
import { ChatMessagesController } from "../ChatMessage";
import { useUser } from "../../context/userContext";
import Task from "../organism/task";
import {
  Building2,
  ArrowRight,
  ShoppingCart,
  Send,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { ReservationPanel } from "../ReservationPanel";
import { Loader } from "../Loader";
import { ChatContent, Reservation, UserMessage } from "../../types/chat";
import { sendMessage } from "../../services/chatService";
import { useLocation } from "wouter";
import { NavigationLink } from "../atom/NavigationLink";
import ROUTES from "../../constants/routes";
import { TabsList } from "../molecule/TabsList";
import { Cart } from "../Cart";
import Button from "../atom/Button";
import { AuthModal } from "../AuthModal";
import { InputText } from "../atom/Input";
import useResize from "../../hooks/useResize";

const Chat = () => {
  const [promptCount, setPromptCount] = useState(0);
  const [_, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatContent[]>([]);
  const [thread, setThread] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState<Reservation | null>(null);
  const [activeTab, setActiveTab] = useState<"reserva" | "carrito">("reserva");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authState } = useUser();
  const [activeChat, setActiveChat] = useState(true);
  const { setSize } = useResize();

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollTop = endRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!authState?.isAuthenticated && promptCount >= 2) {
      setLocation("/registration");
      return;
    }

    setPromptCount(promptCount + 1);
    console.log(promptCount);

    const newMessage: UserMessage = {
      component_type: "user",
      content: inputMessage,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    sendMessage(
      inputMessage,
      thread || null,
      authState?.user?.id || null,
      (data) => {
        try {
          if (data.error) {
            throw new Error(JSON.stringify(data.error));
          }

          setThread(data.thread ?? null);
          if (data.response && Array.isArray(data.response)) {
            if (Array.isArray(data.response)) {
              setMessages((prev) => [
                ...prev,
                ...(data.response as ChatContent[]),
              ]);
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  component_type: "error",
                  content: "Lo siento, no puedo ayudarte con eso.",
                },
              ]);
            }
          }
          setBookingData(data.reserva ? data.reserva[0] : null);
        } catch (error) {
          console.error(error);
          setMessages((prev) => [
            ...prev,
            {
              component_type: "error",
              content: "Lo siento, ocurrio un error al buscar la información.",
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const promptLimitReached = !authState.isAuthenticated && promptCount >= 2;

  return (
    <>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {/* Chat Panel - Left Side */}
      <div className="flex justify-end">
        <div
          className={`w-full md:w-2/3 transition-all duration-500 fixed left-0 h-[calc(100dvh-3rem)]`}
        >
          <div className="flex flex-col h-full border-r">
            {/* Manual Reservation Button */}
            <div className="p-4 bg-white/20 backdrop-blur-sm flex flex-col gap-2">
              <Button
                size="md"
                className="md:hidden"
                onClick={() => {
                  setActiveChat(!activeChat);
                }}
              >
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
            {activeChat ? (
              <>
                {/* Chat Messages Area */}
                <div
                  className="flex-1 overflow-y-auto p-6 space-y-4 "
                  ref={endRef}
                >
                  <div className="w-full max-w-screen-md md:max-w-screen-2xl mx-auto space-y-4">
                    {messages.length > 0 && (
                      <ChatMessagesController messages={messages} />
                    )}
                    {isLoading && <Loader />}
                  </div>
                </div>

                {/* Chat Input Area */}
                <div className="border-t border-white/10 backdrop-blur-lg p-2 py-4 md:p-6  bg-blue-700">
                  <div className="w-full mx-auto">
                    <div className="grid grid-cols-7 space-x-2">
                      <div className="flex-1 relative col-span-6">
                        <InputText
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage();
                            }
                          }}
                          onChange={(value) => setInputMessage(value)}
                          value={inputMessage}
                          placeholder="Hola MIA, quiero ir a Monterrey..."
                        />
                      </div>
                      <div className="pt-1">
                        <Button
                          onClick={handleSendMessage}
                          icon={Send}
                          size={
                            setSize([
                              { size: "base", obj: "rounded" },
                              { size: "sm", obj: "md" },
                            ]) as unknown as "rounded" | "md"
                          }
                          className="md:w-full md:h-full"
                          disabled={promptLimitReached || !inputMessage.trim()}
                        >
                          Enviar
                        </Button>
                      </div>
                    </div>
                    <p className="w-full text-center text-[10px] mt-2 text-gray-200/80">
                      MIA puede cometer errores. Considera verificar la
                      información importante.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 flex justify-center">
                <div className="bg-white h-[70vh] rounded-lg shadow-lg border overflow-hidden w-full flex flex-col">
                  <TabsList
                    activeTab={activeTab}
                    onChange={(tab) => {
                      setActiveTab(tab as "reserva" | "carrito");
                    }}
                    tabs={[
                      { tab: "reserva", icon: Building2 },
                      { tab: "carrito", icon: ShoppingCart },
                    ]}
                  />
                  {activeTab == "reserva" && (
                    <ReservationPanel booking={bookingData || null} />
                  )}
                  {activeTab == "carrito" && <Cart></Cart>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className=" hidden md:flex md:w-1/3 h-[calc(100dvh-4rem)] p-6 justify-center">
          <div className="bg-white rounded-lg shadow-lg border overflow-hidden w-full flex flex-col">
            <TabsList
              activeTab={activeTab}
              onChange={(tab) => {
                setActiveTab(tab as "reserva" | "carrito");
              }}
              tabs={[
                { tab: "reserva", icon: Building2 },
                { tab: "carrito", icon: ShoppingCart },
              ]}
            />
            {activeTab == "reserva" && (
              <ReservationPanel booking={bookingData || null} />
            )}
            {activeTab == "carrito" && <Cart></Cart>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
