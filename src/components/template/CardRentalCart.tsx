import {
  Car,
  Calendar,
  MapPin,
  Users,
  Gauge,
  DollarSign,
  Info,
} from "lucide-react";
import { CarRentalOption } from "../../context/ChatContext";

export const CarRentalDisplay = ({ option }: { option: CarRentalOption }) => {
  const { url, carDetails, rentalPeriod, provider, price } = option;

  const formatDate = (dateTime?: string) => {
    if (!dateTime) return "Fecha no disponible";
    const date = new Date(dateTime);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!url) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden max-w-2xl w-full">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {carDetails?.make || "Vehículo"} {carDetails?.model || ""}
              </h3>
              {carDetails?.category && (
                <span className="text-sm text-slate-200">
                  {carDetails.category}
                </span>
              )}
            </div>
          </div>
          {provider?.name && (
            <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full">
              <span className="text-sm font-medium text-white">
                {provider.name}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {carDetails?.transmission && (
            <div className="flex items-center gap-2 text-slate-600">
              <Gauge className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium capitalize">
                {carDetails.transmission}
              </span>
            </div>
          )}
          {carDetails?.passengers && (
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium">
                {carDetails.passengers} pasajeros
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-4">
          {rentalPeriod?.pickupLocation && (
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    Recoger
                  </p>
                  <p className="text-sm text-slate-600 break-words">
                    {rentalPeriod.pickupLocation.address ||
                      rentalPeriod.pickupLocation.city ||
                      "Ubicación no especificada"}
                  </p>
                  {rentalPeriod.pickupLocation.dateTime && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(rentalPeriod.pickupLocation.dateTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {rentalPeriod?.returnLocation && (
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    Devolver
                  </p>
                  <p className="text-sm text-slate-600 break-words">
                    {rentalPeriod.returnLocation.address ||
                      rentalPeriod.returnLocation.city ||
                      "Ubicación no especificada"}
                  </p>
                  {rentalPeriod.returnLocation.dateTime && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(rentalPeriod.returnLocation.dateTime)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {rentalPeriod?.days && (
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium">
                {rentalPeriod.days} días de renta
              </span>
            </div>
          )}
        </div>

        {price && (
          <div className="border-t border-slate-200 pt-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Precio Total
                </span>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-700" />
                  <span className="text-2xl font-bold text-green-700">
                    {price.total || "Consultar"} {price.currency || ""}
                  </span>
                </div>
              </div>
              {price.includedFeatures && (
                <div className="flex items-start gap-2 pt-2 border-t border-green-100">
                  <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {price.includedFeatures}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
