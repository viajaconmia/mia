import type {
  QuoteDraft,
  QuoteItem,
  QuoteMissingField,
  QuoteServiceType,
} from "../services/miaAiService";

// ---- Archivos adjuntos permitidos en modo cotización ----
export const QUOTE_MAX_FILES = 3;
export const QUOTE_MAX_FILE_BYTES = 4 * 1024 * 1024;
export const QUOTE_ACCEPT =
  ".pdf,.csv,.xlsx,.png,.jpg,.jpeg,.webp,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,image/jpeg,image/webp";

export type QuoteFileKind = "pdf" | "imagen" | "csv" | "excel";

const EXTENSION_KIND: Record<string, QuoteFileKind> = {
  pdf: "pdf",
  png: "imagen",
  jpg: "imagen",
  jpeg: "imagen",
  webp: "imagen",
  csv: "csv",
  xlsx: "excel",
};

export const quoteFileKind = (fileName: string): QuoteFileKind | null => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_KIND[ext] ?? null;
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type FileLike = { name: string; size: number };

// Valida los archivos nuevos contra los ya elegidos; devuelve los aceptados y un mensaje por rechazo.
export function validateQuoteFiles<T extends FileLike>(
  current: T[],
  incoming: T[]
): { accepted: T[]; errors: string[] } {
  const accepted: T[] = [];
  const errors: string[] = [];

  for (const file of incoming) {
    if (current.length + accepted.length >= QUOTE_MAX_FILES) {
      errors.push(
        `Máximo ${QUOTE_MAX_FILES} archivos por mensaje: "${file.name}" no se agregó.`
      );
      continue;
    }
    if (!quoteFileKind(file.name)) {
      errors.push(
        `"${file.name}" no es un formato permitido (PDF, imagen, CSV o Excel .xlsx).`
      );
      continue;
    }
    if (file.size > QUOTE_MAX_FILE_BYTES) {
      errors.push(
        `"${file.name}" pesa ${formatBytes(file.size)}; el máximo es ${formatBytes(
          QUOTE_MAX_FILE_BYTES
        )}.`
      );
      continue;
    }
    if (file.size === 0) {
      errors.push(`"${file.name}" está vacío.`);
      continue;
    }
    if (
      [...current, ...accepted].some(
        (f) => f.name === file.name && f.size === file.size
      )
    ) {
      errors.push(`"${file.name}" ya estaba agregado.`);
      continue;
    }
    accepted.push(file);
  }

  return { accepted, errors };
}

export type QuoteOrigenEntrada =
  | "texto"
  | "pdf"
  | "imagen"
  | "csv"
  | "excel"
  | "mixto";

export function detectOrigenEntrada(fileNames: string[]): QuoteOrigenEntrada {
  const kinds = new Set(
    fileNames.map(quoteFileKind).filter((k): k is QuoteFileKind => k !== null)
  );
  if (kinds.size === 0) return "texto";
  if (kinds.size === 1) return [...kinds][0];
  return "mixto";
}

// ---- Campos requeridos por tipo (contrato) ----
interface RequiredRule {
  field: string;
  label: string;
  anyOf?: string[];
}

const REQUIRED_RULES: Record<QuoteServiceType, RequiredRule[]> = {
  flight: [
    { field: "origin", label: "Origen" },
    { field: "destination", label: "Destino" },
    { field: "departureDate", label: "Fecha de salida" },
  ],
  car_rental: [
    { field: "pickupLocation", label: "Lugar de recolección" },
    { field: "pickupDate", label: "Fecha de recolección" },
    { field: "dropoffDate", label: "Fecha de devolución" },
  ],
  hotel: [
    { field: "city", label: "Ciudad u hotel", anyOf: ["city", "hotelName"] },
    { field: "checkIn", label: "Check-in" },
    { field: "checkOut", label: "Check-out" },
  ],
  bus: [
    { field: "origin", label: "Origen" },
    { field: "destination", label: "Destino" },
    { field: "departureDate", label: "Fecha de salida" },
  ],
};

const isFilled = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return value !== undefined && value !== null;
};

export const getItemField = (item: QuoteItem, key: string): unknown =>
  (item as unknown as Record<string, unknown>)[key];

// Campos cuyo cambio invalida las opciones encontradas por los agentes (ver foundOptions):
// si el cliente edita el origen/destino/lugar de recolección a mano, las opciones que
// había ya no corresponden a la ruta nueva.
const SEARCH_RELEVANT_FIELDS: Record<QuoteServiceType, string[]> = {
  flight: ["origin", "destination"],
  car_rental: ["pickupLocation"],
  hotel: [],
  bus: ["origin", "destination"],
};

