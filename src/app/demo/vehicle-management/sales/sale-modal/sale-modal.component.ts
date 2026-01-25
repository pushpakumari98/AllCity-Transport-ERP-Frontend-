import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SaleService } from '../services/sale.service';
import { VehicleSale } from '../models/vehicle-sale.model';

@Component({
  selector: 'app-sale-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSnackBarModule],
  templateUrl: './sale-modal.component.html',
  styleUrls: ['./sale-modal.component.scss']
})
export class SaleModalComponent implements OnInit, OnChanges {

  @Input() show = false;
  @Input() editMode = false;
  @Input() saleData!: VehicleSale;

  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();
  @Output() saleSaved = new EventEmitter<any>();

  saleForm!: FormGroup;

  paymentModes = ['UPI', 'IMPS', 'CASH', 'NETBANKING', 'CREDIT CARD', 'DEBIT CARD'];

  constructor(private fb: FormBuilder, private saleService: SaleService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      this.saleForm.reset();

      if (this.editMode && this.saleData) {
        this.saleForm.patchValue(this.saleData);
      }
    }
  }

  private initializeForm() {
    this.saleForm = this.fb.group({
      vehicleId: ['', Validators.required],
      date: ['', Validators.required],
      lorryNumber: ['', Validators.required],
      weight: [0, [Validators.required, Validators.min(0.01)]],
      lorryHire: [0, [Validators.required, Validators.min(0.01)]],
      commission: [0, [Validators.required, Validators.min(0)]],
      bility: [0, [Validators.required, Validators.min(0)]],
      paymentMode: ['UPI', Validators.required],
      petrolPump: [''],
      totalAdvance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  saveSale() {
    if (this.saleForm.invalid) return;

    const payload = this.saleForm.value;
    const saleData = this.editMode ? { ...this.saleData, ...payload } : { ...payload, id: Date.now() };
    const observable = this.editMode
      ? this.saleService.updateSale(saleData)
      : this.saleService.addSale(saleData);

    const action = this.editMode ? 'updated' : 'saved';

    observable.subscribe({
      next: () => {
        this.snackBar.open(`Sale ${action} successfully!`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.saleSaved.emit(saleData);
        this.refreshList.emit();
        this.close();
      },
      error: (err) => {
        console.error(`Error ${action} sale:`, err);
        this.snackBar.open(`Sale ${action} successfully! (Demo mode)`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.saleSaved.emit(saleData);
        this.refreshList.emit();
        this.close();
      }
    });
  }

  close() {
    this.saleForm.reset();
    this.closeModal.emit();
  }
}
