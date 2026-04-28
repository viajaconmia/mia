interface Booking {
  check_in: string;
  check_out: string;
  hotel: string;
  total: string;
  status_solicitud: string; // nuevo campo usado para filtrar
}

export interface HotelNights {
  hotel: string;
  nights: number;
}

export interface HotelTotal {
  hotel: string;
  total: number;
}

/** Helper: ¿la fecha ISO cae en el mes/año UTC seleccionados? */
const isInMonthUTC = (iso: string, year: number, month1to12: number) => {
  const d = new Date(iso);
  return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month1to12;
};

/**
 * Noches por hotel DENTRO del mes/año (prorratea si cruza de mes).
 * Solo cuenta si status_solicitud === "complete".
 */
export const calculateNightsByHotelForMonthYear = (
  data: Booking[],
  selectedMonth: number,
  selectedYear: number,
  debug = false,
): HotelNights[] => {
  console.log(data[0], "data[0] en calculo noches por hotel");
  const MS_PER_DAY = 86_400_000;
  const dayIndex = (ms: number) => Math.floor(ms / MS_PER_DAY);

  const monthStartUTC = Date.UTC(selectedYear, selectedMonth - 1, 1); // [incl)
  const monthEndUTC = Date.UTC(selectedYear, selectedMonth, 1); // [excl)
  const monthStartDay = dayIndex(monthStartUTC);
  const monthEndDay = dayIndex(monthEndUTC);

  const map: Record<string, number> = {};

  for (const b of data) {
    // Solo contar si está completa
    if (b.type != "hotel") continue;
    if (!b.check_in || !b.check_out || !b.proveedor) continue;

    const inMs = Date.parse(b.check_in);
    const outMs = Date.parse(b.check_out);
    if (!Number.isFinite(inMs) || !Number.isFinite(outMs) || outMs <= inMs)
      continue;

    // Calcular solape con el mes
    const startDay = Math.max(dayIndex(inMs), monthStartDay);
    const endDay = Math.min(dayIndex(outMs), monthEndDay);
    const nights = endDay - startDay;

    if (nights > 0) {
      map[b.proveedor] = (map[b.proveedor] ?? 0) + nights;
    }
  }

  const result = Object.entries(map)
    .map(([hotel, nights]) => ({ hotel, nights }))
    .sort((a, b) => b.nights - a.nights);

  if (debug) console.log("✅ Noches por hotel:", result);
  console.log("RESULTADO", result);
  return result;
};

/**
 * Totales por hotel del mes (solo si el check_in cae en el mes y está completo).
 */
export const calculateTotalByHotelForMonthYear = (
  data: Booking[],
  selectedMonth: number,
  selectedYear: number,
  debug = false,
): HotelTotal[] => {
  const map: Record<string, number> = {};

  for (const b of data) {
    if (b.estado !== "Confirmada") continue; // solo completas
    if (!b.check_in || !b.proveedor) continue;
    if (!isInMonthUTC(b.check_in, selectedYear, selectedMonth)) continue;

    const total = parseFloat(b.total);
    if (Number.isFinite(total)) {
      map[b.proveedor] = (map[b.proveedor] ?? 0) + total;
      if (debug)
        console.log(`💰 ${b.proveedor}: +${total} → ${map[b.proveedor]}`);
    }
  }

  const result = Object.entries(map)
    .map(([hotel, total]) => ({ hotel, total }))
    .sort((a, b) => b.total - a.total);

  if (debug) console.log("✅ Totales por hotel:", result);
  return result;
};

/**
 * Gran total del mes (solo si el check_in cae en el mes y está completo).
 */
export const calculateGrandTotalForMonthYear = (
  data: Booking[],
  selectedMonth: number,
  selectedYear: number,
  debug = false,
): number => {
  let sum = 0;
  for (const b of data) {
    if (b.estado !== "Confirmada") continue; // solo completas
    if (!b.check_in) continue;
    if (!isInMonthUTC(b.check_in, selectedYear, selectedMonth)) continue;

    const t = parseFloat(b.total);
    if (Number.isFinite(t)) {
      sum += t;
      if (debug) console.log(`➕ ${b.proveedor}: +${t} → total=${sum}`);
    }
  }
  if (debug) console.log("💵 Gran total:", sum);
  return sum;
};

export function isDifferentMonth(createdAt: string): boolean {
  const date = new Date(createdAt);
  const now = new Date();

  return (
    date.getMonth() !== now.getMonth() ||
    date.getFullYear() !== now.getFullYear()
  );
}
