import { useState, useCallback } from "react";
import { useUser } from "../context/userContext";
import {
  AgentExecutionResult,
  AttachedDocumentMeta,
  ChatResponseMetadata,
  DocumentSourceCitation,
  IngestDocumentResponse,
  LLMProviderType,
  MiaAiApiError,
  SessionQuotaState,
  TransportOptionItem,
  TransportServiceType,
  TravelState,
  UIPayload,
  miaAiService,
} from "../services/miaAiService";

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

const formatNowTime = (): string =>
  new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function useMiaAiStudio() {
  const { authState } = useUser();
  const userId = authState?.user?.id || "demo-user";

  const [sessionId, setSessionId] = useState<string>(() => createSessionId());
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

  const handleResetSession = useCallback(() => {
    setSessionId(createSessionId());
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
  }, []);

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
      const trimmed = promptText.trim();
      if (!trimmed || isLoading) return;

      const userMsg: StudioChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
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
    [isLoading, provider, sessionId, userId]
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
      if (msg.metadata?.sources) {
        setActiveSources(msg.metadata.sources);
      }
      if (msg.metadata?.webSourcesUsed) {
        setActiveWebSources(msg.metadata.webSourcesUsed);
      }
      setActiveViewTab("explorer");
      setMobileView("canvas");
    },
    []
  );

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
  };
}
