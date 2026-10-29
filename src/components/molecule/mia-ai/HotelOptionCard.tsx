import React from "react";
import {
  BedDouble,
  Circle,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { HotelFoundOption } from "../../../services/miaAiService";

export interface HotelOptionCardProps {
  option: HotelFoundOption;
  /** Índice de la variante de habitación seleccionada dentro de ESTA opción, o null/undefined si ninguna lo está. */
  selectedVariantIndex?: number | null;
  onSelectVariant: (variantIndex: number) => void;
}

export const HotelOptionCard: React.FC<HotelOptionCardProps> = ({
  option,
  selectedVariantIndex,
  onSelectVariant,
}) => {
  const location = [option.address, option.city].filter(Boolean).join(", ");
  const roomVariants = option.roomVariants || [];
  // El card se marca como "seleccionado" (borde/ring) cuando el índice seleccionado
  // cae dentro de esta opción; el padre ya nos pasa el índice solo cuando corresponde
  // a esta opción, así que basta con comprobar que sea un número.
  const isSelected = typeof selectedVariantIndex === "number";

  return (
    <div
      className={`rounded-2xl bg-white border p-5 shadow-xs transition flex flex-col justify-between gap-4 ${
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/20"
          : "border-slate-200 hover:border-blue-300"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Hotel
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {option.hotelName}
            </h3>
          </div>
          {typeof option.rating === "number" && option.rating > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-current" />
              {option.rating}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 bg-slate-50 rounded-xl p-3 text-xs">
          {location && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800">{location}</span>
            </div>
          )}
          {roomVariants.length > 0 && (
            <div className="space-y-1">
              {roomVariants.map((variant, idx) => {
                const line = [variant.roomType, variant.boardDescription]
                  .filter(Boolean)
                  .join(" · ");
                if (!line) return null;
                const variantSelected = selectedVariantIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectVariant(idx)}
                    className={`w-full flex items-center gap-1.5 rounded-lg px-1.5 py-1 -mx-1.5 text-left transition ${
                      variantSelected
                        ? "bg-emerald-50 text-emerald-900"
                        : "text-slate-600 hover:bg-blue-50"
                    }`}
                  >
                    <BedDouble className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="flex-1">{line}</span>
                    {variantSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {option.cancellationNote && (
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50/80 text-blue-900 text-[11px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {option.cancellationNote}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
