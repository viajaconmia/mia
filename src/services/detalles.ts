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

export async function fetchFullDetalles({
  id_agente,
  id_buscar,
}: FetchFullDetallesParams): Promise<ConexionFullResponse> {
  if (!id_buscar) {
    throw new Error("Faltan parámetros: id_buscar es requerido");
  }

  const raw = String(id_buscar).trim();
  const lower = raw.toLowerCase();

  const isFactura = lower.startsWith("fac");
  const isPago = lower.startsWith("pag") || /^\d+$/.test(lower);

  // Nota: id_agente se mantiene por compatibilidad con tu firma actual,
  // aunque en este request no se usa.
  void id_agente;

  const base = isFactura
    ? `${URL}/v1/mia/factura/detalles_facturas`
    : isPago
    ? `${URL}/v1/mia/pagos/detalles_pagos`
    : `${URL}/v1/mia/reservas/detalles_reservas`;

  const endpoint = `${base}?id_raw=${encodeURIComponent(raw)}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: HEADERS_API,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Error al obtener detalles");
  }

  return json as ConexionFullResponse;
}
