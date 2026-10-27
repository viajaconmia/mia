import React from "react";
import { FileSpreadsheet } from "lucide-react";
import {
  IngestDocumentResponse,
  QuoteDraft,
  UIPayload,
} from "../../../services/miaAiService";
import { DocumentChunkCard } from "../../molecule/mia-ai/DocumentChunkCard";
import { QuoteDraftPanel } from "./QuoteDraftPanel";
import type { QuoteSubmitState } from "../../../hooks/useMiaAiStudio";

export interface MiaWorkspaceExplorerProps {
  activePayload: UIPayload | null;
  lastIngestedDoc: IngestDocumentResponse | null;
  quoteDraft: QuoteDraft | null;
  quoteSubmit: QuoteSubmitState;
  onUpdateQuoteDraft: (draft: QuoteDraft) => void;
  onConfirmQuote: () => void;
}

export const MiaWorkspaceExplorer: React.FC<MiaWorkspaceExplorerProps> = ({
  activePayload,
  lastIngestedDoc,
  quoteDraft,
  quoteSubmit,
  onUpdateQuoteDraft,
  onConfirmQuote,
}) => {
  return (
    <div className="space-y-6">
      {/* 0) BORRADOR DE COTIZACIÓN (EDITABLE, SE ENVÍA A OPERACIONES) */}
      {activePayload?.type === "quote_draft" && (
        <QuoteDraftPanel
          draft={quoteDraft}
          submitState={quoteSubmit}
          onChange={onUpdateQuoteDraft}
          onConfirm={onConfirmQuote}
        />
      )}

      {/* B) TABLA DE DATOS Y TARJETAS (CSV ANALYST / PDF SPECIALIST) */}
      {(activePayload?.type === "table" ||
        activePayload?.type === "summary_cards" ||
        activePayload?.type === "extracted_fields") && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-700" />
                <span>
                  {activePayload.title || "Análisis Estructurado de Documento"}
                </span>
              </h2>
            </div>

            {/* Tarjetas de métricas o campos extraídos */}
            {activePayload.cards && activePayload.cards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activePayload.cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-white border border-blue-200/70"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      {card.label}
                    </span>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {card.value}
                    </p>
                    {card.description && (
                      <p className="text-xs text-slate-500 mt-1">
                        {card.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tabla interactiva si hay tableData */}
            {activePayload.tableData &&
              activePayload.tableData.columns.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        {activePayload.tableData.columns.map((col) => (
                          <th
                            key={col}
                            className="py-2.5 px-3 font-semibold border-r border-blue-800 last:border-r-0"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {activePayload.tableData.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-blue-50/40 transition"
                        >
                          {activePayload.tableData!.columns.map((col) => (
                            <td key={col} className="py-2 px-3 text-slate-700">
                              {String(row[col] ?? "-")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>
      )}

      {/* D) RADIOGRAFÍA DE TOKENIZACIÓN LANGCHAIN (CUANDO SUBEN UN PDF/CSV) */}
      {lastIngestedDoc && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Radiografía de Ingesta LangChain
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {lastIngestedDoc.document.fileName}
              </h3>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold">
                {lastIngestedDoc.document.totalChunks} Chunks
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold">
                {lastIngestedDoc.document.totalTokens} Tokens
              </span>
            </div>
          </div>

          {lastIngestedDoc.summaryPreview && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-semibold text-slate-700 block">
                Resumen Estadístico Pre-calculado (CSV):
              </span>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-600 max-h-40 overflow-y-auto">
                {lastIngestedDoc.summaryPreview}
              </pre>
            </div>
          )}

          {lastIngestedDoc.sampleChunks.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Muestra de fragmentos tokenizados (TokenTextSplitter):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lastIngestedDoc.sampleChunks.map((sample, sIdx) => (
                  <DocumentChunkCard
                    key={sIdx}
                    sampleChunk={sample}
                    index={sIdx}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
