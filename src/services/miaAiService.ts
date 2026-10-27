import { MiaAiApiClient, MiaAiApiError } from "./MiaAiApiClient";

export { MiaAiApiClient, MiaAiApiError };

export type LLMProviderType = "gemini" | "openai";

export type TransportServiceType =
  | "flight"
  | "car_rental"
  | "chauffeur"
  | "ferry"
  | "train"
  | "bus";

export type AgentSpecialtyType =
  | TransportServiceType
  | "pdf_specialist"
  | "csv_analyst"
  | "quote_agent"
  | "general_assistant";

export interface TravelState {
  activeService?: TransportServiceType;
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  serviceClass?: string;
  vehicleType?: string;
  withDriver?: boolean;
  notes?: string;
}

export interface AttachedDocumentMeta {
  documentId: string;
  fileName: string;
  fileType: "pdf" | "csv";
  totalChunks: number;
  totalTokens: number;
  uploadedAt: string;
}

export interface SessionState {
  sessionId: string;
  userId: string;
  messagesUsed: number;
  maxMessages: number;
  filesUploaded: number;
  maxFiles: number;
  attachedDocuments: AttachedDocumentMeta[];
  travelState: TravelState;
  createdAt: string;
  updatedAt: string;
}

export interface TransportOptionItem {
  provider: string;
  serviceName?: string;
  departurePoint?: string;
  arrivalPoint?: string;
  estimatedDuration?: string;
  frequencyOrSchedule?: string;
  departureTimes?: string[];
  serviceClass?: string;
  vehicleCategory?: string;
  highlights: string[];
  sourceUrl?: string;
}

// Opción encontrada por un agente de transporte y anexada a un ítem de cotización.
export interface QuoteFoundOption extends TransportOptionItem {
  id: string;
}

export type UIPayloadType =
  | "none"
  | "transport_options"
  | "table"
  | "summary_cards"
  | "extracted_fields"
  | "quote_draft";

export interface UIPayload {
  type: UIPayloadType;
  title?: string;
  serviceType?: TransportServiceType;
  route?: {
    origin?: string;
    destination?: string;
    date?: string;
    passengers?: number;
  };
  options?: TransportOptionItem[];
  tableData?: {
    columns: string[];
    rows: Record<string, string | number | null>[];
  };
  cards?: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
  quoteDraft?: QuoteDraft;
}

// ---- Cotizaciones (contrato compartido con mia_ai y bacl). Sin precios. ----
export type QuoteServiceType = "flight" | "car_rental" | "hotel" | "bus";

export interface QuoteItemBase {
  id: string;
  type: QuoteServiceType;
  travelers?: number;
  travelerNames?: string[];
  notes?: string;
}

export interface FlightQuoteItem extends QuoteItemBase {
  type: "flight";
  tripType?: "oneway" | "roundtrip" | "multicity";
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  airline?: string;
  cabin?: string;
  flightNumber?: string;
  foundOptions?: QuoteFoundOption[];
  preferredOptionId?: string | null;
}

export interface CarRentalQuoteItem extends QuoteItemBase {
  type: "car_rental";
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  pickupTime?: string;
  dropoffTime?: string;
  carCategory?: string;
  withDriver?: boolean;
  foundOptions?: QuoteFoundOption[];
  preferredOptionId?: string | null;
}

export interface HotelQuoteItem extends QuoteItemBase {
  type: "hotel";
  city?: string;
  hotelName?: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  roomType?: string;
  guests?: number;
}

export interface BusQuoteItem extends QuoteItemBase {
  type: "bus";
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  busLine?: string;
  serviceClass?: string;
  foundOptions?: QuoteFoundOption[];
  preferredOptionId?: string | null;
}

export type QuoteItem =
  | FlightQuoteItem
  | CarRentalQuoteItem
  | HotelQuoteItem
  | BusQuoteItem;

export interface QuoteFileRef {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string | null;
  uploadError?: string;
}

export interface QuoteMissingField {
  itemId: string;
  field: string;
  label: string;
}

export interface QuoteDraft {
  resumen: string;
  items: QuoteItem[];
  notes?: string;
  files: QuoteFileRef[];
  missingFields: QuoteMissingField[];
}

export interface DocumentSourceCitation {
  fileName: string;
  fileType: "pdf" | "csv";
  pageOrRowRange: string;
  snippet: string;
  isSummaryChunk?: boolean;
}

