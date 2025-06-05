import React from 'react';
import StatusBadge from './StatusBadge';
import { BookingData } from '../types';
import { CreditCard } from 'lucide-react';

interface PaymentDetailsProps {
    reservation: BookingData;
}

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
        case 'canceled':
            return 'bg-red-100 text-red-800';
        case 'complete':
            return 'bg-green-100 text-green-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        case 'refunded':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const FacturaDetails: React.FC<PaymentDetailsProps> = ({ reservation }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900"> Informacion de Factura</h3>
                    <div className="space-y-3">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">Monto Total</span>
                            <span className="text-gray-900">{reservation.total_factura}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">Subtotal</span>
                            <span className="text-gray-900">{reservation.subtotal_factura}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">Impuestos</span>
                            <span className="text-gray-900">{reservation.impuestos_factura}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900"> Detalles de Factura</h3>
                    <div className="space-y-3">
                        {/* <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">RFC</span>
                            {reservation.rfc}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">Razón Social</span>
                            {reservation.razon_social}
                        </div> */}
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">Fecha Emisión</span>
                            <span className="text-gray-900">{reservation.fecha_emision}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacturaDetails;