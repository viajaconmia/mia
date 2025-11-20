// src/components/FlightCard.tsx
import { Plane, Luggage } from "lucide-react";
import {
  FlightMessagePayload,
  FlightOption,
  FlightSegment,
  SeatLocation,
} from "../types/chat";

export const FlightCard = ({ payload }: { payload: FlightMessagePayload }) => {
  return (
    <div className="space-y-4 w-full">
      {payload.options.map((option) => (
        <FlightOptionCard key={option.id} option={option} />
      ))}
    </div>
  );
};

const FlightOptionCard = ({ option }: { option: FlightOption }) => {
  const isRoundTrip = option.itineraryType === "round_trip";
  const [outbound, inbound] = option.segments;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-50 p-4 md:p-5 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <Plane className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              {isRoundTrip ? "Viaje redondo" : "Vuelo sencillo"}
            </h3>
            {option.price && (
              <p className="text-xs text-blue-500">
                Desde{" "}
                <span className="font-semibold">
                  {option.price.currency} {option.price.total.toFixed(2)}
                </span>
              </p>
            )}
          </div>
        </div>

        <span className="px-2.5 py-1 text-[11px] rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
          {option.itineraryType === "round_trip"
            ? "Ida y vuelta"
            : "Solo ida"}
        </span>
      </div>

      {/* Segmentos */}
      <div className="grid gap-3 md:grid-cols-1">
        {outbound && (
          <FlightSegmentView
            segment={outbound}
            label="Ida"
            accent="from-blue-500/10 to-blue-100/60"
          />
        )}

        {isRoundTrip && inbound && (
          <FlightSegmentView
            segment={inbound}
            label="Vuelta"
            accent="from-blue-500/10 to-blue-100/60"
          />
        )}
      </div>

      {/* Asiento + Equipaje */}
      <div className="grid gap-3 md:grid-cols-2 border-t border-blue-50 pt-3">
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-semibold text-[11px] tracking-wide text-blue-500 uppercase">
            Asiento
          </p>
          <p>
            <span className="font-semibold">Tipo: </span>
            {translateSeat(option.seat.assignedSeatLocation)}
          </p>
          <p className="text-[11px]">
            {option.seat.isDesiredSeat
              ? "✅ Es el asiento que solicitaste."
              : "⚠️ No coincide con el asiento solicitado."}
          </p>
        </div>

        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-semibold text-[11px] tracking-wide text-blue-500 uppercase flex items-center gap-1">
            <Luggage className="w-3 h-3" />
            Equipaje
          </p>
          {option.baggage.hasCheckedBaggage ? (
            <p>
              Maleta documentada:{" "}
              <span className="font-semibold">
                {option.baggage.pieces ?? 1}
              </span>
            </p>
          ) : (
            <p>Sin maleta documentada</p>
          )}
        </div>
      </div>

      {/* Precio destacado abajo (mobile-friendly) */}
      {option.price && (
        <div className="pt-2 border-t border-blue-50 flex justify-end">
          <p className="text-lg font-bold text-blue-700">
            {option.price.currency} {option.price.total.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

const FlightSegmentView = ({
  segment,
  label,
  accent,
}: {
  segment: FlightSegment;
  label: string;
  accent: string;
}) => {
  const dep = new Date(segment.departureTime);
  const arr = new Date(segment.arrivalTime);

  return (
    <div
      className={`rounded-xl bg-gradient-to-r ${accent} p-3 md:p-4 text-xs text-blue-900 border border-blue-100`}
    >
      <p className="font-semibold text-[11px] tracking-wide text-blue-600 uppercase mb-1">
        {label}
      </p>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">
            {segment.origin.city} ({segment.origin.airportCode}) →{" "}
            {segment.destination.city} ({segment.destination.airportCode})
          </p>
          {segment.airline && (
            <p className="text-[11px] text-blue-700/80">
              {segment.airline}
              {segment.flightNumber && ` · Vuelo ${segment.flightNumber}`}
            </p>
          )}
        </div>
        <div className="text-[11px] md:text-right space-y-0.5">
          <p>
            <span className="font-semibold">Salida: </span>
            {dep.toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">Llegada: </span>
            {arr.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const translateSeat = (seat: SeatLocation): string => {
  switch (seat) {
    case "aisle":
      return "Pasillo";
    case "window":
      return "Ventana";
    case "middle":
      return "En medio";
    case "exit_row":
      return "Salida de emergencia";
    case "premium":
      return "Preferente";
    case "vip":
      return "VIP";
    default:
      return seat;
  }
};
