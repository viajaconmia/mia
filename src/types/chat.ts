interface MessageContent {
  component_type: "message";
  content: string;
}

interface CardHotel {
  component_type: "hotel";
  id_hoteles: string[];
}

export type CardFlight = {
  component_type: "flight";
  payload: FlightMessagePayload;
};



export interface UserMessage {
  component_type: "user";
  content: string;
}

export interface ErrorMessage {
  component_type: "error";
  content: string;
}

export type ChatContent =
  | MessageContent
  | CardFlight
  | CardHotel
  | UserMessage
  | ErrorMessage;

export type ChatContentResponse = (MessageContent | CardHotel)[];

export interface Reservation {
  check_in?: string | null;
  check_out?: string | null;
  id_hotel?: string | null;
  viajero?: string | null;
  room?: "single" | "double" | null;
}

export interface ChatResponse {
  content: ChatContentResponse;
  reservasEnProceso: Reservation[];
}

export interface FetchChatResponse {
  ok: boolean;
  response: {
    thread_id: string;
    value: {
      content: (MessageContent | CardHotel)[];
      reservasEnProceso: Reservation[];
    };
  };
}

export interface FetchFormatResponse {
  thread?: string;
  response?: ChatContentResponse;
  reserva?: Reservation[] | undefined;
  error?: string;
}

// Tipo de viaje
export type ItineraryType = "one_way" | "round_trip";

// Posición / tipo de asiento
export type SeatLocation =
  | "aisle"        // pasillo
  | "window"       // ventana
  | "middle"       // en medio
  | "exit_row"     // salida de emergencia
  | "premium"      // preferente
  | "vip";         // VIP

// Un tramo de vuelo (MEX → MTY, por ejemplo)
export type FlightSegment = {
  origin: {
    airportCode: string;     // "MEX"
    city: string;            // "Ciudad de México"
    airportName?: string;    // "AICM T2"
  };
  destination: {
    airportCode: string;     // "MTY"
    city: string;            // "Monterrey"
    airportName?: string;
  };
  departureTime: string;     // ISO: "2025-12-10T08:30:00-06:00"
  arrivalTime: string;       // ISO
  airline?: string;          // "Aeroméxico"
  flightNumber?: string;     // "AM1234"
};

// Info de asiento
export type SeatInfo = {
  isDesiredSeat: boolean;          // ¿Es el asiento que pidió el usuario?
  requestedSeatLocation?: SeatLocation; // Lo que pidió
  assignedSeatLocation: SeatLocation;   // Lo que realmente tiene
};

// Info de equipaje
export type BaggageInfo = {
  hasCheckedBaggage: boolean;  // ¿Maleta documentada?
  pieces?: number;             // ¿Cuántas?
};

// Una opción de vuelo completa
export type FlightOption = {
  id: string;                 // ID de esta opción
  itineraryType: ItineraryType; // one_way | round_trip
  segments: FlightSegment[];  // 1 = sencillo, 2 (ida/vuelta) = redondo
  seat: SeatInfo;
  baggage: BaggageInfo;
  price?: {
    currency: string;         // "MXN"
    total: number;            // 3250.99
  };
};

// Payload del mensaje de vuelos
export type FlightMessagePayload = {
  type: "flight_options";
  searchId?: string;
  options: FlightOption[];
};