import { useState, useEffect, useRef } from "react";
import { ChatMessagesController } from "../ChatMessage";
import { useUser } from "../../context/userContext";
import {
  MessageSquare,
  Lock,
  Plane,
  MapPin,
  Calendar,
  Hotel,
  Building2,
  ArrowRight,
  Phone,
  ShoppingCart,
} from "lucide-react";
import { ReservationPanel } from "../ReservationPanel";
import { Loader } from "../Loader";
import { ChatContent, Reservation, UserMessage } from "../../types/chat";
import { sendMessage } from "../../services/chatService";
import { useLocation } from "wouter";
import { NavigationLink } from "../atom/NavigationLink";
import ROUTES from "../../constants/routes";
import { ProtectedComponent } from "../../middleware/ProtectedComponent";
import { TabsList } from "../molecule/TabsList";
import PageContainer from "../atom/PageContainer";
import { Cart } from "../Cart";

const Inicio = () => {
  const [promptCount, setPromptCount] = useState(0);
  const [_, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatContent[]>([]);
  const [thread, setThread] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState<Reservation | null>(null);
  const [activeTab, setActiveTab] = useState<"reserva" | "carrito">("reserva");
  const { authState } = useUser();

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

  const showWelcomeMessage = messages.length === 0;
  const promptLimitReached = !authState.isAuthenticated && promptCount >= 2;

  return (
    <PageContainer>
      {/* Chat Panel - Left Side */}
      <div className="flex justify-end">
        <div
          className={`${
            showWelcomeMessage ? "w-full" : "w-2/3"
          } transition-all duration-500 ${
            !showWelcomeMessage && "fixed left-0 h-[calc(100vh-4rem)]"
          }`}
        >
          {showWelcomeMessage ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <div className="relative w-full max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 items-center gap-8">
                  {/* Content Section - Left */}
                  <div className="relative z-10 text-white space-y-8">
                    <h1 className="text-6xl font-bold mb-4">¡Hola! Soy MIA!</h1>
                    <h2 className="text-3xl font-light mb-12">
                      Tu Agente de Inteligencia
                      <br />
                      para Viajes Corporativos.
                    </h2>
                    <div className="fixed bottom-10 right-10 flex flex-row items-center gap-x-3 text-lg">
                      MIA Ahora en WhatsApp!
                      <a
                        href="https://wa.me/525510445254?text=Hola,%20necesito%20que%20me%20ayudes%20a%20realizar%20una%20reserva"
                        target="_blank"
                        className="bg-green-600 p-2 w-12 h-12 justify-center items-center flex rounded-full"
                      >
                        <Phone />
                      </a>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-12">
                      <div className=" rounded-lg p-1 transform hover:scale-105 transition-all duration-300">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium">Empresas</span>
                        </div>
                      </div>
                      <div className=" rounded-lg p-1 transform hover:scale-105 transition-all duration-300">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Plane className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium">Vuelos</span>
                        </div>
                      </div>
                      <div className=" rounded-lg p-1 transform hover:scale-105 transition-all duration-300">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Hotel className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium">Hoteles</span>
                        </div>
                      </div>
                      <div className=" rounded-lg p-1 transform hover:scale-105 transition-all duration-300">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium">Reservas</span>
                        </div>
                      </div>
                    </div>
                    <ProtectedComponent
                      admit={{
                        administrador: true,
                        reservante: true,
                        viajero: false,
                        consultor: false,
                        "no-rol": true,
                      }}
                    >
                      <div className="space-y-6">
                        <NavigationLink
                          href={ROUTES.HOTELS.SEARCH}
                          size="full"
                          variant="primary"
                          className="py-6 font-semibold !text-lg shadow-lg mb-4"
                        >
                          <Hotel className="w-6 h-6 ml-2" />
                          <span>Crear Reserva Manualmente</span>
                        </NavigationLink>

                        <div className="relative">
                          <input
                            pattern="^[^<>]*$"
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleSendMessage()
                            }
                            placeholder="¿A dónde te gustaría viajar?"
                            className="w-full p-6 rounded-xl text-sky-950/90 border-2 border-sky-200/50 bg-white/90 focus:outline-none focus:border-white/40 transition-colors text-lg shadow-lg"
                          />
                          {inputMessage == "" && (
                            <MapPin className="text-sky-950/80 absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6" />
                          )}
                        </div>
                      </div>
                    </ProtectedComponent>
                  </div>

                  {/* SVG Section - Right */}
                  <div className="flex items-center justify-center">
                    <div className="w-[500px] h-[500px]">
                      <svg
                        viewBox="0 0 493 539"
                        className="w-full h-full fill-white"
                      >
                        <path d="M205.1,500.5C205.1,500.5,205,500.6,205.1,500.5C140.5,436.1,71.7,369.1,71.7,291.1c0-86.6,84.2-157.1,187.6-157.1S447,204.4,447,291.1c0,74.8-63.4,139.6-150.8,154.1c0,0,0,0,0,0l-8.8-53.1c61.3-10.2,105.8-52.6,105.8-100.9c0-56.9-60-103.2-133.7-103.2s-133.7,46.3-133.7,103.2c0,49.8,48,93.6,111.7,101.8c0,0,0,0,0,0L205.1,500.5L205.1,500.5z" />
                        <path d="M341,125.5c-2.9,0-5.8-0.7-8.6-2.1c-70.3-37.3-135.9-1.7-138.7-0.2c-8.8,4.9-20,1.8-24.9-7.1c-4.9-8.8-1.8-20,7-24.9c3.4-1.9,85.4-47.1,173.8-0.2c9,4.8,12.4,15.9,7.6,24.8C353.9,122,347.6,125.5,341,125.5z" />
                        <path d="M248.8,263.8c-38.1-26-73.7-0.8-75.2,0.2c-6.4,4.6-8.7,14-5.3,21.8c1.9,4.5,5.5,7.7,9.8,8.9c4,1.1,8.2,0.3,11.6-2.1c0.9-0.6,21.4-14.9,43.5,0.2c2.2,1.5,4.6,2.3,7.1,2.4c0.2,0,0.4,0,0.6,0c0,0,0,0,0,0c5.9,0,11.1-3.7,13.5-9.7C257.8,277.6,255.4,268.3,248.8,263.8z" />
                        <path d="M348.8,263.8c-38.1-26-73.7-0.8-75.2,0.2c-6.4,4.6-8.7,14-5.3,21.8c1.9,4.5,5.5,7.7,9.8,8.9c4,1.1,8.2,0.3,11.6-2.1c0.9-0.6,21.4-14.9,43.5,0.2c2.2,1.5,4.6,2.3,7.1,2.4c0.2,0,0.4,0,0.6,0c0,0,0,0,0,0c5.9,0,11.1-3.7,13.5-9.7C357.8,277.6,355.4,268.3,348.8,263.8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full border-r">
              {/* Manual Reservation Button */}
              <div className="p-4 bg-white/20 backdrop-blur-sm">
                <NavigationLink
                  className="text-blue-600"
                  href={ROUTES.HOTELS.SEARCH}
                  variant="secondary"
                  size="full"
                >
                  <Hotel className="w-5 h-5" />
                  <span>Crear Reserva Manualmente</span>
                  <ArrowRight className="w-5 h-5" />
                </NavigationLink>
              </div>

              {/* Chat Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-6 space-y-4 "
                ref={endRef}
              >
                <div className="w-full mx-auto space-y-4">
                  {messages.length > 0 && (
                    <ChatMessagesController messages={messages} />
                  )}
                  {isLoading && <Loader />}
                  {promptLimitReached && (
                    <div className="bg-white/10 backdrop-blur-lg border-l-4 border-yellow-400 p-4 rounded-lg shadow-md">
                      <div className="flex items-center">
                        <Lock className="h-5 w-5 text-yellow-400 mr-2" />
                        <p className="text-sm text-white">
                          Has alcanzado el límite de mensajes. Por favor
                          regístrate para continuar.
                        </p>
                      </div>
                      <button
                        // onClick={() => setCurrentPage("registration")}
                        className="mt-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Registrarse ahora
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input Area */}
              <div className="border-t border-white/10 backdrop-blur-lg p-6  bg-blue-700">
                <div className="w-full mx-auto">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <input
                        pattern="^[^<>]*$"
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder={
                          promptLimitReached
                            ? "Regístrate para continuar..."
                            : "Escribe tu mensaje..."
                        }
                        disabled={promptLimitReached}
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent disabled:bg-white/5 disabled:text-white/50 transition-all duration-200"
                      />
                      {inputMessage == "" && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={promptLimitReached || !inputMessage.trim()}
                      className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2
                          ${
                            promptLimitReached || !inputMessage.trim()
                              ? "bg-white/10 text-white/50 cursor-not-allowed"
                              : "bg-white text-blue-600 hover:bg-blue-50 transform hover:-translate-y-0.5 hover:shadow-lg"
                          }`}
                    >
                      <span>Enviar</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="w-full text-center text-xs mt-2 text-gray-200/80">
                    MIA puede cometer errores. Considera verificar la
                    información importante.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reservation Panel - Right Side */}
        {!showWelcomeMessage && (
          <div className="w-1/3 h-[calc(100vh-4rem)] p-6 flex justify-center">
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
        )}
      </div>
    </PageContainer>
  );
};

export default Inicio;
