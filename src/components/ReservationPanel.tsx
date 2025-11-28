"use client";

import React, { useState, useEffect } from "react";
import type { BookingData } from "../types";
import {
  Calendar,
  Users,
  CreditCard,
  Building2,
  ArrowRight,
  Clock,
  ShoppingCartIcon,
  Car,
} from "lucide-react";
import { useSolicitud } from "../hooks/useSolicitud";
import { Reservation } from "../types/chat";
import { Hotel } from "../types/hotel";
import { fetchHotelById } from "../services/database";
import useAuth from "../hooks/useAuth";
import Button from "./atom/Button";
import { CartService } from "../services/CartService";
import { useNotification } from "../hooks/useNotification";
import { useCart } from "../context/cartContext";
import { Logo } from "./atom/Logo";
import { CarRentalOption } from "../context/ChatContext";
import { TravelLayout } from "./select";
import { useChat } from "../hooks/useChat";


function areAllFieldsFilled(obj: any, excludeKeys: string[] = []): boolean {
  if (obj === null || obj === undefined) return false;

  if (
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(obj)) {
    return (
      obj.length > 0 &&
      obj.every((item) => areAllFieldsFilled(item, excludeKeys))
    );
  }

  if (typeof obj === "object") {
    return Object.entries(obj).every(([key, value]) => {
      if (excludeKeys.includes(key)) return true;
      return areAllFieldsFilled(value, excludeKeys);
    });
  }

  return false;
}


interface ReservationPanelProps {
  booking?: Reservation | null;
  selectedCar?: CarRentalOption | null; // 👈 nueva prop
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;

  // Forzar la fecha como local ignorando la conversión de zona horaria
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day); // Mes es 0-indexado

  return {
    weekday: date.toLocaleDateString("es-MX", { weekday: "long" }),
    day: date.getDate(),
    month: date.toLocaleDateString("es-MX", { month: "long" }),
    year: date.getFullYear(),
  };
};

// const renderPaymentMethod = () => {
//   const stripe = useStripe();
//   const elements = useElements();
//   return (
//     <Elements stripe={stripePromise}>
//       <CheckoutForm />
//     </Elements>
// }

