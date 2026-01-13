import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../theme/shared/shared.module';

@Component({
  selector: 'app-credit-card-payment',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './credit-card-payment.component.html',
  styleUrls: []
})
export class CreditCardPaymentComponent implements OnInit {
  creditCardForm: FormGroup;
  saleData: any;
  paymentMode: string = 'CREDIT_CARD';
  cardTypes = ['Visa', 'MasterCard', 'American Express', 'RuPay'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.creditCardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardType: ['', Validators.required],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    if (history.state && history.state.saleData) {
      this.saleData = history.state.saleData;
      this.paymentMode = history.state.paymentMode || 'CREDIT_CARD';

      const totalAmount = this.calculateTotalAmount();
      this.creditCardForm.patchValue({
        amount: totalAmount
      });
    } else {
      this.router.navigate(['/sale']);
    }
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
    if (this.creditCardForm.valid) {
      this.snackBar.open('Processing credit card payment...', 'Close', {
        duration: 2000
      });

      setTimeout(() => {
        this.snackBar.open('Credit card payment successful!', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'success-snackbar'
        });
        this.router.navigate(['/vehicle-sales-list']);
      }, 3000);
    } else {
      this.snackBar.open('Please fill all required fields correctly.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: 'error-snackbar'
      });
    }
  }

  cancelPayment() {
    this.router.navigate(['/sale']);
  }
}
