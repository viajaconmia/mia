import {
  Car,
  Clock,
  MapPin,
  User,
  Shield,
  Users,
  Key,
  Calendar,
} from "lucide-react";
import {
  ConductorAdicional,
  SolicitudRentaCarros,
} from "../services/BookingService";
import { formatLargeDate } from "../utils/format";

interface DriverDetailProps {
  conductor: ConductorAdicional;
}

function DriverDetail({ conductor }: DriverDetailProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-all duration-200 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-slate-800 mb-1">
            {conductor.nombre_completo}
          </h4>
          <div className="space-y-1">
            {conductor.correo && (
              <p className="text-sm text-slate-600 truncate">
                {conductor.correo}
              </p>
            )}
            {conductor.telefono && (
              <p className="text-sm text-slate-600">{conductor.telefono}</p>
            )}
            {conductor.numero_pasaporte && (
              <p className="text-xs text-slate-500">
                Pasaporte: {conductor.numero_pasaporte}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CarRentalCardProps {
  item: SolicitudRentaCarros;
}

export default function CarRentalCard({ item }: CarRentalCardProps) {
  const extractLocation = (fullLocation: string) => {
    const parts = fullLocation.split(" - ");
    return {
      name: parts[0] || fullLocation,
      address: parts.slice(1).join(" - ") || "",
    };
  };

  const pickupLocation = extractLocation(item.lugar_recoger_auto);
  const dropoffLocation = extractLocation(item.lugar_dejar_auto);
  const isSameLocation =
    item.id_sucursal_recoger_auto === item.id_sucursal_dejar_auto;

  return (
    <div className="w-full h-full p-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl mt-6 shadow">
        {/* Header Card */}
        <div className="bg-gradient-to-t from-blue-700 to-blue-800 shadow-xl p-8 mb-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Renta de Auto</h2>
                <p className="text-slate-300 text-sm">
                  Confirmación:{" "}
                  <span className="font-mono font-semibold">
                    {item.codigo_confirmation}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-sm mb-1">Proveedor</p>
              <p className="text-xl font-bold text-white">
                {item.nombre_proveedor}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-slate-300 text-sm mb-2">Tipo de Vehículo</p>
                <p className="text-lg font-semibold text-white">
                  {item.tipo_auto}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Transmisión: {item.transmission}
                </p>
              </div>
              <div>
                <p className="text-slate-300 text-sm mb-2">Duración</p>
                <p className="text-lg font-semibold text-white">
                  {item.dias} {item.dias === 1 ? "día" : "días"}
                </p>
              </div>
              <div>
                <p className="text-slate-300 text-sm mb-2">Seguro</p>
                <p className="text-lg font-semibold text-white">
                  {item.seguro_incluido}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">
                Conductor Principal
              </h3>
            </div>
            <p className="text-xl font-bold text-white">
              {item.conductor_principal}
            </p>
          </div>
        </div>

        {/* Pickup and Dropoff Details */}
        <div className="p-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-6 border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pickup */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Recoger Auto
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-slate-500" />

                      <span className="text-sm font-semibold text-slate-700">
                        {formatLargeDate(item.check_in.split("T")[0])}
                      </span>
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-700">
                        {item.hora_recoger_auto}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pl-2 border-l-2 border-emerald-200 ml-6">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {pickupLocation.name}
                      </p>
                      {pickupLocation.address && (
                        <p className="text-sm text-slate-600 mt-1">
                          {pickupLocation.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropoff */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Entregar Auto
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-slate-500" />

                      <span className="text-sm font-semibold text-slate-700">
                        {formatLargeDate(item.check_out.split("T")[0])}
                      </span>
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-700">
                        {item.hora_dejar_auto}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pl-2 border-l-2 border-blue-200 ml-6">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {dropoffLocation.name}
                      </p>
                      {dropoffLocation.address && !isSameLocation && (
                        <p className="text-sm text-slate-600 mt-1">
                          {dropoffLocation.address}
                        </p>
                      )}
                      {isSameLocation && (
                        <p className="text-sm text-emerald-600 mt-1 font-medium">
                          Misma ubicación que recogida
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance and Additional Info */}
          <div className="bg-white border rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-800 mb-2">
                  Cobertura y Seguros
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-slate-700">
                      Seguro:{" "}
                      <span className="font-semibold">
                        {item.seguro_incluido}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="text-sm text-slate-700">
                      Conductores adicionales:{" "}
                      <span className="font-semibold">
                        {item.additional_driver > 0
                          ? `${item.additional_driver} incluido(s)`
                          : "No incluidos"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Drivers */}
          {item.conductores_adicionales &&
            item.conductores_adicionales.filter(
              (c) => c.id_viajero !== item.id_conductor_principal,
            ).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Conductores Adicionales (
                    {item.conductores_adicionales.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.conductores_adicionales
                    .filter((c) => c.id_viajero !== item.id_conductor_principal)
                    .map((conductor) => (
                      <DriverDetail
                        key={conductor.id_viajero}
                        conductor={conductor}
                      />
                    ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
