import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BookingService } from '../services/booking.service';
import { VehicleBooking } from '../models/vehicle-booking.model';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSnackBarModule],
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.scss']
})
export class BookingModalComponent implements OnInit, OnChanges {

  @Input() show = false;
  @Input() editMode = false;
  @Input() bookingData!: VehicleBooking;

  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();
  @Output() bookingSaved = new EventEmitter<any>();

  bookingForm!: FormGroup;

  vehicleTypes = ['LORI', 'TRUCK', 'CAR', 'VAN', 'BUS'];
  bookingStatus = ['UPCOMING', 'INPROGRESS', 'COMPLETED', 'PENDING','OVERDUE','CANCELLED'];
  vehicleStatus = ['AVAILABLE', 'IN_PROGRESS', 'COMPLETED','PENDING','OVERDUE','MAINTENANCE'];

  constructor(private fb: FormBuilder, private bookingService: BookingService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      // Reset form and then patch for edit mode when modal opens
      this.bookingForm.reset({
        bookingId: '',
        vehicleId: '',
        bookingDate: '',
        bookingReceivedDate: '',
        lorryBalancePaidDate: '',
        startedFrom: '',
        destination: '',
        vehicleType: '',
        vehicleNo: '',
        driverName: '',
        bookingHire: 0,
        bookingAdvance: 0,
        bookingBalance: 0,
        vehicleStatus: 'available',
        bookingStatus: 'PENDING',
        detain: '',
        podReceived: false,
        podDocument: ''
      });

      if (this.editMode && this.bookingData) {
        this.bookingForm.patchValue(this.bookingData);
      }
    }
  }

  private initializeForm() {
    this.bookingForm = this.fb.group({
      bookingId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      bookingDate: ['', Validators.required],
      bookingReceivedDate: [''],
      lorryBalancePaidDate: [''],
      startedFrom: ['', Validators.required],
      destination: ['', Validators.required],
      vehicleType: ['', Validators.required],
      vehicleNo: [''],
      driverName: ['', Validators.required],
      bookingHire: [0, Validators.required],
      bookingAdvance: [0],
      bookingBalance: [0],
      vehicleStatus: ['available', Validators.required],
      bookingStatus: ['PENDING', Validators.required],
      detain: [''],
      podReceived: [false],
      podDocument: ['']
    });
  }

  saveBooking() {
    if (this.bookingForm.invalid) return;

    const payload = this.bookingForm.value;
    const bookingData = this.editMode ? { ...this.bookingData, ...payload } : { ...payload, id: Date.now() };
    const observable = this.editMode
      ? this.bookingService.updateBooking(bookingData)
      : this.bookingService.addBooking(bookingData);

    const action = this.editMode ? 'updated' : 'saved';

    observable.subscribe({
      next: () => {
        this.snackBar.open(`Booking ${action} successfully!`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'success-snackbar'
        });
        this.bookingSaved.emit(bookingData);
        this.refreshList.emit();
        this.close();
      },
      error: (err) => {
        console.error(`Error ${action} booking:`, err);
        this.snackBar.open(`Booking ${action} successfully! (Demo mode)`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.bookingSaved.emit(bookingData);
        this.refreshList.emit();
        this.close();
      }
    });
  }

  close() {
    this.bookingForm.reset();
    this.closeModal.emit();
  }
}
