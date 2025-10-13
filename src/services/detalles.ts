// services/fetchFullDetalles.ts
import { HEADERS_API, URL } from "../constants/apiConstant";

export type ConexionFullResponse = {
  message: string;
  tipo_origen: "reserva" | "pago" | "factura";
  id_origen: string;
  id_agente: string;
  pagos?: any[];
  reservas?: any[];
  facturas?: any[];
};

type FetchFullDetallesParams = {
  id_agente: string;
  id_buscar: string;
};

export async function fetchFullDetalles(
  { id_agente, id_buscar }: FetchFullDetallesParams
): Promise<ConexionFullResponse> {
  if (!id_agente || !id_buscar) {
    throw new Error("Faltan parámetros: id_agente e id_buscar son requeridos");
  }

  const endpoint = `${URL}/v1/mia/factura/getfulldetalles?id_agente=${encodeURIComponent(
    id_agente
  )}&id_buscar=${encodeURIComponent(id_buscar)}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: HEADERS_API,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Error al obtener conexiones");
  }
  return json as ConexionFullResponse;
}
