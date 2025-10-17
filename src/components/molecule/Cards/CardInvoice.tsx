import { FileText, ChevronDown, Download } from "lucide-react";
import { useState } from "react";
import { Invoice } from "../../../types/services";
import { formatNumberWithCommas } from "../../../utils/format";
import Button from "../../atom/Button";
import { FacturamaService } from "../../../services/FacturamaService";
import {
  downloadXMLBase64,
  downloadXMLUrl,
  viewPDFBase64,
  viewPDFUrl,
} from "../../../utils/files";

interface InvoiceCardProps {
  data: Invoice;
  OnToggleExpand?: () => React.ReactNode;
}

export function InvoiceCard({ data, OnToggleExpand }: InvoiceCardProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex gap-3 p-3">
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <FileText className="w-10 h-10 text-blue-600" />
          {data.uuid_factura && (
            <div className="absolute bottom-1 right-1 bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
              CFDI
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate leading-tight">
                Factura #{data.id_factura.slice(0, 8)}
              </h3>
              {data.rfc && (
                <p className="text-xs text-slate-500">RFC: {data.rfc}</p>
              )}
              {!data.rfc && data.nombre_agente && (
                <p className="text-xs text-slate-500 truncate">
                  {data.nombre_agente}
                </p>
              )}
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

          {/* <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1.5">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(data.fecha_emision)}</span>
            {data.fecha_vencimiento && (
              <>
                <span className="text-slate-400">→</span>
                <span className="text-amber-600">
                  Vence: {formatDate(data.fecha_vencimiento)}
                </span>
              </>
            )}
          </div> */}

          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 leading-tight">Total</p>
              <p className="text-sm font-bold text-slate-900">
                {formatNumberWithCommas(data.total)}
              </p>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-xs text-slate-500 leading-tight">Impuestos</p>
              <p className="text-xs font-medium text-slate-700">
                {formatNumberWithCommas(data.impuestos)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {data.reservas_asociadas && data.reservas_asociadas.length > 0 && (
              <span className="text-xs text-slate-600">
                {data.reservas_asociadas.length} reserva
                {data.reservas_asociadas.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="p-2 space-y-2 animate-in slide-in-from-top duration-200 border-t border-slate-100">
          {data.uuid_factura && (
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">
                UUID del CFDI
              </p>
              <p className="text-xs font-mono text-blue-800 break-all">
                {data.uuid_factura}
              </p>
              <div className="flex w-full gap-2 py-2">
                {(data.id_facturama || data.url_pdf) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (data.id_facturama) {
                        FacturamaService.getInstance()
                          .downloadCFDI({
                            id: data.id_facturama,
                            type: "pdf",
                          })
                          .then(({ data }) =>
                            viewPDFBase64(data?.Content || "")
                          )
                          .catch((error) =>
                            console.log(
                              error.response ||
                                error.message ||
                                "Error al obtener la factura"
                            )
                          );
                      } else if (data.url_pdf) {
                        viewPDFUrl(data.url_pdf);
                      }
                    }}
                  >
                    PDF
                  </Button>
                )}
                {(data.id_facturama || data.url_xml) && (
                  <Button
                    size="sm"
                    className="w-full"
                    variant="primary"
                    onClick={() => {
                      if (data.id_facturama) {
                        FacturamaService.getInstance()
                          .downloadCFDI({
                            id: data.id_facturama,
                            type: "xml",
                          })
                          .then(({ data: response }) =>
                            downloadXMLBase64(
                              response?.Content || "",
                              `${data.id_factura.slice(0, 8)}-${
                                data.created_at.split("T")[0]
                              }.xml`
                            )
                          )
                          .catch((error) =>
                            console.log(
                              error.response ||
                                error.message ||
                                "Error al obtener la factura"
                            )
                          );
                      } else if (data.url_xml) {
                        downloadXMLUrl(
                          data.url_xml,
                          `${data.id_factura.slice(0, 8)}-${
                            data.created_at.split("T")[0]
                          }.xml`
                        );
                      }
                    }}
                  >
                    XML
                  </Button>
                )}
              </div>
            </div>
          )}

          {OnToggleExpand && OnToggleExpand()}
        </div>
      )}
    </div>
  );
}
