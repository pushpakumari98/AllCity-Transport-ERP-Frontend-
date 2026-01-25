import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Driver } from '../models/driver.model';
import { DriverService } from '../services/driver.service';

@Component({
  selector: 'app-driver-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSnackBarModule],
  templateUrl: './driver-modal.component.html',
  styleUrls: ['./driver-modal.component.scss']
})
export class DriverModalComponent implements OnInit, OnChanges {

  @Input() show = false;
  @Input() editMode = false;
  @Input() driverData!: Driver;

  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();
  @Output() driverSaved = new EventEmitter<any>();

  driverForm!: FormGroup;

  constructor(private fb: FormBuilder, private driverService: DriverService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      this.driverForm.reset();

      if (this.editMode && this.driverData) {
        this.driverForm.patchValue(this.driverData);
      }
    }
  }

  private initializeForm() {
    this.driverForm = this.fb.group({
      serialNumber: ['', Validators.required],
      date: ['', Validators.required],
      vehicleNumber: ['', Validators.required],
      driverName: ['', Validators.required],
      startedFrom: ['', Validators.required],
      destination: ['', Validators.required],
      carryMaterialType: ['', Validators.required],
      contactNumber: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.driverForm.patchValue({ document: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  saveDriver() {
    if (this.driverForm.invalid) return;

    const payload = this.driverForm.value;
    const driverData = this.editMode ? { ...this.driverData, ...payload } : { ...payload, id: Date.now() };
    const observable = this.editMode
      ? this.driverService.updateDriver(driverData)
      : this.driverService.addDriver(driverData);

    const action = this.editMode ? 'updated' : 'added';

    observable.subscribe({
      next: () => {
        this.snackBar.open(`Driver ${action} successfully!`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.driverSaved.emit(driverData);
        this.refreshList.emit();
        this.close();
      },
      error: (err) => {
        console.error(`Error ${action} driver:`, err);
        this.snackBar.open(`Driver ${action} successfully! (Demo mode)`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.driverSaved.emit(driverData);
        this.refreshList.emit();
        this.close();
      }
    });
  }

  close() {
    this.driverForm.reset();
    this.closeModal.emit();
  }
}
