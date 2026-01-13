import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '../../../theme/shared/shared.module';

@Component({
  selector: 'app-netbanking-payment',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './netbanking-payment.component.html',
  styleUrls: []
})
export class NetbankingPaymentComponent implements OnInit {
  netbankingForm: FormGroup;
  saleData: any;
  paymentMode: string = 'NETBANKING';
  banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra', 'IDFC First'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.netbankingForm = this.fb.group({
      bankName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    if (history.state && history.state.saleData) {
      this.saleData = history.state.saleData;
      this.paymentMode = history.state.paymentMode || 'NETBANKING';

      const totalAmount = this.calculateTotalAmount();
      this.netbankingForm.patchValue({
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
    if (this.netbankingForm.valid) {
      this.snackBar.open('Connecting to bank...', 'Close', {
        duration: 2000
      });

      setTimeout(() => {
        this.snackBar.open('Net Banking payment successful!', 'Close', {
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
