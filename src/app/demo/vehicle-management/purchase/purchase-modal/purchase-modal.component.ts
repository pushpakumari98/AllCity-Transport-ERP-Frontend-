import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
export class PurchaseModalComponent implements OnInit, OnChanges {

  @Input() show = false;
  @Input() editMode = false;
  @Input() isViewMode = false;
  @Input() purchaseData!: VehiclePurchase | null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();
  @Output() purchaseSaved = new EventEmitter<VehiclePurchase>();

  purchaseForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']?.currentValue) {
      this.purchaseForm.reset();

      if (this.editMode && this.purchaseData) {
        // EDIT MODE
        this.purchaseForm.patchValue(this.purchaseData);
        this.purchaseForm.enable();
      } else {
        // ADD MODE
        this.purchaseForm.enable();
      }
    }
  }

  private initializeForm(): void {
    this.purchaseForm = this.fb.group({
      date: ['', Validators.required],
      vehicleNo: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/)]],
      bookingHire: ['', [Validators.required, Validators.min(0)]],
      bookingReceivingBalanceDate: [''],
      fromLocation: ['', Validators.required],
      toLocation: ['', Validators.required],
      transportName: ['', Validators.required],
      detain: ['', Validators.required], // detain should be string to match backend
      podReceivedDate: [''],
      lorryBalancePaidDate: ['']
    });
  }

  savePurchase(): void {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields.', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: 'error-snackbar'
      });
      return;
    }

    const payload = {
      ...this.purchaseForm.value,
      vehicleNo: this.purchaseForm.value.vehicleNo.toUpperCase(),
      bookingHire: Number(this.purchaseForm.value.bookingHire),
      detain: this.purchaseForm.value.detain // Keep detain as string to match backend
    };

    const purchaseData = this.editMode
      ? { ...this.purchaseData!, ...payload }
      : payload;

    const request$ = this.editMode
      ? this.purchaseService.updatePurchase(purchaseData)
      : this.purchaseService.addPurchase(purchaseData);

    request$.subscribe({
      next: (response) => {
        this.snackBar.open(
          `Purchase ${this.editMode ? 'updated' : 'saved'} successfully!`,
          '',
          {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: 'success-snackbar'
          }
        );

        this.purchaseSaved.emit(response);
        this.refreshList.emit();
        this.close();
      },
      error: (error) => {
        console.error('Purchase save failed:', error);
        const msg = error?.error?.message || 'Something went wrong. Please try again.';
        this.snackBar.open(msg, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  close(): void {
    this.purchaseForm.reset();
    this.closeModal.emit();
  }
}
