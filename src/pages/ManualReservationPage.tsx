import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import {
  ArrowLeft,
  Hotel,
  Calendar,
  Users,
  User,
  Coffee,
  CreditCard as PaymentIcon,
  BanknoteIcon,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { CallToBackend } from "../components/CallToBackend";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { useSolicitud } from "../hooks/useSolicitud";
import { createLogPayment, createNewPago } from "../hooks/useDatabase";
import {
  fetchPaymentMethods,
  fetchCreditAgent,
  fetchViajerosCompanies,
} from "../hooks/useFetch";
import { URL } from "../constants/apiConstant";
import type { BookingData, Employee, PaymentMethod } from "../types";
import { SupportModal } from "../components/SupportModal";

const { obtenerSolicitudes, crearSolicitud } = useSolicitud();
const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const AUTH = {
  "x-api-key": API_KEY,
};

const cardStyle = {
  style: {
    base: {
      color: "#32325d",
      fontSize: "18px",
      fontFamily: "Arial, sans-serif",
      "::placeholder": {
        color: "#aab7c4",
      },
      backgroundColor: "#f8f8f8",
      padding: "30px",
      borderRadius: "5px",
    },
    invalid: {
      color: "#fa755a",
    },
  },
  hidePostalCode: true, // Oculta el campo de código postal
  hideIcon: false, // Oculta el ícono de Stripe (opcional)
  disabled: false, // Si quieres deshabilitar la edición
  disableLink: true,
};

const stripePromise = loadStripe(
  "pk_test_51R1WOrQttaqZirA7uXoQzqBjIsogB3hbIMWzIimqVnmMR0ZdSGhtl9icQpUkqHhIrWDjvRj2vjV71FEHTcbZjMre005S8gHlDD"
);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return {
    weekday: date.toLocaleDateString("es-MX", { weekday: "long" }),
    day: date.getDate(),
    month: date.toLocaleDateString("es-MX", { month: "long" }),
    year: date.getFullYear(),
  };
};

interface Hotel {
  id_hotel: string;
  hotel: string;
  direccion?: string;
  latitud?: string;
  longitud?: string;
  estado: string;
  ciudad: string;
  menores_de_edad?: string;
  precio_persona_extra?: string;
  desayuno_incluido?: string;
  desayuno_comentarios?: string;
  transportacion?: string;
  URLImagenHotel?: string;
  URLImagenHotelQ?: string;
  URLImagenHotelQQ?: string;
  activo?: number;
  codigo_postal?: string;
  Colonia?: string;
  precio_sencillo?: number;
  precio_doble?: number;
  precio_triple?: number;
  precio_cuadruple?: number;
}

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

interface ManualReservationPageProps {
  onBack: () => void;
}

const DOMAIN = "http://localhost:5173";

