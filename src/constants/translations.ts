export type Lang = "es" | "en";

const translations = {
  es: {
    // General
    downloadPdf: "Descargar PDF",
    confirmation: "Confirmación",
    notFound: "No se encontró información",
    notFoundDesc:
      "No pudimos encontrar una reservación con los datos proporcionados, por favor contacte con soporte.",

    // Hotel
    reservationDetails: "Detalles de la Reservación",
    guest: "Huésped",
    hotel: "Hotel",
    companions: "Acompañantes",
    noCompanions: "No hay acompañantes",
    breakfastLabel: "Desayuno",
    breakfastIncluded: "Desayuno incluido",
    noBreakfast: "No incluye desayuno",
    stayDates: "Fechas de Estancia",
    checkIn: "Check-in",
    checkOut: "Check-out",
    roomType: "Tipo de Habitación",
    comments: "Comentarios",
    noComments: "No hay comentarios",
    needChanges: "¿Necesitas hacer cambios en tu reserva?",
    helpWithChanges: "para ayudarte con cualquier modificación",
    contactSupport: "Contacta al soporte de MIA",

    // Room names
    single: "SENCILLO",
    double: "DOBLE",

    // Flight
    origin: "Origen",
    destination: "Destino",
    code: "Codigo",
    rate: "Tarifa",
    traveler: "Viajero",
    seat: "Asiento",
    personalItem: "Artículo personal",
    carryOn: "Equipaje de mano",
    checkedBag: "Equipaje documentado",
    notes: "Notas",

    // Car rental
    carRental: "Renta de Auto",
    provider: "Proveedor",
    vehicleType: "Tipo de Vehículo",
    transmission: "Transmisión",
    duration: "Duración",
    day: "día",
    days: "días",
    insurance: "Seguro",
    mainDriver: "Conductor Principal",
    pickup: "Recoger Auto",
    dropoff: "Entregar Auto",
    sameLocation: "Misma ubicación que recogida",
    coverage: "Cobertura y Seguros",
    additionalDriversLabel: "Conductores adicionales",
    noAdditionalDrivers: "No incluidos",
    additionalDrivers: "Conductores Adicionales",
    passport: "Pasaporte",
  },
  en: {
    // General
    downloadPdf: "Download PDF",
    confirmation: "Confirmation",
    notFound: "Information not found",
    notFoundDesc:
      "We could not find a reservation with the provided information, please contact support.",

    // Hotel
    reservationDetails: "Reservation Details",
    guest: "Guest",
    hotel: "Hotel",
    companions: "Companions",
    noCompanions: "No companions",
    breakfastLabel: "Breakfast",
    breakfastIncluded: "Breakfast included",
    noBreakfast: "Breakfast not included",
    stayDates: "Stay Dates",
    checkIn: "Check-in",
    checkOut: "Check-out",
    roomType: "Room Type",
    comments: "Comments",
    noComments: "No comments",
    needChanges: "Do you need to make changes to your reservation?",
    helpWithChanges: "to help you with any modification",
    contactSupport: "Contact MIA support",

    // Room names
    single: "SINGLE",
    double: "DOUBLE",

    // Flight
    origin: "Origin",
    destination: "Destination",
    code: "Code",
    rate: "Rate",
    traveler: "Traveler",
    seat: "Seat",
    personalItem: "Personal item",
    carryOn: "Carry-on luggage",
    checkedBag: "Checked baggage",
    notes: "Notes",

    // Car rental
    carRental: "Car Rental",
    provider: "Provider",
    vehicleType: "Vehicle Type",
    transmission: "Transmission",
    duration: "Duration",
    day: "day",
    days: "days",
    insurance: "Insurance",
    mainDriver: "Main Driver",
    pickup: "Pick Up",
    dropoff: "Drop Off",
    sameLocation: "Same location as pickup",
    coverage: "Coverage & Insurance",
    additionalDriversLabel: "Additional drivers",
    noAdditionalDrivers: "Not included",
    additionalDrivers: "Additional Drivers",
    passport: "Passport",
  },
} as const;

export type Translations = (typeof translations)["es"];

export const t = (lang: Lang): Translations => translations[lang];
