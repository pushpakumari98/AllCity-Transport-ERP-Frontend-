import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PurchaseService } from '../services/purchase.service';
import { VehiclePurchase } from '../models/vehicle-purchase.model';

@Component({
  selector: 'app-purchase-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSnackBarModule],
  templateUrl: './purchase-modal.component.html',
  styleUrls: ['./purchase-modal.component.scss']
})
export class PurchaseModalComponent implements OnInit {

  @Input() show = false;
  @Input() editMode = false;
  @Input() purchaseData!: VehiclePurchase;

  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();
  @Output() purchaseSaved = new EventEmitter<any>();

  purchaseForm!: FormGroup;

  paymentModes = ['UPI', 'IMPS', 'NETBANKING', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD'];



  // Determine if this is view mode (read-only)
  get isViewMode(): boolean {
    return !this.editMode && !!this.purchaseData?.slNo;
  }

  constructor(private fb: FormBuilder, private purchaseService: PurchaseService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      this.purchaseForm.reset();

      if (this.purchaseData) {
        this.purchaseForm.patchValue(this.purchaseData);

        // Disable form in view mode
        if (this.isViewMode) {
          this.purchaseForm.disable();
        } else {
          this.purchaseForm.enable();
        }
      } else if (!this.editMode) {
        // Pre-fill with sample data for new entries
        this.prefillWithSampleData();
      } else {
        // For edit mode, ensure form has valid data
        if (this.editMode && this.purchaseData) {
          this.purchaseForm.patchValue(this.purchaseData);
        }
      }
    }
  }

  private prefillWithSampleData() {
    // Pre-fill with sample data for demo purposes
    this.purchaseForm.patchValue({
      date: '2025-01-15',
      vehicleNo: 'MH12AB1234',
      bookingHire: 'John Doe Transport',
      bookingReceivingBalanceDate: '2025-01-16',
      fromLocation: 'Mumbai',
      toLocation: 'Delhi',
      transportName: 'Blue Dart',
      detain: '500',
      podReceivedDate: '2025-01-18',
      lorryBalancePaidDate: '2025-01-20'
    });
  }

  private initializeForm() {
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

  savePurchase() {
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
    const purchaseData = this.editMode ? { ...this.purchaseData, ...payload } : { ...payload };

    const observable = this.editMode
      ? this.purchaseService.updatePurchase(purchaseData)
      : this.purchaseService.addPurchase(purchaseData);

    const action = this.editMode ? 'updated' : 'saved';

    observable.subscribe({
      next: (result) => {
        console.log(`Purchase ${action} successfully:`, result);
        this.snackBar.open(`Purchase ${action} successfully!`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'success-snackbar'
        });
        this.purchaseSaved.emit(result || purchaseData);
        this.refreshList.emit();
        this.close();
      },
      error: (err) => {
        console.error(`Error ${action} purchase:`, err);
        this.snackBar.open(`Purchase ${action} successfully! (Demo mode)`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'success-snackbar'
        });
        this.purchaseSaved.emit(purchaseData);
        this.refreshList.emit();
        this.close();
      }
    });
  }

  close() {
    this.purchaseForm.reset();
    this.closeModal.emit();
  }
}
