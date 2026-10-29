import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Bus,
  Car,
  ChevronDown,
  ListChecks,
  Pencil,
  Plane,
  Plus,
  Trash2,
} from "lucide-react";
import {
  HotelQuoteItem,
  QuoteItem,
  QuoteMissingField,
  QuoteServiceType,
} from "../../../services/miaAiService";
import type { Employee } from "../../../types";
import {
  QUOTE_ITEM_FIELDS,
  QUOTE_TYPE_LABELS,
  QuoteFieldDef,
  addRoom,
  getItemField,
  isEligibleForFoundOptions,
  isFieldMissing,
  isRequiredField,
  removeRoom,
  setItemField,
  setRoomField,
} from "../../../utils/quoteDraft";
import { TransportOptionCard } from "./TransportOptionCard";
import { HotelOptionCard } from "./HotelOptionCard";
import Modal from "../Modal";

const TYPE_ICONS: Record<QuoteServiceType, React.ComponentType<{ className?: string }>> = {
  flight: Plane,
  car_rental: Car,
  hotel: Building2,
  bus: Bus,
};

// Codifica la selección de habitación de hotel como "${optionId}::${variantIndex}" dentro de
// preferredOptionId (que sigue siendo un simple string | null, sin cambios de esquema).
const buildHotelPreferredOptionId = (optionId: string, variantIndex: number): string =>
  `${optionId}::${variantIndex}`;

// Intenta separar un preferredOptionId de hotel en su optionId y variantIndex. Devuelve null si
// el formato no es el esperado (p. ej. datos legados previos a este cambio, sin "::"), para que
// el resto del código pueda hacer fallback con seguridad en vez de fallar.
const parseHotelPreferredOptionId = (
  preferredOptionId: string
): { optionId: string; variantIndex: number } | null => {
  const sepIndex = preferredOptionId.lastIndexOf("::");
  if (sepIndex === -1) return null;
  const optionId = preferredOptionId.slice(0, sepIndex);
  const variantIndex = Number(preferredOptionId.slice(sepIndex + 2));
  if (!optionId || !Number.isInteger(variantIndex) || variantIndex < 0) return null;
  return { optionId, variantIndex };
};

const parseList = (text: string): string[] =>
  text
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

// Formatea el valor "crudo" de un campo (como lo devuelve getItemField) a texto legible para
// los chips compactos. Devuelve undefined cuando el campo no tiene valor capturado, para que
// el chip correspondiente simplemente no se muestre.
const formatFieldValue = (def: QuoteFieldDef, raw: unknown): string | undefined => {
  switch (def.kind) {
    case "select": {
      if (typeof raw !== "string" || raw === "") return undefined;
      return def.options?.find((opt) => opt.value === raw)?.label ?? raw;
    }
    case "bool": {
      if (raw !== true && raw !== false) return undefined;
      return raw ? "Sí" : "No";
    }
    case "list": {
      if (!Array.isArray(raw) || raw.length === 0) return undefined;
      return (raw as string[]).join(", ");
    }
    case "number": {
      if (typeof raw !== "number") return undefined;
      return String(raw);
    }
    default: {
      if (typeof raw !== "string" || raw === "") return undefined;
      return raw;
    }
  }
};

// Resumen corto de una habitación ("Doble — Juan Pérez") para mostrar cuando el desplegable de
// Habitaciones está cerrado pero ya hay datos capturados.
const formatRoomSummary = (room: { roomType?: string; leadGuest?: string }): string =>
  [room.roomType, room.leadGuest].filter(Boolean).join(" — ");

// Nombre completo de un viajero, igual que en ManualReservationPage.tsx, pero sin los espacios
// dobles que deja esa versión cuando falta el segundo nombre o el apellido materno.
const formatTravelerFullName = (empleado: Employee): string =>
  [
    empleado.primer_nombre,
    empleado.segundo_nombre,
    empleado.apellido_paterno,
    empleado.apellido_materno,
  ]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ");

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
  travelers: Employee[];
}

