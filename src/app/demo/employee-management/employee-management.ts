import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { ConfirmationDialogComponent } from '../admin-management/confirmation-dialog/confirmation-dialog.component';
import { EmployeeModalComponent } from '../admin-management/employee-modal/employee-modal.component';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbDropdownModule, ConfirmationDialogComponent, EmployeeModalComponent],
  templateUrl: './employee-management.html',
  styleUrl: './employee-management.scss'
})
export class EmployeeManagement implements OnInit {

  // Employee data array (mock data for demo)
  employeesList: any[] = [];

  // View toggle - Default to form view for direct employee entry
  showEmployeeList = false;

  // Inline form
  employeeForm: FormGroup;

  // Departments
  departments = [
    { id: 1, name: "Transport" },
    { id: 2, name: "HR" },
    { id: 3, name: "Sales" },
    { id: 4, name: "Finance" }
  ];

  // File upload properties
  selectedFile: File | null = null;

  // Modal properties
  showConfirmationDialog = false;
  showEmployeeModal = false;
  editMode = false;
  selectedEmployee?: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.loadSampleData(); // Load sample data for demonstration
  }

  private loadSampleData() {
    // Add sample employees for testing export functionality
    this.employeesList = [
      {
        id: 1,
        name: 'John Smith',
        contactNo: '+91-9876543210',
        email: 'john.smith@allcity.com',
        dateOfJoining: '2024-01-15',
        role: 'Senior Developer',
        departmentId: 1,
        designation: 'Developer',
        qualificationDocument: 'john_cv.pdf'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        contactNo: '+91-9876543211',
        email: 'sarah.johnson@allcity.com',
        dateOfJoining: '2024-02-01',
        role: 'Manager',
        departmentId: 2,
        designation: 'Manager',
        qualificationDocument: 'sarah_cv.pdf'
      },
      {
        id: 3,
        name: 'Mike Davis',
        contactNo: '+91-9876543212',
        email: 'mike.davis@allcity.com',
        dateOfJoining: '2024-03-10',
        role: 'Developer',
        departmentId: 3,
        designation: 'Developer'
      }
    ];
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

  getDepartmentName(id: number | null | undefined): string {
    const dept = this.departments.find(d => d.id === id);
    return dept ? dept.name : 'N/A';
  }

  // Toggle between form view and list view
  toggleView() {
    this.showEmployeeList = !this.showEmployeeList;
    // Reset form when switching to form view
    if (!this.showEmployeeList) {
      this.employeeForm.reset();
      this.selectedFile = null;
    }
  }

  // Handle inline form submission
  onQuickAddEmployee() {
    if (this.employeeForm.invalid) {
      alert('Please fill all required fields!');
      return;
    }

    const formValue = this.employeeForm.value;

    // Handle empty designation by setting it to a default based on role
    if (!formValue.designation) {
      if (formValue.role === 'Manager') {
        formValue.designation = 'Manager';
      } else if (formValue.role === 'Admin') {
        formValue.designation = 'User';
      } else {
        formValue.designation = 'Employee';
      }
    }

    const newEmployee = {
      ...formValue,
      id: Math.floor(Math.random() * 10000),
      departmentId: formValue.departmentId
    };

    console.log('Adding employee via quick form:', newEmployee);

    // Add to appropriate array based on designation
    this.onEmployeeSaved(newEmployee);

    // Switch to list view to show the added employee
    this.showEmployeeList = true;

    // Reset form
    this.employeeForm.reset();
    this.selectedFile = null;
  }

  // Handle employee creation
  onEmployeeSaved(employee: any) {
    // Add all employees to the list
    this.employeesList.push(employee);

    console.log('Employee added:', employee);
    console.log('Current employees:', this.employeesList);
  }

  // Handle file selection for inline form
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('File selected:', this.selectedFile.name);
    }
  }

  // Edit employee
  editEmployee(employee: any) {
    this.selectedEmployee = { ...employee };
    this.editMode = true;
    this.showEmployeeModal = true;
  }

  // Delete employee from list
  deleteEmployee(employee: any) {
    this.selectedEmployee = employee;
    this.showConfirmationDialog = true;
  }

  // Modal event handlers
  onEmployeeModalSaved(employee: any) {
    if (this.editMode) {
      // Update existing employee
      const index = this.employeesList.findIndex(emp => emp.id === employee.id);
      if (index !== -1) {
        this.employeesList[index] = employee;
      }
    } else {
      // Add new employee
      employee.id = Math.max(...this.employeesList.map(e => e.id || 0)) + 1;
      this.employeesList.push(employee);
    }
    this.closeEmployeeModal();
  }

  closeEmployeeModal() {
    this.showEmployeeModal = false;
    this.selectedEmployee = undefined;
    this.editMode = false;
  }

  onConfirmDelete() {
    if (this.selectedEmployee) {
      this.employeesList = this.employeesList.filter(emp => emp.id !== this.selectedEmployee!.id);
      this.showConfirmationDialog = false;
      this.selectedEmployee = undefined;
    }
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.selectedEmployee = undefined;
  }

  // Export methods
  exportToCSV() {
    const headers = ['SL.No', 'Name', 'Contact', 'Email', 'Role', 'Department', 'Date of Joining'];
    const data = this.employeesList.map((emp, index) => [
      index + 1,
      emp.name,
      emp.contactNo,
      emp.email,
      emp.role,
      this.getDepartmentName(emp.departmentId),
      emp.dateOfJoining
    ]);

    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'employees.csv');
    link.click();
    link.style.visibility = 'hidden';
  }

  exportToExcel() {
    // For Excel export using xlsx library with static import
    const worksheet = XLSX.utils.json_to_sheet(this.employeesList.map((emp, index) => ({
      'SL.No': index + 1,
      'Name': emp.name,
      'Contact': emp.contactNo,
      'Email': emp.email,
      'Role': emp.role,
      'Department': this.getDepartmentName(emp.departmentId),
      'Date of Joining': emp.dateOfJoining
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'employees.xlsx');
  }

  exportToPDF() {
    // For PDF export using jsPDF with static import
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text('AllCity Transport - Employee Report', 20, 20);
    let y = 40;
    pdf.setFontSize(12);
    pdf.text('Name | Contact | Email | Role | Department', 20, y);
    y += 20;
    this.employeesList.forEach(employee => {
      pdf.text(`${employee.name} | ${employee.contactNo} | ${employee.email} | ${employee.role} | ${this.getDepartmentName(employee.departmentId)}`, 20, y);
      y += 10;
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
    });
    pdf.save('employees.pdf');
  }

  printEmployees() {
    // Create printable content with watermark and fallback
    const printHtml = `
      <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
        <div style="position: relative; z-index: 2; background: white; padding: 20px;">
          <h1>AllCity Transport - Employee Report</h1>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">SL.No</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Contact</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Email</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Role</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Department</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Date of Joining</th>
              </tr>
            </thead>
            <tbody>
              ${this.employeesList.map((emp, index) => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td><td style="border: 1px solid #ddd; padding: 8px;">${emp.name}</td><td style="border: 1px solid #ddd; padding: 8px;">${emp.contactNo}</td><td style="border: 1px solid #ddd; padding: 8px;">${emp.email}</td><td style="border: 1px solid #ddd; padding: 8px;">${emp.role}</td><td style="border: 1px solid #ddd; padding: 8px;">${this.getDepartmentName(emp.departmentId)}</td><td style="border: 1px solid #ddd; padding: 8px;">${emp.dateOfJoining}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.print();
    }
  }
}
