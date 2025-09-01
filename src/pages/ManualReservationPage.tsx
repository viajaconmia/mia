import { useState, useEffect } from "react";
import {
  Calendar,
  Coffee,
  Hotel,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import { useParams } from "wouter";
import { useSolicitud } from "../hooks/useSolicitud";
import { fetchViajerosCompanies } from "../hooks/useFetch";
import type { Employee } from "../types";
import { UserSingleton } from "../services/UserSingleton";
import { currentDate } from "../utils/helpers";
import { SupportModal } from "../components/SupportModal";
import { HotelWithTarifas } from "../types/index";
import { HotelService } from "../services/HotelService";
import Button from "../components/atom/Button";
import { formatNumberWithCommas } from "../utils/format";
import { CartService } from "../services/CartService";
import { useNotification } from "../hooks/useNotification";
import { useCart } from "../context/cartContext";

const { crearSolicitud } = useSolicitud();

interface ReservationData {
  checkIn: string;
  checkOut: string;
  roomType: "single" | "double";
  guests: number;
  mainGuest: string;
  additionalGuests: string[];
  totalNights: number;
  pricePerNight: number;
  totalPrice: number;
}

export const ManualReservationPage = () => {
  const { id } = useParams();
  const [loadingHotel, setLoadingHotel] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();
  const { handleActualizarCarrito } = useCart();
  const [hotel, setHotel] = useState<HotelWithTarifas | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationData>({
    checkIn: "",
    checkOut: "",
    roomType: "single",
    guests: 1,
    mainGuest: "",
    additionalGuests: [],
    totalNights: 0,
    pricePerNight: 0,
    totalPrice: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [error, setError] = useState("");

  const user = UserSingleton.getInstance().getUser();

  useEffect(() => {
    setLoadingHotel(true);
    HotelService.getInstance()
      .getHotelById(id)
      .then(({ data }) => setHotel(data))
      .catch((error) =>
        console.error(error.response || error.message || "error")
      )
      .finally(() => {
        setLoadingHotel(false);
      });

    const fetchViajero = async () => {
      const data = await fetchViajerosCompanies();
      setEmployees(data);
    };
    fetchViajero();
  }, []);

  const calculateTotalPrice = (
    checkIn: string,
    checkOut: string,
    roomType: "single" | "double"
  ) => {
    if (!checkIn || !checkOut || !hotel)
      return { nights: 0, pricePerNight: 0, total: 0 };

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const pricePerNightRaw =
      roomType === "single" ? hotel.precio_sencilla : hotel.precio_doble;
    const pricePerNight = Number(pricePerNightRaw) || 0;

    return {
      nights,
      pricePerNight,
      total: nights * pricePerNight,
    };
  };

  const handleDateChange = (field: "checkIn" | "checkOut", value: string) => {
    setReservationData((prev) => {
      const newData = { ...prev, [field]: value };
      const { nights, pricePerNight, total } = calculateTotalPrice(
        newData.checkIn,
        newData.checkOut,
        newData.roomType
      );
      return {
        ...newData,
        totalNights: nights,
        pricePerNight,
        totalPrice: total,
      };
    });
  };

  const handleAddCart = async () => {
    setLoading(true);
    const solicitud = {
      hotel_name: hotel?.nombre,
      dates: {
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
      },
      room: {
        type: reservationData.roomType,
        totalPrice: reservationData.totalPrice,
      },
      id_viajero: reservationData.mainGuest,
      viajeros_adicionales: reservationData.additionalGuests,
    };
    let id_solicitud_current;
    let total = reservationData.totalPrice.toFixed(2);
    let type: "hotel" = "hotel";
    try {
      const { data } = await crearSolicitud(solicitud, user?.info?.id_agente);
      const { id_solicitud } = data;
      id_solicitud_current = id_solicitud;
    } catch (error) {
      console.log(error);
    }
    try {
      if (!id_solicitud_current) throw new Error("Solicitud no creada");

      const { message } = await CartService.getInstance().createCartItem({
        id_solicitud: id_solicitud_current,
        total,
        type,
        selected: true,
      });
      showNotification("success", message || "Agregado al carrito");
      handleActualizarCarrito();
    } catch (error: any) {
      console.error(
        error.response || error.message || "Error al agregar al carrito"
      );
      showNotification("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingHotel) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Cargando datos del hotel
            </h2>
          </div>
        </div>
      </>
    );
  }
  if (!hotel) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontró información del hotel
            </h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hotel Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-64">
            <img
              src={
                hotel.URLImagenHotel ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              }
              alt={hotel.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{hotel.nombre}</h1>
              <p className="text-white/90">
                {hotel.Ciudad_Zona}, {hotel.Estado}
              </p>
            </div>
          </div>
        </div>

        {/* Hotel Details and Pricing */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Hotel Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Información del Hotel
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Hotel className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Hotel</p>
                      <p className="text-gray-600">{hotel.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Menores de Edad
                      </p>
                      <p className="text-gray-600">{hotel.MenoresEdad}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Coffee className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Desayuno</p>
                      <p className="text-gray-600">
                        {Boolean(hotel.desayuno_sencilla)
                          ? "Incluido"
                          : "No incluido"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Pricing */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Tarifas por Noche
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          Habitación Sencilla
                        </span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {formatNumberWithCommas(Number(hotel.precio_sencilla))}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Capacidad máxima: 1 personas
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-gray-900">
                          Habitación Doble
                        </span>
                      </div>
                      <span className="text-lg font-bold text-indigo-600">
                        {formatNumberWithCommas(Number(hotel.precio_doble))}
                      </span>
                    </div>
                    <p className="text-sm text-indigo-600">
                      Capacidad máxima: 2 personas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Calendar className="w-6 h-6 text-blue-600 mr-2" />
            Detalles de la Reservación
          </h2>

          {error && (
            <div
              className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
              role="alert"
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dates Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Fechas de Estancia
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Llegada
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      pattern="^[^<>]*$"
                      type="date"
                      value={reservationData.checkIn}
                      onChange={(e) => {
                        if (
                          e.target.value <
                            new Date(currentDate())
                              .toISOString()
                              .split("T")[0] &&
                          Number(e.target.value.split("-")[0]) > 999
                        ) {
                          setError(
                            "No se pueden poner fechas menores al dia de hoy"
                          );
                        } else {
                          setError("");
                          handleDateChange("checkIn", e.target.value);
                        }
                      }}
                      min={new Date(currentDate()).toISOString().split("T")[0]}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Salida
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      pattern="^[^<>]*$"
                      type="date"
                      value={reservationData.checkOut}
                      onChange={(e) => {
                        if (
                          e.target.value <
                            new Date(currentDate())
                              .toISOString()
                              .split("T")[0] &&
                          Number(e.target.value.split("-")[0]) > 999
                        ) {
                          setError(
                            "No se pueden poner fechas menores al dia de hoy"
                          );
                        } else {
                          setError("");
                          handleDateChange("checkOut", e.target.value);
                        }
                      }}
                      min={
                        reservationData.checkIn ||
                        new Date(currentDate()).toISOString().split("T")[0]
                      }
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Room and Guests Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Habitación y Huéspedes
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Habitación
                  </label>
                  <div className="relative">
                    <Hotel className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={reservationData.roomType}
                      onChange={(e) => {
                        const newRoomType = e.target.value as
                          | "single"
                          | "double";
                        setReservationData((prev) => {
                          const { nights, pricePerNight, total } =
                            calculateTotalPrice(
                              prev.checkIn,
                              prev.checkOut,
                              newRoomType
                            );
                          return {
                            ...prev,
                            roomType: newRoomType,
                            guests: 1,
                            totalNights: nights,
                            pricePerNight,
                            totalPrice: total,
                          };
                        });
                      }}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="single">
                        Habitación Sencilla (máx. 1 personas)
                      </option>
                      <option value="double">
                        Habitación Doble (máx. 2 personas)
                      </option>
                    </select>
                  </div>
                  <p className="text-sm my-2 text-gray-600">
                    ¿Necesitas espacio para mas personas? <br />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Personas
                  </label>
                  <div className="relative">
                    <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      pattern="^[^<>]*$"
                      type="number"
                      min="1"
                      max="2"
                      value={reservationData.guests}
                      onChange={(e) => {
                        if (
                          parseInt(e.target.value) < 1 ||
                          parseInt(e.target.value) > 2
                        ) {
                          return setError(
                            "El número de personas debe ser entre 1 y 2"
                          );
                        }

                        setReservationData((prev) => ({
                          ...prev,
                          guests: parseInt(e.target.value),
                        }));
                      }}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Capacidad máxima: 2 personas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Información de Huéspedes
            </h3>

            {/* Main Guest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Huésped Principal
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={reservationData.mainGuest}
                  onChange={(e) =>
                    setReservationData((prev) => ({
                      ...prev,
                      mainGuest: e.target.value,
                    }))
                  }
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">Selecciona un huésped</option>
                  {employees.map((empleado) => (
                    <option
                      key={empleado.id_viajero}
                      value={empleado.id_viajero}
                    >
                      {empleado.primer_nombre} {empleado.segundo_nombre}{" "}
                      {empleado.apellido_paterno} {empleado.apellido_materno}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Guests */}
            {reservationData.guests > 1 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Huéspedes Adicionales
                </label>
                {Array.from({ length: reservationData.guests - 1 }).map(
                  (_, index) => (
                    <div key={index} className="relative">
                      <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select
                        value={reservationData.additionalGuests[index] || ""}
                        onChange={(e) => {
                          const newGuests = [
                            ...reservationData.additionalGuests,
                          ];
                          newGuests[index] = e.target.value;
                          setReservationData((prev) => ({
                            ...prev,
                            additionalGuests: newGuests,
                          }));
                        }}
                        className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Selecciona un huésped</option>
                        {employees
                          .filter(
                            (empleado) =>
                              empleado.id_viajero !== reservationData.mainGuest
                          )
                          .map((empleado) => (
                            <option
                              key={empleado.id_viajero}
                              value={empleado.id_viajero}
                            >
                              {empleado.primer_nombre} {empleado.segundo_nombre}{" "}
                              {empleado.apellido_paterno}{" "}
                              {empleado.apellido_materno}
                            </option>
                          ))}
                      </select>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          <Button
            size="full"
            icon={ShoppingCart}
            onClick={handleAddCart}
            disabled={
              Object.values(reservationData)
                .map((item) =>
                  Array.isArray(item) ? item.length <= 0 : !!item
                )
                .some((value) => value === false) || loading
            }
          >
            Agregar a carrito
          </Button>
        </div>
      </div>
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};