export const QuoteItemCard: React.FC<QuoteItemCardProps> = ({
  item,
  missingFields,
  onChange,
  onRemove,
  travelers,
}) => {
  const Icon = TYPE_ICONS[item.type];
  const itemMissing = missingFields.filter((m) => m.itemId === item.id);
  // showOptions sigue controlando el modal de opciones encontradas para flight/car_rental/bus
  // (selección única por ítem, como siempre). Para hotel, la selección ahora ocurre por
  // habitación: editingRoomIndex guarda qué habitación abrió el modal (null = cerrado), y
  // showAllHotels es un toggle local (no persistido) para ver los 3 hoteles aunque ya haya uno
  // elegido para el ítem.
  const [showOptions, setShowOptions] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [showAllHotels, setShowAllHotels] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const filledFields = QUOTE_ITEM_FIELDS[item.type]
    .map((def) => ({ def, value: formatFieldValue(def, getItemField(item, def.key)) }))
    .filter((entry): entry is { def: QuoteFieldDef; value: string } => entry.value !== undefined);
  const roomsMissing = itemMissing.some((m) => m.field === "rooms");
  const roomsSummary =
    item.type === "hotel"
      ? (item.rooms ?? [])
          .map((room) => formatRoomSummary(room))
          .filter((s) => s.length > 0)
          .join(", ")
      : "";
  const fallbackOrigin =
    item.type === "car_rental"
      ? item.pickupLocation
      : (getItemField(item, "origin") as string | undefined);
  const fallbackDestination =
    item.type === "car_rental"
      ? item.dropoffLocation
      : (getItemField(item, "destination") as string | undefined);
  // Para hoteles, preferredOptionId codifica tanto la opción (hotel) como la variante de
  // habitación elegida dentro de ella, como "${optionId}::${variantIndex}" (ver HotelOptionCard
  // / onSelectVariant más abajo). Para los demás tipos, preferredOptionId sigue siendo el id
  // de opción "crudo" de siempre.
  const hotelSelection =
    item.type === "hotel" && item.preferredOptionId
      ? parseHotelPreferredOptionId(item.preferredOptionId)
      : null;
  const preferredOption =
    item.type === "hotel"
      ? item.foundOptions?.find((o) => o.id === hotelSelection?.optionId)
      : item.foundOptions?.find((o) => o.id === item.preferredOptionId);
  const preferredOptionLabel = preferredOption
    ? "hotelName" in preferredOption
      ? (() => {
          const variant =
            hotelSelection != null
              ? preferredOption.roomVariants?.[hotelSelection.variantIndex]
              : undefined;
          return variant?.roomType
            ? `${preferredOption.hotelName} — ${variant.roomType}`
            : preferredOption.hotelName;
        })()
      : preferredOption.provider
    : undefined;
  // El hotel ya elegido para el ítem (si hay alguno), usado para acotar el modal por-habitación
  // a ese único hotel en lugar de mostrar los hasta 3 encontrados.
  const chosenHotelOption =
    preferredOption && "hotelName" in preferredOption ? preferredOption : undefined;

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

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-500">
            Datos del servicio
          </span>
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>
        {filledFields.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {filledFields.map(({ def, value }) => (
              <span
                key={def.key}
                className="inline-flex items-center gap-1 bg-slate-50 rounded-md px-2 py-1 text-xs text-slate-700"
              >
                <span className="text-slate-400">{def.label}:</span> {value}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Sin datos capturados todavía.</p>
        )}
      </div>

      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Editar datos"
        subtitle={QUOTE_TYPE_LABELS[item.type]}
      >
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-14rem)] grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5">
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
      </Modal>

      {item.type === "hotel" && (
        <div className="pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setRoomsOpen(!roomsOpen)}
            className="w-full flex items-center justify-between gap-2 py-1"
          >
            <span className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-semibold ${
                  roomsMissing ? "text-rose-600" : "text-slate-500"
                }`}
              >
                Habitaciones ({item.rooms?.length ?? 0})
              </span>
              {roomsMissing && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Faltan datos" />
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                roomsOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {!roomsOpen && roomsSummary && (
            <p className="text-xs text-slate-400 pb-1">{roomsSummary}</p>
          )}
          {roomsOpen && (
            <div className="space-y-2 pt-1 animate-in slide-in-from-top duration-200 border-t border-slate-100">
              <div className="space-y-2">
                {(item.rooms ?? []).map((room, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Habitación {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange(removeRoom(item, index))}
                    title="Quitar esta habitación"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <label className="text-[11px] text-slate-500">
                        Tipo de habitación
                        <span className="text-rose-500"> *</span>
                      </label>
                      {item.foundOptions && item.foundOptions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setEditingRoomIndex(index)}
                          className="shrink-0 text-[11px] font-medium text-blue-700 hover:underline"
                        >
                          Elegir tipo
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={room.roomType ?? ""}
                      className={inputClass(!room.roomType)}
                      onChange={(e) =>
                        onChange(
                          setRoomField(
                            item,
                            index,
                            "roomType",
                            e.target.value || undefined
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Titular
                      <span className="text-rose-500"> *</span>
                    </label>
                    <select
                      value={room.leadGuest ?? ""}
                      className={inputClass(!room.leadGuest)}
                      onChange={(e) =>
                        onChange(
                          setRoomField(
                            item,
                            index,
                            "leadGuest",
                            e.target.value || undefined
                          )
                        )
                      }
                    >
                      <option value="">Selecciona un titular</option>
                      {travelers.map((traveler) => {
                        const fullName = formatTravelerFullName(traveler);
                        return (
                          <option key={traveler.id_viajero} value={fullName}>
                            {fullName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Huéspedes adicionales
                    </label>
                    <ListInput
                      value={room.additionalGuests}
                      className={inputClass(false)}
                      onChange={(next) =>
                        onChange(
                          setRoomField(
                            item,
                            index,
                            "additionalGuests",
                            next.length ? next : undefined
                          )
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
              <button
                type="button"
                onClick={() => onChange(addRoom(item))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs font-medium text-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar habitación
              </button>
            </div>
          )}
        </div>
      )}

      {item.type !== "hotel" && item.foundOptions && item.foundOptions.length > 0 && (
        <div className="pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowOptions(true)}
            className="w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition text-left"
          >
            <span className="flex items-center gap-1.5 text-slate-600">
              <ListChecks className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              {preferredOptionLabel ? (
                <span>
                  Preferida: <strong className="text-slate-800">{preferredOptionLabel}</strong>
                </span>
              ) : (
                <span>{item.foundOptions.length} opciones encontradas</span>
              )}
            </span>
            <span className="text-blue-700 font-semibold shrink-0">
              {preferredOptionLabel ? "Cambiar" : "Elegir"}
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

      {item.type === "hotel" ? (
        <Modal
          open={editingRoomIndex !== null}
          onClose={() => {
            setEditingRoomIndex(null);
            setShowAllHotels(false);
          }}
          title="Opciones encontradas"
          subtitle="Orientativo: Operaciones confirma disponibilidad y precio final."
        >
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-14rem)] grid grid-cols-1 gap-3">
            {chosenHotelOption && !showAllHotels && (
              <button
                type="button"
                onClick={() => setShowAllHotels(true)}
                className="justify-self-start text-[11px] font-medium text-blue-700 hover:underline"
              >
                Ver otros hoteles
              </button>
            )}
            {(chosenHotelOption && !showAllHotels
              ? [chosenHotelOption]
              : item.foundOptions ?? []
            ).map((option) => (
              <HotelOptionCard
                key={option.id}
                option={option}
                selectedVariantIndex={
                  hotelSelection?.optionId === option.id ? hotelSelection.variantIndex : null
                }
                onSelectVariant={(variantIndex) => {
                  if (editingRoomIndex === null) return;
                  // Además de marcar la preferencia, se llenan los campos reales del
                  // formulario (hotelName/roomType) con lo elegido -- esos sí viajan a
                  // Operaciones hoy (bacl ya los soporta), a diferencia de
                  // foundOptions/preferredOptionId que por ahora solo se ven en el chat.
                  // roomType se aplica a la habitación específica que abrió este modal
                  // (editingRoomIndex), no siempre a la primera.
                  const variant = option.roomVariants?.[variantIndex];
                  let next = setItemField(
                    item,
                    "preferredOptionId",
                    buildHotelPreferredOptionId(option.id, variantIndex)
                  );
                  next = setItemField(next, "hotelName", option.hotelName);
                  if (variant?.roomType) {
                    next = setRoomField(
                      next as HotelQuoteItem,
                      editingRoomIndex,
                      "roomType",
                      variant.roomType
                    );
                  }
                  onChange(next);
                  setEditingRoomIndex(null);
                  setShowAllHotels(false);
                }}
              />
            ))}
          </div>
        </Modal>
      ) : (
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
