// src/components/organism/detalles.tsx (NavContainerModal)
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Button from "../atom/Button";
import { ScrollArea } from "../atom/scroll-area";
import {
  ArrowUpRight as ArrowIcon,
  CreditCard as PaymentIcon,
  FileText as InvoicesIcon,
  Calendar as BookingIcon,
} from "lucide-react";
import { ModalType } from "../../types/services";
import { HEADERS_API, URL } from "../../constants/apiConstant";

// Interfaces para los items de la lista (Pagos, Facturas o Reservas)
interface ListItem {
  id: string;
  title: string;
  type: 'payment' | 'invoice' | 'booking';
}

interface NavContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  initialItemId: string;
  items: ListItem[];
  itemType: ModalType;
  title?: string;
}

// Interfaces para los datos de detalle
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

interface BookingDetails {
  id_hospedaje: string;
  confirmation_code: string;
  nombre_hotel: string;
  fecha_entrada: string;
  fecha_salida: string;
  estado?: string;
  // Agrega más campos específicos de reservas
}

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
  const [details, setDetails] = useState<
    PaymentDetails | InvoiceDetails | BookingDetails | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados separados para cada tipo de item
  const [payments, setPayments] = useState<ListItem[]>([]);
  const [invoices, setInvoices] = useState<ListItem[]>([]);
  const [bookings, setBookings] = useState<ListItem[]>([]);

  const isSidebarExpanded = isSidebarOpen || isSidebarHovered;

  const fetchDetails = useCallback(
    async (itemId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        let url = "";
        if (itemType === "payment") {
          url = `${URL}/v1/mia/pagos/getDetallesConexion?id_agente=${agentId}&id_raw=${itemId}`;
        } else if (itemType === "invoice") {
          url = `${URL}/v1/mia/factura/getDetallesConexionesFactura?id_agente=${agentId}&id_factura=${itemId}`;
        } else if (itemType === "booking") {
          url = `${URL}/v1/mia/reservas/detallesConexion?id_agente=${agentId}&id_hospedaje=${itemId}`;
        }

        console.log("url", url);
        const response = await fetch(url, {
          method: "GET",
          headers: HEADERS_API,
        });

        if (!response.ok) {
          throw new Error(`Error al obtener los detalles de ${itemType}`);
        }
        const data = await response.json();
        console.log("type", itemType)
        console.log("data traida", data);

        // Procesar los datos según el tipo
        if (data.data) {
          // Establecer los detalles principales
          setDetails(data.data);

          // Procesar items relacionados según el tipo
          if (itemType === "payment" && data.data.reservas && Array.isArray(data.data.reservas)) {
            const relatedBookings = data.data.reservas.map((reserva: any) => ({
              id: reserva.id_hospedaje || reserva.id_solicitud || `RES-${Math.random().toString(36).substr(2, 9)}`,
              title: reserva.nombre_hotel || `Reserva ${reserva.confirmation_code || reserva.id_solicitud}`,
              type: 'booking' as const
            }));
            setBookings(relatedBookings);
          }

          if (itemType === "payment" && data.data.facturas && Array.isArray(data.data.facturas)) {
            const relatedInvoices = data.data.facturas.map((factura: any) => ({
              id: factura.id_factura || `INV-${Math.random().toString(36).substr(2, 9)}`,
              title: factura.concepto || `Factura ${factura.numero_factura || factura.id_factura}`,
              type: 'invoice' as const
            }));
            setInvoices(relatedInvoices);
          }
          console.log("probando")

          if (itemType === "booking" && data.data.pagos && Array.isArray(data.data.pagos)) {
            const relatedPayments = data.data.pagos.map((pago: any) => ({
              id: pago.raw_id || pago.id_movimiento || `PAY-${Math.random().toString(36).substr(2, 9)}`,
              title: pago.concepto || `Pago ${pago.referencia || pago.id_movimiento}`,
              type: 'payment' as const
            }));
            setPayments(relatedPayments);
          }
          if (itemType === "booking" && data.data.pagos && Array.isArray(data.data.pagos)) {
            const relatedpayments = data.data.pagos.map((pagos: any) => ({
              id: pagos.raw_id || pagos.id_solicitud || `RES-${Math.random().toString(36).substr(2, 9)}`,
              title: pagos.concepto || `pago ${pagos.confirmation_code || pagos.id_solicitud}`,
              total: pagos.monto,
              type: 'payment' as const
            }));
            setPayments(relatedpayments);

          }
        }

        if (itemType === "invoice" && data.data.reservas && Array.isArray(data.data.reservas)) {
          const relatedBookings = data.data.reservas.map((reserva: any) => ({
            id: reserva.id_hospedaje || reserva.id_solicitud || `RES-${Math.random().toString(36).substr(2, 9)}`,
            title: reserva.nombre_hotel || `Reserva ${reserva.confirmation_code || reserva.id_solicitud}`,
            type: 'booking' as const
          }));
          setBookings(relatedBookings);
        }

        if (itemType === "invoice" && data.data.pagos && Array.isArray(data.data.pagos)) {
          const relatedPayments = data.data.pagos.map((pago: any) => ({
            id: pago.raw_id || pago.id_movimiento || `PAY-${Math.random().toString(36).substr(2, 9)}`,
            title: pago.concepto || `Pago ${pago.referencia || pago.id_movimiento}`,
            type: 'payment' as const
          }));
          setPayments(relatedPayments);
        }
      } catch (err) {
        // En caso de error, usar datos de ejemplo pero mantener el mensaje de error
        setError(`Error al cargar los detalles de ${itemType}. Mostrando datos de ejemplo.`);
        console.error(err);

        // Usar datos de ejemplo como respaldo

      } finally {
        setIsLoading(false);
      }
    },
    [agentId, itemType]
  );

  console.log(bookings, "reservas", invoices, "facturas", payments, "pagos")

  useEffect(() => {
    if (isOpen && currentItemId) {
      fetchDetails(currentItemId);
    }
  }, [isOpen, currentItemId, fetchDetails]);

  // Inicializar los items principales según el tipo
  useEffect(() => {
    if (items && items.length > 0) {
      if (itemType === "payment") {
        setPayments(items.map(item => ({ ...item, type: 'payment' as const })));
      } else if (itemType === "invoice") {
        setInvoices(items.map(item => ({ ...item, type: 'invoice' as const })));
      } else if (itemType === "booking") {
        setBookings(items.map(item => ({ ...item, type: 'booking' as const })));
      }
    }
  }, [items, itemType]);

  if (!isOpen) {
    return null;
  }

  // Función para renderizar el ícono según el tipo
  const renderIcon = (type: 'payment' | 'invoice' | 'booking') => {
    switch (type) {
      case 'payment':
        return <PaymentIcon className="h-4 w-4" />;
      case 'invoice':
        return <InvoicesIcon className="h-4 w-4" />;
      case 'booking':
        return <BookingIcon className="h-4 w-4" />;
      default:
        return <InvoicesIcon className="h-4 w-4" />;
    }
  };

  // Función para obtener el título de sección según el tipo
  const getSectionTitle = (type: 'payment' | 'invoice' | 'booking') => {
    switch (type) {
      case 'payment':
        return "Pagos";
      case 'invoice':
        return "Facturas";
      case 'booking':
        return "Reservas";
      default:
        return "Items";
    }
  };

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
                className={`transition-transform ${isSidebarOpen ? "rotate-180" : ""
                  }`}
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

                    <nav className="space-y-4">
                      {/* Sección principal según el tipo */}
                      <div>
                        <h3 className={`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isSidebarExpanded ? "" : "sr-only"}`}>
                          {getSectionTitle(itemType)}
                        </h3>
                        <div className="mt-2 space-y-1">
                          {(itemType === "payment" ? payments :
                            itemType === "invoice" ? invoices : bookings).map((item) => (
                              <button
                                onClick={() => setCurrentItemId(item.id)}
                                key={item.id}
                                className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-blue-50 hover:text-blue-900 ${currentItemId === item.id
                                  ? "bg-blue-100 text-blue-900"
                                  : "text-gray-500"
                                  }`}
                              >
                                {renderIcon(item.type)}
                                {isSidebarExpanded && (
                                  <span className="whitespace-nowrap truncate">
                                    {item.title}
                                  </span>
                                )}
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* Sección de items relacionados */}
                      {(invoices.length > 0 || bookings.length > 0) && (
                        <div>
                          <h3 className={`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isSidebarExpanded ? "" : "sr-only"}`}>
                            {itemType === "payment" ? "Facturas y Reservas relacionadas" :
                              itemType === "invoice" ? "Pagos relacionados" : "Facturas relacionadas"}
                          </h3>
                          <div className="mt-2 space-y-1">
                            {/* Mostrar facturas relacionadas para pagos y reservas */}
                            {(itemType === "payment" || itemType === "booking") && invoices.map((item) => (
                              <button
                                onClick={() => setCurrentItemId(item.id)}
                                key={item.id}
                                className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-50 hover:text-gray-900 ${currentItemId === item.id
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-400"
                                  }`}
                              >
                                {renderIcon('invoice')}
                                {isSidebarExpanded && (
                                  <span className="whitespace-nowrap truncate">
                                    {item.title}
                                  </span>
                                )}
                              </button>
                            ))}

                            {/* Mostrar reservas relacionadas para pagos y facturas */}
                            {(itemType === "payment" || itemType === "invoice") && bookings.map((item) => (
                              <button
                                onClick={() => setCurrentItemId(item.id)}
                                key={item.id}
                                className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-50 hover:text-gray-900 ${currentItemId === item.id
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-400"
                                  }`}
                              >
                                {renderIcon('booking')}
                                {isSidebarExpanded && (
                                  <span className="whitespace-nowrap truncate">
                                    {item.title}
                                  </span>
                                )}
                              </button>
                            ))}

                            {/* Mostrar pagos relacionados para facturas y reservas */}
                            {(itemType === "invoice" || itemType === "booking") && payments.map((item) => (
                              <button
                                onClick={() => setCurrentItemId(item.id)}
                                key={item.id}
                                className={`flex items-center justify-start w-full gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-50 hover:text-gray-900 ${currentItemId === item.id
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-400"
                                  }`}
                              >
                                {renderIcon('payment')}
                                {isSidebarExpanded && (
                                  <span className="whitespace-nowrap truncate">
                                    {item.title}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
                      <h2 className="text-2xl font-bold mb-4">
                        Detalles del Pago
                      </h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              ID de Movimiento
                            </p>
                            <p className="font-medium">
                              {(details as PaymentDetails).id_movimiento}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Monto</p>
                            <p className="font-medium text-green-600">
                              {(details as PaymentDetails).monto}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Fecha de Emisión
                            </p>
                            <p className="font-medium">
                              {(details as PaymentDetails).fecha_emision}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <p className="font-medium">
                              {(details as PaymentDetails).estado ||
                                "Completado"}
                            </p>
                          </div>
                          {(details as PaymentDetails).metodo_pago && (
                            <div>
                              <p className="text-sm text-gray-500">
                                Método de Pago
                              </p>
                              <p className="font-medium">
                                {(details as PaymentDetails).metodo_pago}
                              </p>
                            </div>
                          )}
                          {(details as PaymentDetails).referencia && (
                            <div>
                              <p className="text-sm text-gray-500">
                                Referencia
                              </p>
                              <p className="font-medium">
                                {(details as PaymentDetails).referencia}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {itemType === "invoice" && details && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">
                        Detalles de la Factura
                      </h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              ID de Factura
                            </p>
                            <p className="font-medium">
                              {(details as InvoiceDetails).id_factura}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Número de Factura
                            </p>
                            <p className="font-medium">
                              {(details as InvoiceDetails).invoice_number}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="font-medium text-blue-600">
                              {(details as InvoiceDetails).total}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <p className="font-medium">
                              {(details as InvoiceDetails).estado || "Pagada"}
                            </p>
                          </div>
                          {(details as InvoiceDetails).fecha_emision && (
                            <div>
                              <p className="text-sm text-gray-500">
                                Fecha de Emisión
                              </p>
                              <p className="font-medium">
                                {(details as InvoiceDetails).fecha_emision}
                              </p>
                            </div>
                          )}
                          {(details as InvoiceDetails).fecha_vencimiento && (
                            <div>
                              <p className="text-sm text-gray-500">
                                Fecha de Vencimiento
                              </p>
                              <p className="font-medium">
                                {(details as InvoiceDetails).fecha_vencimiento}
                              </p>
                            </div>
                          )}
                          {(details as InvoiceDetails).concepto && (
                            <div className="col-span-2">
                              <p className="text-sm text-gray-500">Concepto</p>
                              <p className="font-medium">
                                {(details as InvoiceDetails).concepto}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {itemType === "booking" && details && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">
                        Detalles de la Reserva
                      </h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              ID de Reserva
                            </p>
                            <p className="font-medium">
                              {(details as BookingDetails).id_hospedaje}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Código de Confirmación
                            </p>
                            <p className="font-medium">
                              {(details as BookingDetails).confirmation_code}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Hotel</p>
                            <p className="font-medium">
                              {(details as BookingDetails).nombre_hotel}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <p className="font-medium">
                              {(details as BookingDetails).estado || "Confirmada"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Fecha de Entrada
                            </p>
                            <p className="font-medium">
                              {(details as BookingDetails).fecha_entrada}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Fecha de Salida
                            </p>
                            <p className="font-medium">
                              {(details as BookingDetails).fecha_salida}
                            </p>
                          </div>
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