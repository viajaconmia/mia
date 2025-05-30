import React from "react";
import StatusBadge from "./StatusBadge";
import { BookingData } from "../types";

interface ReservationDetailsProps {
  reservation: BookingData;
}

/**
 * Format a date string to a user-friendly format
 */
export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split("T")[0].split("-");
  const date = new Date(+year, +month - 1, +day);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format a date string to include time
 */
const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return "Invalid date";
  }
};

/**
 * Format a currency value with proper symbols
 */
const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    return `${amount} ${currency}`;
  }
};

/**
 * Get the status color based on reservation status
 */
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "canceled":
      return "bg-red-100 text-red-800";
    case "complete":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ReservationDetails: React.FC<ReservationDetailsProps> = ({
  reservation,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-900">
            {" "}
            Informacion de Reservación
          </h3>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">
                Codigo de confirmacion
              </span>
              <span className="text-gray-900">
                {reservation.codigo_reservacion_hotel}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Hotel</span>
              <span className="text-gray-900">{reservation.hotel}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">
                Tipo de cuarto
              </span>
              <span className="text-gray-900">
                {reservation.room == "single" ? "Sencillo" : "Doble"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">
                Check-in
              </span>
              <span className="text-gray-900">
                {formatDateTime(reservation.check_in)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">
                Check-out
              </span>
              <span className="text-gray-900">
                {formatDateTime(reservation.check_out)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-900">
            Detalles Booking
          </h3>
          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Viajero</span>
              <span className="text-gray-900">
                {reservation.nombre_viajero
                  ? reservation.nombre_viajero
                  : reservation.primer_nombre +
                    " " +
                    reservation.apellido_paterno}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Estado</span>
              <StatusBadge
                status={
                  reservation.status == "pending" ||
                  reservation.status == "complete"
                    ? "Completado"
                    : "Cancelado"
                }
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">
                Fecha creación
              </span>
              <span className="text-gray-900">
                {formatDateTime(reservation.created_at)}
              </span>
            </div>
            {/* <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">Generado Por</span>
                            <span className="text-gray-900">{reservation.id_usuario_generador}</span>
                        </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetails;
