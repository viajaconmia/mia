/**
 * Formats a number as currency
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Validates if an amount string is a valid payment amount
 * @param amount The amount string to validate
 * @param maxAmount The maximum allowed amount
 * @returns An object with validation result and error message
 */
export const validatePaymentAmount = (
  amount: string,
  maxAmount: number
): { isValid: boolean; errorMessage: string } => {
  // Check if empty
  if (!amount.trim()) {
    return { isValid: false, errorMessage: "Amount is required" };
  }

  // Check if it's a valid number
  const numberRegex = /^\d+(\.\d{1,2})?$/;
  if (!numberRegex.test(amount)) {
    return {
      isValid: false,
      errorMessage: "Please enter a valid amount (up to 2 decimal places)",
    };
  }

  const numericAmount = parseFloat(amount);

  // Check if positive
  if (numericAmount <= 0) {
    return {
      isValid: false,
      errorMessage: "Amount must be greater than zero",
    };
  }

  // Check if not exceeding maximum
  if (numericAmount > maxAmount) {
    return {
      isValid: false,
      errorMessage: `Amount cannot exceed ${formatCurrency(maxAmount)}`,
    };
  }

  return { isValid: true, errorMessage: "" };
};

export const fixEncoding = (str: string) => {
  if (!str) return "";

  // Primero intentamos la forma elegante (TextDecoder)
  try {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (e) {
    // Si falla, no hacemos nada aquí
  }

  // SI LA FORMA ELEGANTE FALLA O DEJA CARACTERES RAROS:
  // Reemplazo manual de los errores más comunes
  return str
    .replace(/Ã©/g, "é")
    .replace(/Ã¡/g, "á")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã‘/g, "Ñ") // El caso de tu JSON
    .replace(/Ã/g, "Á"); // A veces la Á mayúscula da problemas
};
export function getHora(datetimeString: string) {
  const date = new Date(datetimeString);
  if (isNaN(date)) return null;
  return date.toTimeString().slice(0, 5);
}
