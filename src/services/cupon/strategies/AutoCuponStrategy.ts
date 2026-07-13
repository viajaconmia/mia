import { ICuponStrategy } from "../ICuponStrategy";
import { jsPDF } from "jspdf";

export class AutoCuponStrategy implements ICuponStrategy {
  async generarCupon(reservaId: string): Promise<void> {
    if (!reservaId) {
      console.warn("No se recibió el ID de la reserva");
      return;
    }

    const pdf = new jsPDF();

    pdf.text("PDF de renta de autos", 20, 20);
    pdf.text(`ID de reserva: ${reservaId}`, 20, 30);

    pdf.save(`renta-auto-${reservaId}.pdf`);
  }
}