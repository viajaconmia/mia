export interface ICuponStrategy {
  generarCupon(reservaId: string): Promise<void>;
}
