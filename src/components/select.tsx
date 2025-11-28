"use client";

import React, { useState, useEffect } from "react";
import { CarRentalDisplay } from "./template/CardRentalCart";
import { ReservationPanel } from "./ReservationPanel";
import { CarRentalOption } from "../context/ChatContext";
import { Reservation } from "../types/chat";

interface TravelLayoutProps {
  booking: Reservation | null;
  carOption: CarRentalOption | null;
}

export const TravelLayout: React.FC<TravelLayoutProps> = ({
  booking,
  carOption,
}) => {
  console.log("🔵 TravelLayout render, props:", { booking, carOption });

  const [selectedCar, setSelectedCar] = useState<CarRentalOption | null>(null);

  const handleSelectCar = (option: CarRentalOption) => {
    console.log("💚 Opción de renta seleccionada (padre):", option);
    setSelectedCar(option);
  };

  useEffect(() => {
    console.log("🟣 useEffect carOption -> selectedCar", { carOption });
    if (carOption) setSelectedCar(carOption);
  }, [carOption]);

  useEffect(() => {
    console.log("🟠 selectedCar cambió en TravelLayout:", selectedCar);
  }, [selectedCar]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Columna: tarjeta del auto */}
      <div>
        {carOption && (
          <CarRentalDisplay
            option={carOption}
            onSelectCar={handleSelectCar}   // 👈 aquí SÍ se pasa
          />
        )}
      </div>

      {/* Columna: panel de reservación */}
      <div>
        <ReservationPanel
          booking={booking}
          selectedCar={selectedCar}        // 👈 aquí llega al panel
        />
      </div>
    </div>
  );
};

