import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Payment, PaymentFormData, PaymentMethodd } from "../types";
//import { formatCurrency, validatePaymentAmount } from '../utils/formatters';

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
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
    return { isValid: false, errorMessage: "Se requiere una cantidad" };
  }

  // Check if it's a valid number
  const numberRegex = /^\d+(\.\d{1,2})?$/;
  if (!numberRegex.test(amount)) {
    return {
      isValid: false,
      errorMessage: "Ingresa una cantidad valida (hasta 2 decimales)",
    };
  }

  const numericAmount = parseFloat(amount);

  // Check if positive
  if (numericAmount <= 0) {
    return {
      isValid: false,
      errorMessage: "La cantidad debe ser mayor a cero",
    };
  }

  // Check if not exceeding maximum
  if (numericAmount > maxAmount) {
    return {
      isValid: false,
      errorMessage: `La cantidad no puede exceder ${formatCurrency(maxAmount)}`,
    };
  }

  return { isValid: true, errorMessage: "" };
};

interface PaymentModalProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentId: string, formData: PaymentFormData) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  payment,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: payment.pendiente_por_cobrar.toString(),
    paymentMethod: "Credit Card",
  });

  const [validation, setValidation] = useState({
    isValid: true,
    errorMessage: "",
  });

  // Reset form when payment changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: payment.pendiente_por_cobrar.toString(),
        paymentMethod: "Credit Card",
      });
      setValidation({ isValid: true, errorMessage: "" });
    }
  }, [isOpen, payment]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setFormData({ ...formData, amount: newAmount });

    const validationResult = validatePaymentAmount(
      newAmount,
      payment.pendiente_por_cobrar
    );
    setValidation(validationResult);
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      paymentMethod: e.target.value as PaymentMethodd,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = validatePaymentAmount(
      formData.amount,
      payment.pendiente_por_cobrar
    );

    if (validationResult.isValid) {
      onSubmit(payment.id_credito, formData);
      onClose();
    } else {
      setValidation(validationResult);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-25 flex items-center justify-center">
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Hacer pago</h3>
          <button
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Payment Info Summary */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Id pago con credito:</span>
                <span className="font-medium font-mono">
                  {payment.id_credito}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Cantidad total:</span>
                <span className="font-medium font-mono">
                  {formatCurrency(payment.pago_por_credito)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pendiente por pagar:</span>
                <span className="font-medium font-mono text-blue-600">
                  {formatCurrency(payment.pendiente_por_cobrar)}
                </span>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cantidad de pago
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  pattern="^[^<>]*$"
                  type="text"
                  name="amount"
                  id="amount"
                  className={`block w-full pl-7 pr-12 py-2 sm:text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    !validation.isValid
                      ? "border-red-300 text-red-900 placeholder-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleAmountChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">MXN</span>
                </div>
              </div>
              {!validation.isValid && (
                <p className="mt-2 text-sm text-red-600">
                  {validation.errorMessage}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Metodo de pago
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={formData.paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <option value="Credit Card">Tarjeta de credito</option>
                <option value="Bank Transfer">Transferencia</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !validation.isValid ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!validation.isValid}
            >
              Confirmar pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
