import { useState, useCallback, useEffect, useRef } from "react";
import { useUser } from "../context/userContext";
import {
  AgentExecutionResult,
  AttachedDocumentMeta,
  ChatResponseMetadata,
  DocumentSourceCitation,
  IngestDocumentResponse,
  LLMProviderType,
  MiaAiApiError,
  QuoteDraft,
  SessionQuotaState,
  TransportOptionItem,
  TransportServiceType,
  TravelState,
  UIPayload,
  miaAiService,
} from "../services/miaAiService";
import { describeSubmitError } from "../utils/quoteSubmitError";
import { CotizacionIaService } from "../services/CotizacionIaService";
import {
  buildQuoteSubmission,
  isDraftComplete,
  resolveQuoteMessage,
  validateQuoteFiles,
  withRecomputedMissing,
} from "../utils/quoteDraft";

export type QuoteSubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; folio: string }
  // uncertain: el POST no recibió respuesta, no sabemos si bacl guardó la cotización.
  | { status: "error"; message: string; uncertain?: boolean };

export interface StudioChatMessage {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: string;
  metadata?: ChatResponseMetadata;
  uiPayload?: UIPayload;
  suggestedActions?: string[];
  retryable?: boolean;
  retryPrompt?: string;
}

export interface SelectedItineraryItem {
  id: string;
  serviceType: TransportServiceType;
  origin?: string;
  destination?: string;
  date?: string;
  option: TransportOptionItem;
  addedAt: string;
}

export interface StudioErrorState {
  message: string;
  code: string;
  retryable: boolean;
  lastPrompt?: string;
}

export const SERVICE_NAMES_ES: Record<TransportServiceType, string> = {
  flight: "Vuelos Comerciales",
  bus: "Autobuses Foráneos",
  train: "Trenes de Pasajeros",
  ferry: "Ferry / Navieras",
  car_rental: "Renta de Autos (Sin Chofer)",
  chauffeur: "Transporte Ejecutivo con Chofer",
};

export const QUICK_STARTERS: Array<{
  label: string;
  prompt: string;
  service: TransportServiceType;
}> = [
  {
    label: "✈️ Vuelos CDMX → Cancún",
    prompt:
      "Busca opciones de vuelos de Ciudad de México (CDMX) a Cancún para 2 pasajeros",
    service: "flight",
  },
  {
    label: "🚌 Autobuses GDL → Vallarta",
    prompt:
      "¿Qué líneas de autobuses ejecutivos van de Guadalajara a Puerto Vallarta y cuáles son sus terminales?",
    service: "bus",
  },
  {
    label: "⛴️ Ferry Playa → Cozumel",
    prompt:
      "Busca horarios y navieras de ferry de Playa del Carmen a Cozumel ida y vuelta",
    service: "ferry",
  },
  {
    label: "🚆 Tren Maya Mérida → Cancún",
    prompt:
      "¿Qué opciones y clases hay en el Tren Maya de Mérida Teya a Cancún Aeropuerto?",
    service: "train",
  },
  {
    label: "🚗 Renta Auto en Monterrey",
    prompt:
      "Quiero rentar un auto SUV sin chofer en el Aeropuerto de Monterrey por 4 días",
    service: "car_rental",
  },
  {
    label: "🕴️ Auto con Chofer CDMX",
    prompt:
      "Necesito transporte ejecutivo privado con chofer en CDMX desde Santa Fe al AICM",
    service: "chauffeur",
  },
];

// const INITIAL_SUGGESTED_ACTIONS = [
//   "Buscar vuelos de CDMX a Cancún mañana",
//   "Ver autobuses de Monterrey a Saltillo",
//   "Rentar un auto en Guadalajara por 3 días",
// ];

const INITIAL_QUOTA: SessionQuotaState = {
  messagesUsed: 0,
  maxMessages: 30,
  messagesRemaining: 30,
  filesUploaded: 0,
  maxFiles: 5,
};

