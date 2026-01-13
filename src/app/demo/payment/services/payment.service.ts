import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Payment } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/payments'; // Backend API URL
  private localStorageKey = 'payments';

  constructor(private http: HttpClient) {}

  // Create payment
  createPayment(amount: number, referenceId: string, paymentMode: string): Observable<Payment> {
    const payload = { amount, referenceId, paymentMode };

    return new Observable(observer => {
      this.http.post<Payment>(`${this.apiUrl}/create`, null, { params: payload }).subscribe({
        next: (result) => {
          console.log('Payment created on backend:', result);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          console.error('Backend error, falling back to localStorage:', error);
          // Fallback to local storage
          const localPayment = this.createPaymentLocally(amount, referenceId, paymentMode);
          console.log('Payment created in localStorage:', localPayment);
          observer.next(localPayment);
          observer.complete();
        }
      });
    });
  }

  // Update payment status
  updatePaymentStatus(paymentId: number, status: string, transactionId?: string): Observable<Payment> {
    const payload = { status };
    if (transactionId) {
      payload['transactionId'] = transactionId;
    }

    return new Observable(observer => {
      this.http.put<Payment>(`${this.apiUrl}/update-status/${paymentId}`, null, { params: payload }).subscribe({
        next: (result) => {
          console.log('Payment status updated on backend:', result);
          observer.next(result);
          observer.complete();
        },
        error: (error) => {
          console.error('Backend error, updating in localStorage:', error);
          // Fallback to local storage
          const updatedPayment = this.updatePaymentStatusLocally(paymentId, status, transactionId);
          if (updatedPayment) {
            observer.next(updatedPayment);
          } else {
            observer.error(new Error('Payment not found'));
          }
          observer.complete();
        }
      });
    });
  }

  // Get all payments
  getAllPayments(): Observable<Payment[]> {
    return new Observable(observer => {
      this.http.get<Payment[]>(this.apiUrl).subscribe({
        next: (payments) => observer.next(payments),
        error: () => {
          // Fallback to local storage
          const localPayments = this.getAllPaymentsLocally();
          observer.next(localPayments);
        },
        complete: () => observer.complete()
      });
    });
  }

  // Get payment by ID
  getPaymentById(id: number): Observable<Payment> {
    return new Observable(observer => {
      this.http.get<Payment>(`${this.apiUrl}/${id}`).subscribe({
        next: (payment) => observer.next(payment),
        error: () => {
          // Fallback to local storage
          const localPayment = this.getPaymentByIdLocally(id);
          if (localPayment) {
            observer.next(localPayment);
          } else {
            observer.error(new Error('Payment not found'));
          }
        },
        complete: () => observer.complete()
      });
    });
  }

  // Local storage fallback methods
  private createPaymentLocally(amount: number, referenceId: string, paymentMode: string): Payment {
    const payment: Payment = {
      id: Date.now(),
      amount: amount,
      status: 'PENDING',
      paymentMode: paymentMode as any,
      referenceId: referenceId,
      transactionId: null,
      createdAt: new Date().toISOString()
    };

    const payments = this.getAllPaymentsLocally();
    payments.push(payment);
    localStorage.setItem(this.localStorageKey, JSON.stringify(payments));

    return payment;
  }

  private updatePaymentStatusLocally(paymentId: number, status: string, transactionId?: string): Payment | null {
    const payments = this.getAllPaymentsLocally();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);

    if (paymentIndex !== -1) {
      payments[paymentIndex].status = status as any;
      if (transactionId) {
        payments[paymentIndex].transactionId = transactionId;
      }
      localStorage.setItem(this.localStorageKey, JSON.stringify(payments));
      return payments[paymentIndex];
    }

    return null;
  }

  private getAllPaymentsLocally(): Payment[] {
    const stored = localStorage.getItem(this.localStorageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private getPaymentByIdLocally(id: number): Payment | null {
    const payments = this.getAllPaymentsLocally();
    return payments.find(p => p.id === id) || null;
  }
}
