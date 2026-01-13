import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
// import { NotificationService } from 'src/app/shared/services/notification.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SaleService } from '../services/sale.service';
// Note: PaymentMode enum doesn't exist in the project
// Using string literals instead - common payment modes: 'UPI', 'CASH', 'NETBANKING', 'CREDIT_CARD', 'DEBIT_CARD'
// import { VehicleService } from '../../bookings/services/booking.service';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [SharedModule, NgbDropdownModule],
  templateUrl: './sale.html',
  styleUrls: ['./sale.scss']
})
export class SaleComponent implements OnInit {
  saleForm: FormGroup;
  isEditMode = false;
  editingSale: any;

  constructor(private fb: FormBuilder, private saleService: SaleService, private router: Router, private route: ActivatedRoute, private snackBar: MatSnackBar, // private notificationService: NotificationService
  ) {
    this.saleForm = this.fb.group({
      vehicleRefId: [1, Validators.required], // Temporary - should come from vehicle selection
      date: ['', Validators.required],
      lorryNumber: ['', Validators.required],  //lorryNumber
      weight: [0, [Validators.required, Validators.min(1)]],
      lorryHire: [0, [Validators.required, Validators.min(1)]],
      commission: [0, [Validators.required, Validators.min(0)]],
      bility: [0, [Validators.required, Validators.min(0)]],
      paymentMode: ['UPI', Validators.required],
      petrolPump: [''],
      totalAdvance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    // Check if there's sale data passed for editing
    if (history.state && history.state.sale) {
      this.isEditMode = true;
      this.editingSale = history.state.sale;
      this.saleForm.patchValue(this.editingSale);
    }
  }

  onSubmit() {
    if (this.saleForm.valid) {
      const payload = this.saleForm.value;

      // Generate vehicleId automatically for new sales (not for edits)
      const vehicleId = this.isEditMode ? this.editingSale.vehicleId : this.generateVehicleId();

      const saleData = this.isEditMode
        ? { ...this.editingSale, ...payload }
        : { ...payload, id: Date.now(), vehicleId };

      if (this.isEditMode && this.editingSale.id) {
        this.saleService.updateSale(saleData).subscribe(
          response => {
            console.log('Sale updated successfully:', response);
            this.snackBar.open('Vehicle sale updated successfully', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
            this.router.navigate(['/vehicle-sales-list']);
          },
          error => {
            console.error('Error updating sale:', error);
          }
        );
      } else {
        // Remove vehicleId from request since backend generates it
        const { vehicleId, id, ...requestData } = saleData;

        this.saleService.addSale(requestData).subscribe(
          response => {
            console.log('Sale submitted successfully to backend:', response);
            this.snackBar.open('Vehicle sold successfully! Proceeding to payment...', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
            // Trigger notification with backend response
            // this.notificationService.notifySale(response);
            this.saleForm.reset();

            // Redirect to payment page based on payment mode
            this.redirectToPayment(payload.paymentMode, response || saleData);
          },
          error => {
            console.error('Backend error, saving to localStorage:', error);
            this.snackBar.open('Vehicle sold successfully (saved locally)! Proceeding to payment...', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
            // Save to localStorage when backend fails
            this.saveSaleToLocalStorage(saleData);
            // Trigger notification
            // this.notificationService.notifySale(saleData);
            this.saleForm.reset();
            // Redirect to payment page based on payment mode
            this.redirectToPayment(payload.paymentMode, saleData);
          }
        );
      }
    } else {
      console.log('Sale form is invalid');
      this.snackBar.open('Please fill all required fields correctly.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: 'warning-snackbar'
      });
    }
  }

  private generateVehicleId(): string {
    // Generate vehicle ID in format VH-XXXXXXXX (8 uppercase chars from UUID)
    // This matches the backend @PrePersist logic in VehicleSale entity
    const uuid = crypto.randomUUID();
    const vehicleId = 'VH-' + uuid.substring(0, 8).toUpperCase();

    // Check if this ID already exists and regenerate if needed
    const existingSales = this.getExistingSales();
    const existingIds = existingSales.map(sale => sale.vehicleId);

    // Keep generating until we get a unique ID
    if (existingIds.includes(vehicleId)) {
      return this.generateVehicleId(); // Recursive call for uniqueness
    }

    return vehicleId;
  }

  private getExistingSales(): any[] {
    const stored = localStorage.getItem('userSales');
    return stored ? JSON.parse(stored) : [];
  }

  private saveSaleToLocalStorage(saleData: any) {
    const existingSales = this.getExistingSales();
    existingSales.push(saleData);
    localStorage.setItem('userSales', JSON.stringify(existingSales));
    console.log('Sale saved to localStorage:', saleData);
  }

  private redirectToPayment(paymentMode: string, saleData: any) {
    console.log('Redirecting to payment for mode:', paymentMode, 'with sale data:', saleData);

    switch (paymentMode.toUpperCase()) {
      case 'UPI':
        this.router.navigate(['/payment/upi'], {
          state: { saleData, paymentMode: 'UPI' }
        });
        break;
      case 'CASH':
        this.router.navigate(['/payment/cash'], {
          state: { saleData, paymentMode: 'CASH' }
        });
        break;
      case 'NETBANKING':
        this.router.navigate(['/payment/netbanking'], {
          state: { saleData, paymentMode: 'NETBANKING' }
        });
        break;
      case 'CREDIT_CARD':
        this.router.navigate(['/payment/credit-card'], {
          state: { saleData, paymentMode: 'CREDIT_CARD' }
        });
        break;
      case 'DEBIT_CARD':
        this.router.navigate(['/payment/debit-card'], {
          state: { saleData, paymentMode: 'DEBIT_CARD' }
        });
        break;
      default:
        // Fallback to sales list if payment mode is unknown
        console.warn('Unknown payment mode:', paymentMode, 'redirecting to sales list');
        this.router.navigate(['/vehicle-sales-list']);
    }
  }

  viewSoldVehiclesList() {
    this.router.navigate(['/vehicle-sales-list']);
  }
}
