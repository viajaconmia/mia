import React from 'react';
import { Payment } from '../types';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { CreditCard } from 'lucide-react';


/**
 * Format a date string to a user-friendly format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format a date string to include time
 */
const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format a currency value with proper symbols
 */
const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    return `${amount} ${currency}`;
  }
};

/**
 * Get the status color based on reservation status
 */
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface BookingsSectionProps {
  payments: Payment[];
  currency: string;
  totalAmount: number;
}

const BookingsSection: React.FC<BookingsSectionProps> = ({
  payments,
  currency,
  totalAmount
}) => {
  if (!payments || payments.length === 0) {
    return <EmptyState message="No hay reservas disponibles" />;
  }

  // Calculate subtotal (assuming 10% tax for this example)
  const taxRate = 0.16;
  const subtotal = totalAmount / (1 + taxRate);
  const taxAmount = totalAmount - subtotal;

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Codigo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hotel
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fechas
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id_solicitud} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {payment.codigo_reservacion_hotel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {payment.hotel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {payment.nombre_viajero ? payment.nombre_viajero : payment.viajero.nombre + " " + payment.viajero.apellido_paterno}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span>
                    {new Date(payment.check_in).toLocaleDateString()} -
                    {new Date(payment.check_out).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatCurrency(payment.total, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsSection;