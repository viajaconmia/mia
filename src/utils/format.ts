// Helpers
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
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
    return `$${formattedInteger}.${decimalPart}`;
  } else {
    return `$${formattedInteger}.00`;
  }
}
