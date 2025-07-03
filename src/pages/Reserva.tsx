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
        setReservation({
          ...data,
        } as Reservation);
        setLoading(false);
      });
    }
  }, []);

  const getAcompanantesValue = (viajeros: string) => {
    if (viajeros) {
      return viajeros;
    }
    return "No hay acompañantes";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-12 relative">
        <img
          src="https://luiscastaneda-tos.github.io/log/files/nokt.png"
          alt="Logo noktos"
          className="w-20 h-auto absolute top-15 left-4"
        />
        <p className="w-20 h-auto absolute top-15 right-4">
          <span>
            <svg
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 493 539"
              className="w-16 h-16 -rotate-12 transform text-sky-950"
            >
              <path
                fill="currentColor"
                d="M205.1,500.5C205.1,500.5,205,500.6,205.1,500.5C140.5,436.1,71.7,369.1,71.7,291.1 c0-86.6,84.2-157.1,187.6-157.1S447,204.4,447,291.1c0,74.8-63.4,139.6-150.8,154.1c0,0,0,0,0,0l-8.8-53.1 c61.3-10.2,105.8-52.6,105.8-100.9c0-56.9-60-103.2-133.7-103.2s-133.7,46.3-133.7,103.2c0,49.8,48,93.6,111.7,101.8c0,0,0,0,0,0 L205.1,500.5L205.1,500.5z"
              ></path>
              <path
                fill="currentColor"
                d="M341,125.5c-2.9,0-5.8-0.7-8.6-2.1c-70.3-37.3-135.9-1.7-138.7-0.2c-8.8,4.9-20,1.8-24.9-7.1 c-4.9-8.8-1.8-20,7-24.9c3.4-1.9,85.4-47.1,173.8-0.2c9,4.8,12.4,15.9,7.6,24.8C353.9,122,347.6,125.5,341,125.5z"
              ></path>
              <g>
                <path
                  fill="currentColor"
                  d="M248.8,263.8c-38.1-26-73.7-0.8-75.2,0.2c-6.4,4.6-8.7,14-5.3,21.8c1.9,4.5,5.5,7.7,9.8,8.9 c4,1.1,8.2,0.3,11.6-2.1c0.9-0.6,21.4-14.9,43.5,0.2c2.2,1.5,4.6,2.3,7.1,2.4c0.2,0,0.4,0,0.6,0c0,0,0,0,0,0 c5.9,0,11.1-3.7,13.5-9.7C257.8,277.6,255.4,268.3,248.8,263.8z"
                ></path>
                <path
                  fill="currentColor"
                  d="M348.8,263.8c-38.1-26-73.7-0.8-75.2,0.2c-6.4,4.6-8.7,14-5.3,21.8c1.9,4.5,5.5,7.7,9.8,8.9 c4,1.1,8.2,0.3,11.6-2.1c0.9-0.6,21.4-14.9,43.5,0.2c2.2,1.5,4.6,2.3,7.1,2.4c0.2,0,0.4,0,0.6,0c0,0,0,0,0,0 c5.9,0,11.1-3.7,13.5-9.7C357.8,277.6,355.4,268.3,348.8,263.8z"
                ></path>
              </g>
            </svg>
          </span>
        </p>
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
                  <div>
                    {reservation.nombres_viajeros_adicionales &&
                      reservation.nombres_viajeros_adicionales.length > 0 && (
                        <div className="">
                          <InfoCard
                            icon={Users}
                            label="Acompañantes"
                            value={getAcompanantesValue(
                              reservation.nombres_viajeros_adicionales
                            )}
                          />
                        </div>
                      )}
                    <div className="">
                      <InfoCard
                        icon={CupSoda}
                        label="Desayuno incluido"
                        value={
                          Boolean(
                            {
                              sencillo: reservation.desayuno_sencilla,
                              doble: reservation.desayuno_doble,
                            }[
                              reservation.room == "single" ||
                              reservation.room == "SENCILLO"
                                ? "sencillo"
                                : "doble"
                            ]
                          )
                            ? "Desayuno incluido"
                            : "No incluye desayuno"
                        }
                      />
                    </div>
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
