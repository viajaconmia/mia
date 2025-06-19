import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Hotel,
  Search,
  Download,
  MessageSquare,
  Filter,
  Receipt,
  ListCollapse,
  User,
  ChevronDown,
  Send,
  DownloadCloud,
  X,
  Book,
  CreditCard,
  Share2,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { useSolicitud } from "../hooks/useSolicitud";
import { Link } from "wouter";
import { useUser } from "../context/authContext";
import useApi from "../hooks/useApi";
import ShareButton from "../components/ShareButton";

interface Booking {
  id_solicitud: string;
  codigo_reservacion_hotel: string | null;
  nombre: string | null;
  hotel: string;
  check_in: string;
  check_out: string;
  room: string;
  total: string;
  status: string;
  nombre_viajero_completo: string | null;
  nombre_viajero: string | null;
  created_at: string;
  URLImagenHotel: string | null;
  is_booking: number | null;
  id_pago: string | null;
  id_facturama: string | null;
  id_credito: string | null;
  pendiente_por_cobrar: string | null;
  viajero: string;
}

interface InvoiceData {
  ContentEncoding: string;
  ContentType: string;
  ContentLength: number;
  Content: string;
}

interface BookingsReportPageProps {
  onBack: () => void;
}

export const BookingsReportPage: React.FC<BookingsReportPageProps> = ({
  onBack,
}) => {
  const { mandarCorreo, descargarFactura } = useApi();
  const { obtenerSolicitudesClient } = useSolicitud();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"hotel" | "traveler" | "date">(
    "hotel"
  );
  const [showFilters, setShowFilters] = useState(false);
  const { authState } = useUser();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [invoiceDataxml, setInvoiceDataxml] = useState<InvoiceData | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (authState?.user) {
      obtenerSolicitudesClient((json) => {
        setBookings(json);
      }, authState?.user?.id);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    const date = new Date(+year, +month - 1, +day);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSendFactura = async (id_facturama: string) => {
    try {
      const correo = prompt(
        "¿A que correo electronico deseas mandar la factura?"
      );
      await mandarCorreo(id_facturama, correo || "");
      alert("El correo fue mandado con exito");
    } catch (error) {
      alert("ha ocurrido un error");
    }
  };

  const handleDescargarFactura = async (id: string) => {
    try {
      descargarFactura(id).then((data) => setInvoiceData(data));
      descargarFactura(id, "xml").then((data) => setInvoiceDataxml(data));
    } catch (error) {
      alert("Ha ocurrido un error al descargar la factura");
    }
  };

  const downloadCSV = () => {
    if (!filteredBookings || filteredBookings.length === 0) return;

    // Mapeamos los datos para seleccionar solo los campos que necesitamos
    const csvData = filteredBookings.map((booking) => {
      // Transformar el tipo de habitación con valor por defecto
      const roomType =
        booking.room === "single"
          ? "Sencillo"
          : booking.room === "double"
          ? "Double"
          : booking.room || "No especificado";

      // Formatear las fechas
      const checkIn = booking.check_in
        ? new Date(booking.check_in).toLocaleDateString("es-MX")
        : "N/A";
      const checkOut = booking.check_out
        ? new Date(booking.check_out).toLocaleDateString("es-MX")
        : "N/A";

      return {
        Hotel: booking.hotel || "N/A",
        "Nombre del Viajero": booking.viajero || "N/A",
        "Tipo de Habitación": roomType,
        "Check-in": checkIn,
        "Check-out": checkOut,
        "Código Reservación": booking.codigo_reservacion_hotel || "N/A",
        Total: booking.total ? `$${parseFloat(booking.total).toFixed(2)}` : "",
      };
    });

    // Crear el contenido CSV
    const headers = Object.keys(csvData[0]).join(",");

    const rows = csvData
      .map((obj) =>
        Object.values(obj)
          .map((value) => {
            // Manejo seguro para valores null/undefined
            const safeValue =
              value === null || value === undefined ? "" : value;
            return `"${String(safeValue).replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;

    // Descargar el archivo
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_hoteles.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsOpen(false);
  };

  const downloadPDF = () => {
    downloadReport(); // Tu función existente para PDF
    setIsOpen(false);
  };

  const handleDownloadPDF = () => {
    if (!invoiceData) return;

    const linkSource = `data:application/pdf;base64,${invoiceData.Content}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = "factura.pdf";
    downloadLink.click();
  };
  const handleDownloadxml = () => {
    if (!invoiceData) return;

    const linkSource = `data:application/xml;base64,${invoiceDataxml?.Content}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = "factura.xml";
    downloadLink.click();
  };

  const getStatusColor = (status: string) => {
    return status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    let matches = true;

    switch (filterType) {
      case "hotel":
        matches = matches && booking.hotel.toLowerCase().includes(searchLower);
        break;
      case "traveler":
        matches =
          matches &&
          (booking.viajero?.toLowerCase().includes(searchLower) ||
            false ||
            booking.viajero?.toLowerCase().includes(searchLower) ||
            false);
        break;
      case "date":
        matches =
          matches &&
          (booking.check_in.includes(searchLower) ||
            booking.check_out.includes(searchLower));
        break;
    }

    // if (selectedPaymentMethod !== "all") {
    //   matches = matches && booking.payment_method === selectedPaymentMethod;
    // }

    // if (selectedStage !== "all") {
    //   matches = matches && booking.booking_stage === selectedStage;
    // }

    if (startDate && endDate) {
      const bookingDate = new Date(booking.check_in);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matches = matches && bookingDate >= start && bookingDate <= end;
    }

    return matches;
  });

  const downloadReport = () => {
    const element = document.getElementById("bookings-report");
    if (!element) return;

    const opt = {
      margin: 1,
      filename: "reporte-reservas.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-[#4c93f8] pt-16 relative overflow-hidden">
      {invoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Descargar Factura</h3>
              <button
                onClick={() => setInvoiceData(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="mb-4 text-gray-600">
              Tu factura está lista para descargar. Haz clic en el botón para
              comenzar la descarga.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <DownloadCloud className="w-5 h-5" />
                Descargar PDF
              </button>
              <button
                onClick={handleDownloadxml}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <DownloadCloud className="w-5 h-5" />
                Descargar XML
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            disabled={filteredBookings.length === 0}
            style={
              filteredBookings.length === 0
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {}
            }
          >
            <Download className="w-5 h-5" />
            <span>Descargar Reporte</span>
          </button>

          {isOpen && (
            <div className="absolute right-4 mt-36 w-48  bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={downloadCSV}
                  className="block w-full text-left px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-gray-50"
                >
                  Descargar como CSV
                </button>
                <button
                  onClick={downloadPDF}
                  className="block w-full text-left px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-gray-50"
                >
                  Descargar como PDF
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                pattern="^[^<>]*$"
                type="text"
                placeholder={`Buscar por ${
                  filterType === "hotel"
                    ? "nombre de hotel"
                    : filterType === "traveler"
                    ? "nombre o ID de viajero"
                    : "fecha"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 pl-10"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 z-50">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Buscar por
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setFilterType("hotel")}
                          className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                            filterType === "hotel"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100"
                          }`}
                        >
                          <Hotel className="w-4 h-4" />
                          <span>Hotel</span>
                        </button>
                        <button
                          onClick={() => setFilterType("traveler")}
                          className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                            filterType === "traveler"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100"
                          }`}
                        >
                          <User className="w-4 h-4" />
                          <span>Viajero</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Rango de fechas
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          pattern="^[^<>]*$"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          pattern="^[^<>]*$"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Método de pago
                      </label>
                      <select
                        value={selectedPaymentMethod}
                        onChange={(e) =>
                          setSelectedPaymentMethod(e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">Todos</option>
                        <option value="credit_card">Tarjeta de crédito</option>
                        <option value="debit_card">Tarjeta de débito</option>
                        <option value="cash">Efectivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Etapa
                      </label>
                      <select
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">Todas</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="completed">Completada</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          id="bookings-report"
          className="bg-white rounded-lg overflow-hidden"
        >
          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <>
                  <div
                    key={booking.id_solicitud}
                    className="p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={
                                booking.URLImagenHotel ||
                                "https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/256x256/hotel.png"
                              }
                              alt={booking.hotel}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {booking.hotel}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>
                                ID Viajero:{" "}
                                {booking.viajero?.toUpperCase() || ""}
                              </span>
                              {booking.codigo_reservacion_hotel && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Código: {booking.codigo_reservacion_hotel}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(booking.check_in)} -{" "}
                                {formatDate(booking.check_out)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {booking.id_facturama ? (
                          <>
                            <button
                              onClick={() => {
                                handleSendFactura(booking.id_facturama || "");
                              }}
                              className="flex border p-2 rounded-lg border-sky-200 items-center gap-1 bg-sky-600 text-blue-50 font-semibold hover:text-blue-700"
                            >
                              <Send className="w-4 h-4" /> Enviar factura
                            </button>
                            <button
                              onClick={() => {
                                handleDescargarFactura(
                                  booking.id_facturama || ""
                                );
                              }}
                              className="flex border p-2 rounded-lg border-sky-200 items-center gap-1 bg-sky-600 text-blue-50 font-semibold hover:text-blue-700"
                            >
                              <DownloadCloud className="w-4 h-4" /> Descargar
                              factura
                            </button>
                          </>
                        ) : (
                          <>
                            {Number(booking.pendiente_por_cobrar) <= 0 ? (
                              <Link
                                href={`/factura/${booking.id_solicitud}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Receipt className="w-4 h-4" /> Facturar
                              </Link>
                            ) : (
                              <>
                                {/* <Link
                                  href={`/factura/${booking.id_solicitud}`}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                >
                                  <Receipt className="w-4 h-4" /> Facturar
                                </Link>
                                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                                  <CreditCard className="w-4 h-4" />
                                  <span>Pagar</span>
                                </button> */}
                              </>
                            )}
                          </>
                        )}
                        {/* {booking.is_booking && } */}

                        <Link
                          to={`/reserva/${booking.id_solicitud}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <ListCollapse className="w-4 h-4" />
                          <span>Detalles</span>
                        </Link>
                        <ShareButton
                          id={booking.id_solicitud}
                          title="hola"
                          description="hloa"
                        >
                          <Share2 className="w-4 h-4" /> Compartir
                        </ShareButton>
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron reservaciones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsReportPage;
