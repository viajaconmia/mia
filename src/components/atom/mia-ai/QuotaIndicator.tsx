import React from "react";
import { SessionQuotaState } from "../../../services/miaAiService";

export interface QuotaIndicatorProps {
  quota: SessionQuotaState;
}

export const QuotaIndicator: React.FC<QuotaIndicatorProps> = ({ quota }) => {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-blue-100">
      <span
        title={`Mensajes usados: ${quota.messagesUsed} de ${quota.maxMessages}`}
        className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15"
      >
        {quota.messagesRemaining} msj rest.
      </span>
      <span
        title={`Archivos subidos: ${quota.filesUploaded} de ${quota.maxFiles}`}
        className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15"
      >
        {quota.filesUploaded}/{quota.maxFiles} docs
      </span>
    </div>
  );
};
