// Helpers
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

// export const formatDate = (dateString: string) => {
//   console.log(formatDate,"kr bvklr jbk")
//   const [year, month, day] = dateString;
//   const date = new Date(+year, +month - 1, +day)
//     ;
//   return date.toLocaleDateString("es-MX", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });
// };

export const formatDate = (input?: string | Date | null): string => {
  // Logs útiles (corrige tu console.log)
  // console.log("formatDate input:", input);

  if (!input) return "N/A";

  let d: Date;

  if (input instanceof Date) {
    d = input;
  } else {
    const s = String(input).trim();
    if (!s || s === "0000-00-00") return "N/A";

    // Caso: "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, day] = s.split("-").map(Number);
      // Interpretar como fecha en UTC para evitar desfases por huso
      d = new Date(Date.UTC(y, m - 1, day));
    } else {
      // Caso ISO completo: "2025-10-08T21:00:07.000Z" (u otros formatos válidos)
      const ms = Date.parse(s);
      if (!Number.isFinite(ms)) return "N/A";
      d = new Date(ms);
    }
  }

  if (isNaN(d.getTime())) return "N/A";

  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function formatNumberWithCommas(
  numberStr: string | number | undefined | null
): string {
  // Si el valor es undefined o null, retornar cadena vacía
  if (numberStr == null) return "";

  // Convertir a string si es un número
  const str = typeof numberStr === "number" ? numberStr.toString() : numberStr;

  // Si la cadena está vacía, retornar cadena vacía
  if (str.trim() === "") return "";
  // 1. Separar la parte entera de la parte decimal
  const parts = str.split(".");
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : undefined;

  // 2. Formatear la parte entera
  // Invertimos la parte entera para facilitar la inserción de comas cada tres dígitos desde la derecha
  const reversedInteger = integerPart.split("").reverse().join("");
  let formattedReversedInteger = "";

  for (let i = 0; i < reversedInteger.length; i++) {
    if (i > 0 && i % 3 === 0) {
      formattedReversedInteger += ",";
    }
    formattedReversedInteger += reversedInteger[i];
  }

  // Volvemos a invertir la parte entera formateada para obtener el orden correcto
  const formattedInteger = formattedReversedInteger
    .split("")
    .reverse()
    .join("");

  // 3. Unir la parte entera formateada con la parte decimal (si existe)
  if (decimalPart !== undefined) {
    return `$${formattedInteger}.${
      decimalPart.length == 2 ? decimalPart : decimalPart + "0"
    }`;
  } else {
    return `$${formattedInteger}.00`;
  }
}
