import React from "react";
import { ExternalLink, FileSpreadsheet, Sparkles } from "lucide-react";
import {
  DocumentSourceCitation,
  IngestDocumentResponse,
  TransportOptionItem,
  TransportServiceType,
  UIPayload,
} from "../../../services/miaAiService";
import {
  QUICK_STARTERS,
  SERVICE_NAMES_ES,
} from "../../../hooks/useMiaAiStudio";
import { TransportOptionCard } from "../../molecule/mia-ai/TransportOptionCard";
import { DocumentChunkCard } from "../../molecule/mia-ai/DocumentChunkCard";

export interface MiaWorkspaceExplorerProps {
  activePayload: UIPayload | null;
  activeSources: DocumentSourceCitation[];
  activeWebSources: Array<{ title: string; url: string }>;
  lastIngestedDoc: IngestDocumentResponse | null;
  isOptionSelected: (option: TransportOptionItem) => boolean;
  onToggleSelectOption: (
    option: TransportOptionItem,
    serviceType?: TransportServiceType
  ) => void;
  onQuickPrompt: (promptText: string) => void;
}

export const MiaWorkspaceExplorer: React.FC<MiaWorkspaceExplorerProps> = ({
  activePayload,
  activeSources,
  activeWebSources,
  lastIngestedDoc,
  isOptionSelected,
  onToggleSelectOption,
  onQuickPrompt,
}) => {
  return (
    <div className="space-y-6">
      {/* A) OPCIONES DE TRANSPORTE (VUELO, AUTOBÚS, TREN, FERRY, RENTA AUTO, CHOFER) */}
      {activePayload?.type === "transport_options" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900 to-sky-800 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold">
                {activePayload.serviceType
                  ? SERVICE_NAMES_ES[activePayload.serviceType]
                  : "Opciones de Transporte"}
              </span>
              <h2 className="text-xl font-bold mt-0.5">
                {activePayload.title ||
                  `Opciones encontradas (${
                    activePayload.options?.length || 0
                  })`}
              </h2>
              {activePayload.route && (
                <p className="text-xs text-blue-100 mt-1">
                  Ruta:{" "}
                  <strong>{activePayload.route.origin || "Origen"}</strong> →{" "}
                  <strong>
                    {activePayload.route.destination || "Destino"}
                  </strong>{" "}
                  {activePayload.route.date
                    ? `• Fecha: ${activePayload.route.date}`
                    : ""}
                </p>
              )}
            </div>
            <div className="text-xs bg-white/10 px-3.5 py-2 rounded-xl border border-white/15">
              Haz clic en <strong>"Elegir opción"</strong> para armar tu
              itinerario multimodal
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {(activePayload.options || []).map((opt, idx) => (
              <TransportOptionCard
                key={idx}
                option={opt}
                serviceType={activePayload.serviceType}
                fallbackOrigin={activePayload.route?.origin}
                fallbackDestination={activePayload.route?.destination}
                isSelected={isOptionSelected(opt)}
                onToggleSelect={onToggleSelectOption}
              />
            ))}
          </div>
        </div>
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

      {/* C) FUENTES DOCUMENTALES Y WEB CITADAS */}
      {(activeSources.length > 0 || activeWebSources.length > 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider">
            Fuentes y Fragmentos Tokenizados Consultados
          </h3>

          {activeSources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeSources.map((src, idx) => (
                <DocumentChunkCard key={idx} citation={src} index={idx} />
              ))}
            </div>
          )}

          {activeWebSources.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {activeWebSources.map((w, idx) => (
                <a
                  key={idx}
                  href={w.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{w.title}</span>
                </a>
              ))}
            </div>
          )}
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

      {/* E) ESTADO INICIAL DEL LIENZO CUANDO AÚN NO HAY PAYLOAD ACTIVO */}
      {!activePayload && !lastIngestedDoc && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 my-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-700">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-blue-950">
              Lienzo Interactivo Multi-Transporte y Documentos
            </h2>
            <p className="text-sm text-slate-600">
              A medida que conversas en el chat compacto de la izquierda, aquí
              aparecerán en grande las opciones de{" "}
              <strong>
                vuelos, autobuses, trenes, ferries, renta de autos o chofer
                privado
              </strong>
              , así como las tablas y métricas extraídas de tus archivos{" "}
              <strong>PDF y CSV</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            {QUICK_STARTERS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onQuickPrompt(item.prompt)}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition group"
              >
                <span className="font-semibold text-xs text-blue-950 group-hover:text-blue-700 block">
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {item.prompt}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
