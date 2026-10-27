import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Plus,
  Send,
} from "lucide-react";
import {
  QuoteDraft,
  QuoteItem,
  QuoteServiceType,
} from "../../../services/miaAiService";
import { QuoteSubmitState } from "../../../hooks/useMiaAiStudio";
import { QuoteItemCard } from "../../molecule/mia-ai/QuoteItemCard";
import {
  QUOTE_TYPE_LABELS,
  computeMissingFields,
  createBlankQuoteItem,
} from "../../../utils/quoteDraft";

export interface QuoteDraftPanelProps {
  draft: QuoteDraft | null;
  submitState: QuoteSubmitState;
  onChange: (draft: QuoteDraft) => void;
  onConfirm: () => void;
}

const ADDABLE_TYPES: QuoteServiceType[] = ["flight", "hotel", "car_rental", "bus"];

export const QuoteDraftPanel: React.FC<QuoteDraftPanelProps> = ({
  draft,
  submitState,
  onChange,
  onConfirm,
}) => {
  if (submitState.status === "success") {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 space-y-2">
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckCircle2 className="w-5 h-5" />
          <h2 className="text-base font-bold">Cotización enviada a Operaciones</h2>
        </div>
        {submitState.folio && (
          <p className="text-sm text-emerald-900">
            Folio: <span className="font-mono font-semibold">{submitState.folio}</span>
          </p>
        )}
        <p className="text-xs text-emerald-800">
          El equipo revisará tu solicitud y se pondrá en contacto contigo con las
          opciones y los precios.
        </p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-sm text-slate-500">
        Este borrador ya no está activo. Pídele a MIA una nueva cotización con el
        botón “Solicitar cotización”.
      </div>
    );
  }

  const missing = computeMissingFields(draft.items);
  const submitting = submitState.status === "submitting";
  const canConfirm = draft.items.length > 0 && missing.length === 0 && !submitting;

  const updateItem = (index: number, item: QuoteItem) =>
    onChange({
      ...draft,
      items: draft.items.map((it, i) => (i === index ? item : it)),
    });

  const removeItem = (index: number) =>
    onChange({ ...draft, items: draft.items.filter((_, i) => i !== index) });

  const addItem = (type: QuoteServiceType) =>
    onChange({ ...draft, items: [...draft.items, createBlankQuoteItem(type)] });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-start gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 mt-0.5">
            <ClipboardList className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-blue-950">
              Borrador de cotización
            </h2>
            <p className="text-xs text-slate-500">
              Revisa y corrige lo que entendió MIA. No incluye precios: los
              agrega Operaciones.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-slate-500 mb-1">Resumen</label>
          <textarea
            rows={2}
            value={draft.resumen}
            onChange={(e) => onChange({ ...draft, resumen: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 resize-none"
          />
        </div>
      </div>

      {draft.items.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Aún no hay servicios en el borrador. Agrega uno o cuéntale a MIA qué
          necesitas cotizar.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {draft.items.map((item, idx) => (
            <QuoteItemCard
              key={item.id}
              item={item}
              missingFields={missing}
              onChange={(next) => updateItem(idx, next)}
              onRemove={() => removeItem(idx)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Agregar servicio:</span>
        {ADDABLE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addItem(type)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs font-medium text-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {QUOTE_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Notas para Operaciones (opcional)
          </label>
          <textarea
            rows={2}
            value={draft.notes ?? ""}
            onChange={(e) =>
              onChange({ ...draft, notes: e.target.value || undefined })
            }
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 resize-none"
          />
        </div>
      </div>

      {missing.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Faltan {missing.length} dato{missing.length === 1 ? "" : "s"}{" "}
            requerido{missing.length === 1 ? "" : "s"} para poder enviar. Están
            marcados en rojo.
          </span>
        </div>
      )}

      {submitState.status === "error" && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitState.message}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canConfirm}
          onClick={onConfirm}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
            canConfirm
              ? "bg-blue-700 hover:bg-blue-800 text-white shadow-xs"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                {submitState.status === "error" && submitState.uncertain
                  ? "Reenviar de todos modos"
                  : "Confirmar y enviar a Operaciones"}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
