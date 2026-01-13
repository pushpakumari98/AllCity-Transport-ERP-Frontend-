import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PermitLevel } from '../../../enums/permit-level.enum';
import { VehicleStatus } from '../../../enums/vehicle-status.enum';
import { VehicleType } from '../../../enums/vehicle-type.enum';
import { Vehicle } from '../../../model/vehicle.model';
import { VehicleService } from '../services/vehicle.service';

@Component({
  selector: 'app-vehicle-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSnackBarModule],
  templateUrl: './vehicle-modal.component.html',
  styleUrls: ['./vehicle-modal.component.scss']
})
export class VehicleModalComponent implements OnInit {

  @Input() show = false;
  @Input() editMode = false;
  @Input() vehicleData!: Vehicle;

  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();
  @Output() vehicleSaved = new EventEmitter<any>();

  vehicleForm!: FormGroup;
  selectedFile: File | null = null;

  // Enum options for dropdowns
  permitLevelOptions = Object.values(PermitLevel);
  vehicleTypeOptions = Object.values(VehicleType);
  vehicleStatusOptions = Object.values(VehicleStatus);

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      // Reset form and then patch for edit mode when modal opens
      this.vehicleForm.reset({
        vehicleRegNo: '',
        permitLevel: '',
        driverMob: null,
        vehicleType: '',
        price: null,
        capacity: null,
        description: '',
        originCity: '',
        destinationCity: '',
        vehicleStatus: VehicleStatus.AVAILABLE
      });

      if (this.editMode && this.vehicleData) {
        this.vehicleForm.patchValue(this.vehicleData);
      }
    }
  }

  private initializeForm() {
    this.vehicleForm = this.fb.group({
      vehicleRegNo: ['', [Validators.required, Validators.minLength(4)]],
      permitLevel: ['', Validators.required],
      driverMob: [null, [Validators.required, Validators.min(1000000000), Validators.max(9999999999)]],
      vehicleType: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.1)]],
      capacity: [null, [Validators.required, Validators.min(1)]],
      description: [''],
      originCity: [''],
      destinationCity: [''],
      vehicleStatus: [VehicleStatus.AVAILABLE, Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select a valid image file!', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'error-snackbar'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size should not exceed 5MB!', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'error-snackbar'
        });
        return;
      }

      this.selectedFile = file;
    }
  }

  saveVehicle() {
    if (this.vehicleForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.vehicleForm.value;

    if (this.editMode && this.vehicleData) {
      // For edit mode - send individual form fields
      const formData = new FormData();

      formData.append('vehicleRegNo', formValue.vehicleRegNo);
      formData.append('permitLevel', formValue.permitLevel);
      formData.append('driverMob', formValue.driverMob.toString());
      formData.append('vehicleType', formValue.vehicleType);
      formData.append('price', formValue.price.toString());
      formData.append('capacity', formValue.capacity.toString());
      formData.append('originCity', formValue.originCity || '');
      formData.append('destinationCity', formValue.destinationCity || '');
      formData.append('description', formValue.description || '');
      formData.append('vehicleStatus', formValue.vehicleStatus);

      // 🔥 ONLY append image if selected
      if (this.selectedFile) {
        formData.append('imageFile', this.selectedFile);
      }

      // Call update with FormData
      this.vehicleService.updateVehicleWithFile(this.vehicleData.id!, formData).subscribe({
        next: (response) => {
          this.snackBar.open('Vehicle updated successfully!', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: 'success-snackbar'
          });
          this.vehicleSaved.emit(formValue);
          this.refreshList.emit();
          this.close();
        },
        error: (error) => {
          console.error('Error updating vehicle:', error);
          let errorMessage = 'Error updating vehicle. Please try again!';

          if (error.status === 401) {
            errorMessage = 'Authentication required. Please login as admin.';
          } else if (error.status === 403) {
            errorMessage = 'Access denied. Admin privileges required.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid data. Please check all fields.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          this.snackBar.open(errorMessage, '', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: 'error-snackbar'
          });
        }
      });
    } else {
      // For add mode, use FormData for file upload
      const formData = new FormData();

      const vehicleData = {
        vehicleRegNo: formValue.vehicleRegNo,
        permitLevel: formValue.permitLevel,
        driverMob: formValue.driverMob,
        vehicleType: formValue.vehicleType,
        price: formValue.price,
        capacity: formValue.capacity,
        description: formValue.description,
        originCity: formValue.originCity,
        destinationCity: formValue.destinationCity,
        vehicleStatus: formValue.vehicleStatus
      };

      formData.append('vehicle', new Blob([JSON.stringify(vehicleData)], { type: 'application/json' }));

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.vehicleService.addVehicleWithFile(formData).subscribe({
        next: (response) => {
          this.snackBar.open('Vehicle saved successfully!', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: 'success-snackbar'
          });
          this.vehicleSaved.emit(vehicleData);
          this.refreshList.emit();
          this.close();
        },
        error: (error) => {
          console.error('Error saving vehicle:', error);
          let errorMessage = 'Error saving vehicle. Please try again!';

          if (error.status === 401) {
            errorMessage = 'Authentication required. Please login as admin.';
          } else if (error.status === 403) {
            errorMessage = 'Access denied. Admin privileges required.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid data. Please check all fields.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          this.snackBar.open(errorMessage, '', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      control?.markAsTouched();
    });
  }

  close() {
    this.vehicleForm.reset();
    this.selectedFile = null;
    this.closeModal.emit();
  }
}
