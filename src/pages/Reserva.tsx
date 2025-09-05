import React, { useEffect, useState } from "react";
import {
  Calendar,
  Hotel,
  User,
  Bed,
  ArrowRight,
  MessageCircle,
  Users,
  CupSoda,
} from "lucide-react";
import { useRoute } from "wouter";
import { SupportModal } from "../components/SupportModal";
import { ReservationDetails2 } from "../types/index";
import { fetchReservation } from "../services/reservas";
import ROUTES from "../constants/routes";
import { Logo } from "../components/atom/Logo";

export function Reserva() {
  const [, params] = useRoute(`${ROUTES.BOOKINGS.ID}`);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [reservationDetails, setReservationDetails] =
    useState<ReservationDetails2 | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  console.log(params);

  useEffect(() => {
    if (params?.id) {
      fetchReservation(params.id, (data) => {
        console.log(data);
        setReservationDetails({
          ...data,
        } as ReservationDetails2);
        setLoading(false);
      });
    }
  }, [params?.id]);

  const getAcompanantesValue = (viajeros: string) => {
    if (viajeros) {
      return viajeros;
    }
    return "No hay acompañantes";
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-12 relative">
        <img
          src="https://luiscastaneda-tos.github.io/log/files/nokt.png"
          alt="Logo noktos"
          className="w-20 h-auto absolute top-15 left-4"
        />
        <p className="w-20 h-auto absolute top-15 right-4">
          <Logo className="w-16 h-16"></Logo>
        </p>
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
                      value={(reservationDetails.huesped || "").toUpperCase()}
                    />
                    <InfoCard
                      icon={Bed}
                      label="Tipo de Habitación"
                      value={cambiarLenguaje(reservationDetails.room || "")}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={Hotel}
                      label="Hotel"
                      value={reservationDetails.hotel || ""}
                      subValue={reservationDetails.direccion || ""}
                    />
                    <DateCard
                      check_in={reservationDetails.check_in}
                      check_out={reservationDetails.check_out}
                    />
                  </div>
                  {reservationDetails.acompañantes.trim() &&
                    reservationDetails.acompañantes.length > 0 && (
                      <div className="">
                        <InfoCard
                          icon={Users}
                          label="Acompañantes"
                          value={getAcompanantesValue(
                            reservationDetails.acompañantes
                          )}
                        />
                      </div>
                    )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Room Type */}
                    <InfoCard
                      icon={CupSoda}
                      label="Desayuno incluido"
                      value={
                        reservationDetails.incluye_desayuno === 1
                          ? "Desayuno incluido"
                          : "No incluye desayuno"
                      }
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
        <p className="text-blue-900/60 text-xs font-semibold">
          Fechas de estancia
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
