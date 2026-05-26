import { CheckCircle2 } from "lucide-react";

export const PagoExitoso = () => (
  <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
    <CheckCircle2 className="w-16 h-16 text-green-500" />
    <h1 className="text-2xl font-bold text-gray-800">Pago exitoso</h1>
    <p className="text-gray-500">Tu pago fue procesado correctamente.</p>
  </div>
);
