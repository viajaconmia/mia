"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { Hotel } from "../services/AdapterHotel";
import { Viajero } from "../services/ViajerosService";
import { calcularNoches } from "../lib/calculates";

export type HotelResponse = {
  type?: string;
  options?: {
    option?: HotelOption[];
  };
};

export type HotelDB = {
  type: "db_hotel";
  seleccionados: { id: string | string[] };
};

export type HotelOption = {
  id?: string;
  url?: string;
  hotelDetails?: {
    name?: string;
    location?: {
      city?: string;
      address?: string;
      proximityToLandmark?: string;
    };
    media: { imagen: string | string[] };
    starRating?: string;
    guestRating?: string;
    amenities?: string;
  };
  roomDetails?: {
    roomType?: string;
    maxGuests?: string;
    beds?: string;
    breakfastIncluded?: string; // "true"/"false"
  };
  stayPeriod?: {
    checkInDate?: string;
    checkOutDate?: string;
    nights?: string;
  };
  price?: {
    currency?: string;
    totalPerStay?: string;
    taxAndFeesIncluded?: string;
  };
};

interface CarDetails {
  make?: string;
  model?: string;
  category?: string;
  transmission?: string;
  passengers?: string;
}

interface Location {
  city?: string;
  address?: string;
  dateTime?: string;
}

interface RentalPeriod {
  pickupLocation?: Location;
  returnLocation?: Location;
  days?: string;
}

interface Provider {
  name?: string;
  rating?: string;
}

interface Price {
  currency?: string;
  total?: string;
  includedFeatures?: string;
}

export interface CarRentalOption {
  id: string;
  url?: string;
  carDetails?: CarDetails;
  rentalPeriod?: RentalPeriod;
  provider?: Provider;
  price?: Price;
}

interface CarRentalOptions {
  type: "car_rental";
  options: {
    option: CarRentalOption | CarRentalOption[];
  };
}

interface HotelOptions {
  type: "hotel";
  options: {
    option: HotelOption | HotelOption[];
  };
}

export type FlightOptions = {
  type: "flight";
  options: {
    option: FlightOption[] | FlightOption;
  };
};

export type Segment = {
  origin: AirportInfo;
  destination: AirportInfo;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
};

export type FlightOption = {
  option: any;
  id: string;
  url: string;
  itineraryType?: string;
  segments: {
    segment: Segment[] | Segment;
  };
  seat?: {
    isDesiredSeat: string;
    requestedSeatLocation: string; // "null"
    assignedSeatLocation: string; // "null"
  };
  baggage?: {
    hasCheckedBaggage: string; // "true" | "false"
    pieces: string;
  };
  price?: {
    currency: string;
    total: string;
  };
};

export type AirportInfo = {
  airportCode: string;
  city: string;
  airportName: string;
};

type FunctionCall = {
  status: "success" | "loading" | "error" | "queue";
  tarea: string;
  assistant: string;
  args: any;
  id: string;
  resolucion?: string;
};

export type MessageChat = {
  role: "user" | "assistant";
  text: string;
  componente:
    | FlightOptions
    | CarRentalOptions
    | HotelOptions
    | undefined
    | HotelDB;
};

export type ItemStack = {
  role: "assistant";
  functionCall: FunctionCall;
};

export type ItemHistory = MessageChat | ItemStack;

export type DataReservation =
  | {
      type: "carro";
      item: CarRentalOption;
      extra?: {
        principal?: Viajero;
        conductoresExtras?: (Viajero | null)[];
        edad?: number;
      };
    }
  | {
      type: "vuelo";
      item: FlightOption;
      extra?: {
        viajero?: Viajero;
      };
    }
  | {
      type: "hotel";
      item: Hotel;
      extra?: {
        viajero?: Viajero;
        acompanantes?: Viajero[];
        check_in?: string;
        check_out?: string;
        precio?: string;
        currency?: string;
        room?: string;
      };
    }
  | null;

interface ChatState {
  stack: ItemStack[];
  isLoading: boolean;
  thread: string | null;
  history: ItemHistory[];
  messages: MessageChat[];
  booking: { nombre: string } | null;
  input: string;
  // 👇 ahora puede guardar coche O vuelo
  select: DataReservation;
}

type ChatAction =
  | { type: "SET_STACK"; payload: ItemStack[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SET_THREAD"; payload: string }
  | { type: "SET_MESSAGES"; payload: MessageChat[] }
  | { type: "SET_HISTORY"; payload: ItemHistory[] }
  | {
      type: "SET_SELECT";
      payload: DataReservation;
    }
  | {
      type: "UPDATE_SELECT";
      payload: DataReservation;
    }
  | { type: "SET_BOOKING"; payload: { nombre: string } }
  | {
      type: "SET_PRECIO_BY_FECHAS";
      payload: { check_in?: string; check_out?: string; room?: string };
    };

const initialChatState: ChatState = {
  isLoading: false,
  history: [],
  stack: [],
  thread: null,
  booking: null,
  messages: [],
  input: "",
  select: null,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_STACK":
      return { ...state, stack: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_INPUT":
      return { ...state, input: action.payload };
    case "SET_THREAD":
      return { ...state, thread: action.payload };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "SET_SELECT":
      return { ...state, select: action.payload };
    case "SET_PRECIO_BY_FECHAS":
      if (state.select == null) return state;
      if (state.select.type != "hotel") return state;
      let check_in = action.payload.check_in ?? state.select.extra?.check_in;
      let check_out = action.payload.check_out ?? state.select.extra?.check_out;
      let room = action.payload.room ?? state.select.extra?.room;
      let [cuarto] = state.select.item.tipos_cuartos.filter(
        (r) => r.cuarto.toUpperCase() == room?.toUpperCase()
      );
      let precio = state.select.extra?.precio;
      if (check_in && room && check_out) {
        precio = (
          Number(cuarto.precio) *
          calcularNoches(
            new Date(check_in).toISOString(),
            new Date(check_out).toISOString()
          )
        ).toFixed(2);
      }
      return {
        ...state,
        select: {
          ...state.select,
          extra: { ...state.select.extra, check_in, check_out, room, precio },
        },
      };
    case "SET_BOOKING":
      return { ...state, booking: action.payload };
    case "UPDATE_SELECT":
      return { ...state, select: action.payload };
    default:
      return state;
  }
};

type ChatContextType = {
  state: ChatState;
  dispatcher: React.Dispatch<ChatAction>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatcher] = useReducer(chatReducer, initialChatState);

  return (
    <ChatContext.Provider value={{ dispatcher, state }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
