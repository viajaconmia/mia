/**
 * Formats a number as currency
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
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
        return { isValid: false, errorMessage: 'Amount is required' };
    }

    // Check if it's a valid number
    const numberRegex = /^\d+(\.\d{1,2})?$/;
    if (!numberRegex.test(amount)) {
        return {
            isValid: false,
            errorMessage: 'Please enter a valid amount (up to 2 decimal places)'
        };
    }

    const numericAmount = parseFloat(amount);

    // Check if positive
    if (numericAmount <= 0) {
        return {
            isValid: false,
            errorMessage: 'Amount must be greater than zero'
        };
    }

    // Check if not exceeding maximum
    if (numericAmount > maxAmount) {
        return {
            isValid: false,
            errorMessage: `Amount cannot exceed ${formatCurrency(maxAmount)}`
        };
    }

    return { isValid: true, errorMessage: '' };
};