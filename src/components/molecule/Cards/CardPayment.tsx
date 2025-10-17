import { ChevronDown, Calendar, CreditCard } from "lucide-react";
import { useState } from "react";
import { Payment } from "../../../services/PagosService";
import { formatDate, formatNumberWithCommas } from "../../../utils/format";

interface PaymentCardProps {
  data: Payment;
  OnToggleExpand?: () => React.ReactNode;
}

export function PaymentCard({ data, OnToggleExpand }: PaymentCardProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex gap-3 p-3">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
          <CreditCard></CreditCard>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 capitalize truncate leading-tight">
                {data.metodo} {data.banco && `- ${data.banco}`}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {data.tipo_pago}
              </p>
            </div>
            <button
              onClick={() => setOpen(!open)}
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
            <span>{formatDate(data.fecha_pago)}</span>
            <span className="text-slate-400">•</span>
            <span className="capitalize">{data.origen_pago}</span>
          </div>

          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 leading-tight">
                Monto Total
              </p>
              <p className="text-sm font-bold text-slate-900">
                {formatNumberWithCommas(data.monto)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="p-2 space-y-2 animate-in slide-in-from-top duration-200 border-t border-slate-100">
          {OnToggleExpand && OnToggleExpand()}
        </div>
      )}
    </div>
  );
}
