export interface Payment {
  id: number;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMode: 'UPI' | 'CASH' | 'NETBANKING' | 'CREDIT_CARD' | 'DEBIT_CARD';
  referenceId: string;
  transactionId: string | null;
  createdAt: string;
}
