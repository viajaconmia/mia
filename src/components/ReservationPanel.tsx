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
  Plane,
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
import {
  CarRentalOption,
  FlightOption,
} from "../context/ChatContext";
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
  selectedCar?: CarRentalOption | null; // sigue existiendo como prop opcional
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return {
    weekday: date.toLocaleDateString("es-MX", { weekday: "long" }),
    day: date.getDate(),
    month: date.toLocaleDateString("es-MX", { month: "long" }),
    year: date.getFullYear(),
  };
};

// 👇 viajeros de ejemplo (por ahora sin back)
interface Viajero {
  id: string;
  nombre: string;
  edad?: number;
}

const EXAMPLE_TRAVELERS: Viajero[] = [
  { id: "1", nombre: "Juan Pérez", edad: 32 },
  { id: "2", nombre: "María López", edad: 28 },
];

// ==== TYPE GUARDS para distinguir Auto vs Vuelo ====

const isCarRentalOption = (option: any): option is CarRentalOption => {
  return option && typeof option === "object" && "carDetails" in option;
};

const isFlightOption = (option: any): option is FlightOption => {
  return option && typeof option === "object" && "segments" in option;
};

export const ReservationPanel: React.FC<ReservationPanelProps> = ({
  booking,
  selectedCar: selectedCarProp,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [idSolicitud, setIdSolicitud] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBookingSaved, setIsBookingSaved] = useState(false);
  const [dataHotel, setDataHotel] = useState<Hotel | null>(null);

  // estados para auto / vuelo (viajero principal y adicionales)
  const [mainDriver, setMainDriver] = useState<string>("");
  const [mainDriverAge, setMainDriverAge] = useState<number | "">("");
  const [additionalDrivers, setAdditionalDrivers] = useState<string[]>([]);

  const { state } = useChat();
  const { user } = useAuth();
  const { handleActualizarCarrito } = useCart();
  const { crearSolicitudChat } = useSolicitud();

  const notificationContext = useNotification();
  const showNotification = notificationContext?.showNotification;

  // Selección global desde el contexto (puede ser auto o vuelo)
  const selectedFromContext = state.select;

  // Normalizamos: primero lo que venga del contexto; si no es auto, usamos el prop como fallback
  const selectedCar = isCarRentalOption(selectedFromContext)
    ? selectedFromContext
    : isCarRentalOption(selectedCarProp)
    ? selectedCarProp
    : null;

  const selectedFlight = isFlightOption(selectedFromContext)
    ? selectedFromContext
    : null;

  // LOGs para debug
  useEffect(() => {
    console.log("selectedCar (efectivo) en ReservationPanel:", selectedCar);
  }, [selectedCar]);

  useEffect(() => {
    console.log("selectedFlight (efectivo) en ReservationPanel:", selectedFlight);
  }, [selectedFlight]);

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
              parseFloat(room.precio) * (currentBookingData.totalNights || 0),
          },
        };
      }
    }

    if (currentBooking?.viajero || currentBooking?.id_viajero) {
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

  const saveBookingToDatabase = async () => {
    if (!bookingData || isSaving || isBookingSaved) return;

    try {
      setIsSaving(true);

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const imageUrl =
        bookingData.hotel.additionalImages?.[0] ||
        bookingData.hotel.image ||
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";

      console.log("Saving booking data:", bookingData, "image:", imageUrl);

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

  if (!bookingData && !selectedCar && !selectedFlight) {
    return null;
  }

  const hasAnyData =
    bookingData?.hotel?.name ||
    bookingData?.dates?.checkIn ||
    bookingData?.room?.type ||
    bookingData?.confirmationCode ||
    selectedCar ||
    selectedFlight;

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
      showNotification?.("success", message || "Agregado al carrito");
    } catch (error: any) {
      console.error(
        error.response || error.message || "Error al agregar al carrito"
      );
      showNotification?.("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // payload de ejemplo para auto
  const handleAddCarToCart = () => {
    if (!selectedCar) return;

    const payload = {
      id_solicitud: idSolicitud,
      tipo: "auto",
      auto: {
        proveedor: selectedCar.provider?.name || "",
        url_detalle: selectedCar.url || "",
        vehiculo: {
          marca: selectedCar.carDetails?.make || "",
          modelo: selectedCar.carDetails?.model || "",
          categoria: selectedCar.carDetails?.category || "",
          pasajeros: selectedCar.carDetails?.passengers || null,
        },
        renta: {
          fecha_inicio:
            selectedCar.rentalPeriod?.pickupLocation?.dateTime || null,
          fecha_fin:
            selectedCar.rentalPeriod?.returnLocation?.dateTime || null,
          dias: selectedCar.rentalPeriod?.days || null,
        },
        precio: {
          total: selectedCar.price?.total || null,
          moneda: selectedCar.price?.currency || null,
        },
      },
      viajero_principal: {
        nombre: mainDriver,
        edad: mainDriverAge === "" ? null : Number(mainDriverAge),
      },
      viajeros_adicionales: additionalDrivers,
    };

    console.log("Payload para auto listo para enviar:", payload);
  };

  // payload de ejemplo para vuelo
  const handleAddFlightToCart = () => {
    if (!selectedFlight) return;

    const segmentsArray = Array.isArray(selectedFlight.segments.segment)
      ? selectedFlight.segments.segment
      : [selectedFlight.segments.segment];

    const firstSeg = segmentsArray[0];
    const lastSeg = segmentsArray[segmentsArray.length - 1];

    const payload = {
      id_solicitud: idSolicitud,
      tipo: "vuelo",
      vuelo: {
        url_detalle: selectedFlight.url,
        origen: {
          aeropuerto: firstSeg.origin.airportName,
          codigo: firstSeg.origin.airportCode,
          ciudad: firstSeg.origin.city,
          salida: firstSeg.departureTime,
        },
        destino: {
          aeropuerto: lastSeg.destination.airportName,
          codigo: lastSeg.destination.airportCode,
          ciudad: lastSeg.destination.city,
          llegada: lastSeg.arrivalTime,
        },
        aerolinea: firstSeg.airline,
        numero_vuelo: firstSeg.flightNumber,
        precio: {
          total: selectedFlight.price?.total || null,
          moneda: selectedFlight.price?.currency || null,
        },
        equipaje: {
          incluye: selectedFlight.baggage?.hasCheckedBaggage === "true",
          piezas: selectedFlight.baggage?.pieces || null,
        },
      },
      pasajero_principal: {
        nombre: mainDriver,
        edad: mainDriverAge === "" ? null : Number(mainDriverAge),
      },    };

    console.log("Payload para vuelo listo para enviar:", payload);
  };

  const isTravelerFormValid =
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
          Agregar hotel al carrito
        </Button>
      )}

      <div id="reservation-content" className="space-y-8">
        {/* HOTEL */}
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
                  alt={bookingData.hotel.name || ""}
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
                          alt={`${bookingData.hotel.name} - Vista ${
                            index + 1
                          }`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                </div>
              )}
          </div>
        )}

        {/* FECHAS */}
        {(bookingData?.dates?.checkIn || bookingData?.dates?.checkOut) && (
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

                {bookingData?.totalNights && (
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

        {/* HABITACIÓN */}
        {bookingData?.room?.type && (
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
                        $
                        {bookingData.room.totalPrice.toLocaleString("es-MX")}{" "}
                        MXN
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HUÉSPEDES */}
        {bookingData?.guests?.length > 0 && (
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

        {/* === AUTO DE RENTA === */}
        {selectedCar && (
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
                    {selectedCar.carDetails?.make || "Vehículo"}{" "}
                    {selectedCar.carDetails?.model || ""}
                  </p>
                  {selectedCar.carDetails?.category && (
                    <p className="text-sm text-[#10244c]/70">
                      {selectedCar.carDetails.category}
                    </p>
                  )}
                  {selectedCar.carDetails?.passengers && (
                    <p className="text-sm text-[#10244c]/70 mt-1">
                      {selectedCar.carDetails.passengers} pasajeros
                    </p>
                  )}
                </div>

                {selectedCar.price?.total && (
                  <div className="text-right">
                    <p className="text-sm text-[#10244c]/80">Precio Total</p>
                    <p className="text-xl font-semibold text-[#10244c]">
                      {selectedCar.price.total}{" "}
                      {selectedCar.price.currency || ""}
                    </p>
                    {selectedCar.rentalPeriod?.days && (
                      <p className="text-xs text-[#10244c]/70 mt-1">
                        {selectedCar.rentalPeriod.days} días de renta
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* campos viajero para auto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Conductor principal */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#10244c]">
                    Conductor principal / Viajero
                  </label>
                  <select
                    value={mainDriver}
                    onChange={(e) => setMainDriver(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10244c]"
                  >
                    <option value="">Selecciona un viajero</option>
                    {EXAMPLE_TRAVELERS.map((v) => (
                      <option key={v.id} value={v.nombre}>
                        {v.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Edad del conductor */}
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

                {/* Conductores adicionales */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-[#10244c]">
                    Conductores adicionales / Viajeros adicionales
                  </label>
                  <select
                    multiple
                    value={additionalDrivers}
                    onChange={(e) => {
                      const values = Array.from(
                        e.target.selectedOptions
                      ).map((opt) => opt.value);
                      setAdditionalDrivers(values);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10244c] min-h-[60px]"
                  >
                    {EXAMPLE_TRAVELERS.map((v) => (
                      <option key={v.id} value={v.nombre}>
                        {v.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#10244c]/60">
                    Mantén presionada la tecla Ctrl (o Cmd en Mac) para
                    seleccionar varios.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="full"
                  disabled={!isTravelerFormValid}
                  onClick={handleAddCarToCart}
                >
                  Guardar datos del auto (console.log payload)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* === VUELO === */}
        {selectedFlight && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Plane className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">
                Vuelo seleccionado
              </h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              {/* resumen del vuelo */}
              {(() => {
                const segmentsArray = Array.isArray(
                  selectedFlight.segments.segment
                )
                  ? selectedFlight.segments.segment
                  : [selectedFlight.segments.segment];

                const firstSeg = segmentsArray[0];
                const lastSeg = segmentsArray[segmentsArray.length - 1];

                const formatShortDate = (dateStr: string) =>
                  new Date(dateStr).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "short",
                  });

                const formatTime = (dateStr: string) =>
                  new Date(dateStr).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                return (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-sm text-[#10244c]/80">
                          Itinerario
                        </p>
                        <p className="text-lg font-semibold text-[#10244c]">
                          {firstSeg.origin.city} ({firstSeg.origin.airportCode}){" "}
                          → {lastSeg.destination.city} (
                          {lastSeg.destination.airportCode})
                        </p>
                        <p className="text-sm text-[#10244c]/70 mt-1">
                          {formatShortDate(firstSeg.departureTime)}{" "}
                          {formatTime(firstSeg.departureTime)} ·{" "}
                          {selectedFlight.itineraryType
                            ?.replace("_", " ")
                            .toUpperCase() || "TRIP"}
                        </p>
                        <p className="text-xs text-[#10244c]/60 mt-1">
                          {segmentsArray.length}{" "}
                          {segmentsArray.length === 1
                            ? "segmento"
                            : "segmentos"}{" "}
                          · {firstSeg.airline} {firstSeg.flightNumber}
                        </p>
                      </div>

                      {selectedFlight.price?.total && (
                        <div className="text-right">
                          <p className="text-sm text-[#10244c]/80">
                            Precio Total
                          </p>
                          <p className="text-xl font-semibold text-[#10244c]">
                            {selectedFlight.price.total}{" "}
                            {selectedFlight.price.currency}
                          </p>
                          {selectedFlight.baggage && (
                            <p className="text-xs text-[#10244c]/70 mt-1">
                              {selectedFlight.baggage.hasCheckedBaggage ===
                              "true"
                                ? `Incluye ${selectedFlight.baggage.pieces} maleta(s) documentada(s)`
                                : "Sin equipaje documentado"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* campos viajero para vuelo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pasajero principal */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#10244c]">
                    Pasajero principal
                  </label>
                  <select
                    value={mainDriver}
                    onChange={(e) => setMainDriver(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#10244c]"
                  >
                    <option value="">Selecciona un viajero</option>
                    {EXAMPLE_TRAVELERS.map((v) => (
                      <option key={v.id} value={v.nombre}>
                        {v.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Edad del pasajero principal */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#10244c]">
                    Edad del pasajero principal
                  </label>
                  <input
                    type="number"
                    min={0}
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

              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="full"
                  disabled={!isTravelerFormValid}
                  onClick={handleAddFlightToCart}
                >
                  Guardar datos del vuelo (console.log payload)
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
