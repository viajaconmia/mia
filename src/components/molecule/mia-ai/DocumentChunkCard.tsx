import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { DocumentSourceCitation } from "../../../services/miaAiService";

export interface DocumentChunkCardProps {
  citation?: DocumentSourceCitation;
  sampleChunk?: {
    preview: string;
    metadata: Record<string, unknown>;
  };
  index?: number;
}

export const DocumentChunkCard: React.FC<DocumentChunkCardProps> = ({
  citation,
  sampleChunk,
  index = 0,
}) => {
  if (citation) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
        <div className="flex items-center justify-between font-semibold text-blue-900 gap-2">
          <span className="inline-flex items-center gap-1.5 truncate">
            {citation.fileType === "pdf" ? (
              <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            )}
            <span className="truncate">{citation.fileName}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] shrink-0">
            {citation.pageOrRowRange}
          </span>
        </div>
        <p className="text-slate-600 text-[11px] line-clamp-3 font-mono">
          {citation.snippet}
        </p>
      </div>
    );
  }

  if (sampleChunk) {
    const pageOrRows =
      (sampleChunk.metadata?.pageNumber
        ? `Pág. ${String(sampleChunk.metadata.pageNumber)}`
        : sampleChunk.metadata?.rowRange
        ? `Filas ${String(sampleChunk.metadata.rowRange)}`
        : `Chunk #${index + 1}`);
    const tokenCount = sampleChunk.metadata?.tokenCount
      ? `${String(sampleChunk.metadata.tokenCount)} tok`
      : null;

    return (
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            {pageOrRows}
          </span>
          {tokenCount && (
            <span className="text-slate-500">{tokenCount}</span>
          )}
        </div>
        <p className="font-mono text-slate-600 line-clamp-3">
          {sampleChunk.preview}...
        </p>
      </div>
    );
  }

  return null;
};
