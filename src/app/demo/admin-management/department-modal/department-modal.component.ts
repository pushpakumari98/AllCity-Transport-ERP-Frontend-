import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-department-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './department-modal.component.html',
  styleUrls: ['./department-modal.component.scss']
})
export class DepartmentModalComponent implements OnInit {

  @Input() show = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshList = new EventEmitter<void>();

  departmentForm!: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  saveDepartment() {
    if (this.departmentForm.invalid) return;

    const payload = this.departmentForm.value;
    this.adminService.createDepartment(payload).subscribe({
      next: () => {
        this.refreshList.emit();
        this.close();
      },
      error: (err) => console.error('Error creating department:', err)
    });
  }

  close() {
    this.departmentForm.reset();
    this.closeModal.emit();
  }
}
