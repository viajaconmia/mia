import {
  ArrowRight,
  Bed,
  Calendar,
  CupSoda,
  FileDown,
  Hotel,
  MessageCircle,
  User,
  Users,
} from "lucide-react";
import { SolicitudHotel } from "../services/BookingService";
import { useEffect, useRef, useState } from "react";
import { getUbicacion } from "../services/reservas";
import { SupportModal } from "../components/SupportModal";
import { generatePdfHotel } from "./cupon";
import { useNotification } from "../hooks/useNotification";

export function CuponHotel({ item }: { item: SolicitudHotel }) {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const [reservationDetails, setReservationDetails] =
    useState<SolicitudHotel | null>(item);

  useEffect(() => {
    setReservationDetails(item);
  }, [item]);

  const pageRef = useRef<HTMLDivElement>(null);

  const getAcompanantesValue = (viajeros: string) => {
    if (viajeros) return viajeros;
    return "No hay acompañantes";
  };

  const cambiarLenguaje = (room: string) => {
    let updateRoom = room;
    if (room?.toUpperCase() === "SINGLE") updateRoom = "SENCILLO";
    else if (room?.toUpperCase() === "DOUBLE") updateRoom = "DOBLE";
    return updateRoom;
  };

  type UbicacionType =
    | { lat?: number; lng?: number }
    | string
    | null
    | undefined;

  function buildGoogleMapsUrl(
    ubicacion: UbicacionType,
    hotelName?: string | null,
    direccionFallback?: string | null,
    soloHotel: boolean = false,
  ) {
    const hotel = (hotelName ?? "").trim();
    if (soloHotel && hotel) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel)}`;
    }

    // Si recibes objeto {lat, lng}
    if (
      ubicacion &&
      typeof ubicacion === "object" &&
      "lat" in ubicacion &&
      "lng" in ubicacion
    ) {
      const lat = Number(ubicacion.lat);
      const lng = Number(ubicacion.lng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        // Coordenadas + contexto (hotel)
        const label = hotel ? ` (${hotel})` : "";
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}${label}`)}`;
      }
    }

    // Caso string
    const ubicStr = (typeof ubicacion === "string" ? ubicacion : "")?.trim();
    const dir = (direccionFallback ?? "").trim();

    // Combina piezas disponibles: Hotel, ubicacion string, direccion
    const parts = [hotel, ubicStr, dir].filter(Boolean);
    if (parts.length > 0) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
    }

    // Sin datos suficientes
    return "";
  }

  const handleUbication = async (): Promise<UbicacionType> => {
    try {
      const id_hotel = reservationDetails?.id_hotel_resuelto;
      if (!id_hotel) return reservationDetails?.direccion ?? null;

      const data = await getUbicacion(id_hotel);
      const ubic = data?.res?.[0]?.ubicacion_o_direccion ?? null; // puede ser "lat,lng" o texto
      // Si viene como "lat,lng" en string, parsea:
      if (typeof ubic === "string" && ubic.includes(",")) {
        const [a, b] = ubic.split(",").map((s) => Number(s.trim()));
        if (!Number.isNaN(a) && !Number.isNaN(b)) return { lat: a, lng: b };
      }
      return ubic;
    } catch (e) {
      console.error("Hubo un error al obtener la ubicación:", e);
      return reservationDetails?.direccion ?? null;
    }
  };

  useEffect(() => {
    const loadUbication = async () => {
      const ubic = await handleUbication();
      const mapsUrl = buildGoogleMapsUrl(
        ubic,
        reservationDetails?.hotel || "",
        reservationDetails?.direccion || "",
      );
      setUrl(mapsUrl);
    };
    loadUbication();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      {/* Botón de descarga */}
      <div className="text-right p-4 print:hidden">
        <button
          onClick={async () => {
            try {
              const pdf = await generatePdfHotel(item);
              const filename = `reservacion-${item.huesped.toUpperCase()}-${item.codigo_confirmacion}.pdf`;
              downloadPdfSafely(pdf, filename);
            } catch (err: any) {
              console.log(err);
              showNotification(
                "error",
                err.message || "Error al realizar este pedouw",
              );
            }
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FileDown className="mr-2" size={20} />
          Descargar PDF
        </button>
      </div>

      <div ref={pageRef} className="max-w-5xl mx-auto px-4 py-12 relative">
        {/* ✅ Quitamos los logos visibles en pantalla (izq/der) */}
        {/* (No hay <img> ni <svg> en el header; solo quedan en el PDF) */}

        <>
          <SupportModal
            isOpen={isSupportModalOpen}
            onClose={() => setIsSupportModalOpen(false)}
          />
          {reservationDetails ? (
            <>
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-blue-900">
                  Detalles de la Reservación
                </h1>
                {reservationDetails.codigo_confirmacion && (
                  <p className="text-blue-600 mt-2">
                    Confirmación #{reservationDetails.codigo_confirmacion}
                  </p>
                )}
              </div>

              {/* Main Content */}
              <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-blue-100">
                <div className="grid gap-6">
                  {/* Guest and Hotel Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={User}
                      label="Huésped"
                      value={reservationDetails.huesped || ""}
                    />
                    <div data-role="hotel-card">
                      <InfoCard
                        icon={Hotel}
                        label="Hotel"
                        value={reservationDetails.hotel || ""}
                        subValue={reservationDetails.direccion || ""}
                        href={url || null}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {reservationDetails.acompañantes &&
                      reservationDetails.acompañantes.length > 0 && (
                        <div className="">
                          <InfoCard
                            icon={Users}
                            label="Acompañantes"
                            value={getAcompanantesValue(
                              reservationDetails.acompañantes,
                            )}
                          />
                        </div>
                      )}
                    <div className="">
                      <InfoCard
                        icon={CupSoda}
                        label="Desayuno incluido"
                        value={
                          reservationDetails.incluye_desayuno === 1
                            ? "Desayuno incluido"
                            : "No incluye desayuno"
                        }
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <DateCard
                    check_in={reservationDetails.check_in}
                    check_out={reservationDetails.check_out}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Room Type */}
                    <InfoCard
                      icon={Bed}
                      label="Tipo de Habitación"
                      value={cambiarLenguaje(reservationDetails.room || "")}
                    />
                    <InfoCard
                      icon={MessageCircle}
                      label="Comentarios"
                      value={
                        reservationDetails.comentarios || "No hay comentarios"
                      }
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-blue-50 text-sm rounded-lg border border-blue-100 text-gray-700">
                  <p>
                    ¿Necesitas hacer cambios en tu reserva? <br />
                    <span
                      onClick={() => {
                        setIsSupportModalOpen(true);
                      }}
                      className="hover:underline cursor-pointer text-blue-500"
                    >
                      Contacta al soporte de MIA{" "}
                    </span>{" "}
                    para ayudarte con cualquier modificación
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mt-20">
                <h1 className="text-3xl font-bold text-blue-900 mb-4">
                  No se encontró información
                </h1>
                <p className="text-gray-600 text-lg">
                  No pudimos encontrar una reservación con los datos
                  proporcionados, por favor contacte con soporte.
                </p>
              </div>
            </>
          )}
        </>
      </div>
    </div>
  );
}

// Reusable components (sin cambios)
const InfoCard = ({
  icon: Icon,
  label,
  value,
  subValue = "",
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  href?: string | null;
}) => (
  <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm p-3 rounded-lg">
    <Icon className="w-4 h-4 text-blue-600" />
    <div>
      <p className="text-xs font-medium text-blue-900/60">{label}</p>
      <p className="text-base font-semibold text-blue-900">{value}</p>
      {subValue && href && (
        <a
          href={href}
          className="text-[11px] font-normal text-blue-900/80 underline hover:no-underline"
        >
          {subValue.toLowerCase()}
        </a>
      )}
    </div>
  </div>
);

const DateCard = ({
  check_in,
  check_out,
}: {
  check_in: string;
  check_out: string;
}) => {
  // Helper para limpiar fecha solo si incluye "T"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg">
      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-blue-600" />
        <div className="flex-1">
          <p className="text-xs font-medium text-blue-900/60">
            Fechas de Estancia
          </p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-xs text-blue-900/60">Check-in</p>
              <p className="text-base font-semibold text-blue-900">
                {formatDate(check_in)}
              </p>
            </div>
            <div className="mx-4">
              <ArrowRight className="text-blue-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-blue-900/60">Check-out</p>
              <p className="text-base font-semibold text-blue-900">
                {formatDate(check_out)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const downloadPdfSafely = (pdf: any, filename: string) => {
  // más robusto que pdf.save() en algunos navegadores/bloqueos
  try {
    if (typeof pdf?.output === "function") {
      const blob: Blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }
  } catch (e) {
    // fallback abajo
  }

  // fallback clásico
  pdf?.save?.(filename);
};
