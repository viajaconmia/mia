import { FetchChatResponse, FetchFormatResponse } from "../types/chat";

async function sendMessage(
  message: string,
  threadId: string | null,
  userId: string | null,
  onResponse: (data: FetchFormatResponse) => void
) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        content: message,
        thread_id: threadId,
        user_id: userId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error en la petición al chat:", errorData);
      throw errorData;
    }

    const data: FetchChatResponse = await res.json();
    const formatResponse = {
      thread: data.response.thread_id,
      response: data.response.value.content,
      reserva: data.response.value.reservasEnProceso,
    };
    console.log(formatResponse);
    onResponse(formatResponse);
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
    onResponse({ error: "Error al enviar el mensaje." });
  }
}

export { sendMessage };

const API_URL = "https://chatmia.wl.r.appspot.com/chat";
