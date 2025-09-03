
interface Booking {
  check_in: string;
  check_out: string;
  hotel: string;
  total: string;
}

// Define the return type for clarity
export interface HotelNights {
  hotel: string;
  nights: number;
}

/**
 * Define la estructura para el resultado del cálculo de gastos.
 */
export interface HotelTotal {
  hotel: string;
  total: number;
}

/**
 * Noches por hotel DENTRO del mes/año (pro-ratea si cruza de mes).
 */
export const calculateNightsByHotelForMonthYear = (
  data: Booking[],
  selectedMonth: number,
  selectedYear: number
): HotelNights[] => {
  const monthStartUTC = Date.UTC(selectedYear, selectedMonth - 1, 1);     // [inclusive)
  const monthEndUTC = Date.UTC(selectedYear, selectedMonth, 1);         // [exclusive)

  const map: Record<string, number> = {};

  data.forEach(b => {
    if (!b.check_in || !b.check_out) return;

    const checkInUTC = Date.parse(b.check_in);
    const checkOutUTC = Date.parse(b.check_out);

    // Solape con el mes
    const start = Math.max(checkInUTC, monthStartUTC);
    const end = Math.min(checkOutUTC, monthEndUTC);

    const ms = end - start;
    if (ms > 0) {
      const nights = ms / (1000 * 60 * 60 * 24);
      map[b.hotel] = (map[b.hotel] ?? 0) + nights;
    }
  });

  return Object.entries(map).map(([hotel, nights]) => ({ hotel, nights }));
};

/**
 * Totales por hotel del mes (agrega si el check_in cae en el mes).
 */
export const calculateTotalByHotelForMonthYear = (
  data: Booking[],
  selectedMonth: number,
  selectedYear: number
): HotelTotal[] => {
  const map: Record<string, number> = {};

  data.forEach(b => {
    if (!b.check_in) return;
    const d = new Date(b.check_in);
    if (d.getUTCFullYear() !== selectedYear || (d.getUTCMonth() + 1) !== selectedMonth) return;

    const total = parseFloat(b.total);
    if (!isNaN(total)) map[b.hotel] = (map[b.hotel] ?? 0) + total;
  });

  return Object.entries(map).map(([hotel, total]) => ({ hotel, total }));
};

/**
 * Gran total del mes (si el check_in cae en el mes).
 */
export const calculateGrandTotalForMonthYear = (
  data: Booking[],
  selectedMonth: number,
  selectedYear: number
): number => {
  return data.reduce((sum, b) => {
    if (!b.check_in) return sum;
    const d = new Date(b.check_in);
    if (d.getUTCFullYear() !== selectedYear || (d.getUTCMonth() + 1) !== selectedMonth) return sum;

    const t = parseFloat(b.total);
    return isNaN(t) ? sum : sum + t;
  }, 0);
};
