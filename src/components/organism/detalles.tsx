// src/components/organism/detalles.tsx (NavContainerModal)
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Button from "../atom/Button";
import { ScrollArea } from "../atom/scroll-area";
import {
  ArrowUpRight as ArrowIcon,
  CreditCard as PaymentIcon,
  FileText as InvoicesIcon,
} from "lucide-react";

// Interfaces para los items de la lista (Pagos o Facturas)
interface ListItem {
  id: string;
  title: string;
}

interface NavContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  initialItemId: string;
  items: ListItem[];
  itemType: "payment" | "invoice";
  title?: string;
}

// Interfaces para los datos de detalle (adapta estos a la respuesta de tu API)
interface PaymentDetails {
  id_movimiento: string;
  monto: string;
  fecha_emision: string;
  estado?: string;
  metodo_pago?: string;
  referencia?: string;
  // Agrega más campos específicos de pagos
}

interface InvoiceDetails {
  id_factura: string;
  invoice_number: string;
  total: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  estado?: string;
  concepto?: string;
  // Agrega más campos específicos de facturas
}

// Datos de ejemplo para pagos
const paymentExamples: PaymentDetails[] = [
  {
    id_movimiento: "PAY-001",
    monto: "$1,250.00",
    fecha_emision: "15/03/2023",
    estado: "Completado",
    metodo_pago: "Transferencia bancaria",
    referencia: "REF7890123"
  },
  {
    id_movimiento: "PAY-002",
    monto: "$850.50",
    fecha_emision: "22/03/2023",
    estado: "Completado",
    metodo_pago: "Tarjeta de crédito",
    referencia: "REF3456789"
  },
  {
    id_movimiento: "PAY-003",
    monto: "$2,100.75",
    fecha_emision: "05/04/2023",
    estado: "Pendiente",
    metodo_pago: "PayPal",
    referencia: "REF9012345"
  }
];

// Datos de ejemplo para facturas
const invoiceExamples: InvoiceDetails[] = [
  {
    id_factura: "INV-2023-001",
    invoice_number: "F-001",
    total: "$1,250.00",
    fecha_emision: "10/03/2023",
    fecha_vencimiento: "10/04/2023",
    estado: "Pagada",
    concepto: "Servicios de consultoría marzo"
  },
  {
    id_factura: "INV-2023-002",
    invoice_number: "F-002",
    total: "$850.50",
    fecha_emision: "15/03/2023",
    fecha_vencimiento: "15/04/2023",
    estado: "Pagada",
    concepto: "Licencias de software"
  },
  {
    id_factura: "INV-2023-003",
    invoice_number: "F-003",
    total: "$2,100.75",
    fecha_emision: "22/03/2023",
    fecha_vencimiento: "22/04/2023",
    estado: "Pendiente",
    concepto: "Desarrollo de aplicación móvil"
  }
];

const MiaIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