export const setItemField = (
  item: QuoteItem,
  key: string,
  value: unknown
): QuoteItem => {
  const next = { ...item, [key]: value } as QuoteItem;
  if (SEARCH_RELEVANT_FIELDS[item.type].includes(key)) {
    delete (next as unknown as Record<string, unknown>).foundOptions;
    delete (next as unknown as Record<string, unknown>).preferredOptionId;
  }
  return next;
};

// El backend solo intenta buscar opciones si el ítem ya trae estos campos (ver
// agente_servicios/src/agents/quote/quote-options.enricher.ts). Si ya los tiene y aun así
// no hay foundOptions, es porque la búsqueda falló o no encontró nada — no porque falte info.
export const isEligibleForFoundOptions = (item: QuoteItem): boolean => {
  const fields = SEARCH_RELEVANT_FIELDS[item.type];
  if (fields.length === 0) return false;
  return fields.every((key) => {
    const value = getItemField(item, key);
    return typeof value === "string" && value.trim().length > 0;
  });
};

export function computeMissingFields(items: QuoteItem[]): QuoteMissingField[] {
  const missing: QuoteMissingField[] = [];
  for (const item of items) {
    for (const rule of REQUIRED_RULES[item.type] ?? []) {
      const keys = rule.anyOf ?? [rule.field];
      if (!keys.some((k) => isFilled(getItemField(item, k)))) {
        missing.push({ itemId: item.id, field: rule.field, label: rule.label });
      }
    }
  }
  return missing;
}

// Un campo "anyOf" (hotel: ciudad u hotel) se marca como faltante en ambos.
export function isFieldMissing(
  missing: QuoteMissingField[],
  itemId: string,
  field: string,
  type?: QuoteServiceType
): boolean {
  if (missing.some((m) => m.itemId === itemId && m.field === field)) return true;
  if (type === "hotel" && field === "hotelName") {
    return missing.some((m) => m.itemId === itemId && m.field === "city");
  }
  return false;
}

export const isRequiredField = (
  type: QuoteServiceType,
  field: string
): boolean =>
  (REQUIRED_RULES[type] ?? []).some(
    (r) => r.field === field || (r.anyOf ?? []).includes(field)
  );

export function withRecomputedMissing(draft: QuoteDraft): QuoteDraft {
  return { ...draft, missingFields: computeMissingFields(draft.items) };
}

export const isDraftComplete = (draft: QuoteDraft | null): boolean =>
  !!draft && draft.items.length > 0 && computeMissingFields(draft.items).length === 0;

export const QUOTE_TYPE_LABELS: Record<QuoteServiceType, string> = {
  flight: "Vuelo",
  car_rental: "Renta de auto",
  hotel: "Hotel",
  bus: "Autobús",
};

