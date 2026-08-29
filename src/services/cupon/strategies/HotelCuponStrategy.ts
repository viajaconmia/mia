import { ICuponStrategy } from "../ICuponStrategy";
// Importar la lógica actual de cupon.ts

export const HotelCuponStrategy: ICuponStrategy = {
  async generarCupon(reservaId: string): Promise<void> {
    // TODO: Implementar lógica para generar PDF del cupón del hotel
    // Por ahora retorna un Buffer vacío
  },
};
