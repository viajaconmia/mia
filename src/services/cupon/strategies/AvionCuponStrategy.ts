import { ICuponStrategy } from "../ICuponStrategy";

export class AvionCuponStrategy implements ICuponStrategy {
  async generarCupon(reservaId: string): Promise<void> {
    // Aqui va la logica para generar el cupon de aviones
  }
}
