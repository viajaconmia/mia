import { AlertCircle, Armchair, BaggageClaim, User } from "lucide-react";
import { SolicitudVuelo, VueloDetalle } from "../../../services/BookingService";
import { formatLargeDate } from "../../../utils/format";

interface FlightDetailProps {
  vuelo: VueloDetalle;
  isLast: boolean;
}

function FlightDetail({ vuelo }: FlightDetailProps) {
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const extractAirportCode = (airportString: string) => {
    const match = airportString.match(/\(([A-Z]{3})\//);
    return match ? match[1] : "";
  };

  return (
    <div className="relative">
      <div className="rounded-xl border-2 border-slate-200 p-6 hover:shadow-md">
        <div className="flex gap-1 items-center">
          <p className="text-sm font-medium text-slate-700">Tarifa:</p>
          <span className="p-1 px-3 bg-blue-200 rounded-full text-xs font-semibold border border-blue-300 hidden md:inline-block">
            {vuelo.rate_type}
          </span>
        </div>
        <div className="mb-4">
          <div className="flex flex-col md:flex-row items-center justify-between backdrop-blur-sm rounded-xl p-4 gap-4">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {extractAirportCode(vuelo.departure_airport)}
              </p>
              <div>
                <p className="text-sm text-slate-600 mt-1">
                  {vuelo.departure_city}
                </p>
              </div>
              <div className="flex justify-center items-center gap-2 text-slate-600">
                <span className="text-xs">
                  {formatLargeDate(vuelo.departure_date)}{" "}
                </span>
              </div>
              <span className="font-semibold text-sm text-gray-800">
                {formatTime(vuelo.departure_time)}
              </span>
            </div>
            {/*  */}
            <div className="flex-shrink-0 px-6 flex flex-col items-center gap-1">
              <span className="text-sm font-semibold">
                {(vuelo.flight_number || "").toUpperCase()}
              </span>
              <div className="text-4xl text-gray-900/80">→</div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border `}
              >
                {vuelo.airline.toUpperCase()}
              </span>
            </div>
            {/*  */}
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {extractAirportCode(vuelo.arrival_airport)}
              </p>
              <div>
                <p className="text-sm text-slate-600 mt-1">
                  {vuelo.arrival_city}
                </p>
              </div>
              <div className="flex justify-center items-center gap-2 text-slate-600">
                <span className="text-xs">
                  {formatLargeDate(vuelo.arrival_date)}{" "}
                </span>
              </div>
              <span className="font-semibold text-sm text-gray-800">
                {formatTime(vuelo.arrival_time)}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex flex-wrap justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              Viajero:{" "}
              <span className="font-semibold text-slate-800">
                {vuelo.viajero}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Armchair className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              Asiento:{" "}
              <span className="font-semibold text-slate-800">
                {vuelo.seat_number}
              </span>
            </span>
          </div>
        </div>

        {(vuelo.eq_mano || vuelo.eq_personal || vuelo.eq_documentado) && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <BaggageClaim className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">
              {vuelo.eq_mano} {vuelo.eq_personal} {vuelo.eq_documentado}
            </p>
          </div>
        )}
        {/* Comments */}
        {vuelo.comentarios && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">Notas: {vuelo.comentarios}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface FlightCardProps {
  item: SolicitudVuelo;
}

export default function FlightCard({ item }: FlightCardProps) {
  const getTripTypeIcon = () => {
    if (item.tipo.includes("REDONDO")) {
      return "⇄";
    }
    return "→";
  };

  return (
    <div className="w-full h-full p-4">
      <div className="w-full max-w-7xl bg-white mx-auto rounded-xl mt-6">
        <div className="mb-4">
          <div className="flex flex-col md:flex-row items-center justify-between bg-blue-50 backdrop-blur-sm rounded-xl p-6 gap-4">
            <div className="text-center flex-1">
              <p className="text-gray-700 text-sm mb-2">Origen</p>
              <p className="text-2xl font-bold text-gray-900">{item.origen}</p>
            </div>
            <div className="flex-shrink-0 px-6 flex flex-col items-center gap-1">
              <span className="p-1 px-3 bg-gray-200 rounded-full text-xs font-semibold border border-gray-300 hidden md:inline-block">
                Codigo: {item.codigo_confirmacion}
              </span>
              <div className="text-4xl text-gray-900/80">
                {getTripTypeIcon()}
              </div>
            </div>
            <div className="text-center flex-1">
              <p className="text-gray-700 text-sm mb-2">Destino</p>
              <p className="text-2xl font-bold text-gray-900">{item.destino}</p>
            </div>
          </div>
        </div>

        {/* Flight Details List */}
        <div className="space-y-2 p-4">
          {item.vuelos.map((vuelo, index) => (
            <FlightDetail
              key={vuelo.id_vuelo}
              vuelo={{ ...vuelo, viajero: item.viajero }}
              isLast={index === item.vuelos.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