export default function NavContainerModal({
  isOpen,
  onClose,
  agentId,
  initialItemId,
  items,
  itemType,
  title = "Detalles",
}: NavContainerModalProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(initialItemId);
  const [details, setDetails] = useState<PaymentDetails | InvoiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSidebarExpanded = isSidebarOpen || isSidebarHovered;

  const fetchDetails = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = "";
      if (itemType === "payment") {
        url = `/v1/mia/pagos/get_pago_details?id_agente=${agentId}&id_pago=${itemId}`;
      } else if (itemType === "invoice") {
        url = `/v1/mia/factura/get_factura_details?id_agente=${agentId}&id_factura=${itemId}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener los detalles de ${itemType}`);
      }
      const data = await response.json();

      // Si no hay datos, usar datos de ejemplo
      if (!data.data) {
        if (itemType === "payment") {
          const examplePayment = paymentExamples.find(p => p.id_movimiento === itemId) || paymentExamples[0];
          setDetails(examplePayment);
        } else {
          const exampleInvoice = invoiceExamples.find(i => i.id_factura === itemId) || invoiceExamples[0];
          setDetails(exampleInvoice);
        }
      } else {
        setDetails(data.data);
      }
    } catch (err) {
      // En caso de error, usar datos de ejemplo pero mantener el mensaje de error
      setError(`Error al cargar los detalles de ${itemType}. Mostrando datos de ejemplo.`);
      console.error(err);

      // Usar datos de ejemplo como respaldo
      if (itemType === "payment") {
        const examplePayment = paymentExamples.find(p => p.id_movimiento === itemId) || paymentExamples[0];
        setDetails(examplePayment);
      } else {
        const exampleInvoice = invoiceExamples.find(i => i.id_factura === itemId) || invoiceExamples[0];
        setDetails(exampleInvoice);
      }
    } finally {
      setIsLoading(false);
    }
  }, [agentId, itemType]);

  useEffect(() => {
    if (isOpen && currentItemId) {
      fetchDetails(currentItemId);
    }
  }, [isOpen, currentItemId, fetchDetails]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full h-[80vh] max-w-4xl rounded-xl overflow-hidden bg-white shadow-lg">
        <Button
          variant="ghost"
          size="md"
          className="absolute top-4 right-4 z-50"
          onClick={onClose}
        >
          <ArrowIcon className="rotate-90" />
        </Button>

        <div className="flex h-full w-full min-w-[85vw]">
          <div
            className={`relative h-full bg-white/70 transition-all duration-300 ${isSidebarExpanded ? "w-52" : "w-16"
              }`}
          >
            <Button
              variant="ghost"
              size="md"
              className="absolute w-full right-0 top-0 z-40 h-12 flex justify-end pr-5 items-center"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <ArrowIcon
                className={`transition-transform ${isSidebarOpen ? "rotate-180" : ""}`}
              />
            </Button>

            <ScrollArea
              className="h-full py-6"
              onMouseOver={() => setIsSidebarHovered(true)}
              onMouseOut={() => setIsSidebarHovered(false)}
            >
              <div className="space-y-4">
                <div className="px-3 py-2">
                  <div className="space-y-1">
                    <div className="flex gap-2 h-fit items-center mb-8 mt-4">
                      <MiaIcon />
                      {isSidebarExpanded && (
                        <h2 className="text-xl font-semibold transition-all">
                          {title}
                        </h2>
                      )}
                    </div>

                    <nav className="space-y-2">
                      {items.map((item) => (
                        <button
                          onClick={() => setCurrentItemId(item.id)}
                          key={item.id}
                          className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-blue-50 hover:text-blue-900 ${currentItemId === item.id
                            ? "bg-blue-100 text-blue-900"
                            : "text-gray-500"
                            }`}
                        >
                          {itemType === "payment" ? (
                            <PaymentIcon className="h-4 w-4" />
                          ) : (
                            <InvoicesIcon className="h-4 w-4" />
                          )}
                          {isSidebarExpanded && (
                            <span className="whitespace-nowrap">
                              {item.title}
                            </span>
                          )}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[600px] border-l">
            {isLoading ? (
              <div className="p-6">
                <h1>Cargando tus datos... ⏳</h1>
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="p-6">
                    <h1>Cargando tu contenido...</h1>
                  </div>
                }
              >
                <div className="h-full overflow-y-auto p-6">
                  {/* Mostrar mensaje de error si existe, pero igualmente mostrar los datos */}
                  {error && (
                    <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                      <p>{error}</p>
                    </div>
                  )}

                  {itemType === "payment" && details && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Detalles del Pago</h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">ID de Movimiento</p>
                            <p className="font-medium">{(details as PaymentDetails).id_movimiento}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Monto</p>
                            <p className="font-medium text-green-600">{(details as PaymentDetails).monto}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fecha de Emisión</p>
                            <p className="font-medium">{(details as PaymentDetails).fecha_emision}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <p className="font-medium">{(details as PaymentDetails).estado || "Completado"}</p>
                          </div>
                          {(details as PaymentDetails).metodo_pago && (
                            <div>
                              <p className="text-sm text-gray-500">Método de Pago</p>
                              <p className="font-medium">{(details as PaymentDetails).metodo_pago}</p>
                            </div>
                          )}
                          {(details as PaymentDetails).referencia && (
                            <div>
                              <p className="text-sm text-gray-500">Referencia</p>
                              <p className="font-medium">{(details as PaymentDetails).referencia}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {itemType === "invoice" && details && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Detalles de la Factura</h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">ID de Factura</p>
                            <p className="font-medium">{(details as InvoiceDetails).id_factura}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Número de Factura</p>
                            <p className="font-medium">{(details as InvoiceDetails).invoice_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="font-medium text-blue-600">{(details as InvoiceDetails).total}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <p className="font-medium">{(details as InvoiceDetails).estado || "Pagada"}</p>
                          </div>
                          {(details as InvoiceDetails).fecha_emision && (
                            <div>
                              <p className="text-sm text-gray-500">Fecha de Emisión</p>
                              <p className="font-medium">{(details as InvoiceDetails).fecha_emision}</p>
                            </div>
                          )}
                          {(details as InvoiceDetails).fecha_vencimiento && (
                            <div>
                              <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
                              <p className="font-medium">{(details as InvoiceDetails).fecha_vencimiento}</p>
                            </div>
                          )}
                          {(details as InvoiceDetails).concepto && (
                            <div className="col-span-2">
                              <p className="text-sm text-gray-500">Concepto</p>
                              <p className="font-medium">{(details as InvoiceDetails).concepto}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}