import { FC } from "react";
import {
  MapPin,
  Star,
  Coffee,
  Baby, // Tu cambio a Baby se mantiene
  Bed,
  Users,
  CreditCard,
  PawPrint,
  Briefcase,
} from "lucide-react";
import { NavigationLink } from "./atom/NavigationLink";
import ROUTES from "../constants/routes";

// --- INTERFAZ DE DATOS PARA EL HOTEL ---
interface Hotel {
  id_hotel: string;
  nombre: string;
  id_cadena: number;
  correo: string;
  telefono: string;
  rfc: string;
  razon_social: string;
  direccion: string;
  latitud: string;
  longitud: string;
  convenio: string;
  descripcion: string;
  calificacion: number | null;
  tipo_hospedaje: string;
  cuenta_de_deposito: string;
  Estado: string;
  Ciudad_Zona: string;
  NoktosQ: number | null;
  NoktosQQ: number | null;
  MenoresEdad: string;
  PaxExtraPersona: string;
  DesayunoIncluido: string;
  DesayunoComentarios: string;
  DesayunoPrecioPorPersona: string;
  tiene_transportacion: string;
  Transportacion: string;
  TransportacionComentarios: string;
  acepta_mascotas: string;
  mascotas: string;
  salones: string;
  URLImagenHotel: string;
  URLImagenHotelQ: string;
  URLImagenHotelQQ: string;
  Activo: number;
  Comentarios: string;
  Id_Sepomex: number | null;
  CodigoPostal: string;
  Id_hotel_excel: number;
  Colonia: string;
  tipo_negociacion: string;
  vigencia_convenio: string; // ISO date string
  hay_convenio: string;
  comentario_vigencia: string;
  tipo_pago: string;
  disponibilidad_precio: string;
  contacto_convenio: string;
  contacto_recepcion: string;
  iva: string;
  ish: string;
  otros_impuestos: string;
  otros_impuestos_porcentaje: string;
  comentario_pago: string;
  precio_sencilla: string;
  costo_sencilla: string;
  desayuno_sencilla: number;
  precio_doble: string;
  costo_doble: string;
  precio_persona_extra: string;
  desayuno_doble: number;
  pais: string;
  score_operaciones: number | null;
}

// --- Componente de Ayuda para las Estrellas ---
type StarRatingProps = {
  rating: number | null | undefined;
};

const StarRating: FC<StarRatingProps> = ({ rating }) => {
  const totalStars = 5;
  if (rating === null || rating === undefined || isNaN(rating)) {
    return null;
  }
  const filledStars = Math.round(rating);

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          className={`w-5 h-5 ${
            index < filledStars
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600 font-medium">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// --- Función de Ayuda para Formatear Precios ---
const formatPrice = (price: string | number | null | undefined): string => {
  const number = typeof price === "string" ? parseFloat(price) : price;
  if (number === null || number === undefined || isNaN(number)) {
    return "No disponible";
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(number);
};

// --- PROPS DEL COMPONENTE PRINCIPAL ---
type HotelCardProps = {
  hotel: Hotel;
  onReserve: (hotel: Hotel) => void;
};

// --- Componente Principal de la Tarjeta del Hotel ---
const HotelCard: FC<HotelCardProps> = ({ hotel, onReserve }) => {
  // Lógica para el desayuno, para usarla fácilmente abajo
  const isBreakfastIncluded = Boolean(hotel.desayuno_sencilla);

  return (
    <div
      key={hotel.id_hotel}
      className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 flex flex-col"
    >
      {/* Sección de la Imagen */}
      <div className="relative h-52">
        <img
          src={
            hotel.URLImagenHotel ||
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1170"
          }
          alt={`Imagen del hotel ${hotel.nombre}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Sección de Información */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <h3
            className="text-xl font-bold text-gray-800 truncate"
            title={hotel.nombre}
          >
            {hotel.nombre}
          </h3>
          <StarRating rating={hotel.calificacion} />
        </div>

        <div className="flex items-center text-gray-500 mb-4 text-sm">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {hotel.Ciudad_Zona.toUpperCase()}, {hotel.Estado.toUpperCase()}
          </span>
        </div>

        {/* --- SECCIÓN DE AMENIDADES CON LA LÓGICA CORREGIDA --- */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5 text-sm">
          {/* Lógica de Desayuno Integrada */}
          <div className="flex items-center text-gray-700">
            <Coffee
              className={`w-4 h-4 mr-2 ${
                isBreakfastIncluded ? "text-sky-600" : "text-gray-300"
              }`}
            />
            <span>
              {isBreakfastIncluded ? "Desayuno incluido" : "Sin desayuno"}
            </span>
          </div>

          {/* Tus otras amenidades se mantienen igual */}
          {hotel.MenoresEdad && (
            <div className="flex items-center text-gray-700">
              <Baby className="w-4 h-4 mr-2 text-blue-500" />
              <span>{hotel.MenoresEdad}</span>
            </div>
          )}
          {/* {hotel.acepta_mascotas === "SI" && (
            <div
              className="flex items-center text-gray-700"
              title={hotel.mascotas ?? undefined}
            >
              <PawPrint className="w-4 h-4 mr-2 text-blue-500" />
              <span>Acepta mascotas</span>
            </div>
          )} */}
          {/* {hotel.salones && hotel.salones !== "NO" && (
            <div
              className="flex items-center text-gray-700"
              title={hotel.salones ?? undefined}
            >
              <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
              <span>Tiene salones</span>
            </div>
          )} */}
        </div>

        <hr className="my-3" />

        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600 text-sm">
              <Bed className="w-4 h-4 mr-2" />
              <span>Hab. Sencilla</span>
            </div>
            <span className="font-bold text-gray-800 text-lg">
              {formatPrice(hotel.precio_sencilla)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-2" />
              <span>Hab. Doble</span>
            </div>
            <span className="font-bold text-gray-800 text-lg">
              {formatPrice(hotel.precio_doble)}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <NavigationLink
            href={ROUTES.HOTELS.ID_CREATE(hotel.id_hotel)}
            variant="primary"
            size="full"
            // className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span>Reservar Ahora</span>
          </NavigationLink>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
