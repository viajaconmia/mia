import {
  ItemHistory,
  ItemStack,
  MessageChat,
  useChatContext,
} from "../context/ChatContext";
import { ChatService } from "../services/chatService";
import { useNotification } from "./useNotification";

export const useChat = () => {
  const { dispatcher, state } = useChatContext();
  const { showNotification } = useNotification();

  //Esta lógica asegura que no se dupliquen items en el stack y que si ya existe, se actualice.
  const addToStack = (newItems: ItemStack[]) => {
    const newStack = state.stack.map((item) => {
      let exists = newItems.some(
        (newItem) => newItem.functionCall.id === item.functionCall.id
      );
      return exists
        ? newItems.find((n) => n.functionCall.id === item.functionCall.id)!
        : item;
    });
    const newItemsToAdd = newItems.filter(
      (newItem) =>
        !state.stack.some(
          (item) => item.functionCall.id === newItem.functionCall.id
        )
    );
    newStack.push(...newItemsToAdd);
    dispatcher({ type: "SET_STACK", payload: newStack });
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
    dispatcher({ type: "SET_MESSAGES", payload: messages.reverse() });
  };

  // Limpia los mensajes
  // const clearMessages = () => {
  //   dispatcher({ type: "SET_MESSAGES", payload: [] });
  // };

  //Debemos formatear y separar los mensajes de la stack y asi para poder pintarlos correctamente
  const updateHistory = (history: ItemHistory[]) => {
    const messages: MessageChat[] = history
      .filter((item) => (item as any).text !== undefined)
      .map((item) => item as MessageChat);
    updateMessages(messages);
    dispatcher({ type: "SET_HISTORY", payload: history });
  };

  //Debe enviar el history y el stack para poder actualizarlos según la respuesta del servidor, pero aqui cada que se actualice el historial se debe separar lo que es los mensajes del stack
  const waitChatResponse = async () => {
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
    const message = state.input;
    try {
      if (state.input.trim() === "") return;
      if (state.stack.length > 0)
        throw new Error(
          "Espera a que se termine de procesar la solicitud actual."
        );

      clearInput();
      updateMessages([
        { role: "user", text: message },
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
  };
};

// export const demoFlightMessage: ChatContent = {
//   component_type: "flight",
//   payload: {
//     type: "flight_options",
//     searchId: "search-demo-123",
//     options: [
//       {
//         id: "opt-1",
//         itineraryType: "round_trip",
//         segments: [
//           {
//             origin: {
//               airportCode: "MEX",
//               city: "Ciudad de México",
//               airportName: "AICM T2",
//             },
//             destination: {
//               airportCode: "MTY",
//               city: "Monterrey",
//               airportName: "Aeropuerto Internacional de Monterrey",
//             },
//             departureTime: "2025-12-10T08:30:00-06:00",
//             arrivalTime: "2025-12-10T10:05:00-06:00",
//             airline: "Aeroméxico",
//             flightNumber: "AM1234",
//           },
//           {
//             origin: {
//               airportCode: "MTY",
//               city: "Monterrey",
//               airportName: "Aeropuerto Internacional de Monterrey",
//             },
//             destination: {
//               airportCode: "MEX",
//               city: "Ciudad de México",
//               airportName: "AICM T2",
//             },
//             departureTime: "2025-12-15T18:45:00-06:00",
//             arrivalTime: "2025-12-15T20:20:00-06:00",
//             airline: "Aeroméxico",
//             flightNumber: "AM5678",
//           },
//         ],
//         seat: {
//           isDesiredSeat: true,
//           requestedSeatLocation: "window",
//           assignedSeatLocation: "window",
//         },
//         baggage: {
//           hasCheckedBaggage: true,
//           pieces: 1,
//         },
//         price: {
//           currency: "MXN",
//           total: 3250.99,
//         },
//       },
//       {
//         id: "opt-2",
//         itineraryType: "one_way",
//         segments: [
//           {
//             origin: {
//               airportCode: "MEX",
//               city: "Ciudad de México",
//             },
//             destination: {
//               airportCode: "CUN",
//               city: "Cancún",
//             },
//             departureTime: "2025-12-11T12:00:00-06:00",
//             arrivalTime: "2025-12-11T15:10:00-05:00",
//             airline: "Volaris",
//             flightNumber: "Y4235",
//           },
//         ],
//         seat: {
//           isDesiredSeat: false,
//           requestedSeatLocation: "aisle",
//           assignedSeatLocation: "middle",
//         },
//         baggage: {
//           hasCheckedBaggage: false,
//           pieces: 0,
//         },
//         price: {
//           currency: "MXN",
//           total: 1899,
//         },
//       },
//     ],
//   },
// };
