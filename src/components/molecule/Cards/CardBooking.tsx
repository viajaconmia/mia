import { Calendar, ChevronDown, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/format";
import { calcularNoches } from "../../../lib/calculates";
import { useState } from "react";
import { Booking } from "../../../services/BookingService";

interface BookingCardProps {
  data: Booking;
  OnToggleExpand: () => React.ReactNode;
  onViewDetails: (item: Booking) => void;
}

export function BookingCard({
  data,
  OnToggleExpand,
  onViewDetails,
}: BookingCardProps) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex gap-3 p-3">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
          <img
            src={
              "https://img.freepik.com/vector-gratis/fondo-plano-edificio-hotel_23-2148136541.jpg"
            }
            alt={data.proveedor || ""}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {data.proveedor}
            </h3>
            <button
              onClick={() => {
                setOpen(!open);
              }}
              className="p-1 rounded hover:bg-slate-100 transition-colors flex-shrink-0"
              aria-label="Expandir"
            >
              <ChevronDown
                className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1.5">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(data.check_in || "")}</span>
            <span className="text-slate-400">→</span>
            <span>{formatDate(data.check_out || "")}</span>
          </div>

          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 leading-tight">Código</p>
              <p className="text-xs font-medium text-slate-900 truncate">
                {data.codigo_confirmacion}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 leading-tight">Viajero</p>
              <p className="text-xs font-medium text-slate-900 truncate">
                {data.viajero}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">
              {formatCurrency(Number(data.total || 0))}
            </span>
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs ml-auto">
              {`${calcularNoches(
                data.check_in || "",
                data.check_out || "",
              )} noches`}
            </span>
          </div>
        </div>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-0 space-y-2 animate-in slide-in-from-top duration-200 border-t border-slate-100">
          {OnToggleExpand()}

          <button
            onClick={() => {
              onViewDetails(data);
            }}
            className="w-full py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
          >
            Ver detalles
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
