import { ApiError } from "../services/ApiService";

const QUOTE_FIELD_LABELS: Record<string, string> = {
  origin: "origen",
  destination: "destino",
  departureDate: "fecha de salida",
  returnDate: "fecha de regreso",
  tripType: "tipo de viaje",
  airline: "aerolínea",
  cabin: "clase",
  flightNumber: "número de vuelo",
  pickupLocation: "lugar de recogida",
  dropoffLocation: "lugar de devolución",
  pickupDate: "fecha de recogida",
  dropoffDate: "fecha de devolución",
  pickupTime: "hora de recogida",
  dropoffTime: "hora de devolución",
  carCategory: "categoría de auto",
  city: "ciudad u hotel",
  hotelName: "hotel",
  checkIn: "entrada",
  checkOut: "salida",
  rooms: "habitaciones",
  roomType: "tipo de habitación",
  guests: "huéspedes",
  busLine: "línea de autobús",
  serviceClass: "clase de servicio",
  travelers: "viajeros",
  travelerNames: "nombres de viajeros",
  notes: "notas",
};

// "items.0.origin" -> "Servicio 1: origen"; "notas" -> "Notas generales".
const describeIssuePath = (path: string): string => {
  const match = path.match(/^items\.(\d+)\.(.+)$/);
  if (match) {
    const field = match[2].split(".")[0];
    return `Servicio ${Number(match[1]) + 1}: ${QUOTE_FIELD_LABELS[field] ?? field}`;
  }
  if (path === "notas" || path === "notes") return "Notas generales";
  if (path === "resumen") return "Resumen";
  if (path.startsWith("archivos")) return "Archivos adjuntos";
  return path || "Cotización";
};

const MAX_ISSUES_SHOWN = 4;

export const describeSubmitError = (
  err: unknown
): { message: string; uncertain: boolean } => {
  if (err instanceof ApiError) {
    if (err.status === 400) {
      const details = err.response?.error?.details as
        | { issues?: Array<{ path?: unknown; message?: unknown }> }
        | undefined;
      const issues = Array.isArray(details?.issues) ? details.issues : [];
      const lines = issues
        .filter((i) => typeof i?.message === "string")
        .slice(0, MAX_ISSUES_SHOWN)
        .map((i) => `${describeIssuePath(String(i.path ?? ""))}: ${i.message}`);
      if (lines.length > 0) {
        const extra = issues.length - lines.length;
        return {
          message: `Revisa estos datos antes de enviar: ${lines.join("; ")}${
            extra > 0 ? `; y ${extra} más` : ""
          }.`,
          uncertain: false,
        };
      }
      return {
        message: "Hay datos de la cotización que no son válidos. Revísalos e intenta de nuevo.",
        uncertain: false,
      };
    }
    if (err.status === 429) {
      return {
        message: "Demasiadas solicitudes, intenta en unos minutos.",
        uncertain: false,
      };
    }
    if (err.status === 401 || err.status === 403) {
      return {
        message: "No tienes acceso para enviar cotizaciones. Vuelve a iniciar sesión e intenta de nuevo.",
        uncertain: false,
      };
    }
    return {
      message: "No se pudo enviar la cotización. Intenta de nuevo en unos minutos.",
      uncertain: false,
    };
  }
  // Sin respuesta del servidor (red, timeout o respuesta ilegible): puede haberse guardado.
  return {
    message:
      "No pudimos confirmar si se envió; revisa con Operaciones antes de reenviar.",
    uncertain: true,
  };
};
