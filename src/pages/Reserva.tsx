import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import ROUTES from "../constants/routes";
import { BookingService, Solicitud } from "../services/BookingService";
import { CuponHotel } from "../porArreglar/CuponHotel";
import Loader from "../components/atom/Loader";
import ErrorPage from "../v2/components/atom/ErrorPage";
import CuponVuelo from "../v2/components/organism/CuponVuelo";
import CarRentalCard from "../porArreglar/CuponAuto";

export function Reserva() {
  const [, params] = useRoute(`${ROUTES.BOOKINGS.ID}`);
  const [booking, setBooking] = useState<Solicitud | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!params) return;

  let id: string = "";

  try {
    id = atob(params[0] as string);
  } catch (error) {
    return <ErrorPage message="Código de reserva inválido" />;
  }

  useEffect(() => {
    if (id) {
      BookingService.getInstance()
        .getCupon(id)
        .then((res) => {
          console.log(res);
          setBooking((res.data || {}) as Solicitud);
        })
        .catch((e) => setError(e.message || "Error al cargar la reserva"));
    }
  }, [id]);

  if (error) {
    return <ErrorPage message={error} />;
  }

  if (!booking)
    return (
      <div className="w-full h-full flex justify-center items-center bg-blue-50">
        <Loader />
      </div>
    );

  if (booking.type === "hotel") {
    return <CuponHotel item={booking} />;
  }
  if (booking.type === "vuelo") {
    return <CuponVuelo item={booking} />;
  }
  if (booking.type === "renta_carros") {
    return <CarRentalCard item={booking} />;
  }

  return <ErrorPage message="No se encontró el tipo de reserva solicitado" />;
}
