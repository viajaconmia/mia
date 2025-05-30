import React, { useEffect, useState } from "react";
import {
  Calendar,
  Hotel,
  User,
  Bed,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { useRoute } from "wouter";
import { SupportModal } from "../components/SupportModal";
import { Reservation } from "../types/index";
import { fetchReservation } from "../services/reservas";

export function Reserva() {
  const [_, params] = useRoute("/reserva/:id");
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (params?.id) {
      fetchReservation(params.id, (data) => {
        console.log(data);
        setReservation(data);
        setLoading(false);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <>
          <SupportModal
            isOpen={isSupportModalOpen}
            onClose={() => setIsSupportModalOpen(false)}
          />
          {reservation ? (
            <>
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-blue-900">
                  Detalles de la Reservación
                </h1>
                {reservation.codigo_reservacion_hotel && (
                  <p className="text-blue-600 mt-2">
                    Confirmación #{reservation.codigo_reservacion_hotel}
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
                      value={
                        reservation.nombre_viajero ||
                        reservation.nombre_viajero_completo
                      }
                    />
                    <InfoCard
                      icon={Hotel}
                      label="Hotel"
                      value={reservation.hotel || ""}
                      subValue={reservation.direccion || ""}
                    />
                  </div>

                  {/* Dates */}
                  <DateCard
                    check_in={reservation.check_in}
                    check_out={reservation.check_out}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Room Type */}
                    <InfoCard
                      icon={Bed}
                      label="Tipo de Habitación"
                      value={cambiarLenguaje(reservation.room || "")}
                    />
                    <InfoCard
                      icon={MessageCircle}
                      label="Comentarios"
                      value={reservation.comments || "No hay comentarios"}
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
              {loading ? (
                <>
                  <div className="text-center mt-20 animate-pulse">
                    <h1 className="text-3xl font-bold text-blue-900 mb-4">
                      Cargando reservación...
                    </h1>
                    <p className="text-gray-500 text-lg">
                      Por favor espera un momento.
                    </p>

                    <div className="mt-10 flex justify-center">
                      <div className="w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
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
          )}
        </>
      </div>
    </div>
  );
}

const cambiarLenguaje = (room: string) => {
  let updateRoom = room;
  if (room.toUpperCase() == "SINGLE") {
    updateRoom = "SENCILLO";
  } else if (room.toUpperCase() == "DOUBLE") {
    updateRoom = "DOBLE";
  }
  return updateRoom;
};

// Reusable components
const InfoCard = ({
  icon: Icon,
  label,
  value,
  subValue = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
}) => (
  <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm p-3 rounded-lg">
    <Icon className="w-4 h-4 text-blue-600" />
    <div>
      <p className="text-xs font-medium text-blue-900/60">{label}</p>
      <p className="text-base font-semibold text-blue-900">{value}</p>
      {subValue && (
        <p className="text-[11px] font-normal text-blue-900/50">
          {subValue.toLowerCase()}
        </p>
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
}) => (
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
              {check_in.split("T")[0]}
            </p>
          </div>
          <div className="mx-4">
            <ArrowRight className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-blue-900/60">Check-out</p>
            <p className="text-base font-semibold text-blue-900">
              {check_out.split("T")[0]}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