export const createBlankQuoteItem = (type: QuoteServiceType): QuoteItem => {
  const id = `item-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  return { id, type } as QuoteItem;
};

// ---- Campos editables por tipo (sin precios) ----
export type QuoteFieldKind = "text" | "date" | "time" | "number" | "select" | "bool" | "list";

export interface QuoteFieldDef {
  key: string;
  label: string;
  kind: QuoteFieldKind;
  options?: Array<{ value: string; label: string }>;
  wide?: boolean;
}

export const QUOTE_ITEM_FIELDS: Record<QuoteServiceType, QuoteFieldDef[]> = {
  flight: [
    {
      key: "tripType",
      label: "Tipo de viaje",
      kind: "select",
      options: [
        { value: "oneway", label: "Sencillo" },
        { value: "roundtrip", label: "Redondo" },
        { value: "multicity", label: "Multidestino" },
      ],
    },
    { key: "origin", label: "Origen", kind: "text" },
    { key: "destination", label: "Destino", kind: "text" },
    { key: "departureDate", label: "Fecha de salida", kind: "date" },
    { key: "returnDate", label: "Fecha de regreso", kind: "date" },
    { key: "airline", label: "Aerolínea", kind: "text" },
    { key: "cabin", label: "Cabina", kind: "text" },
    { key: "flightNumber", label: "Número de vuelo", kind: "text" },
    { key: "travelers", label: "Pasajeros", kind: "number" },
    { key: "travelerNames", label: "Nombres de viajeros (separados por coma)", kind: "list", wide: true },
    { key: "notes", label: "Notas", kind: "text", wide: true },
  ],
  car_rental: [
    { key: "pickupLocation", label: "Lugar de recolección", kind: "text" },
    { key: "dropoffLocation", label: "Lugar de devolución", kind: "text" },
    { key: "pickupDate", label: "Fecha de recolección", kind: "date" },
    { key: "pickupTime", label: "Hora de recolección", kind: "time" },
    { key: "dropoffDate", label: "Fecha de devolución", kind: "date" },
    { key: "dropoffTime", label: "Hora de devolución", kind: "time" },
    { key: "carCategory", label: "Categoría de auto", kind: "text" },
    { key: "withDriver", label: "Con chofer", kind: "bool" },
    { key: "travelers", label: "Personas", kind: "number" },
    { key: "travelerNames", label: "Nombres de viajeros (separados por coma)", kind: "list", wide: true },
    { key: "notes", label: "Notas", kind: "text", wide: true },
  ],
  hotel: [
    { key: "city", label: "Ciudad", kind: "text" },
    { key: "hotelName", label: "Hotel", kind: "text" },
    { key: "checkIn", label: "Check-in", kind: "date" },
    { key: "checkOut", label: "Check-out", kind: "date" },
    { key: "rooms", label: "Habitaciones", kind: "number" },
    { key: "roomType", label: "Tipo de habitación", kind: "text" },
    { key: "guests", label: "Huéspedes", kind: "number" },
    { key: "travelerNames", label: "Nombres de huéspedes (separados por coma)", kind: "list", wide: true },
    { key: "notes", label: "Notas", kind: "text", wide: true },
  ],
  bus: [
    { key: "origin", label: "Origen", kind: "text" },
    { key: "destination", label: "Destino", kind: "text" },
    { key: "departureDate", label: "Fecha de salida", kind: "date" },
    { key: "returnDate", label: "Fecha de regreso", kind: "date" },
    { key: "busLine", label: "Línea de autobús", kind: "text" },
    { key: "serviceClass", label: "Clase de servicio", kind: "text" },
    { key: "travelers", label: "Pasajeros", kind: "number" },
    { key: "travelerNames", label: "Nombres de viajeros (separados por coma)", kind: "list", wide: true },
    { key: "notes", label: "Notas", kind: "text", wide: true },
  ],
};

// ---- Envío a bacl (nunca viajan precios) ----
const PRICE_KEY = /(price|precio|total|amount|monto|costo|cost|tarifa)/i;

function stripEmptyAndPrices(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map(stripEmptyAndPrices)
      .filter((v) => v !== undefined && v !== "");
  }
  if (value && typeof value === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (PRICE_KEY.test(key)) continue;
      const next = stripEmptyAndPrices(val);
      if (next === undefined || next === null || next === "") continue;
      if (Array.isArray(next) && next.length === 0) continue;
      clean[key] = next;
    }
    return clean;
  }
  return value;
}

export interface QuoteSubmitUser {
  id: string;
  name?: string;
  email?: string;
  idAgente?: string;
}

export interface QuoteSubmissionBody {
  id_usuario: string;
  id_agente?: string;
  solicitante_nombre?: string;
  solicitante_correo?: string;
  origen_entrada: QuoteOrigenEntrada;
  resumen: string;
  notas?: string;
  items: QuoteItem[];
  archivos: Array<{
    nombre: string;
    mime: string;
    size: number;
    storage_path: string | null;
  }>;
}

export function buildQuoteSubmission(
  draft: QuoteDraft,
  user: QuoteSubmitUser
): QuoteSubmissionBody {
  const items = draft.items.map(stripEmptyAndPrices) as QuoteItem[];
  const body: QuoteSubmissionBody = {
    id_usuario: user.id,
    origen_entrada: detectOrigenEntrada(draft.files.map((f) => f.fileName)),
    resumen: draft.resumen.trim() || defaultResumen(draft.items),
    items,
    archivos: draft.files.map((f) => ({
      nombre: f.fileName,
      mime: f.mimeType,
      size: f.sizeBytes,
      storage_path: f.storagePath,
    })),
  };
  if (user.idAgente) body.id_agente = user.idAgente;
  if (user.name?.trim()) body.solicitante_nombre = user.name.trim();
  if (user.email?.trim()) body.solicitante_correo = user.email.trim();
  if (draft.notes?.trim()) body.notas = draft.notes.trim();
  return body;
}

export function defaultResumen(items: QuoteItem[]): string {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});
  const parts = Object.entries(counts).map(
    ([type, n]) => `${n} ${QUOTE_TYPE_LABELS[type as QuoteServiceType].toLowerCase()}`
  );
  return parts.length > 0 ? `Cotización de ${parts.join(", ")}` : "Cotización";
}

export const DEFAULT_QUOTE_FILES_MESSAGE =
  "Cotiza lo que viene en los archivos adjuntos.";

export const resolveQuoteMessage = (text: string, fileCount: number): string => {
  const trimmed = text.trim();
  if (trimmed) return trimmed;
  return fileCount > 0 ? DEFAULT_QUOTE_FILES_MESSAGE : "";
};
