import { ICuponStrategy } from "../ICuponStrategy";

export class AutoCuponStrategy implements ICuponStrategy {
  async generarCupon(reservaId: string): Promise<void> {
    // Aqui va la logica para generar el pdf del auto
  }
}
