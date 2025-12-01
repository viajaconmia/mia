import {
  CarRentalOption,
  ItemHistory,
  ItemStack,
  MessageChat,
  useChatContext,
  FlightOption, // 👈 antes tenías FlightOptions
} from "../context/ChatContext";
import { parseToJson } from "../lib/utils";
import { ChatService } from "../services/chatService";
import { useNotification } from "./useNotification";

export const useChat = () => {
  const { dispatcher, state } = useChatContext();
  const { showNotification } = useNotification();

  //Esta lógica asegura que no se dupliquen items en el stack y que si ya existe, se actualice.
  const addToStack = (newItems: ItemStack[]) => {
    const newStack = [...newItems];
    dispatcher({ type: "SET_STACK", payload: newStack });
  };

  const setCartSelected = (option: CarRentalOption | null) => {
    dispatcher({ type: "SET_SELECT", payload: option });
  };

  const setFlySelected = (option: FlightOption | null) => {
    dispatcher({ type: "SET_SELECT", payload: option });
  };

  // Limpia todo el stack
  const clearStack = () => {
    dispatcher({ type: "SET_STACK", payload: [] });
  };

  //Sirve para editar el loading
  const setLoading = (isLoading: boolean) => {
    dispatcher({ type: "SET_LOADING", payload: isLoading });
  };

  //Actualiza el valor del input
  const setInput = (input: string) => {
    dispatcher({ type: "SET_INPUT", payload: input });
  };

  //Limpia el input
  const clearInput = () => {
    dispatcher({ type: "SET_INPUT", payload: "" });
  };

  //Actualiza el id del hilo de conversación
  const updateThread = (threadId: string | null) => {
    if (threadId === null) return;
    dispatcher({ type: "SET_THREAD", payload: threadId });
  };

  //Agrega mensajes al estado
  const updateMessages = (messages: MessageChat[]) => {
    // Ojo: .reverse() muta el array original; si quieres evitar bugs,
    // podrías hacer [...messages].reverse()
    dispatcher({ type: "SET_MESSAGES", payload: messages.reverse() });
  };

  //Debemos formatear y separar los mensajes de la stack y asi para poder pintarlos correctamente
// En useChat.ts - REEMPLAZA LA FUNCIÓN updateHistory COMPLETA
const updateHistory = (history: ItemHistory[]) => {
  console.log("📋 updateHistory llamado con history:", {
    total: history.length,
    items: history.map(item => ({
      type: "functionCall" in item ? "ItemStack" : "MessageChat",
      role: item.role,
      hasText: "text" in item,
      hasFunctionCall: "functionCall" in item,
      functionCallAssistant: "functionCall" in item ? item.functionCall.assistant : "N/A"
    }))
  });

  // 1. Extraer TODOS los mensajes del historial
  const messagesFromHistory: MessageChat[] = [];
  
  history.forEach((item) => {

    console.log("item en history:", item);

    // Si es un MessageChat (tiene text)
if ("text" in item && typeof item.text === "string") {
   messagesFromHistory.push({
     role: item.role,
     text: item.text,
     componente: undefined
   });
}
    // Si es un ItemStack con functionCall exitoso, crear mensaje
    else if ("functionCall" in item && item.functionCall.status === "success") {
      const { functionCall } = item;
      
      let messageText = "";
      let componente = undefined;
      
      // Mensajes específicos por agente
      switch (functionCall.assistant) {
        // En useChat.ts - REEMPLAZA el case "db_hotel" completo
          case "db_hotel":
            console.log("🔍 DB_HOTEL functionCall DETALLADO:", {
              functionCall: functionCall,
              resolucion: functionCall.resolucion,
              tipoResolucion: typeof functionCall.resolucion,
              tieneUserMessage: functionCall.resolucion?.userMessage,
              userMessagePreview: functionCall.resolucion?.userMessage?.substring(0, 100)
            });

            // OPCIÓN 1: Si resolucion es un objeto con userMessage
            if (functionCall.resolucion && 
                typeof functionCall.resolucion === 'object' && 
                functionCall.resolucion.userMessage) {
              
              console.log("✅ Usando userMessage del resolucion");
              messageText = functionCall.resolucion.userMessage;
              
            } 
            // OPCIÓN 2: Si resolucion directamente es el mensaje (string)
            else if (typeof functionCall.resolucion === 'string') {
              
              console.log("⚠️ resolucion es string directo");
              messageText = functionCall.resolucion;
              
            } 
            // OPCIÓN 3: Mensaje genérico como fallback
            else {
              
              console.log("❌ No hay userMessage, usando mensaje genérico");
              messageText = `🏨 Encontré ${functionCall.resolucion?.hotelesEncontrados || 'algunas'} opciones de hoteles`;
              
            }
            break;
        case "search_hotel":
          messageText = "🔍 Buscando hoteles en línea...";
          // Si hay XML en resolucion, parsearlo
          if (functionCall.resolucion && typeof functionCall.resolucion === "string") {
            componente = parseToJson(functionCall.resolucion);
          }
          break;
        case "orquestador":
          messageText = "🤖 Procesando tu solicitud...";
          break;
        default:
          messageText = `✅ ${functionCall.tarea || "Tarea"} completada`;
      }
      
      if (messageText) {
        const messageChat: MessageChat = {
          role: "assistant" as const,
          text: messageText,
          componente: componente
        };
        messagesFromHistory.push(messageChat);
      }
    }
  });

  console.log("💬 Mensajes extraídos del historial:", {
    total: messagesFromHistory.length,
    messages: messagesFromHistory.map(m => ({
      text: m.text.substring(0, 50) + (m.text.length > 50 ? "..." : ""),
      hasComponente: !!m.componente
    }))
  });

  // 2. Eliminar duplicados (mismo texto y mismo rol)
  const uniqueMessages = messagesFromHistory.filter((msg, index, self) =>
    index === self.findIndex((m) => 
      m.text === msg.text && m.role === msg.role
    )
  );

  console.log("✨ Mensajes únicos después de filtrar:", uniqueMessages.length);

  // 3. Actualizar estado
  dispatcher({ type: "SET_MESSAGES", payload: uniqueMessages.reverse() });
  dispatcher({ type: "SET_HISTORY", payload: history });
};

  //Debe enviar el history y el stack para poder actualizarlos según la respuesta del servidor
  const waitChatResponse = async () => {
    console.log("waitChatResponse - stack actual:", state.stack);
    try {
      const response = await ChatService.getInstance().esperarRespuesta({
        thread: state.thread,
        history: state.history,
        stack: state.stack,
      });
      if (!response?.data) throw new Error("No se recibió respuesta de chat");
      console.log("Respuesta recibida en waitChatResponse:", response.data);

      updateChat(response.data);
      if (response.data.stack.length === 0) {
        clearStack();
        setLoading(false);
      }
    } catch (error) {
      console.error("Error al esperar la respuesta del chat:", error);
      throw error;
    }
  };

  const updateChat = ({
    stack,
    history,
    thread,
  }: {
    stack: ItemStack[];
    history: ItemHistory[];
    thread: string | null;
  }) => {
    updateHistory(history);
    updateThread(thread);
    addToStack(stack);
  };

  // Envía un mensaje al servicio de chat
  const sendMessage = async () => {
    console.log("sendMessage - stack actual:", state.stack);
    const message = state.input;
    try {
      if (state.input.trim() === "") return;
      if (state.stack.length > 0)
        throw new Error(
          "Espera a que se termine de procesar la solicitud actual."
        );

      clearInput();
      updateMessages([
        {
          role: "user",
          text: message,
          componente: undefined,
        },
        ...state.messages.reverse(),
      ]);

      setLoading(true);

      const response = await ChatService.getInstance().enviarMensaje({
        message,
        thread: state.thread,
        history: state.history,
        stack: state.stack,
      });
      if (!response.data) throw new Error("No se recibió respuesta de chat");
      console.log("Respuesta recibida en sendMessage:", response.data);
      if (response.data.stack.length === 0) {
        setLoading(false);
      }
      //Actualizamos el stack y el history
      updateChat(response.data);
      clearInput();
    } catch (error: any) {
      console.error(error.message || "Error al enviar el mensaje");
      showNotification("error", error.message || "Error al enviar el mensaje");
      setInput(message); // Restaurar el mensaje en el input en caso de error
      setLoading(false);
    }
  };

  return {
    loading: state.isLoading,
    stack: state.stack,
    input: state.input,
    setInput,
    sendMessage,
    waitChatResponse,
    messages: state.messages,
    setCartSelected,
    setFlySelected,
    state,
  };
};