const CheckOutForm = ({
  setCardPayment,
  paymentData,
  setSuccess,
  handleEndSubmit,
}: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!stripe || !elements) return;

      const { data } = await supabase.auth.getUser();
      const id_agente = data.user?.id;
      const cardElement = elements.getElement(CardElement);
      //crear metodo de pago
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });
      console.log("Se creo payment method");
      if (error) {
        setMessage(error.message);
      } else {
        const response = await fetch(`${URL}/v1/stripe/save-payment-method`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...AUTH,
          },
          body: JSON.stringify({
            paymentMethodId: paymentMethod.id,
            id_agente: id_agente,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setMessage(data.message || "Metodo de pago guardado");
          setSuccess(false);
          handleEndSubmit();
        } else {
          setMessage("Ocurrio un error");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col w-full px-4">
      <h2 className="font-semibold text-lg text-[#10244c] mb-5">
        Ingresa los detalles de tu tarjeta de credito
      </h2>
      <form onSubmit={handleSubmit}>
        <CardElement options={cardStyle} />
        <button
          type="submit"
          disabled={!stripe}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full mt-5"
        >
          <PaymentIcon className="w-4 h-4" />
          <span className="font-medium">Agregar tarjeta</span>
        </button>
        <button
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full mt-5"
          onClick={() => setSuccess(false)}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Volver</span>
        </button>
      </form>
      {message && (
        <div className="h-auto p-3 bg-red-300 border-4 mt-5 rounded-xl">
          <p className="text-base text-center">{message}</p>
        </div>
      )}
    </div>
  );
};

const getPaymentData = (hotel: Hotel, reservationData: ReservationData) => {
  const payment_metadata = {
    hotel_name: hotel.hotel,
    check_in: reservationData.checkIn,
    check_out: reservationData.checkOut,
    room_type: reservationData.roomType,
    guests: reservationData.guests,
  };

  const currentUrl = window.location.href;

  return {
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: hotel.hotel,
            description: `Reservación en ${hotel.hotel} - ${
              reservationData.roomType === "single"
                ? "Habitación Sencilla"
                : "Habitación Doble"
            }`,
            images: [
              hotel.URLImagenHotel ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            ],
          },
          unit_amount: Math.round(reservationData.totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${DOMAIN}?success=true&session={CHECKOUT_SESSION_ID}&metadata=${JSON.stringify(
      payment_metadata
    )}`,
    cancel_url: currentUrl,
  };
};

export const ManualReservationPage: React.FC<ManualReservationPageProps> = ({
  onBack,
}) => {
  const [hotel, setHotel] = useState<Hotel | null>(null);
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

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isBookingSaved, setIsBookingSaved] = useState(false);
  const [cardPayment, setCardPayment] = useState(false);
  const [creditoPayment, setCreditoPayment] = useState(false);
  const [successPayment, setSuccessPayment] = useState(false);
  const [successCreditPayment, setSuccessCreditPayment] = useState(false);
  //const [idServicio, setIdServicio] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [creditoValue, setCreditoValue] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    const data = await fetchPaymentMethods();
    console.log("Payment methods data:", data);
    setPaymentMethods(data);
  };

  const fetchCredit = async () => {
    const data = await fetchCreditAgent();
    console.log("Credito del agente", data);
    setCreditoValue(data);
  };

  useEffect(() => {
    if (cardPayment) {
      fetchData();
    }
  }, [cardPayment]);

  useEffect(() => {
    if (creditoPayment) {
      fetchCredit();
    }
  }, [creditoPayment]);

  useEffect(() => {
    const storedHotel = sessionStorage.getItem("selectedHotel");
    if (storedHotel) {
      const parsedHotel = JSON.parse(storedHotel);
      setHotel(parsedHotel);

      // Get current user's name
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.user_metadata?.full_name) {
          setReservationData((prev) => ({
            ...prev,
            mainGuest: reservationData.mainGuest,
          }));
        }
      });
    }
    const fetchViajero = async () => {
      const data = await fetchViajerosCompanies();
      setEmployees(data);
    };
    fetchViajero();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(price);
  };

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

    const pricePerNight =
      roomType === "single" ? hotel.precio_sencillo : hotel.precio_doble;

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

  const saveBookingToDatabase = async () => {
    if (!reservationData || isSaving || isBookingSaved) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Get the first image URL from additionalImages
      const imageUrl =
        hotel?.URLImagenHotel ||
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
      const numerosAleatorios = Math.floor(100000 + Math.random() * 900000); // Genera un número de 6 dígitos
      const responseSolicitud = await crearSolicitud(
        {
          confirmation_code: `RES-${numerosAleatorios}`,
          hotel_name: hotel?.hotel,
          dates: {
            checkIn: reservationData.checkIn,
            checkOut: reservationData.checkOut,
          },
          room: {
            type: reservationData.roomType,
            totalPrice: reservationData.totalPrice,
          },
          id_viajero: reservationData.mainGuest,
        },
        user.id
      );

      const idServicio = responseSolicitud.data.id_servicio;

      // Save booking to database
      // const { data: booking, error: bookingError } = await supabase
      //   .from("bookings")
      //   .insert({
      //     confirmation_code: `RES-${numerosAleatorios}`,
      //     user_id: user.id,
      //     hotel_name: hotel?.MARCA,
      //     check_in: reservationData.checkIn,
      //     check_out: reservationData.checkOut,
      //     room_type: reservationData.roomType,
      //     total_price: reservationData.totalPrice,
      //     status: "pending",
      //     image_url: imageUrl,
      //   })
      //   .select()
      //   .single();

      // if (bookingError) {
      //   console.error("Error saving booking:", bookingError);
      //   throw bookingError;
      // }

      console.log("guardado");
      setIsBookingSaved(true);

      return idServicio;
    } catch (error: any) {
      console.error("Error saving booking:", error);
      setSaveError(error.message || "Error al guardar la reservación");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMethod = (id: string) => {
    console.log("Delete payment method:", id);
  };

  const handleAddMethod = () => {
    setShowAddPaymentForm(true);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setSaveError(null);

    if (!selectedMethod) return;
    const method = paymentMethods.find((m) => m.id === selectedMethod);
    // Guardar la reservación en la base de datos y obtener el idServicio
    const idServicio = await saveBookingToDatabase();
    if (!idServicio) {
      throw new Error("No se pudo obtener el idServicio para el pago");
    }
    console.log("Processing payment with method:", method);
    const paymentData = getPaymentData(hotel, reservationData);
    try {
      const { data } = await supabase.auth.getUser();
      const id_agente = data.user?.id;
      const response = await fetch(`${URL}/v1/stripe/make-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AUTH,
        },
        body: JSON.stringify({
          paymentMethodId: method?.id,
          id_agente: id_agente,
          amount: paymentData.line_items[0].price_data.unit_amount,
          currency: paymentData.line_items[0].price_data.currency,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al procesar el pago en Stripe");
      }

      const responsePayment = await response.json();
      console.log(responsePayment);
      //Se guarda el log en la base
      const responseLogPayment = await createLogPayment(
        paymentData.line_items[0].price_data.unit_amount,
        id_agente,
        responsePayment
      );
      if (!responseLogPayment.success) {
        throw new Error("No se pudo hacer log del pago");
      }

      //Se guarda el pago en la base
      const responseNewPago = await createNewPago(
        idServicio, // Reemplaza con el ID del servicio correspondiente
        paymentData.line_items[0].price_data.unit_amount,
        id_agente,
        method?.card.brand,
        method?.card.last4,
        method?.card?.funding || "xddd",
        "tarjeta",
        "Reservacion en " + hotel?.hotel,
        responsePayment.paymentIntent.client_secret,
        responsePayment.paymentIntent.currency
      );
      if (!responseNewPago.success) {
        throw new Error("No se pudo guardar el pago en la base de datos");
      }

      setSuccessPayment(true);
    } catch (error) {
      console.log(error);
      setSaveError("Hubo un error al procesar el pago");
    }
    setIsProcessing(false);
  };

  const handlePaymentCredito = async () => {
    setSaveError(null);
    try {
      // Guardar la reservación en la base de datos y obtener el idServicio
      const idServicio = await saveBookingToDatabase();
      if (!idServicio) {
        throw new Error("No se pudo obtener el idServicio para el pago");
      }

      const { data } = await supabase.auth.getUser();
      const id_agente = data.user?.id;

      const response = await fetch(`${URL}/v1/mia/pagos/credito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AUTH,
        },
        body: JSON.stringify({
          id_servicio: idServicio,
          monto_a_credito: reservationData.totalPrice,
          responsable_pago_agente: id_agente,
          fecha_creacion: new Date().toISOString().split("T")[0],
          pago_por_credito: reservationData.totalPrice,
          pendiente_por_cobrar: reservationData.totalPrice,
          total: reservationData.totalPrice,
          subtotal: reservationData.totalPrice * 0.84,
          impuestos: reservationData.totalPrice * 0.16,
          concepto: "Reservacion en " + hotel?.hotel,
          // Campos adicionales según la tabla
          currency: "mxn",
          tipo_de_pago: "credito",
          // Para actualizar el crédito del agente
          credito_restante:
            creditoValue[0]?.monto_credito_agente - reservationData.totalPrice,
        }),
      });

      console.log(response);
      if (!response.ok) {
        throw new Error("Error al procesar el pago por credito");
      }
      setSuccessCreditPayment(true);
    } catch (error) {
      console.log(error);
      setSaveError("Hubo un error al procesar el pago");
    }
  };

  const checkInDate = formatDate(reservationData.checkIn);
  const checkOutDate = formatDate(reservationData.checkOut);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontró información del hotel
          </h2>
          <button
            onClick={onBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
        </div>

        {/* Hotel Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-64">
            <img
              src={
                hotel.URLImagenHotel ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              }
              alt={hotel.hotel}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{hotel.hotel}</h1>
              <p className="text-white/90">
                {hotel.ciudad}, {hotel.estado}
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
                    {/* <div>
                      <p className="font-medium text-gray-900">Tipo de Negociación</p>
                      <p className="text-gray-600">{hotel["TIPO DE NEGOCIACION"]}</p>
                    </div> */}
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Menores de Edad
                      </p>
                      <p className="text-gray-600">{hotel.menores_de_edad}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Coffee className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Desayuno</p>
                      <p className="text-gray-600">
                        {hotel.desayuno_incluido === "SI"
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
                        {formatPrice(hotel.precio_sencillo)}
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
                        {formatPrice(hotel.precio_doble)}
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
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Calendar className="w-6 h-6 text-blue-600 mr-2" />
            Detalles de la Reservación
          </h2>

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
                      onChange={(e) =>
                        handleDateChange("checkIn", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
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
                      onChange={(e) =>
                        handleDateChange("checkOut", e.target.value)
                      }
                      min={
                        reservationData.checkIn ||
                        new Date().toISOString().split("T")[0]
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
                      max={reservationData.roomType === "single" ? 2 : 4}
                      value={reservationData.guests}
                      onChange={(e) =>
                        setReservationData((prev) => ({
                          ...prev,
                          guests: parseInt(e.target.value),
                        }))
                      }
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Capacidad máxima:{" "}
                    {reservationData.roomType === "single" ? "2" : "4"} personas
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
                      <input
                        pattern="^[^<>]*$"
                        type="text"
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
                        placeholder={`Nombre del huésped ${index + 2}`}
                        className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Reservation Summary */}
          {reservationData.totalNights > 0 &&
            reservationData.mainGuest != "" &&
            (cardPayment ? (
              <>
                {successPayment ? (
                  <>
                    <div className="w-full h-32 bg-green-300 rounded-xl border-4 border-green-500 justify-center items-center flex flex-col gap-y-2">
                      <p className="text-xl text-green-800 font-bold">
                        ¡Se realizo el pago correctamente!
                      </p>
                      <CheckCircle className="w-10 h-10 text-green-800" />
                    </div>

                    <a
                      href="/"
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        selectedMethod
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Continuar con MIA
                    </a>
                  </>
                ) : showAddPaymentForm ? (
                  <Elements stripe={stripePromise}>
                    <CheckOutForm
                      setCardPayment={setCardPayment}
                      paymentData={getPaymentData(hotel, reservationData)}
                      setSuccess={setShowAddPaymentForm}
                      onCancel={() => setShowAddPaymentForm(false)}
                      handleEndSubmit={fetchData}
                    />
                  </Elements>
                ) : (
                  <div className="w-full bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      Metodos de pago
                    </h3>

                    {paymentMethods.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <CreditCard
                          className="mx-auto text-gray-400 mb-3"
                          size={32}
                        />
                        <p className="text-gray-500">
                          No se han guardado metodos de pago
                        </p>
                        <ul className="space-y-3 mb-6">
                          <li
                            onClick={handleAddMethod}
                            className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300"
                          >
                            <div className="flex items-center gap-3">
                              <Plus className="text-gray-600" size={20} />
                              <p className="font-medium text-gray-800">
                                Agregar nuevo metodo de pago
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <>
                        <ul className="space-y-3 mb-6">
                          {paymentMethods.length > 0 &&
                            paymentMethods.map((method) => (
                              <li
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                                  selectedMethod === method.id
                                    ? "bg-blue-50 border-2 border-blue-500"
                                    : "bg-gray-50 hover:bg-gray-100"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <CreditCard
                                    className={
                                      selectedMethod === method.id
                                        ? "text-blue-600"
                                        : "text-gray-600"
                                    }
                                    size={20}
                                  />
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {method.card.brand.toUpperCase()} ••••{" "}
                                      {method.card.last4}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Vence {method.card.exp_month}/
                                      {method.card.exp_year}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedMethod === method.id && (
                                    <CheckCircle2
                                      className="text-blue-600"
                                      size={20}
                                    />
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMethod(method.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                    aria-label="Delete payment method"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </li>
                            ))}

                          <li
                            onClick={handleAddMethod}
                            className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300"
                          >
                            <div className="flex items-center gap-3">
                              <Plus className="text-gray-600" size={20} />
                              <p className="font-medium text-gray-800">
                                Agregar nuevo metodo de pago
                              </p>
                            </div>
                          </li>
                        </ul>
                        <button
                          onClick={handlePayment}
                          disabled={!selectedMethod}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            selectedMethod
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Pagar
                        </button>
                      </>
                    )}
                    <button
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full mt-5"
                      onClick={() => setCardPayment(false)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="font-medium">Cambiar forma de pago</span>
                    </button>
                  </div>
                  // <Elements stripe={stripePromise}>
                  //   <CheckOutForm
                  //     setCardPayment={setCardPayment}
                  //     paymentData={getPaymentData(bookingData)}
                  //     setSuccess={setSuccessPayment}
                  //     idServicio={idServicio}
                  //   />
                  // </Elements>
                )}
              </>
            ) : creditoPayment ? (
              <>
                {successCreditPayment ? (
                  <>
                    <div className="w-full h-32 bg-green-300 rounded-xl border-4 border-green-500 justify-center items-center flex flex-col gap-y-2">
                      <p className="text-xl text-green-800 font-bold">
                        ¡Se realizo el pago correctamente!
                      </p>
                      <CheckCircle className="w-10 h-10 text-green-800" />
                    </div>

                    <button
                      onClick={() => window.location.reload()}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700`}
                    >
                      Continuar con MIA
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      Pago con credito
                    </h3>
                    {creditoValue[0]?.monto_credito_agente -
                      reservationData.totalPrice >
                      0 && creditoValue[0]?.tiene_credito_consolidado == 1 ? (
                      <div className="space-y-4">
                        <p className="text-xl font-medium text-gray-700">
                          Crédito Disponible:
                          <span className="text-2xl font-bold text-gray-900 ml-2">
                            ${creditoValue[0]?.monto_credito_agente}
                          </span>
                        </p>

                        <p className="text-xl font-medium text-gray-700">
                          Monto a Pagar:
                          <span className="text-2xl font-bold text-gray-900 ml-2">
                            ${reservationData.totalPrice}
                          </span>
                        </p>

                        <p className="text-xl font-medium text-gray-700">
                          Crédito Restante:
                          <span className="text-2xl font-bold text-gray-900 ml-2">
                            $
                            {creditoValue[0]?.monto_credito_agente -
                              reservationData.totalPrice}
                          </span>
                        </p>
                        <button
                          onClick={handlePaymentCredito}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
                          bg-green-600 text-white hover:bg-green-700
                            `}
                        >
                          Pagar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xl font-medium text-gray-700">
                          No cuentas con crédito suficiente para pagar esta
                          reservación
                        </p>
                      </div>
                    )}

                    <button
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full mt-5"
                      onClick={() => setCreditoPayment(false)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="font-medium">Cambiar forma de pago</span>
                    </button>
                  </div>
                  // <Elements stripe={stripePromise}>
                  //   <CheckOutForm
                  //     setCardPayment={setCardPayment}
                  //     paymentData={getPaymentData(bookingData)}
                  //     setSuccess={setSuccessPayment}
                  //     idServicio={idServicio}
                  //   />
                  // </Elements>
                )}
              </>
            ) : (
              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Resumen de la Reservación
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Total de Noches:</span>
                    <span>{reservationData.totalNights}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Precio por Noche:</span>
                    <span>{formatPrice(reservationData.pricePerNight)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold text-lg pt-3 border-t border-gray-200">
                    <span>Precio Total:</span>
                    <span>{formatPrice(reservationData.totalPrice)}</span>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <button
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    onClick={() => setCardPayment(true)}
                  >
                    <PaymentIcon className="w-4 h-4" />
                    <span className="font-medium">Pagar por Stripe</span>
                  </button>

                  <button
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    onClick={() => setCreditoPayment(true)}
                  >
                    <BanknoteIcon className="w-4 h-4" />
                    <span className="font-medium">Pagar por Crédito</span>
                  </button>
                </div>
              </div>
            ))}
          {saveError && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {saveError}
            </div>
          )}
        </div>
      </div>
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};
