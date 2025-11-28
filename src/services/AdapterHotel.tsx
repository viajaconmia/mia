import { HotelOption } from "../context/ChatContext";

export interface Room {
  id_tipo_cuarto: number;
  cuarto: string;
  id_tarifa: number;
  precio: string;
}

export interface Hotel {
  id_hotel: string;
  hotel: string;
  direccion: string;
  estado: string;
  ciudad: string;
  codigo_postal: string;
  colonia: string;
  menores_de_edad: string;
  precio_persona_extra: string;
  desayuno_incluido: string;
  desayuno_comentarios: string;
  currency: string;
  transportacion: string;
  imagenes: string[];
  tipos_cuartos: Room[];
}

export interface Amenity {
  icon: string;
  label: string;
}

// Función helper para extraer código postal de la dirección
function extractPostalCode(address: string): string {
  const postalCodeMatch = address.match(/\b\d{5}\b/);
  return postalCodeMatch ? postalCodeMatch[0] : "";
}

// Función helper para extraer colonia de la dirección
function extractColonia(address: string): string {
  const parts = address.split(",");
  if (parts.length >= 2) {
    const coloniaPart = parts[1].trim();
    return coloniaPart.split(/\d/)[0].trim();
  }
  return "";
}

// Función helper para extraer estado de la dirección
function extractEstado(address: string): string {
  const estadoMatch = address.match(/([A-Z]\.?[A-Z]\.?),?\s*México/);
  return estadoMatch ? estadoMatch[1] : "";
}

export function adaptHotelData(inputData: HotelOption[]): Hotel[] {
  return inputData.map((item, index) => {
    const address = item?.hotelDetails?.location?.address;

    // Crear el room basado en los detalles de la habitación
    const room: Room = {
      id_tipo_cuarto: index + 1,
      cuarto: item?.roomDetails?.roomType || "",
      id_tarifa: index + 1,
      precio: item?.price?.totalPerStay || "",
    };

    const hotel: Hotel = {
      id_hotel: item.id || "",
      hotel: item?.hotelDetails?.name || "",
      direccion: address || "",
      estado: extractEstado(address || ""),
      ciudad: item?.hotelDetails?.location?.city || "",
      codigo_postal: extractPostalCode(address || ""),
      colonia: extractColonia(address || ""),
      menores_de_edad: "permitido", // No viene en los datos de entrada, valor por defecto
      precio_persona_extra: "0", // No viene en los datos de entrada, valor por defecto
      desayuno_incluido:
        item?.roomDetails?.breakfastIncluded === "true" ? "si" : "no",
      desayuno_comentarios:
        item?.roomDetails?.breakfastIncluded === "true"
          ? "Desayuno incluido en la tarifa"
          : "Desayuno no incluido",
      transportacion: "no disponible", // No viene en los datos de entrada, valor por defecto
      currency: item.price?.currency || "",
      imagenes: (
        (Array.isArray(item.hotelDetails?.media?.imagen)
          ? item.hotelDetails.media.imagen
          : [item.hotelDetails?.media?.imagen]) || []
      ).filter((x): x is string => typeof x === "string"), // No vienen imágenes en los datos de entrada
      tipos_cuartos: [room],
    };

    return hotel;
  });
}

// Función bonus para parsear las amenidades a tu interface Amenity
export function parseAmenities(amenitiesString: string): Amenity[] {
  const amenityMap: { [key: string]: string } = {
    piscina: "🏊",
    pool: "🏊",
    "wi-fi": "📶",
    wifi: "📶",
    parking: "🅿️",
    estacionamiento: "🅿️",
    gimnasio: "💪",
    gym: "💪",
    restaurante: "🍽️",
    restaurant: "🍽️",
    bar: "🍹",
    sauna: "🧖",
    tobogán: "🎢",
    "centro de negocios": "💼",
    "servicio a la habitación": "🛎️",
  };

  const amenities = amenitiesString
    .toLowerCase()
    .split(",")
    .map((a) => a.trim());

  return amenities.map((amenity) => {
    const icon = Object.keys(amenityMap).find((key) => amenity.includes(key));
    return {
      icon: icon ? amenityMap[icon] : "✓",
      label: amenity.charAt(0).toUpperCase() + amenity.slice(1),
    };
  });
}
