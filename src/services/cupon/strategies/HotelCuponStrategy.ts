import { ICuponStrategy } from "../ICuponStrategy";
// Importar la lógica actual de cupon.ts

export class HotelCuponStrategy implements ICuponStrategy {
  async generarCupon(reservaId: string): Promise<void> {
    // Aqui va la logica para generar el pdf del cupon del hotel
  }
}
