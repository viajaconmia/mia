export type PaymentStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Failed';

export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Crypto';

export interface Payment {
  id: string;
  dueAmount: number;
  remainingBalance: number;
  status: PaymentStatus;
  date: string;
}

export interface PaymentFormData {
  amount: string;
  paymentMethod: PaymentMethod;
}