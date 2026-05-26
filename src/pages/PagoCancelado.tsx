import { XCircle } from "lucide-react";

export const PagoCancelado = () => (
  <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
    <XCircle className="w-16 h-16 text-red-500" />
    <h1 className="text-2xl font-bold text-gray-800">Pago cancelado</h1>
    <p className="text-gray-500">El pago no fue completado.</p>
  </div>
);
