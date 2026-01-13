import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../theme/shared/shared.module';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../models/payment.model';

@Component({
  selector: 'app-upi-payment',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './upi-payment.component.html',
  styleUrls: []
})
export class UpiPaymentComponent implements OnInit {
  upiForm: FormGroup;
  saleData: any;
  paymentMode: string = 'UPI';
  paymentId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService
  ) {
    this.upiForm = this.fb.group({
      upiId: ['', [Validators.required, Validators.pattern(/^[\w.-]+@[\w.-]+$/)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      payerName: ['', Validators.required],
      payerMobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      upiPin: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]],
      remarks: ['']
    });
  }

  ngOnInit() {
    // Get sale data from navigation state
    if (history.state && history.state.saleData) {
      this.saleData = history.state.saleData;
      this.paymentMode = history.state.paymentMode || 'UPI';

      // Set the amount from sale data
      const totalAmount = this.calculateTotalAmount();
      this.upiForm.patchValue({
        amount: totalAmount
      });

      // Create payment record
      this.createPaymentRecord(totalAmount);
    } else {
      // If no sale data, redirect back to sale form
      this.router.navigate(['/sale']);
    }
  }

  private createPaymentRecord(amount: number) {
    const referenceId = this.saleData.id || this.saleData.vehicleId || `SALE_${Date.now()}`;

    this.paymentService.createPayment(amount, referenceId, this.paymentMode).subscribe({
      next: (payment) => {
        this.paymentId = payment.id;
        console.log('Payment record created:', payment);
      },
      error: (error) => {
        console.error('Failed to create payment record:', error);
        // Continue with payment flow even if payment record creation fails
      }
    });
  }

  private calculateTotalAmount(): number {
    if (!this.saleData) return 0;

    // Calculate total amount: lorryHire + commission + bility
    const lorryHire = this.saleData.lorryHire || 0;
    const commission = this.saleData.commission || 0;
    const bility = this.saleData.bility || 0;
    const totalAmount = lorryHire + commission + bility;

    // Calculate advance paid
    const totalAdvance = this.saleData.totalAdvance || 0;

    // Payment amount = total amount - advance paid (cannot be negative)
    const paymentAmount = Math.max(0, totalAmount - totalAdvance);

    return paymentAmount;
  }

  onSubmit() {
    if (this.upiForm.valid) {
      const formData = this.upiForm.value;

      // Step 1: Validate UPI ID
      this.snackBar.open('Validating UPI ID...', 'Close', {
        duration: 1500
      });

      setTimeout(() => {
        // Step 2: Processing payment
        this.snackBar.open('Processing UPI payment to ' + formData.upiId + '...', 'Close', {
          duration: 2000
        });

        setTimeout(() => {
          // Step 3: Simulate OTP verification (real-time aspect)
          this.snackBar.open('OTP sent to ' + formData.payerMobile + '. Please approve payment.', 'Close', {
            duration: 2500
          });

          setTimeout(() => {
            // Update payment status to COMPLETED
            if (this.paymentId) {
              const transactionId = `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              this.updatePaymentStatus('COMPLETED', transactionId);
            }

            // Step 4: Payment completion
            this.snackBar.open('Payment successful! ₹' + formData.amount + ' transferred via UPI.', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: 'success-snackbar'
            });

            // Redirect to sales list after successful payment
            setTimeout(() => {
              this.router.navigate(['/vehicle-sales-list']);
            }, 1500);
          }, 2500);
        }, 2000);
      }, 1500);
    } else {
      this.snackBar.open('Please fill all required fields correctly.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: 'error-snackbar'
      });
    }
  }

  private updatePaymentStatus(status: string, transactionId: string) {
    if (this.paymentId) {
      this.paymentService.updatePaymentStatus(this.paymentId, status, transactionId).subscribe({
        next: (updatedPayment) => {
          console.log('Payment status updated:', updatedPayment);
        },
        error: (error) => {
          console.error('Failed to update payment status:', error);
          // Continue with payment flow even if status update fails
        }
      });
    }
  }

  cancelPayment() {
    this.router.navigate(['/sale']);
  }
}
