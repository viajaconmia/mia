import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Bus,
  Car,
  ListChecks,
  Plane,
  Trash2,
} from "lucide-react";
import {
  QuoteItem,
  QuoteMissingField,
  QuoteServiceType,
} from "../../../services/miaAiService";
import {
  QUOTE_ITEM_FIELDS,
  QUOTE_TYPE_LABELS,
  QuoteFieldDef,
  getItemField,
  isEligibleForFoundOptions,
  isFieldMissing,
  isRequiredField,
  setItemField,
} from "../../../utils/quoteDraft";
import { TransportOptionCard } from "./TransportOptionCard";
import Modal from "../Modal";

const TYPE_ICONS: Record<QuoteServiceType, React.ComponentType<{ className?: string }>> = {
  flight: Plane,
  car_rental: Car,
  hotel: Building2,
  bus: Bus,
};

const parseList = (text: string): string[] =>
  text
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

const BASE_INPUT =
  "w-full rounded-lg border px-2.5 py-1.5 text-xs text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-200";

const inputClass = (missing: boolean) =>
  `${BASE_INPUT} ${
    missing
      ? "border-rose-400 bg-rose-50/60 focus:border-rose-500"
      : "border-slate-200 bg-white focus:border-blue-400"
  }`;

// Lista de nombres: conserva lo que se escribe (comas y espacios) mientras edita.
const ListInput: React.FC<{
  value: string[] | undefined;
  onChange: (next: string[]) => void;
  className: string;
}> = ({ value, onChange, className }) => {
  const joined = (value ?? []).join(", ");
  const [text, setText] = useState(joined);

  useEffect(() => {
    if (parseList(text).join(", ") !== joined) setText(joined);
  }, [joined]);

  return (
    <input
      type="text"
      value={text}
      className={className}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parseList(e.target.value));
      }}
    />
  );
};

export interface QuoteItemCardProps {
  item: QuoteItem;
  missingFields: QuoteMissingField[];
  onChange: (item: QuoteItem) => void;
  onRemove: () => void;
}

export const QuoteItemCard: React.FC<QuoteItemCardProps> = ({
  item,
  missingFields,
  onChange,
  onRemove,
}) => {
  const Icon = TYPE_ICONS[item.type];
  const itemMissing = missingFields.filter((m) => m.itemId === item.id);
  const [showOptions, setShowOptions] = useState(false);
  const fallbackOrigin =
    item.type === "car_rental"
      ? item.pickupLocation
      : (getItemField(item, "origin") as string | undefined);
  const fallbackDestination =
    item.type === "car_rental"
      ? item.dropoffLocation
      : (getItemField(item, "destination") as string | undefined);
  const preferredOption =
    item.type !== "hotel"
      ? item.foundOptions?.find((o) => o.id === item.preferredOptionId)
      : undefined;

  const renderControl = (def: QuoteFieldDef, missing: boolean) => {
    const raw = getItemField(item, def.key);

    switch (def.kind) {
      case "select":
        return (
          <select
            value={typeof raw === "string" ? raw : ""}
            className={inputClass(missing)}
            onChange={(e) =>
              onChange(setItemField(item, def.key, e.target.value || undefined))
            }
          >
            <option value="">—</option>
            {def.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "bool":
        return (
          <label className="flex items-center gap-2 py-1.5 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={raw === true}
              onChange={(e) =>
                onChange(setItemField(item, def.key, e.target.checked))
              }
              className="rounded border-slate-300"
            />
            <span>Sí</span>
          </label>
        );
      case "number":
        return (
          <input
            type="number"
            min={1}
            value={typeof raw === "number" ? raw : ""}
            className={inputClass(missing)}
            onChange={(e) => {
              const n = e.target.value === "" ? undefined : Number(e.target.value);
              onChange(setItemField(item, def.key, n));
            }}
          />
        );
      case "list":
        return (
          <ListInput
            value={Array.isArray(raw) ? (raw as string[]) : undefined}
            className={inputClass(missing)}
            onChange={(next) =>
              onChange(setItemField(item, def.key, next.length ? next : undefined))
            }
          />
        );
      default:
        return (
          <input
            type={def.kind === "date" ? "date" : def.kind === "time" ? "time" : "text"}
            value={typeof raw === "string" ? raw : ""}
            className={inputClass(missing)}
            onChange={(e) =>
              onChange(setItemField(item, def.key, e.target.value || undefined))
            }
          />
        );
    }
  };

  return (
    <div
      className={`rounded-2xl bg-white border p-4 shadow-xs space-y-3 ${
        itemMissing.length > 0 ? "border-rose-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <Icon className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            {QUOTE_TYPE_LABELS[item.type]}
          </h3>
          {itemMissing.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              <AlertCircle className="w-3.5 h-3.5" />
              Faltan {itemMissing.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          title="Quitar este servicio"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5">
        {QUOTE_ITEM_FIELDS[item.type].map((def) => {
          const missing = isFieldMissing(missingFields, item.id, def.key, item.type);
          return (
            <div key={def.key} className={def.wide ? "sm:col-span-2" : ""}>
              <label className="block text-[11px] text-slate-500 mb-1">
                {def.label}
                {isRequiredField(item.type, def.key) && (
                  <span className="text-rose-500"> *</span>
                )}
              </label>
              {renderControl(def, missing)}
            </div>
          );
        })}
      </div>

      {item.type !== "hotel" && item.foundOptions && item.foundOptions.length > 0 && (
        <div className="pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowOptions(true)}
            className="w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition text-left"
          >
            <span className="flex items-center gap-1.5 text-slate-600">
              <ListChecks className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              {preferredOption ? (
                <span>
                  Preferida: <strong className="text-slate-800">{preferredOption.provider}</strong>
                </span>
              ) : (
                <span>{item.foundOptions.length} opciones encontradas</span>
              )}
            </span>
            <span className="text-blue-700 font-semibold shrink-0">
              {preferredOption ? "Cambiar" : "Elegir"}
            </span>
          </button>
        </div>
      )}

      {!getItemField(item, "foundOptions") && isEligibleForFoundOptions(item) && (
        <p className="pt-1 border-t border-slate-100 text-[11px] text-slate-400">
          No se pudieron buscar opciones por ahora. Puedes confirmar igual: Operaciones
          valida la disponibilidad real.
        </p>
      )}

      {item.type !== "hotel" && (
        <Modal
          open={showOptions}
          onClose={() => setShowOptions(false)}
          title="Opciones encontradas"
          subtitle="Orientativo: Operaciones confirma disponibilidad y precio final."
        >
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-14rem)] grid grid-cols-1 gap-3">
            {item.foundOptions?.map((option) => (
              <TransportOptionCard
                key={option.id}
                option={option}
                serviceType={item.type}
                fallbackOrigin={fallbackOrigin}
                fallbackDestination={fallbackDestination}
                isSelected={item.preferredOptionId === option.id}
                onToggleSelect={() => {
                  onChange(setItemField(item, "preferredOptionId", option.id));
                  setShowOptions(false);
                }}
              />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
