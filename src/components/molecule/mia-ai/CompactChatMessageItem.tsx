import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronRight, RefreshCw, ShieldAlert } from "lucide-react";
import { StudioChatMessage } from "../../../hooks/useMiaAiStudio";
import { AgentSpecialtyBadge } from "../../atom/mia-ai/AgentSpecialtyBadge";
import { QuickPromptChip } from "../../atom/mia-ai/QuickPromptChip";

export interface CompactChatMessageItemProps {
  message: StudioChatMessage;
  onInspectPayload: (message: StudioChatMessage) => void;
  onQuickPrompt: (promptText: string) => void;
  onRetry: (retryPrompt?: string) => void;
  isLoading?: boolean;
}

export const CompactChatMessageItem: React.FC<CompactChatMessageItemProps> = ({
  message,
  onInspectPayload,
  onQuickPrompt,
  onRetry,
  isLoading = false,
}) => {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-blue-700 text-white px-3 py-2 text-[11.5px] leading-relaxed shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <span className="block text-[9.5px] text-blue-200 mt-0.5 text-right">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  if (message.role === "error") {
    return (
      <div className="flex justify-start">
        <div className="w-full rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-[11.5px] text-rose-900 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-rose-700">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Aviso del servicio</span>
          </div>
          <p>{message.content}</p>
          {message.retryable && message.retryPrompt && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onRetry(message.retryPrompt)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-[11px] shadow-xs transition disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3" />
              Reintentar envío
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-2xl rounded-bl-xs bg-white border border-slate-200 px-3 py-2 text-[11.5px] leading-relaxed text-slate-800 shadow-xs space-y-1.5">
        {/* Agente y proveedor de IA comentados para mantener el chat minimalista
        {message.metadata && (
          <AgentSpecialtyBadge metadata={message.metadata} />
        )}
        */}

        <div className="text-[11.5px] leading-relaxed text-slate-700 space-y-1 [&_p]:text-[11.5px] [&_p]:leading-relaxed [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-3.5 [&_ol]:my-1 [&_ol]:pl-3.5 [&_li]:text-[11.5px] [&_li]:leading-relaxed [&_li]:my-0.5 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_h1]:text-xs [&_h2]:text-[11.5px] [&_h3]:text-[11.5px] [&_code]:text-[10.5px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {message.uiPayload && message.uiPayload.type !== "none" && (
          <button
            type="button"
            onClick={() => onInspectPayload(message)}
            className="w-full mt-1 py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[10.5px] flex items-center justify-between transition"
          >
            <span>Ver resultados detallados en el lienzo</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Acciones sugeridas dentro del mensaje comentadas para diseño minimalista
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
            {message.suggestedActions.slice(0, 2).map((act, idx) => (
              <QuickPromptChip
                key={idx}
                label={act}
                variant="suggestion"
                disabled={isLoading}
                onClick={() => onQuickPrompt(act)}
              />
            ))}
          </div>
        )}
        */}

        <span className="block text-[9.5px] text-slate-400 text-right">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};