export interface TokenUsageMeta {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface SessionQuotaState {
  messagesUsed: number;
  maxMessages: number;
  messagesRemaining: number;
  filesUploaded: number;
  maxFiles: number;
}

export interface ChatResponseMetadata {
  sessionId: string;
  agentUsed: AgentSpecialtyType;
  providerUsed: LLMProviderType;
  modelUsed: string;
  fallbackTriggered: boolean;
  tokenUsage: TokenUsageMeta;
  latencyMs: number;
  sources: DocumentSourceCitation[];
  webSourcesUsed?: Array<{ title: string; url: string }>;
  quota: SessionQuotaState;
}

export interface AgentExecutionResult {
  answer: string;
  uiPayload: UIPayload;
  suggestedActions: string[];
  updatedTravelState?: Partial<TravelState>;
  metadata: ChatResponseMetadata;
}

export interface IngestDocumentResponse {
  sessionId: string;
  document: AttachedDocumentMeta;
  summaryPreview: string | null;
  sampleChunks: Array<{
    preview: string;
    metadata: Record<string, unknown>;
  }>;
  quota: {
    filesUploaded: number;
    maxFiles: number;
    filesRemaining: number;
    messagesUsed: number;
    maxMessages: number;
  };
}

export interface ChatMessageRecord {
  id?: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  uiPayload?: UIPayload;
  metadata?: Partial<ChatResponseMetadata>;
  createdAt: string;
}

export interface MiaAiHealthResponse {
  status: string;
  service: string;
  defaultProvider: LLMProviderType;
  timestamp: string;
}

export class MiaAiService extends MiaAiApiClient {
  private static instance: MiaAiService;

  constructor() {
    super("");
  }

  public static getInstance(): MiaAiService {
    if (!MiaAiService.instance) {
      MiaAiService.instance = new MiaAiService();
    }
    return MiaAiService.instance;
  }

  public async ingestDocument(params: {
    file: File;
    sessionId: string;
    userId?: string;
    provider?: LLMProviderType;
  }): Promise<IngestDocumentResponse> {
    const formData = new FormData();
    formData.append("file", params.file);
    formData.append("sessionId", params.sessionId);
    if (params.userId) formData.append("userId", params.userId);
    if (params.provider) formData.append("provider", params.provider);

    return this.postFormData<IngestDocumentResponse>({
      path: "/documents/ingest",
      formData,
    });
  }

  public async sendMessage(params: {
    sessionId: string;
    userId?: string;
    message: string;
    provider?: LLMProviderType;
    file?: File;
    mode?: "quote";
    currentDraft?: QuoteDraft | null;
    files?: File[];
  }): Promise<AgentExecutionResult> {
    if (params.mode === "quote") {
      const hasFiles = Boolean(params.files && params.files.length > 0);
      if (hasFiles) {
        const formData = new FormData();
        params.files!.forEach((f) => formData.append("files", f));
        formData.append("sessionId", params.sessionId);
        formData.append("message", params.message);
        formData.append("mode", "quote");
        if (params.currentDraft) {
          formData.append("currentDraft", JSON.stringify(params.currentDraft));
        }
        if (params.userId) formData.append("userId", params.userId);
        if (params.provider) formData.append("provider", params.provider);

        return this.postFormData<AgentExecutionResult>({
          path: "/chat",
          formData,
        });
      }

      return this.post<AgentExecutionResult>({
        path: "/chat",
        body: {
          sessionId: params.sessionId,
          userId: params.userId || "anonymous",
          message: params.message,
          provider: params.provider,
          mode: "quote",
          currentDraft: params.currentDraft ?? undefined,
        },
      });
    }

    if (params.file) {
      const formData = new FormData();
      formData.append("file", params.file);
      formData.append("sessionId", params.sessionId);
      formData.append("message", params.message);
      if (params.userId) formData.append("userId", params.userId);
      if (params.provider) formData.append("provider", params.provider);

      return this.postFormData<AgentExecutionResult>({
        path: "/chat",
        formData,
      });
    }

    return this.post<AgentExecutionResult>({
      path: "/chat",
      body: {
        sessionId: params.sessionId,
        userId: params.userId || "anonymous",
        message: params.message,
        provider: params.provider,
      },
    });
  }

  public async getSession(
    sessionId: string,
    userId?: string
  ): Promise<{
    session: SessionState;
    messages: ChatMessageRecord[];
  }> {
    return this.get<{
      session: SessionState;
      messages: ChatMessageRecord[];
    }>({
      path: `/chat/session/${encodeURIComponent(sessionId)}`,
      params: userId ? { userId } : {},
    });
  }

  public async checkHealth(): Promise<MiaAiHealthResponse> {
    return this.get<MiaAiHealthResponse>({
      path: "/health",
    });
  }
}

export const miaAiService = MiaAiService.getInstance();

export const ingestMiaDocument = (
  params: Parameters<MiaAiService["ingestDocument"]>[0]
) => miaAiService.ingestDocument(params);

export const sendMiaAiMessage = (
  params: Parameters<MiaAiService["sendMessage"]>[0]
) => miaAiService.sendMessage(params);

export const getMiaAiSession = (sessionId: string, userId?: string) =>
  miaAiService.getSession(sessionId, userId);

export const checkMiaAiHealth = () => miaAiService.checkHealth();
