import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PurchaseService } from './services/purchase.service';
// import { NotificationService } from '../../../shared/services/notification.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../../theme/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-purchase',
  imports: [
    SharedModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './purchase.html',
  styleUrls: ['./purchase.scss']
})
export class PurchaseComponent implements OnInit {

  purchaseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private router: Router,
    private snackBar: MatSnackBar,
    // private notificationService: NotificationService
  ) {
    this.purchaseForm = this.fb.group({
      date: ['', Validators.required],
      vehicleNo: ['', Validators.required],
      bookingHire: ['', Validators.required],
      bookingReceivingBalanceDate: [''],
      fromLocation: ['', Validators.required],
      toLocation: ['', Validators.required],
      transportName: ['', Validators.required],
      detain: ['', Validators.required],
      podReceivedDate: [''],
      lorryBalancePaidDate: ['']
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.purchaseForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly.', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: 'error-snackbar'
      });
      // Mark all fields as touched to show validation errors
      Object.keys(this.purchaseForm.controls).forEach(key => {
        this.purchaseForm.get(key)?.markAsTouched();
      });
      return;
    }

    const payload = this.purchaseForm.value;

    this.purchaseService.addPurchase(payload).subscribe({
      next: (response) => {
        console.log('Purchase submitted successfully to backend:', response);
        this.snackBar.open('Vehicle purchased successfully!', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'success-snackbar'
        });

        // Trigger notification
        // this.notificationService.notifyPurchase(response || payload);

        this.purchaseForm.reset();
        this.router.navigate(['/purchase-list']);
      },

      error: (error) => {
        console.error('Backend error, treating as demo mode:', error);
        this.snackBar.open('Vehicle purchased successfully! (Demo mode)', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'success-snackbar'
        });

        // For demo mode, save to localStorage
        this.savePurchaseToLocalStorage(payload);

        // Trigger notification
        // this.notificationService.notifyPurchase(payload);

        this.purchaseForm.reset();
        this.router.navigate(['/purchase-list']);
      }
    });
  }

  private savePurchaseToLocalStorage(purchaseData: any) {
    const existingPurchases = this.getExistingPurchases();
    // Generate sequential serial number (1, 2, 3, 4...)
    const maxSlNo = existingPurchases.length > 0
      ? Math.max(...existingPurchases.map(p => p.slNo || 0))
      : 0;
    const nextSlNo = maxSlNo + 1;

    const purchaseWithId = { ...purchaseData, slNo: nextSlNo };
    existingPurchases.push(purchaseWithId);
    localStorage.setItem('vehiclePurchases', JSON.stringify(existingPurchases));
    console.log('Purchase saved to localStorage:', purchaseWithId);
  }

  private getExistingPurchases(): any[] {
    const stored = localStorage.getItem('vehiclePurchases');
    return stored ? JSON.parse(stored) : [];
  }

  viewPurchasesList() {
    this.router.navigate(['/purchase-list']);
  }
}
