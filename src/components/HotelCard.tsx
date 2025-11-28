import React, { useEffect, useState } from "react";
import { MapPin, Coffee } from "lucide-react";
import { Hotel } from "../types/hotel";
import { ImageSlider } from "./ImageSlider";
import { ImageModal } from "./ImageModal";
import { fetchHotelById } from "../services/database";

interface HotelCardProps {
  id_hotel?: string;
  data_hotel?: Hotel;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  id_hotel,
  data_hotel,
}) => {
  const [hotel, setHotel] = useState<Hotel | null>(
    data_hotel ? data_hotel : null
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    try {
      if (!data_hotel && id_hotel) {
        fetchHotelById(id_hotel, (hotel_response) => {
          setHotel(hotel_response);
        });
      }
    } catch (error) {}
  }, [id_hotel]);

  if (!hotel) {
    return <h1 className="text-center text-gray-600">Cargando hotel...</h1>;
  }

  return (
    <>
      <div className="overflow-hidden min-w-sm  mb-2 rounded-xl bg-white shadow-lg transform transition-all duration-300 opacity-0 animate-fade-in-left">
        {hotel.imagenes.filter((i) => !!i).length > 0 && (
          <>
            <ImageSlider
              images={hotel.imagenes}
              onImageClick={() => setShowModal(true)}
            />
          </>
        )}

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
          {hotel.desayuno_incluido.toUpperCase() === "SI" && (
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
                  {room.precio}
                  <span>{}</span>
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
