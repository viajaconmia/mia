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
import { useLocation } from "wouter";
import ROUTES from "../../constants/routes";
import useAuth from "../../hooks/useAuth";

// Interfaces para los items de la lista (Pagos, Facturas o Reservas)
interface ListItem {
  id: string;
  title: string;
  type: 'payment' | 'invoice' | 'booking';
  // Campos adicionales para cada tipo
  monto?: string;
  total?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  check_in?: string;
  check_out?: string;
  night?: string;
  viajeros?: string;
  saldo?: string;
  metodo?: string;
  fecha_de_pago?: string;
  apiType?: ModalType;
}

interface NavContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  initialItemId: string;
  items: ListItem[];
  itemType: ModalType;
  title?: string;
  itemData?: any;
}

// Interfaces para los datos de detalle
interface PaymentDetails {
  id_movimiento: string;
  monto: string;
  fecha_emision: string;
  estado?: string;
  metodo_pago?: string;
  referencia?: string;
  concepto?: string;
  // Agrega más campos específicos de pagos
  id_pago?: string;
  fecha_pago?: string;
  saldo?: string;
}

interface InvoiceDetails {
  id_factura: string;
  invoice_number: string;
  numero_factura?: string;
  total: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  estado?: string;
  concepto?: string;
  // Agrega más campos específicos de facturas
  subtotal?: string;
  iva?: string;
}

