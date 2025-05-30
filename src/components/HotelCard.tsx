import React, { useEffect, useState } from "react";
import { Wifi, Dog, School as Pool, MapPin, Coffee } from "lucide-react";
import { Hotel, Amenity } from "../types/hotel";
import { ImageSlider } from "./ImageSlider";
import { ImageModal } from "./ImageModal";
import { fetchHotelById } from "../services/database";

interface HotelCardProps {
  id_hotel: string;
}

const defaultAmenities: Amenity[] = [
  { icon: "wifi", label: "Wi-Fi Gratis" },
  { icon: "pet", label: "Pet Friendly" },
  { icon: "pool", label: "Alberca" },
];

const getAmenityIcon = (icon: string) => {
  switch (icon) {
    case "wifi":
      return <Wifi size={16} />;
    case "pet":
      return <Dog size={16} />;
    case "pool":
      return <Pool size={16} />;
    default:
      return null;
  }
};

export const HotelCard: React.FC<HotelCardProps> = ({ id_hotel }) => {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    try {
      fetchHotelById(id_hotel, (hotel_response) => {
        console.log(hotel_response);
        setHotel(hotel_response);
      });
    } catch (error) {}
  }, [id_hotel]);

  if (!hotel) {
    return <h1 className="text-center text-gray-600">Cargando hotel...</h1>;
  }

  const precioDesde = hotel.tipos_cuartos.length
    ? Math.min(...hotel.tipos_cuartos.map((r) => parseFloat(r.precio)))
    : null;

  return (
    <>
      <div className="overflow-hidden min-w-sm  mb-2 rounded-xl bg-white shadow-lg transform transition-all duration-300 opacity-0 animate-fade-in-left">
        <ImageSlider
          images={hotel.imagenes}
          onImageClick={() => setShowModal(true)}
        />

        <div className="p-4">
          {/* Nombre del hotel */}
          <h2 className="mb-1 text-base font-bold text-gray-800">
            {hotel.hotel}
          </h2>

          {/* Ciudad y Estado */}
          <div className="mb-1 flex items-center gap-1 text-xs text-gray-700 font-medium">
            <MapPin size={14} />
            <span>
              {hotel.ciudad}, {hotel.estado}
            </span>
          </div>

          {/* Dirección (opcional) */}
          <p className="mb-2 text-xs text-gray-500 line-clamp-1">
            {hotel.direccion}
          </p>

          {/* Amenidades fijas
          <div className="mb-3 flex flex-wrap gap-3">
            {defaultAmenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-1 text-xs text-gray-600"
              >
                {getAmenityIcon(amenity.icon)}
                <span>{amenity.label}</span>
              </div>
            ))}
          </div> */}

          {/* Desayuno incluido */}
          {hotel.desayuno_incluido === "SI" && (
            <div className="mb-2 flex items-center gap-2 text-sm text-green-700">
              <Coffee size={14} />
              <span>Desayuno incluido ({hotel.desayuno_comentarios})</span>
            </div>
          )}

          {/* Cuartos y precios */}
          <div className="space-y-1.5">
            {hotel.tipos_cuartos.map((room) => (
              <div
                key={room.id_tipo_cuarto}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-2 text-sm"
              >
                <span className="font-medium text-gray-700">{room.cuarto}</span>
                <span className="font-semibold text-gray-900">
                  <span className="font-medium text-gray-700 text-xs">
                    precio por noche:{" "}
                  </span>
                  ${parseFloat(room.precio).toLocaleString("es-MX")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de imágenes */}
      {showModal && (
        <ImageModal
          images={hotel.imagenes}
          initialIndex={0}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