const createSessionId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `mia-session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

// El sessionId se guarda por usuario para retomar la conversación al recargar
// sin que otra cuenta del mismo navegador vea el historial.
const SESSION_STORAGE_PREFIX = "mia-ai:session:";

const readStoredSessionId = (userId: string): string | null => {
  try {
    return localStorage.getItem(`${SESSION_STORAGE_PREFIX}${userId}`);
  } catch {
    return null;
  }
};

const storeSessionId = (userId: string, sessionId: string): void => {
  try {
    localStorage.setItem(`${SESSION_STORAGE_PREFIX}${userId}`, sessionId);
  } catch {
    // Sin localStorage la sesión simplemente no sobrevive a la recarga.
  }
};

// Marca de cotización ya enviada: evita reenviar el mismo borrador al recargar.
const QUOTE_SENT_PREFIX = "mia-ai:quote-sent:";

interface QuoteSentMarker {
  folio: string;
  messageCount: number;
}

const readQuoteSent = (sessionId: string): QuoteSentMarker | null => {
  try {
    const raw = localStorage.getItem(`${QUOTE_SENT_PREFIX}${sessionId}`);
    return raw ? (JSON.parse(raw) as QuoteSentMarker) : null;
  } catch {
    return null;
  }
};

const storeQuoteSent = (sessionId: string, marker: QuoteSentMarker): void => {
  try {
    localStorage.setItem(
      `${QUOTE_SENT_PREFIX}${sessionId}`,
      JSON.stringify(marker)
    );
  } catch {
    // Sin localStorage el borrador podría mostrarse de nuevo tras recargar.
  }
};

// Mensajes que sí existen en el servidor (los locales de aviso/archivo no se guardan allá).
const countPersistedMessages = (msgs: StudioChatMessage[]): number =>
  msgs.filter(
    (m) =>
      !m.id.startsWith("err-") &&
      !m.id.startsWith("doc-") &&
      !m.id.startsWith("sent-")
  ).length;

const formatNowTime = (): string =>
  new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function useMiaAiStudio() {
  const { authState } = useUser();
  const userId = authState?.user?.id || "demo-user";

  const [sessionId, setSessionId] = useState<string>(
    () => readStoredSessionId(userId) ?? createSessionId()
  );
  const [provider, setProvider] = useState<LLMProviderType>("gemini");
  const [messages, setMessages] = useState<StudioChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<StudioErrorState | null>(null);

  const [travelState, setTravelState] = useState<TravelState>({});
  const [attachedDocuments, setAttachedDocuments] = useState<
    AttachedDocumentMeta[]
  >([]);
  const [quota, setQuota] = useState<SessionQuotaState>(INITIAL_QUOTA);
  const [activePayload, setActivePayload] = useState<UIPayload | null>(null);
  const [activeSources, setActiveSources] = useState<DocumentSourceCitation[]>(
    []
  );
  const [activeWebSources, setActiveWebSources] = useState<
    Array<{ title: string; url: string }>
  >([]);
  const [lastIngestedDoc, setLastIngestedDoc] =
    useState<IngestDocumentResponse | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<
    SelectedItineraryItem[]
  >([]);
  const [activeViewTab, setActiveViewTab] = useState<"explorer" | "selection">(
    "explorer"
  );
  const [mobileView, setMobileView] = useState<"chat" | "canvas">("chat");

  // Modo cotización: adjuntos del siguiente mensaje y borrador vigente.
  const [quoteMode, setQuoteMode] = useState<boolean>(false);
  const [quoteFiles, setQuoteFiles] = useState<File[]>([]);
  const [quoteFileErrors, setQuoteFileErrors] = useState<string[]>([]);
  const [quoteDraft, setQuoteDraft] = useState<QuoteDraft | null>(null);
  const [quoteSubmit, setQuoteSubmit] = useState<QuoteSubmitState>({
    status: "idle",
  });

  // Sesión vigente: evita que una restauración lenta pise una conversación nueva.
  const activeSessionRef = useRef<string>(sessionId);

  const clearConversationState = useCallback(() => {
    setMessages([]);
    setInputMessage("");
    setPendingFile(null);
    setErrorState(null);
    setTravelState({});
    setAttachedDocuments([]);
    setLastIngestedDoc(null);
    setActivePayload(null);
    setActiveSources([]);
    setActiveWebSources([]);
    setSuggestedActions([]);
    setQuota(INITIAL_QUOTA);
    setQuoteMode(false);
    setQuoteFiles([]);
    setQuoteFileErrors([]);
    setQuoteDraft(null);
    setQuoteSubmit({ status: "idle" });
  }, []);

  const handleResetSession = useCallback(() => {
    const newSessionId = createSessionId();
    storeSessionId(userId, newSessionId);
    activeSessionRef.current = newSessionId;
    setSessionId(newSessionId);
    clearConversationState();
    setActiveViewTab("explorer");
  }, [userId, clearConversationState]);

  // Al cargar (o al cambiar de usuario) retoma la sesión guardada desde el backend.
  useEffect(() => {
    const stored = readStoredSessionId(userId);
    if (!stored) {
      const fresh = createSessionId();
      storeSessionId(userId, fresh);
      activeSessionRef.current = fresh;
      setSessionId(fresh);
      clearConversationState();
      return;
    }

    activeSessionRef.current = stored;
    setSessionId(stored);
    let cancelled = false;

    miaAiService
      .getSession(stored, userId)
      .then(({ session, messages: history }) => {
        if (cancelled || activeSessionRef.current !== stored) return;
        if (history.length === 0) return;

        const restored: StudioChatMessage[] = history.map((m, idx) => ({
          id: m.id ?? `restored-${idx}`,
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          uiPayload: m.uiPayload,
          metadata: m.metadata as ChatResponseMetadata | undefined,
        }));

        const lastPayload = [...history]
          .reverse()
          .find((m) => m.uiPayload && m.uiPayload.type !== "none")?.uiPayload;

        // Si la conversación terminó con un borrador de cotización, se retoma.
        const lastQuoteDraft = [...history]
          .reverse()
          .find((m) => m.uiPayload?.type === "quote_draft")?.uiPayload
          ?.quoteDraft;
        if (lastQuoteDraft) {
          const sent = readQuoteSent(stored);
          if (sent && history.length <= sent.messageCount) {
            setQuoteDraft(null);
            setQuoteMode(false);
            setQuoteSubmit({ status: "success", folio: sent.folio });
          } else {
            setQuoteDraft(withRecomputedMissing(lastQuoteDraft));
            setQuoteMode(true);
            setQuoteSubmit({ status: "idle" });
          }
        }

        setMessages(restored);
        setTravelState(session.travelState ?? {});
        setAttachedDocuments(session.attachedDocuments ?? []);
        setActivePayload(lastPayload ?? null);
        setQuota({
          messagesUsed: session.messagesUsed,
          maxMessages: session.maxMessages,
          messagesRemaining: Math.max(
            0,
            session.maxMessages - session.messagesUsed
          ),
          filesUploaded: session.filesUploaded,
          maxFiles: session.maxFiles,
        });
      })
      .catch(() => {
        // Si el backend no responde se queda el chat vacío con el mismo sessionId.
      });

    return () => {
      cancelled = true;
    };
  }, [userId, clearConversationState]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file || isUploading) return;
      setPendingFile(file);
      setIsUploading(true);
      setErrorState(null);

      try {
        const res = await miaAiService.ingestDocument({
          file,
          sessionId,
          userId,
          provider,
        });

        setLastIngestedDoc(res);
        setAttachedDocuments((prev) => [...prev, res.document]);
        setQuota((prev) => ({
          ...prev,
          filesUploaded: res.quota.filesUploaded,
          maxFiles: res.quota.maxFiles,
        }));
        setActiveViewTab("explorer");

        const docTypeLabel = res.document.fileType.toUpperCase();
        const followUpActions =
          res.document.fileType === "pdf"
            ? [
                `Extrae los datos clave y fechas de ${res.document.fileName}`,
                `Haz un resumen ejecutivo de ${res.document.fileName}`,
                `¿Qué políticas o importes menciona el PDF?`,
              ]
            : [
                `Muestra una tabla resumen y totales de ${res.document.fileName}`,
                `¿Cuáles son los valores más altos y promedios del CSV?`,
                `Agrupa los registros principales del archivo CSV`,
              ];

        setSuggestedActions(followUpActions);

        setMessages((prev) => [
          ...prev,
          {
            id: `doc-${Date.now()}`,
            role: "assistant",
            content: `✅ **Archivo ${docTypeLabel} tokenizado con éxito:** \`${res.document.fileName}\`\n- **Fragmentos (Chunks):** ${res.document.totalChunks}\n- **Tokens indexados:** ${res.document.totalTokens}\n\nYa puedes hacer preguntas específicas sobre este archivo a nuestro especialista **${
              res.document.fileType === "pdf" ? "PdfSpecialist" : "CsvAnalyst"
            }**.`,
            timestamp: formatNowTime(),
            suggestedActions: followUpActions,
          },
        ]);
      } catch (err) {
        const apiErr =
          err instanceof MiaAiApiError
            ? err
            : new MiaAiApiError({
                message: "Error al tokenizar el documento.",
                retryable: true,
              });

        setErrorState({
          message: apiErr.message,
          code: apiErr.code,
          retryable: apiErr.retryable,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "error",
            content: apiErr.message,
            retryable: false,
            timestamp: formatNowTime(),
          },
        ]);
      } finally {
        setIsUploading(false);
        setPendingFile(null);
      }
    },
    [isUploading, provider, sessionId, userId]
  );

  const executeMessage = useCallback(
    async (promptText: string) => {
      const outgoingFiles = quoteMode ? quoteFiles : [];
      const trimmed = quoteMode
        ? resolveQuoteMessage(promptText, outgoingFiles.length)
        : promptText.trim();
      if (!trimmed || isLoading) return;

      const userMsg: StudioChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content:
          outgoingFiles.length > 0
            ? `${trimmed}\n\n📎 ${outgoingFiles.map((f) => f.name).join(", ")}`
            : trimmed,
        timestamp: formatNowTime(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputMessage("");
      setIsLoading(true);
      setErrorState(null);

      try {
        const result: AgentExecutionResult = await miaAiService.sendMessage({
          sessionId,
          userId,
          message: trimmed,
          provider,
          ...(quoteMode
            ? { mode: "quote" as const, currentDraft: quoteDraft, files: outgoingFiles }
            : {}),
        });

        const assistantMsg: StudioChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: result.answer,
          timestamp: formatNowTime(),
          metadata: result.metadata,
          uiPayload: result.uiPayload,
          suggestedActions: result.suggestedActions,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (result.updatedTravelState) {
          setTravelState((prev) => ({
            ...prev,
            ...result.updatedTravelState,
          }));
        }

        if (result.uiPayload && result.uiPayload.type !== "none") {
          setActivePayload(result.uiPayload);
          setActiveViewTab("explorer");
        }

        if (result.uiPayload?.type === "quote_draft" && result.uiPayload.quoteDraft) {
          setQuoteDraft(withRecomputedMissing(result.uiPayload.quoteDraft));
          setQuoteSubmit({ status: "idle" });
        }
        if (outgoingFiles.length > 0) {
          setQuoteFiles([]);
          setQuoteFileErrors([]);
        }

        setActiveSources(result.metadata.sources || []);
        setActiveWebSources(result.metadata.webSourcesUsed || []);

        if (result.suggestedActions && result.suggestedActions.length > 0) {
          setSuggestedActions(result.suggestedActions);
        }

        if (result.metadata.quota) {
          setQuota(result.metadata.quota);
        }
      } catch (err) {
        const apiErr =
          err instanceof MiaAiApiError
            ? err
            : new MiaAiApiError({
                message:
                  "Ocurrió un error al comunicarse con el agente inteligente.",
                retryable: true,
              });

        setErrorState({
          message: apiErr.message,
          code: apiErr.code,
          retryable: apiErr.retryable,
          lastPrompt: trimmed,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "error",
            content: apiErr.message,
            retryable: apiErr.retryable,
            retryPrompt: trimmed,
            timestamp: formatNowTime(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, provider, sessionId, userId, quoteMode, quoteFiles, quoteDraft]
  );

  const handleSendMessage = useCallback(
    async (customMessage?: string) => {
      const target =
        typeof customMessage === "string" ? customMessage : inputMessage;
      await executeMessage(target);
    },
    [executeMessage, inputMessage]
  );

  const handleQuickPrompt = useCallback(
    async (promptText: string) => {
      await executeMessage(promptText);
    },
    [executeMessage]
  );

  const handleRetry = useCallback(
    async (retryPrompt?: string) => {
      const target = retryPrompt || errorState?.lastPrompt;
      if (target) {
        await executeMessage(target);
      }
    },
    [errorState?.lastPrompt, executeMessage]
  );

  const isOptionSelected = useCallback(
    (option: TransportOptionItem): boolean => {
      return selectedOptions.some(
        (item) =>
          item.option.provider === option.provider &&
          item.option.serviceName === option.serviceName &&
          item.option.frequencyOrSchedule === option.frequencyOrSchedule
      );
    },
    [selectedOptions]
  );

  const handleToggleSelectOption = useCallback(
    (option: TransportOptionItem, serviceType?: TransportServiceType) => {
      const existing = selectedOptions.find(
        (item) =>
          item.option.provider === option.provider &&
          item.option.serviceName === option.serviceName &&
          item.option.frequencyOrSchedule === option.frequencyOrSchedule
      );

      if (existing) {
        setSelectedOptions((prev) =>
          prev.filter((item) => item.id !== existing.id)
        );
        return;
      }

      const resolvedService: TransportServiceType =
        serviceType || travelState.activeService || "flight";

      const newItem: SelectedItineraryItem = {
        id: `${resolvedService}-${option.provider}-${Date.now()}`,
        serviceType: resolvedService,
        origin: activePayload?.route?.origin || travelState.origin,
        destination:
          activePayload?.route?.destination || travelState.destination,
        date: activePayload?.route?.date || travelState.departureDate,
        option,
        addedAt: formatNowTime(),
      };

      setSelectedOptions((prev) => [...prev, newItem]);
    },
    [activePayload?.route, selectedOptions, travelState]
  );

  const handleRemoveSelectedOption = useCallback((id: string) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearSelectedOptions = useCallback(() => {
    setSelectedOptions([]);
  }, []);

  const handleInspectMessagePayload = useCallback(
    (msg: StudioChatMessage) => {
      if (msg.uiPayload && msg.uiPayload.type !== "none") {
        setActivePayload(msg.uiPayload);
      }
      if (
        msg.uiPayload?.type === "quote_draft" &&
        msg.uiPayload.quoteDraft &&
        !quoteDraft &&
        quoteSubmit.status !== "success"
      ) {
        setQuoteDraft(withRecomputedMissing(msg.uiPayload.quoteDraft));
      }
      if (msg.metadata?.sources) {
        setActiveSources(msg.metadata.sources);
      }
      if (msg.metadata?.webSourcesUsed) {
        setActiveWebSources(msg.metadata.webSourcesUsed);
      }
      setActiveViewTab("explorer");
      setMobileView("canvas");
    },
    [quoteDraft, quoteSubmit.status]
  );

  const handleToggleQuoteMode = useCallback(() => {
    if (quoteMode) {
      setQuoteFiles([]);
      setQuoteFileErrors([]);
    }
    setQuoteMode(!quoteMode);
  }, [quoteMode]);

  const handleAddQuoteFiles = useCallback(
    (files: File[]) => {
      const { accepted, errors } = validateQuoteFiles(quoteFiles, files);
      if (accepted.length > 0) {
        setQuoteFiles((prev) => [...prev, ...accepted]);
      }
      setQuoteFileErrors(errors);
    },
    [quoteFiles]
  );

  const handleRemoveQuoteFile = useCallback((index: number) => {
    setQuoteFiles((prev) => prev.filter((_, i) => i !== index));
    setQuoteFileErrors([]);
  }, []);

  const handleUpdateQuoteDraft = useCallback((draft: QuoteDraft) => {
    setQuoteDraft(withRecomputedMissing(draft));
    // El aviso de envío incierto se conserva hasta que haya un envío confirmado.
    setQuoteSubmit((prev) =>
      prev.status === "error" && !prev.uncertain ? { status: "idle" } : prev
    );
  }, []);

  const handleConfirmQuote = useCallback(async () => {
    if (!quoteDraft || quoteSubmit.status === "submitting") return;

    if (!isDraftComplete(quoteDraft)) {
      setQuoteSubmit({
        status: "error",
        message: "Completa los campos requeridos antes de enviar.",
      });
      return;
    }

    const user = authState?.user;
    if (!user?.id) {
      setQuoteSubmit({
        status: "error",
        message: "Inicia sesión para enviar la cotización a Operaciones.",
      });
      return;
    }

    setQuoteSubmit({ status: "submitting" });
    try {
      const body = buildQuoteSubmission(quoteDraft, {
        id: user.id,
        name: user.name,
        email: user.email,
        idAgente: user.info?.id_agente,
      });
      const res = await CotizacionIaService.getInstance().crear(body);
      const folio = res.data?.id_cotizacion ?? "";

      storeQuoteSent(sessionId, {
        folio,
        messageCount: countPersistedMessages(messages),
      });
      setQuoteSubmit({ status: "success", folio });
      setQuoteDraft(null);
      setQuoteFiles([]);
      setQuoteFileErrors([]);
      setQuoteMode(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `sent-${Date.now()}`,
          role: "assistant",
          content: `✅ **Cotización enviada a Operaciones.**${
            folio ? `\n\nFolio: \`${folio}\`` : ""
          }\n\nEl equipo se pondrá en contacto contigo con las opciones y precios.`,
          timestamp: formatNowTime(),
        },
      ]);
    } catch (err) {
      const { message, uncertain } = describeSubmitError(err);
      setQuoteSubmit({ status: "error", message, uncertain });
    }
  }, [authState?.user, messages, quoteDraft, quoteSubmit.status, sessionId]);

  return {
    sessionId,
    provider,
    setProvider,
    messages,
    inputMessage,
    setInputMessage,
    pendingFile,
    isLoading,
    isUploading,
    errorState,
    travelState,
    attachedDocuments,
    quota,
    activePayload,
    setActivePayload,
    activeSources,
    activeWebSources,
    lastIngestedDoc,
    suggestedActions,
    selectedOptions,
    activeViewTab,
    setActiveViewTab,
    mobileView,
    setMobileView,
    isOptionSelected,
    handleSendMessage,
    handleQuickPrompt,
    handleFileUpload,
    handleRetry,
    handleToggleSelectOption,
    handleRemoveSelectedOption,
    handleClearSelectedOptions,
    handleResetSession,
    handleInspectMessagePayload,
    quoteMode,
    quoteFiles,
    quoteFileErrors,
    quoteDraft,
    quoteSubmit,
    handleToggleQuoteMode,
    handleAddQuoteFiles,
    handleRemoveQuoteFile,
    handleUpdateQuoteDraft,
    handleConfirmQuote,
  };
}
