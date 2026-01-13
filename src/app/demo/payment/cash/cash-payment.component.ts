import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../theme/shared/shared.module';

@Component({
  selector: 'app-cash-payment',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './cash-payment.component.html',
  styleUrls: []
})
export class CashPaymentComponent implements OnInit {
  cashForm: FormGroup;
  saleData: any;
  paymentMode: string = 'CASH';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cashForm = this.fb.group({
      receivedAmount: ['', [Validators.required, Validators.min(0.01)]],
      receivedBy: ['', [Validators.required]],
      notes: ['']
    });
  }

  ngOnInit() {
    if (history.state && history.state.saleData) {
      this.saleData = history.state.saleData;
      this.paymentMode = history.state.paymentMode || 'CASH';

      const totalAmount = this.calculateTotalAmount();
      this.cashForm.patchValue({
        receivedAmount: totalAmount
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
    if (this.cashForm.valid) {
      this.snackBar.open('Processing cash payment...', 'Close', {
        duration: 2000
      });

      setTimeout(() => {
        this.snackBar.open('Cash payment recorded successfully!', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'success-snackbar'
        });
        this.router.navigate(['/vehicle-sales-list']);
      }, 2000);
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
