import React, { useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { NavigationLink } from "../../atom/NavigationLink";
import ROUTES from "../../../constants/routes";
import {
  LLMProviderType,
  SessionQuotaState,
} from "../../../services/miaAiService";
import {
  QUICK_STARTERS,
  StudioChatMessage,
  StudioErrorState,
} from "../../../hooks/useMiaAiStudio";
import { QuotaIndicator } from "../../atom/mia-ai/QuotaIndicator";
import { QuickPromptChip } from "../../atom/mia-ai/QuickPromptChip";
import { ProviderStrategySelector } from "../../molecule/mia-ai/ProviderStrategySelector";
import { CompactChatMessageItem } from "../../molecule/mia-ai/CompactChatMessageItem";

export interface MiaCompactChatSidebarProps {
  visibleOnMobile: boolean;
  provider: LLMProviderType;
  onChangeProvider: (provider: LLMProviderType) => void;
  quota: SessionQuotaState;
  messages: StudioChatMessage[];
  inputMessage: string;
  onChangeInputMessage: (value: string) => void;
  isLoading: boolean;
  isUploading: boolean;
  errorState: StudioErrorState | null;
  suggestedActions: string[];
  onSendMessage: (customMessage?: string) => void;
  onQuickPrompt: (promptText: string) => void;
  onFileUpload: (file: File) => void;
  onRetry: (retryPrompt?: string) => void;
  onResetSession: () => void;
  onInspectMessagePayload: (message: StudioChatMessage) => void;
}

export const MiaCompactChatSidebar: React.FC<MiaCompactChatSidebarProps> = ({
  visibleOnMobile,
  provider,
  onChangeProvider,
  quota,
  messages,
  inputMessage,
  onChangeInputMessage,
  isLoading,
  isUploading,
  errorState,
  suggestedActions,
  onSendMessage,
  onQuickPrompt,
  onFileUpload,
  onRetry,
  onResetSession,
  onInspectMessagePayload,
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [messages, isLoading, isUploading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    onFileUpload(file);
  };

  return (
    <aside
      className={`${
        visibleOnMobile ? "flex" : "hidden"
      } md:flex w-full md:w-[380px] lg:w-[420px] shrink-0 border-r border-slate-200 bg-slate-50 flex-col h-full`}
    >
      {/* === SECCIÓN SUPERIOR COMENTADA: Header y Pruebas Rápidas === */}
      {/*
      <div className="p-3.5 bg-gradient-to-r from-blue-900 via-blue-800 to-sky-800 text-white shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/15 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                MIA AI Studio
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-200 border border-sky-300/30">
                  Multi-Agente
                </span>
              </h1>
              <p className="text-[11px] text-blue-100/80">
                LangChain + Strategy + RAG PDF/CSV
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onResetSession}
            title="Nueva sesión"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1 text-blue-100 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Reiniciar</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
          <ProviderStrategySelector
            provider={provider}
            onChange={onChangeProvider}
            disabled={isLoading || isUploading}
          />
          <QuotaIndicator quota={quota} />
        </div>

        <div className="pt-0.5">
          <NavigationLink
            href={ROUTES.MIA.HOME}
            variant="secondary"
            size="sm"
            className="!py-1 !px-2.5 !text-xs w-full justify-center bg-white/10 hover:bg-white/20 !text-white border border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Volver al Chat de Hoteles Clásico</span>
          </NavigationLink>
        </div>
      </div>

      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Pruebas rápidas multi-transporte (1 clic):
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_STARTERS.map((starter) => (
            <QuickPromptChip
              key={starter.label}
              label={starter.label}
              variant="starter"
              disabled={isLoading || isUploading}
              onClick={() => onQuickPrompt(starter.prompt)}
            />
          ))}
        </div>
      </div>
      */}

      {/* Banner de reintento si errorState?.retryable */}
      {errorState?.retryable && errorState.lastPrompt && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900">
          <span className="inline-flex items-center gap-1.5 truncate">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Conexión interrumpida temporalmente</span>
          </span>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onRetry(errorState.lastPrompt)}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition disabled:opacity-50"
          >
            <RefreshCw className="w-3 h-3" />
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de Mensajes del Chat Compacto */}
      <div
        ref={chatEndRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50"
      >
        {/* Mensaje de bienvenida inicial comentado para mantener interfaz minimalista
        {messages.length === 0 && (
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm text-slate-600 text-xs space-y-2">
            <p className="font-semibold text-blue-950 text-sm">
              ¡Bienvenido a MIA AI Studio! 👋
            </p>
            <p>
              Este asistente multi-agente coordina especialistas en{" "}
              <strong>
                Vuelos, Autobuses, Trenes, Ferry, Renta de Autos y Chofer
              </strong>
              , además de indexar archivos <strong>PDF y CSV</strong> con
              LangChain.
            </p>
            <p className="text-[11px] text-slate-500">
              Selecciona cualquier chip superior o adjunta un PDF/CSV con el
              clip inferior para ver la radiografía en el lienzo derecho.
            </p>
          </div>
        )}
        */}

        {messages.map((msg) => (
          <CompactChatMessageItem
            key={msg.id}
            message={msg}
            isLoading={isLoading}
            onInspectPayload={onInspectMessagePayload}
            onQuickPrompt={onQuickPrompt}
            onRetry={onRetry}
          />
        ))}

        {(isLoading || isUploading) && (
          <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-xl p-3 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>
              {isUploading
                ? "Tokenizando archivo con LangChain e indexando vectores..."
                : "Orquestando especialista y consultando fuentes..."}
            </span>
          </div>
        )}
      </div>

      {/* Acciones sugeridas clicables comentadas para interfaz minimalista
      {suggestedActions.length > 0 && (
        <div className="px-3 py-2 bg-slate-100 border-t border-slate-200">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {suggestedActions.map((suggestion, idx) => (
              <QuickPromptChip
                key={idx}
                label={suggestion}
                variant="suggestion"
                disabled={isLoading || isUploading}
                onClick={() => onQuickPrompt(suggestion)}
              />
            ))}
          </div>
        </div>
      )}
      */}

      {/* Barra Inferior de Entrada estilo Notion AI */}
      <div className="p-3 bg-white border-t border-slate-200/80">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.csv,application/pdf,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs focus-within:ring-0 focus-within:outline-none transition">
          <textarea
            rows={2}
            value={inputMessage}
            onChange={(e) => onChangeInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (inputMessage.trim() && !isLoading && !isUploading) {
                  onSendMessage(inputMessage);
                }
              }
            }}
            placeholder="Pregúntale a MIA..."
            className="w-full bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 border-0 border-transparent outline-none ring-0 focus:ring-0 focus:outline-none focus:border-transparent focus-visible:outline-none focus-visible:ring-0 resize-none px-1 shadow-none focus:shadow-none"
          />

          <div className="flex items-center justify-between pt-1 mt-1">
            <button
              type="button"
              disabled={isUploading || isLoading}
              onClick={() => fileInputRef.current?.click()}
              title="Adjuntar PDF o CSV (máx 4 MB)"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={isLoading || isUploading || !inputMessage.trim()}
              onClick={() => onSendMessage(inputMessage)}
              title="Enviar mensaje"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition shrink-0 ${
                inputMessage.trim() && !isLoading && !isUploading
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
