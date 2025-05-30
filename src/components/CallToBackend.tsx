import React from "react";
import { useSolicitud } from "../hooks/useSolicitud";
//import { URL } from "../constants/apiConstant";

interface CallToBackendProps {
  children: React.ReactNode;
  paymentData: any;
  className?: string;
  bookingData?: any;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
let d = 2;

export const CallToBackend: React.FC<CallToBackendProps> = ({
  children,
  paymentData,
  className,
  onClick,
  bookingData,
}) => {
  const urlParams = new URLSearchParams(window.location.search);
  const session = urlParams.get("session");

  // if (!session) {
  //   obtenerSessionCheckout(
  //     "cs_live_a10ETlnCEAsKIlJNvhJTRtlQJoAwy8V6zWSAYER15SOesH0dE67tTYGHg6"
  //   );
  // }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    crearSessionCheckout(paymentData, bookingData);
  };

  return (
    <button onClick={handleSubmit} className={className} type="button">
      {children}
    </button>
  );
};

/* LLAMADAS A LA API*/

// const URL = "https://mianoktos.vercel.app";

const ROUTES = {
  stripe: "/v1/stripe",
  solicitud: "/v1/solicitud",
};
const ENDPOINTS = {
  create: "/create-checkout-session",
  retrieve: "/get-checkout-session",
  createSolicitud: "/create",
};
const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const AUTH = {
  "x-api-key": API_KEY,
};

const obtenerSessionCheckout = async (ID_CHECKOUT_SESSION: string) => {
  const response = await fetch(
    `${URL}${ROUTES.stripe}${ENDPOINTS.retrieve}?id_checkout=${ID_CHECKOUT_SESSION}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...AUTH,
      },
    }
  );
  const json = await response.json();
  console.log(json);
};

const crearSessionCheckout = async (payment_data: any, bookingData: any) => {
  // const response = await fetch(`${URL}${ROUTES.stripe}${ENDPOINTS.create}`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     ...AUTH,
  //   },
  //   body: JSON.stringify({ payment_data }),
  // });
  console.log(bookingData);
  // const json = await response.json();
  try {
    const response = await fetch(`${URL}/v1/solicitud/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AUTH,
      },
      body: JSON.stringify({
        confirmation_code: bookingData.confirmationCode,
        id_viajero: 1,
        hotel_name: bookingData.hotel.name,
        check_in: bookingData.dates.checkIn,
        check_out: bookingData.dates.checkOut,
        room_type: bookingData.room?.type,
        total_price: bookingData.room?.totalPrice,
        status: "pending",
      }),
    });
    const json = await response.json();
    console.log("termino");
    console.log(json);
  } catch (error) {
    console.log(error);
  }
  //console.log(payment_data);
  console.log(201);
  return 201;
  console.log(payment_data);
  // // const json = await response.json();
  // try{
  //   const response = await fetch(`https://mianoktos.vercel.app /v1/solicitud/create`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type":  "application/json",
  //       ...AUTH,
  //     },
  //     body: JSON.stringify({
  //       "confirmation_code": bookingData.confirmationCode,
  //       "id_viajero": 1,
  //       "hotel_name":bookingData.hotel.name,
  //       "check_in": bookingData.dates.checkIn,
  //       "check_out": bookingData.dates.checkOut,
  //       "room_type": bookingData.room?.type,
  //       "total_price": bookingData.room?.totalPrice,
  //       "status": "pending",
  //     }),
  //   })
  //   const json = await response.json();
  //   console.log("termino");
  //   console.log(json);
  // }catch(error){
  //   console.log(error);
  // }
  // //console.log(payment_data);
  // console.log(201);
  // return(201);
  // window.location = json.url;
};
