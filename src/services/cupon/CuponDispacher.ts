import { ICuponStrategy } from "./ICuponStrategy";
import { HotelCuponStrategy } from "./strategies/HotelCuponStrategy";
import { AutoCuponStrategy } from "./strategies/AutoCuponStrategy";
import { AvionCuponStrategy } from "./strategies/AvionCuponStrategy";

type ReservaType = "hotel" | "auto" | "avion";

export class CuponDispatcher {
  private strategies: Record<ReservaType, ICuponStrategy> = {
    hotel: new HotelCuponStrategy(),
    auto: new AutoCuponStrategy(),
    avion: new AvionCuponStrategy(),
  };

  async generar(tipo: ReservaType, reservaId: string): Promise<void> {
    const strategy = this.strategies[tipo];
    if (!strategy) {
      throw new Error(`Tipo de reserva no soportado ${tipo}`);
    }

    await strategy.generarCupon(reservaId);
  }
}
