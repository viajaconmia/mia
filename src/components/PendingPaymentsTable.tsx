import React, { useState } from "react";
import { Payment, PaymentFormData } from "../types";
import StatusBadge from "./StatusBadge";
import PaymentModal from "./PaymentModal";

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

interface PendingPaymentsTableProps {
  payments: Payment[];
  onMakePayment: (paymentId: string, formData: PaymentFormData) => void;
}

const PendingPaymentsTable: React.FC<PendingPaymentsTableProps> = ({
  payments,
  onMakePayment,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitPayment = (
    paymentId: string,
    formData: PaymentFormData
  ) => {
    onMakePayment(paymentId, formData);
  };

  // Determine if a payment is eligible for the Pay button
  const isPaymentEligible = (payment: Payment): boolean => {
    return (
      payment.estado_solicitud === "complete" &&
      payment.pendiente_por_cobrar > 0
    );
  };

  // Format the date string
  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Concepto de pago
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Total
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Restante por pagar
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Estado
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Fecha Creado
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {payments.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="py-4 text-center text-sm text-gray-500"
              >
                No se encontraron pagos pendientes
              </td>
            </tr>
          ) : (
            payments.map((payment) => {
              const isEligible = isPaymentEligible(payment);
              // Highlight confirmed payments with remaining balance
              const highlightRow =
                payment.estado_solicitud === "complete" &&
                payment.pendiente_por_cobrar > 0;

              return (
                <tr
                  key={payment.id_credito}
                  className={`transition-colors duration-200 hover:bg-gray-50 ${
                    highlightRow ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <span className="font-mono">{payment.concepto}</span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 font-mono">
                    {formatCurrency(payment.pago_por_credito)}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <span
                      className={`font-mono ${
                        payment.pendiente_por_cobrar > 0
                          ? "text-blue-600 font-semibold"
                          : ""
                      }`}
                    >
                      {formatCurrency(payment.pendiente_por_cobrar)}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <StatusBadge status={payment.estado_solicitud} />
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {new Date(payment.fecha_credito).toLocaleDateString()}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleOpenModal(payment)}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                        isEligible
                          ? "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          : "text-gray-400 bg-gray-100 cursor-not-allowed"
                      }`}
                      disabled={!isEligible}
                    >
                      Pagar
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitPayment}
        />
      )}
    </div>
  );
};

export default PendingPaymentsTable;
