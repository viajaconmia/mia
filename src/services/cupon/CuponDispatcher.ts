//services/cupon/cuponDispacher.ts
import { ICuponStrategy } from "./ICuponStrategy";
import { HotelCuponStrategy } from "./strategies/HotelCuponStrategy";
import { AutoCuponStrategy } from "./strategies/AutoCuponStrategy";
import { AvionCuponStrategy } from "./strategies/AvionCuponStrategy";

export type ReservaType = "hotel" | "car_rental" | "flyght";

export const CuponDispatcher = async (tipo: ReservaType, reservaId: string) => {
  const strategies: Record<ReservaType, ICuponStrategy> = {
    hotel: HotelCuponStrategy,
    car_rental: AutoCuponStrategy,
    flyght: AvionCuponStrategy,
  };

  const strategy = strategies[tipo];
  if (!strategy) {
    throw new Error(`Tipo de reserva no soportado ${tipo}`);
  }

  await strategy.generarCupon(reservaId);
};
