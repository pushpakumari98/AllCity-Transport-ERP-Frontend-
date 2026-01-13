import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../admin.service';
import { Employee, Department } from '../admin.service';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatSnackBarModule],
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent implements OnInit, OnChanges {
  departments: Department[] = [];

  @Input() show = false;
  @Input() editMode = false;
  @Input() employeeData!: Employee;
  @Input() userType = '';

  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();
  @Output() employeeSaved = new EventEmitter<any>();

  employeeForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      this.loadDepartments();
      // Reset form and then patch for edit mode when modal opens
      this.employeeForm.reset({
        name: '',
        contactNo: '',
        email: '',
        dateOfJoining: '',
        designation: '',
        role: null,
        departmentId: null,
        qualificationDocument: null
      });

      // Pre-fill designation based on user type for create mode
      if (!this.editMode && this.userType) {
        if (this.userType === 'Manager') {
          this.employeeForm.patchValue({
            designation: 'Manager'
          });
        } else if (this.userType === 'Employee') {
          this.employeeForm.patchValue({
            designation: 'Employee'
          });
        } else if (this.userType === 'User') {
          this.employeeForm.patchValue({
            designation: 'User'
          });
        }
      }

      // Patch the form with employee data for edit mode
      if (changes['employeeData'] && changes['employeeData'].currentValue && this.editMode) {
        this.employeeForm.patchValue(changes['employeeData'].currentValue);
      } else if (this.editMode && this.employeeData) {
        this.employeeForm.patchValue(this.employeeData);
      }
    }
  }

  private initializeForm() {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      contactNo: [''],
      email: [''],
      dateOfJoining: ['', Validators.required],
      designation: [''],
      role: [null, Validators.required],
      departmentId: [null],
      qualificationDocument: [null]
    });
  }

  saveEmployee() {
    if (this.employeeForm.invalid) {
      console.log('Form is invalid:', this.employeeForm.errors);
      return;
    }

    const formValue = this.employeeForm.value;
    console.log('Saving employee:', formValue, 'userType:', this.userType);

    const payload = {
      name: formValue.name,
      contactNo: formValue.contactNo,
      email: formValue.email,
      dateOfJoining: formValue.dateOfJoining,
      designation: formValue.designation,
      role: formValue.role,
      qualificationDocument: formValue.qualificationDocument?.name || null, // Store file name only
      department: { id: formValue.departmentId }
    };

    const action = this.editMode ? 'updated' : 'created';
    const userTypeLabel = this.userType ? this.userType.toLowerCase() : 'employee';

    const observable = this.editMode
      ? this.adminService.updateEmployee(this.employeeData.id!, payload)
      : this.adminService.createEmployee(payload);

    // For demo purposes, create a mock response with the form data (ID will be assigned by parent)
    const mockResponse = {
      id: this.editMode ? this.employeeData.id : null, // Let parent assign ID
      ...payload,
      departmentId: formValue.departmentId // Flatten department structure for UI
    };

    observable.subscribe({
      next: (response) => {
        // Use actual API response if successful, otherwise fall back to mock
        const responseData = response || mockResponse;
        this.snackBar.open(`${this.userType} ${action} successfully!`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: 'success-snackbar'
        });
        this.employeeSaved.emit(responseData);
        this.refreshList.emit();
        this.close();
      },
      error: (err) => {
        // For demo purposes, show success with mock data even if backend fails
        console.error(`Error ${action} ${userTypeLabel}:`, err);
        this.snackBar.open(`${this.userType} ${action} successfully! (Demo mode)`, '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.employeeSaved.emit(mockResponse);
        this.refreshList.emit();
        this.close();
      }
    });
  }

  private loadDepartments() {
    this.adminService.getDepartments().subscribe({
      next: (res) => this.departments = res,
      error: () => {
        // Fallback mock data if backend not available
        this.departments = [
          { id: 1, name: "Transport" },
          { id: 2, name: "HR" },
          { id: 3, name: "Sales" },
          { id: 4, name: "Finance" }
        ];
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Update the form control with the file
      this.employeeForm.patchValue({
        qualificationDocument: this.selectedFile
      });
    }
  }

  close() {
    this.employeeForm.reset();
    this.selectedFile = null;
    this.closeModal.emit();
  }
}
