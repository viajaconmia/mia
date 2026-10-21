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
        <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-blue-700 text-white px-3.5 py-2.5 text-xs shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
          <span className="block text-[10px] text-blue-200 mt-1 text-right">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  if (message.role === "error") {
    return (
      <div className="flex justify-start">
        <div className="w-full rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-rose-700">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Aviso del servicio</span>
          </div>
          <p>{message.content}</p>
          {message.retryable && message.retryPrompt && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onRetry(message.retryPrompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs transition disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar envío
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-2xl rounded-bl-xs bg-white border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 shadow-xs space-y-2">
        {message.metadata && (
          <AgentSpecialtyBadge metadata={message.metadata} />
        )}

        <div className="prose prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 text-slate-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {message.uiPayload && message.uiPayload.type !== "none" && (
          <button
            type="button"
            onClick={() => onInspectPayload(message)}
            className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] flex items-center justify-between transition"
          >
            <span>Ver resultados detallados en el lienzo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

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

        <span className="block text-[10px] text-slate-400 text-right">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};
