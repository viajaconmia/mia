import React, { useState, useEffect } from "react";
import type { BookingData, PaymentMethod } from "../types";
import {
  Calendar,
  Users,
  CreditCard,
  Building2,
  ArrowRight,
  Check,
  Clock,
  CreditCard as PaymentIcon,
  BanknoteIcon,
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { useSolicitud } from "../hooks/useSolicitud";
import { createLogPayment, createNewPago } from "../hooks/useDatabase";
import { fetchPaymentMethods, fetchCreditAgent } from "../hooks/useFetch";
import { URL } from "../constants/apiConstant";
import { Reservation } from "../types/chat";
import { Hotel } from "../types/hotel";
import { fetchHotelById } from "../services/database";

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

const { crearSolicitudChat } = useSolicitud();
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
const DOMAIN = "http://localhost:5173";
const getPaymentData = (bookingData: BookingData) => {
  const payment_metadata = {
    confirmation_code: bookingData.confirmationCode,
  };

  const imageToUse =
    bookingData.hotel.additionalImages?.[0] ||
    bookingData.hotel.image ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";

  const currentUrl = window.location.href;

  return {
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: bookingData.hotel.name,
            description: `Reservación en ${bookingData.hotel.name} - ${
              bookingData.room?.type === "single"
                ? "Habitación Sencilla"
                : "Habitación Doble"
            }`,
            images: [imageToUse],
          },
          unit_amount: Math.round((bookingData.room?.totalPrice || 0) * 100),
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

interface ReservationPanelProps {
  booking?: Reservation | null;
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

const CheckOutForm = ({
  setCardPayment,
  paymentData,
  setSuccess,
  idServicio,
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

// const renderPaymentMethod = () => {
//   const stripe = useStripe();
//   const elements = useElements();
//   return (
//     <Elements stripe={stripePromise}>
//       <CheckoutForm />
//     </Elements>
//   )
// }

export const ReservationPanel: React.FC<ReservationPanelProps> = ({
  booking,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isBookingSaved, setIsBookingSaved] = useState(false);
  const [cardPayment, setCardPayment] = useState(false);
  const [creditoPayment, setCreditoPayment] = useState(false);
  const [successPayment, setSuccessPayment] = useState(false);
  const [successCreditPayment, setSuccessCreditPayment] = useState(false);
  const [idServicio, setIdServicio] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [creditoValue, setCreditoValue] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataHotel, setDataHotel] = useState<Hotel | null>(null);

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
      const totalNights = Math.ceil(
        (new Date(currentBooking.check_out).getTime() -
          new Date(currentBooking.check_in).getTime()) /
          (1000 * 3600 * 24)
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
    if (currentBookingData.room.pricePerNight <= 0) {
      setError(
        "Las reservaciones con un precio menor o igual a $0 seran canceladas, puedes cambiar eso pidiendo un cambio de hotel"
      );
    } else {
      setError(null);
    }
  }, [booking, dataHotel]);

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
    // Auto-save booking when confirmation code is generated
    if (bookingData?.confirmationCode && !isBookingSaved) {
      saveBookingToDatabase();
    }
  }, [bookingData?.confirmationCode]);

  // const handleDownloadPDF = () => {
  //   const element = document.getElementById("reservation-content");
  //   if (!element) return;

  //   const opt = {
  //     margin: 1,
  //     filename: `reservacion-${
  //       bookingData?.confirmationCode || "borrador"
  //     }.pdf`,
  //     image: { type: "jpeg", quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  //   };

  //   html2pdf().set(opt).from(element).save();
  // };

  const saveBookingToDatabase = async () => {
    if (!bookingData || isSaving || isBookingSaved) return;

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
        bookingData.hotel.additionalImages?.[0] ||
        bookingData.hotel.image ||
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
      console.log(bookingData);
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
        user.id
      );

      setIdServicio(responseSolicitud.data.id_servicio);

      // Save booking to database
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          confirmation_code: bookingData.confirmationCode,
          user_id: user.id,
          hotel_name: bookingData.hotel.name,
          check_in: bookingData.dates.checkIn,
          check_out: bookingData.dates.checkOut,
          room_type: bookingData.room?.type,
          total_price: bookingData.room?.totalPrice,
          status: "pending",
          image_url: imageUrl,
        })
        .select()
        .single();

      if (bookingError) {
        console.error("Error saving booking:", bookingError);
        throw bookingError;
      }

      console.log("guardado");
      setIsBookingSaved(true);
    } catch (error: any) {
      console.error("Error saving booking:", error);
      setSaveError(error.message || "Error al guardar la reservación");
    } finally {
      setIsSaving(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="h-full bg-white p-6 rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center text-[#10244c93]">
          <p className="text-3xl mb-2">Aún no hay detalles de la reservación</p>
          <p className="text-sm opacity-80 flex justify-center">
            <span>
              <svg
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 493 539"
                className="w-[300px] h-[300px] -rotate-12 transform text-sky-950"
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
        </div>
      </div>
    );
  }

  const hasAnyData =
    bookingData.hotel?.name ||
    bookingData.dates?.checkIn ||
    bookingData.room?.type ||
    bookingData.confirmationCode;

  if (!hasAnyData) {
    return (
      <div className="h-full bg-white p-6 rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center text-[#10244c93]">
          <p className="text-3xl mb-2">Aún no hay detalles de la reservación</p>
          <p className="text-sm opacity-80 flex justify-center">
            <span>
              <svg
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 493 539"
                className="w-[300px] h-[300px] -rotate-12 transform text-sky-950"
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
        </div>
      </div>
    );
  }

  // const handleDeleteMethod = (id: string) => {
  //   console.log("Delete payment method:", id);
  // };

  const handleAddMethod = () => {
    setShowAddPaymentForm(true);
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setSaveError(null);

      if (!selectedMethod) return;
      const method = paymentMethods.find((m) => m.id === selectedMethod);
      console.log("Processing payment with method:", method);
      const paymentData = getPaymentData(bookingData);
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
        const responsePayment = await response.json();
        console.log(responsePayment);
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
        "Reservacion en " + bookingData.hotel?.name,
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
          monto_a_credito: bookingData.room?.totalPrice,
          responsable_pago_agente: id_agente,
          fecha_creacion: new Date().toISOString().split("T")[0],
          pago_por_credito: bookingData.room?.totalPrice,
          pendiente_por_cobrar: bookingData.room?.totalPrice,
          total: bookingData.room?.totalPrice,
          subtotal: bookingData.room?.totalPrice * 0.84,
          impuestos: bookingData.room?.totalPrice * 0.16,
          concepto: "Reservacion en " + bookingData.hotel?.name,
          currency: "mxn",
          tipo_de_pago: "credito",
          credito_restante:
            creditoValue[0]?.monto_credito_agente -
            bookingData.room?.totalPrice,
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

  const checkInDate = formatDate(bookingData.dates?.checkIn);
  const checkOutDate = formatDate(bookingData.dates?.checkOut);

  return (
    <div className="h-full bg-white p-6 rounded-lg shadow-lg space-y-10 overflow-y-auto">
      {bookingData.confirmationCode && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden shadow-lg mb-10">
          <div className="p-6">
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Check className="w-6 h-6 text-green-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-[#10244c]">
                      ¡Reservación En Proceso!
                    </h2>
                    <p className="text-[#10244c]/80">
                      Código: {bookingData.confirmationCode}
                    </p>
                  </div>
                </div>
              </div>

              {cardPayment ? (
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
                        paymentData={getPaymentData(bookingData)}
                        setSuccess={setShowAddPaymentForm}
                        idServicio={idServicio}
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
                                    {/* <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMethod(method.id);
                                      }}
                                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                      aria-label="Delete payment method"
                                    >
                                      <Trash2 size={18} />
                                    </button> */}
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
                        <span className="font-medium">
                          Cambiar forma de pago
                        </span>
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
                        bookingData.room?.totalPrice >
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
                              ${bookingData.room?.totalPrice}
                            </span>
                          </p>

                          <p className="text-xl font-medium text-gray-700">
                            Crédito Restante:
                            <span className="text-2xl font-bold text-gray-900 ml-2">
                              $
                              {creditoValue[0]?.monto_credito_agente -
                                bookingData.room?.totalPrice}
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
                        <span className="font-medium">
                          Cambiar forma de pago
                        </span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {/* <CallToBackend
                    paymentData={getPaymentData(bookingData)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    bookingData={bookingData}
                  >
                    <BanknoteIcon className="w-4 h-4" />
                    <span className="font-medium">Pagar por Crédito</span>
                  </CallToBackend> */}
                  {/* <button
                    onClick={handleDownloadPDF}
                    className="flex items-center  justify-center space-x-2 px-4 py-3 bg-[#10244c] text-white rounded-xl hover:bg-[#10244c]/90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4" />
                    <span className="font-medium">Descargar</span>
                  </button> */}
                </div>
              )}

              {/* {saveError && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                  {saveError}
                </div>
              )} */}
            </div>
          </div>
        </div>
      )}

      <div id="reservation-content" className="space-y-8">
        {error && (
          <>
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              <p className="font-medium">Ocurrió un error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </>
        )}
        {bookingData.hotel?.name && (
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
                          {checkInDate.month}
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
                          {checkOutDate.month}
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
      </div>
      <div></div>
    </div>
  );
};