interface BookingDetails {
  id_hospedaje: string;
  id_solicitud: string;
  id_booking: string;
  confirmation_code: string;
  nombre_hotel: string;
  fecha_entrada: string;
  fecha_salida: string;
  check_in: string;
  check_out: string;
  status_reserva: string;
  total_venta: string;
  viajero: string;
  telefono_viajero: string;
  noches: number;
  tipo_cuarto: string;
  agente: string;
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
  itemData,
  items,
  itemType,
  title = "Detalles",
}: NavContainerModalProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [location, setLocation] = useLocation()
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
  const { user } = useAuth()

  const isSidebarExpanded = isSidebarOpen || isSidebarHovered;

  console.log("vevrvrv", itemData);

  // Función para manejar el clic en cualquier item
  const handleItemClick = useCallback((itemId: string, itemType: ModalType) => {
    setCurrentItemId(itemId);
    console.log(`Cambiando conte"########################################xto a: ${itemType}`);
    itemType = itemType;
    console.log("biiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", itemType);
    // Si el tipo es diferente al actual, cambiar el contexto
    if (itemType !== itemType) {
      // Aquí podrías agregar lógica para cambiar el contexto si es necesario
      console.log(`Cambiando contexto a: ${itemType}`);
    }
  }, [itemType]);

  const fetchDetails = useCallback(
    async (itemId: string) => {
      setIsLoading(true);
      setError(null);
      console.log("feteeeeeeeeeeeeeeeeeeeeeee", itemType, itemId)
      if (!user?.info) {
        console.error("No agentId provided for agent user");
        setError("No se proporcionó ID de agente para el usuario.");
      }
      try {
        let url = "";
        if (itemType === "payment") {
          url = `${URL}/v1/mia/pagos/getDetallesConexion?id_agente=${user?.info?.id_agente}&id_raw=${itemId}`;
        } else if (itemType === "invoice") {
          url = `${URL}/v1/mia/factura/getDetallesConexionesFactura?id_agente=${user?.info?.id_agente}&id_factura=${itemId}`;
        } else if (itemType === "booking") {
          url = `${URL}/v1/mia/reservas/detallesConexion?id_agente=${user?.info?.id_agente}&id_hospedaje=${itemId}`;
        }

        console.log("Fetching from URL:", url);
        const response = await fetch(url, {
          method: "GET",
          headers: HEADERS_API,
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // CORRECCIÓN: La estructura varía según el endpoint
        const responseData = data.data || data; // Algunos endpoints usan data.data, otros data directamente

        if (responseData) {
          // Establecer los detalles principales
          setDetails(responseData);

          // Procesar items relacionados según el tipo
          if (itemType === "payment") {
            // Para pagos, buscar reservas y facturas relacionadas
            if (responseData.reservas && Array.isArray(responseData.reservas)) {
              const relatedBookings = responseData.reservas.map((reserva: any) => ({
                id: reserva.id_hospedaje || reserva.id_solicitud || `RES-${Math.random().toString(36).substr(2, 9)}`,
                title: reserva.nombre_hotel || `Reserva ${reserva.confirmation_code || reserva.id_solicitud}`,
                type: 'booking' as const,
                check_in: reserva.check_in,
                check_out: reserva.check_out,
                night: reserva.noches || reserva.night,
                viajeros: (reserva.viajero || "") + " " + (reserva.viajeros_adicionales_reserva || ""),
                total: reserva.total_venta || reserva.total
              }));
              setBookings(relatedBookings);
            }

            if (responseData.facturas && Array.isArray(responseData.facturas)) {
              const relatedInvoices = responseData.facturas.map((factura: any) => ({
                id: factura.id_factura || `INV-${Math.random().toString(36).substr(2, 9)}`,
                title: factura.concepto || `Factura ${factura.numero_factura || factura.id_factura}`,
                type: 'invoice' as const,
                fecha_emision: factura.fecha_emision,
                total: factura.total_factura || factura.total,
              }));
              setInvoices(relatedInvoices);
            }
          }

          if (itemType === "booking") {
            // Para reservas, buscar pagos y facturas relacionadas
            if (responseData.pagos && Array.isArray(responseData.pagos)) {
              const relatedPayments = responseData.pagos.map((pago: any) => ({
                id: pago.raw_id || pago.id_movimiento || pago.id_pago || `PAY-${Math.random().toString(36).substr(2, 9)}`,
                title: pago.concepto || `Pago ${pago.referencia || pago.id_movimiento || pago.id_pago}`,
                type: 'payment' as const,
                monto: pago.monto,
                saldo: pago.saldo,
                metodo: pago.metodo_pago || pago.metodo,
                fecha_de_pago: pago.fecha_pago || pago.fecha_emision
              }));
              setPayments(relatedPayments);
            }

            if (responseData.facturas && Array.isArray(responseData.facturas)) {
              const relatedInvoices = responseData.facturas.map((factura: any) => ({
                id: factura.id_factura || `INV-${Math.random().toString(36).substr(2, 9)}`,
                title: factura.concepto || `Factura ${factura.numero_factura || factura.id_factura}`,
                type: 'invoice' as const,
                fecha_emision: factura.fecha_emision,
                total: factura.total_factura || factura.total,
              }));
              setInvoices(relatedInvoices);
            }
          }

          if (itemType === "invoice") {
            // Para facturas, buscar reservas y pagos relacionados
            if (responseData.reservas && Array.isArray(responseData.reservas)) {
              const relatedBookings = responseData.reservas.map((reserva: any) => ({
                id: reserva.id_hospedaje || reserva.id_solicitud || `RES-${Math.random().toString(36).substr(2, 9)}`,
                title: reserva.nombre_hotel || `Reserva ${reserva.confirmation_code || reserva.id_solicitud}`,
                type: 'booking' as const,
                check_in: reserva.check_in,
                check_out: reserva.check_out,
                night: reserva.noches || reserva.night,
                viajeros: (reserva.viajero || "") + " " + (reserva.viajeros_adicionales_reserva || ""),
                total: reserva.total_venta || reserva.total
              }));
              setBookings(relatedBookings);
            }

            if (responseData.pagos && Array.isArray(responseData.pagos)) {
              const relatedPayments = responseData.pagos.map((pago: any) => ({
                id: pago.raw_id || pago.id_movimiento || pago.id_pago || `PAY-${Math.random().toString(36).substr(2, 9)}`,
                title: pago.concepto || `Pago ${pago.referencia || pago.id_movimiento || pago.id_pago}`,
                type: 'payment' as const,
                monto: pago.monto,
                saldo: pago.saldo,
                metodo: pago.metodo_pago || pago.metodo,
                fecha_de_pago: pago.fecha_pago || pago.fecha_emision
              }));
              setPayments(relatedPayments);
            }
          }
        }
      } catch (err) {
        setError(`Error al cargar los detalles de ${itemType}. Mostrando datos de ejemplo.`);
        console.error("Error fetching details:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [agentId, itemType]
  );

  console.log("payments", payments, "invoices", invoices, "bookings", bookings);

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

  // Agrega esta función helper al inicio del componente (después de los estados)
  const getRouteForType = (type: ModalType, id: string) => {
    switch (type) {
      case 'payment':
        return ROUTES.CONSULTAS.SEARCH("pagos", id);
      case 'invoice':
        return ROUTES.CONSULTAS.SEARCH("facturas", id);
      case 'booking':
        return ROUTES.CONSULTAS.SEARCH("reservaciones", id);
      default:
        return ROUTES.CONSULTAS.SEARCH("", id);
    }
  };

  // Función para manejar la redirección y cerrar el modal
  const handleRedirect = (type: ModalType, id: string) => {
    setLocation(getRouteForType(type, id));
    onClose(); // Cierra el modal después de redirigir
  };

  // Actualiza el componente RelatedItemsSection para usar la nueva función
  const RelatedItemsSection = ({ title, items }: { title: string, items: ListItem[] }) => {
    if (items.length === 0) return null;

    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer"
              onClick={() => handleRedirect(item.type as ModalType, item.id)}
            >
              <div className="flex items-center gap-2 mb-3">
                {renderIcon(item.type)}
                <h4 className="font-medium text-gray-900">{item.title}</h4>
              </div>

              {item.type === 'payment' && (
                <div className="space-y-2 text-sm text-gray-600">
                  {item.monto && <p><span className="text-gray-500 font-medium">Monto:</span> {item.monto}</p>}
                  {item.saldo && <p><span className="text-gray-500 font-medium">Saldo:</span> {item.saldo}</p>}
                  {item.metodo && <p><span className="text-gray-500 font-medium">Método:</span> {item.metodo}</p>}
                  {item.fecha_de_pago && <p><span className="text-gray-500 font-medium">Fecha:</span> {item.fecha_de_pago}</p>}
                </div>
              )}

              {item.type === 'invoice' && (
                <div className="space-y-2 text-sm text-gray-600">
                  {item.total && <p><span className="text-gray-500 font-medium">Total:</span> {item.total}</p>}
                  {item.fecha_emision && <p><span className="text-gray-500 font-medium">Emisión:</span> {item.fecha_emision}</p>}
                  {item.fecha_vencimiento && <p><span className="text-gray-500 font-medium">Vencimiento:</span> {item.fecha_vencimiento}</p>}
                </div>
              )}

              {item.type === 'booking' && (
                <div className="space-y-2 text-sm text-gray-600">
                  {item.check_in && <p><span className="text-gray-500 font-medium">Check-in:</span> {item.check_in}</p>}
                  {item.check_out && <p><span className="text-gray-500 font-medium">Check-out:</span> {item.check_out}</p>}
                  {item.night && <p><span className="text-gray-500 font-medium">Noches:</span> {item.night}</p>}
                  {item.viajeros && <p><span className="text-gray-500 font-medium">Viajeros:</span> {item.viajeros}</p>}
                  {item.total && <p><span className="text-gray-500 font-medium">Total:</span> {item.total}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full h-[90vh] max-w-6xl rounded-xl overflow-hidden bg-white shadow-lg">
        <Button
          variant="ghost"
          size="md"
          className="absolute top-4 right-4 z-50 bg-white rounded-full shadow-md"
          onClick={onClose}
        >
          <ArrowIcon className="rotate-90" />
        </Button>

        <div className="flex h-full w-full">


          <div className="flex-1 overflow-hidden border-l">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>Cargando tus datos... ⏳</p>
                </div>
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <p>Cargando tu contenido...</p>
                  </div>
                }
              >
                <ScrollArea className="h-full">
                  <div className="p-6">
                    {/* Mostrar mensaje de error si existe, pero igualmente mostrar los datos */}
                    {error && (
                      <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                        <p className="font-semibold">⚠️ Advertencia</p>
                        <p>{error}</p>
                        <button
                          onClick={() => setError(null)}
                          className="mt-2 text-yellow-700 underline text-sm"
                        >
                          Cerrar
                        </button>
                      </div>
                    )}

                    {!details && !isLoading && (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No se encontraron detalles para este elemento.</p>
                      </div>
                    )}

                    {itemType === "payment" && itemData && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6">
                          Detalles del Pago
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                ID de Movimiento
                              </p>
                              <p className="font-medium">
                                {itemData.raw_id || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Monto</p>
                              <p className="font-medium text-green-600 text-lg">
                                ${itemData.monto}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Fecha de Pago
                              </p>
                              <p className="font-medium">
                                {itemData.fecha_pago || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Saldo restante</p>
                              <p className="font-medium text-red-700 text-lg">
                                ${itemData.saldo || "N/A"}
                              </p>
                            </div>
                            {itemData.metodo_pago && (
                              <div>
                                <p className="text-sm text-gray-500">
                                  Método de Pago
                                </p>
                                <p className="font-medium">
                                  {itemData.metodo}
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
                            {(details as PaymentDetails).concepto && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">
                                  Concepto
                                </p>
                                <p className="font-medium">
                                  {(details as PaymentDetails).concepto}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mostrar items relacionados */}
                        <RelatedItemsSection
                          title="Facturas relacionadas"
                          items={invoices}
                        />
                        <RelatedItemsSection
                          title="Reservas relacionadas"
                          items={bookings}
                        />
                      </div>
                    )}

                    {itemType === "invoice" && itemData && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6">
                          Detalles de la Factura
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                ID de Factura
                              </p>
                              <p className="font-medium">
                                {itemData.id_factura}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                UUID de la factura
                              </p>
                              <p className="font-medium">
                                {itemData.uuid_factura || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-medium text-blue-600 text-lg">
                                ${itemData.total}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Estado</p>
                              <p className="font-medium">
                                {itemData.estado || "N/A"}
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
                            {(details as InvoiceDetails).subtotal && (
                              <div>
                                <p className="text-sm text-gray-500">
                                  Subtotal
                                </p>
                                <p className="font-medium">
                                  ${(details as InvoiceDetails).subtotal}
                                </p>
                              </div>
                            )}
                            {(details as InvoiceDetails).iva && (
                              <div>
                                <p className="text-sm text-gray-500">
                                  IVA
                                </p>
                                <p className="font-medium">
                                  ${(details as InvoiceDetails).iva}
                                </p>
                              </div>
                            )}
                            {(details as InvoiceDetails).concepto && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Concepto</p>
                                <p className="font-medium">
                                  {(details as InvoiceDetails).concepto}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mostrar items relacionados */}
                        <RelatedItemsSection
                          title="Pagos relacionados"
                          items={payments}
                        />
                        <RelatedItemsSection
                          title="Reservas relacionadas"
                          items={bookings}
                        />
                      </div>
                    )}

                    {itemType === "booking" && itemData && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6">Detalles de la Reserva</h2>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">ID de Reserva</p>
                              <p className="font-medium">{itemData.id_hospedaje}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Código de Confirmación</p>
                              <p className="font-medium">{itemData.confirmation_code}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Hotel</p>
                              <p className="font-medium">{itemData.hotel}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Estado</p>
                              <p className="font-medium">{itemData.status_solicitud || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Check-in</p>
                              <p className="font-medium">{itemData.check_in || itemData.fecha_entrada}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Check-out</p>
                              <p className="font-medium">{itemData.check_out || itemData.fecha_salida}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Tipo de Cuarto</p>
                              <p className="font-medium">{itemData.room}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Viajero</p>
                              <p className="font-medium">{itemData.nombre_viajero_reservacion + " " + itemData.nombres_viajeros_acompañantes}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Total de Venta</p>
                              <p className="font-medium text-green-600 text-lg">
                                ${itemData.total}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Mostrar items relacionados */}
                        <RelatedItemsSection
                          title="Pagos relacionados"
                          items={payments}
                        />
                        <RelatedItemsSection
                          title="Facturas relacionadas"
                          items={invoices}
                        />
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