export const ReservationPanel: React.FC<ReservationPanelProps> = ({
  booking,
  selectedCar,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [idSolicitud, setIdSolicitud] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBookingSaved, setIsBookingSaved] = useState(false);
  const [dataHotel, setDataHotel] = useState<Hotel | null>(null);

  const [carData, setCarData] = useState<CarRentalOption | null>(null);
  //   )
  const [mainDriver, setMainDriver] = useState<string>("");
  const [mainDriverAge, setMainDriverAge] = useState<number | "">("");
  const [additionalDrivers, setAdditionalDrivers] = useState<string>("");
  const { state } = useChat()

  const { user } = useAuth();
  const { handleActualizarCarrito } = useCart();

  const { crearSolicitudChat } = useSolicitud();
  // 👉 LOG 1: lo que viene del padre
  useEffect(() => {
    console.log("selectedCar (prop) en ReservationPanel:", selectedCar);
  }, [selectedCar]);

  // 👉 LOG 2: estado interno del auto
  useEffect(() => {
    console.log("carData (state) en ReservationPanel:", carData);
  }, [carData]);

  useEffect(() => {
    console.log("selectedCar prop en ReservationPanel:", selectedCar);
    if (selectedCar) {
      setCarData(selectedCar);
    }
  }, [selectedCar]);

  const notificationContext = useNotification();
  const showNotification = notificationContext?.showNotification;

  useEffect(() => {
    let currentBooking = booking || null;
    let currentBookingData = bookingData || {
      confirmationCode: null,
      hotel: {
        name: null,
        location: null,
        image: null,
        additionalImages: [],
      },
      dates: {
        checkIn: null,
        checkOut: null,
      },
      room: {
        type: null,
        pricePerNight: null,
        totalPrice: null,
      },
      guests: [],
      totalNights: null,
    };
    if (currentBooking?.check_in && currentBooking?.check_out) {
      const checkIn = new Date(currentBooking?.check_in);
      const checkOut = new Date(currentBooking?.check_out);
      const currentYear = new Date().getFullYear();
      const totalNights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)
      );

      currentBookingData = {
        ...currentBookingData,
        dates: {
          checkIn: currentBooking.check_in,
          checkOut: currentBooking.check_out,
        },
        totalNights,
      };
    }
    if (
      currentBooking?.id_hotel &&
      (!dataHotel || dataHotel?.id_hotel != currentBooking.id_hotel)
    ) {
      fetchHotelById(currentBooking.id_hotel, (hotel_response) => {
        console.log(hotel_response);
        setDataHotel(hotel_response);
      });
    }
    if (dataHotel) {
      currentBookingData = {
        ...currentBookingData,
        hotel: {
          name: dataHotel.hotel,
          location: dataHotel.direccion,
          image: dataHotel.imagenes[0],
          additionalImages: dataHotel.imagenes,
        },
      };
      if (currentBooking?.room) {
        let room = dataHotel.tipos_cuartos.find(
          (room) =>
            room.id_tipo_cuarto ===
            (currentBooking.room == "single"
              ? 1
              : currentBooking.room == "double"
                ? 2
                : 0)
        );
        if (!room) {
          room = dataHotel.tipos_cuartos[0];
        }

        currentBookingData = {
          ...currentBookingData,
          room: {
            ...currentBookingData.room,
            type: room.cuarto,
            pricePerNight: parseFloat(room.precio),
            totalPrice:
              parseFloat(room.precio) * currentBookingData.totalNights!,
          },
        };
      }
    }
    if (currentBooking?.viajero || currentBooking?.id_viajero) {
      console.log(currentBooking.viajero || currentBooking.id_viajero);
      currentBookingData = {
        ...currentBookingData,
        guests: [currentBooking.viajero || currentBooking.id_viajero].filter(
          (guest): guest is string => typeof guest === "string"
        ),
      };
    }
    if (areAllFieldsFilled(currentBookingData, ["confirmationCode"])) {
      currentBookingData = {
        ...currentBookingData,
        confirmationCode: `RES${Math.round(Math.random() * 10000000)}`,
      };
    }
    setBookingData(currentBookingData);
  }, [booking, dataHotel]);

  useEffect(() => {
    // Auto-save booking when confirmation code is generated
    if (bookingData?.confirmationCode && !isBookingSaved) {
      saveBookingToDatabase();
    }
  }, [bookingData?.confirmationCode]);

  useEffect(() => {
    console.log("selectedCar prop en ReservationPanel:", selectedCar);
    if (selectedCar) {
      setCarData(selectedCar);
    }
  }, [selectedCar]);

  const saveBookingToDatabase = async () => {
    if (!bookingData || isSaving || isBookingSaved) return;

    try {
      setIsSaving(true);

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Get the first image URL from additionalImages
      const imageUrl =
        bookingData.hotel.additionalImages?.[0] ||
        bookingData.hotel.image ||
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
      console.log(bookingData);
      console.log("Saving booking data:", bookingData);
      const responseSolicitud = await crearSolicitudChat(
        {
          confirmation_code: bookingData.confirmationCode,
          hotel_name: bookingData.hotel.name,
          dates: {
            checkIn: bookingData.dates.checkIn,
            checkOut: bookingData.dates.checkOut,
          },
          room: {
            type: bookingData.room.type,
            totalPrice: bookingData.room.totalPrice,
          },
          nombre_viajero: bookingData.guests[0],
        },
        user.info?.id_agente || ""
      );
      console.log(
        "Response from crearSolicitudChat:",
        responseSolicitud.data.response.resultsCallback[0]
      );
      console.log(responseSolicitud.data.response.resultsCallback);
      setIdSolicitud(responseSolicitud.data.response.resultsCallback[0]);

      setIsBookingSaved(true);
    } catch (error: any) {
      console.error("Error saving booking:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!bookingData && !selectedCar) {
    return null;
  }

  // 👇 OJO: bookingData puede ser null, usamos "?."
  const hasAnyData =
    bookingData?.hotel?.name ||
    bookingData?.dates?.checkIn ||
    bookingData?.room?.type ||
    bookingData?.confirmationCode ||
    state.select;

  if (!hasAnyData) {
    return (
      <div className="h-full p-6  flex items-center justify-center">
        <div className="text-center text-[#10244c93]">
          <p className="text-3xl mb-2">Aún no hay detalles de la reservación</p>
          <p className="text-sm opacity-80 flex justify-center">
            <span>
              <Logo className="w-full -rotate-12 transform text-sky-950" />
            </span>
          </p>
        </div>
      </div>
    );
  }

  // 👇 También aquí, proteger bookingData
  const checkInDate = formatDate(bookingData?.dates?.checkIn || null);
  const checkOutDate = formatDate(bookingData?.dates?.checkOut || null);

  const handleAddToCart = async (total: string, type: "hotel") => {
    try {
      setLoading(true);
      if (!idSolicitud) throw new Error("Solicitud no creada");

      const { message } = await CartService.getInstance().createCartItem({
        id_solicitud: idSolicitud,
        total,
        type,
        selected: true,
      });
      showNotification("success", message || "Agregado al carrito");
    } catch (error: any) {
      console.error(
        error.response || error.message || "Error al agregar al carrito"
      );
      showNotification("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarToCart = () => {
    if (!carData) return;

    console.log("Auto listo para mandar al carrito (ReservationPanel):", {
      carData,
      mainDriver,
      mainDriverAge,
      additionalDrivers,
    });
  };


  const isCarFormValid =
    !!carData &&
    mainDriver.trim().length > 0 &&
    mainDriverAge !== "" &&
    Number(mainDriverAge) > 0;

  return (
    <div className="h-full p-6 space-y-10 overflow-y-auto">
      {idSolicitud && (
        <Button
          icon={ShoppingCartIcon}
          variant="primary"
          size="full"
          disabled={loading}
          onClick={() =>
            handleAddToCart(
              (bookingData?.room?.totalPrice || 0).toFixed(2),
              "hotel"
            ).then(() => handleActualizarCarrito())
          }
        >
          Agregar al carrito
        </Button>
      )}

      <div id="reservation-content" className="space-y-8">
        {bookingData?.hotel?.name && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">Hotel</h3>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              {bookingData.hotel.image && (
                <img
                  src={bookingData.hotel.image}
                  alt={bookingData.hotel.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h4 className="font-semibold text-lg text-[#10244c]">
                  {bookingData.hotel.name}
                </h4>
                {bookingData.hotel.location && (
                  <p className="text-[#10244c]/80">
                    {bookingData.hotel.location}
                  </p>
                )}
              </div>
            </div>

            {bookingData.hotel.additionalImages &&
              bookingData.hotel.additionalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {bookingData.hotel.additionalImages
                    .slice(0, 3)
                    .map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden shadow-sm"
                      >
                        <img
                          src={imageUrl}
                          alt={`${bookingData.hotel.name} - Vista ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                </div>
              )}
          </div>
        )}

        {(bookingData.dates?.checkIn || bookingData.dates?.checkOut) && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">
                Fechas de Estancia
              </h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[#10244c]/80 text-sm uppercase tracking-wider">
                    Check-in
                  </p>
                  {checkInDate ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-[#10244c]">
                        {checkInDate.day}
                      </p>
                      <div>
                        <p className="text-lg capitalize text-[#10244c]">
                          {checkInDate.month} - {checkInDate.year}
                        </p>
                        <p className="text-sm text-[#10244c]/80 capitalize">
                          {checkInDate.weekday}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-[#10244c]">Por definir</p>
                  )}
                </div>

                {bookingData.totalNights && (
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-6 h-6 text-[#10244c]/80" />
                    <div className="mt-2 text-center">
                      <p className="text-sm text-[#10244c]/80">Duración</p>
                      <p className="font-bold text-[#10244c]">
                        {bookingData.totalNights}{" "}
                        {bookingData.totalNights === 1 ? "noche" : "noches"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-[#10244c]/80 text-sm uppercase tracking-wider">
                    Check-out
                  </p>
                  {checkOutDate ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-[#10244c]">
                        {checkOutDate.day}
                      </p>
                      <div>
                        <p className="text-lg capitalize text-[#10244c]">
                          {checkOutDate.month} - {checkOutDate.year}
                        </p>
                        <p className="text-sm text-[#10244c]/80 capitalize">
                          {checkOutDate.weekday}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-[#10244c]">Por definir</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {bookingData.room?.type && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">
                Detalles de la Habitación
              </h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#10244c]/80">
                      Tipo de Habitación
                    </p>
                    <p className="text-lg font-medium text-[#10244c]">
                      {bookingData.room.type || ""}
                    </p>
                  </div>
                  {bookingData.totalNights && (
                    <div>
                      <p className="text-sm text-[#10244c]/80">Duración</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-[#10244c]/80" />
                        <p className="text-lg font-medium text-[#10244c]">
                          {bookingData.totalNights}{" "}
                          {bookingData.totalNights === 1 ? "noche" : "noches"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {bookingData.room.pricePerNight && (
                    <div>
                      <p className="text-sm text-[#10244c]/80">
                        Precio por Noche
                      </p>
                      <p className="text-lg font-medium text-[#10244c]">
                        $
                        {bookingData.room.pricePerNight.toLocaleString("es-MX")}{" "}
                        MXN
                      </p>
                    </div>
                  )}
                  {bookingData.room.totalPrice && (
                    <div>
                      <p className="text-sm text-[#10244c]/80">Precio Total</p>
                      <p className="text-xl font-semibold text-[#10244c]">
                        ${bookingData.room.totalPrice.toLocaleString("es-MX")}{" "}
                        MXN
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {bookingData.guests?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">
                Huéspedes
              </h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {bookingData.guests.map((guest, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#10244c]/10 flex items-center justify-center">
                      <span className="text-[#10244c] font-medium">
                        {guest.charAt(0)}
                      </span>
                    </div>
                    <span className="text-[#10244c]/90">{guest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {/* === NUEVA SECCIÓN: AUTO DE RENTA === */}
        {state.select && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">
                Renta de Auto
              </h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              {/* resumen del auto */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-[#10244c]/80">Vehículo</p>
                  <p className="text-lg font-semibold text-[#10244c]">
                    {state.select.carDetails?.make || "Vehículo"}{" "}
                    {state.select.carDetails?.model || ""}
                  </p>
                  {state.select.carDetails?.category && (
                    <p className="text-sm text-[#10244c]/70">
                      {state.select.carDetails.category}
                    </p>
                  )}
                  {state.select.carDetails?.passengers && (
                    <p className="text-sm text-[#10244c]/70 mt-1">
                      {state.select.carDetails.passengers} pasajeros
                    </p>
                  )}
                </div>

                {state.select.price?.total && (
                  <div className="text-right">
                    <p className="text-sm text-[#10244c]/80">Precio Total</p>
                    <p className="text-xl font-semibold text-[#10244c]">
                      {state.select.price.total}{" "}
                      {state.select.price.currency || ""}
                    </p>
                    {state.select.rentalPeriod?.days && (
                      <p className="text-xs text-[#10244c]/70 mt-1">
                        {state.select.rentalPeriod.days} días de renta
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* campos llenables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#10244c]">
                    Conductor principal
                  </label>
                  <input
                    type="text"
                    value={mainDriver}
                    onChange={(e) => setMainDriver(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10244c]"
                    placeholder="Nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#10244c]">
                    Edad del conductor principal
                  </label>
                  <input
                    type="number"
                    min={18}
                    value={mainDriverAge}
                    onChange={(e) =>
                      setMainDriverAge(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10244c]"
                    placeholder="Edad"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-[#10244c]">
                    Conductores adicionales
                  </label>
                  <textarea
                    value={additionalDrivers}
                    onChange={(e) => setAdditionalDrivers(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10244c]"
                    placeholder="Nombres de conductores adicionales (opcional)"
                    rows={2}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="full"
                  disabled={!isCarFormValid}
                  onClick={handleAddCarToCart}
                >
                  Guardar datos del auto (console.log por ahora)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div></div>
    </div>
  );
};
