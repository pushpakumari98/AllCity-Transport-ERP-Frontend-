import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from 'src/app/demo/admin-management/admin.service';
import { Employee, Department } from 'src/app/demo/admin-management/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeModalComponent } from './employee-modal/employee-modal.component';
import { DepartmentModalComponent } from './department-modal/department-modal.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, EmployeeModalComponent, DepartmentModalComponent, ConfirmationDialogComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  employees: Employee[] = [];
  departments: Department[] = [];

  // Separate arrays for each type
  users: Employee[] = [];
  managers: Employee[] = [];
  employeesList: Employee[] = [];

  // Simple ID generator for new employees
  private nextEmployeeId = 1;
  showEmployeeModal = false;
  showDepartmentModal = false;
  showConfirmationDialog = false;
  showAddOptionsModal = false;
  showExportDropdown = false;
  editMode = false;
  selectedEmployee?: Employee;
  selectedEmployeeToDelete?: Employee;
  hasLocalUpdates = false;
  selectedUserType = '';



  constructor(private svc: AdminService, private cdr: ChangeDetectorRef, private fb: FormBuilder) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc.getEmployees().subscribe({
      next: (res) => {
        this.employees = res;
        this.updateFilteredLists(); // Update filtered arrays when data loads
        // Clear local updates flag when fresh data is loaded from backend
        this.hasLocalUpdates = false;
      },
      error: () => this.loadMockData()
    });
    this.svc.getDepartments().subscribe({
      next: (res) => this.departments = res,
      error: () => this.loadMockDepartments()
    });
  }

  private loadMockData() {
    // Start with empty list for user to add employees
    this.employees = [];
  }

  private loadMockDepartments() {
    // Mock departments for demonstration when backend is not available
    this.departments = [
      { id: 1, name: "Transport" },
      { id: 2, name: "HR" },
      { id: 3, name: "Sales" },
      { id: 4, name: "Finance" }
    ];
  }

  getDepartmentName(id: number | null | undefined): string {
    const dept = this.departments.find(d => d.id === id);
    return dept ? dept.name : 'N/A';
  }

  openCreate(userType: string) {
    this.editMode = false;
    this.selectedEmployee = undefined;
    this.selectedUserType = userType;
    this.showEmployeeModal = true;
  }

  openEdit(emp: Employee) {
    this.editMode = true;
    this.selectedEmployee = emp;
    // Set userType based on employee's designation for proper form handling
    this.selectedUserType = emp.designation || '';
    this.showEmployeeModal = true;
  }

  closeModal() {
    this.showEmployeeModal = false;
  }

  closeDepartmentModal() {
    this.showDepartmentModal = false;
  }

  delete(emp: Employee) {
    this.selectedEmployeeToDelete = emp;
    this.showConfirmationDialog = true;
  }

  onConfirmDelete() {
    if (this.selectedEmployeeToDelete) {
      this.showConfirmationDialog = false;
      this.svc.deleteEmployee(this.selectedEmployeeToDelete.id).subscribe({
        next: () => {
          this.onEmployeeDeleted(this.selectedEmployeeToDelete!);
          this.selectedEmployeeToDelete = undefined;
        },
        error: (err) => {
          // For demo purposes, remove from local list even if backend fails
          console.error('Error deleting employee:', err);
          this.onEmployeeDeleted(this.selectedEmployeeToDelete!);
          this.selectedEmployeeToDelete = undefined;
        }
      });
    }
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.selectedEmployeeToDelete = undefined;
  }

  addDepartment() {
    this.showDepartmentModal = true;
  }

  // Update separate arrays based on employee designations
  private updateFilteredLists() {
    this.users = this.employees.filter(emp => emp.designation === 'User');
    this.managers = this.employees.filter(emp => emp.designation === 'Manager');
    this.employeesList = this.employees.filter(emp => emp.designation === 'Employee');
  }

  // Handle employee update/create from modal (for demo purposes with mock data)
  onEmployeeSaved(updatedEmployee: any) {
    console.log('Employee saved:', updatedEmployee);

    const index = this.employees.findIndex(emp => emp.id === updatedEmployee.id);
    if (index !== -1) {
      // Update existing employee
      this.employees[index] = { ...this.employees[index], ...updatedEmployee };
      console.log('Updated existing employee');
    } else {
      // Add new employee - use our static ID generator to avoid conflicts
      const newEmployee = { ...updatedEmployee, id: this.nextEmployeeId++ };
      this.employees.push(newEmployee);
      console.log('Added new employee:', newEmployee);
    }

    // Always update filtered lists after any change
    this.updateFilteredLists();
    this.hasLocalUpdates = true; // Mark that we have local updates

    this.cdr.detectChanges(); // Force immediate view update

    console.log('Current employees list:', this.employees);
    console.log('Filtered lists:', {
      users: this.users,
      managers: this.managers,
      employeesList: this.employeesList
    });
  }

  // Remove employee from local list (for demo purposes)
  onEmployeeDeleted(emp: Employee) {
    if (!this.hasLocalUpdates) {
      this.employees = [...this.employees];
      this.hasLocalUpdates = true;
    }
    this.employees = this.employees.filter(e => e.id !== emp.id);
    this.updateFilteredLists(); // Update filtered arrays after deletion
    this.cdr.detectChanges(); // Force immediate view update
  }

  openAddOptions() {
    this.showAddOptionsModal = true;
  }

  closeAddOptionsModal() {
    this.showAddOptionsModal = false;
  }

  selectAddOption(userType: string) {
    this.showAddOptionsModal = false;
    this.openCreate(userType);
  }

  toggleExportDropdown() {
    this.showExportDropdown = !this.showExportDropdown;
  }

  print() {
    window.print();
  }

  export(format: string = 'csv') {
    switch (format) {
      case 'csv':
        this.exportToCSV();
        break;
      case 'pdf':
        this.exportToPDF();
        break;
      case 'excel':
        this.exportToExcel();
        break;
      case 'docx':
        this.exportToDOCX();
        break;
      default:
        this.exportToCSV();
    }
  }

  private exportToCSV() {
    const csvData = this.convertToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-management-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private exportToPDF() {
    // Create a simple HTML representation for PDF export
    const htmlContent = this.generateHTMLContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Admin Management Data</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .section-title { margin-top: 30px; font-size: 18px; color: #666; }
            </style>
          </head>
          <body>
            <h1>Admin Management Data</h1>
            ${htmlContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      // Use setTimeout to ensure content is loaded before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  private exportToExcel() {
    const csvData = this.convertToCSV();
    // Create Excel-compatible format
    const excelData = this.convertCSVToExcel(csvData);
    const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-management-data.xls';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private exportToDOCX() {
    const htmlContent = this.generateHTMLContent();
    // Create a simple DOCX-compatible format
    const docxContent = this.convertHTMLToDOCX(htmlContent);
    const blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-management-data.docx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(): string {
    const headers = ['SL.No', 'Name', 'Contact', 'Email', 'Department', 'Designation'];
    const rows = [];

    // Add users
    this.users.forEach((user, index) => {
      rows.push([
        index + 1,
        user.name,
        user.contactNo,
        user.email,
        this.getDepartmentName(user.departmentId),
        'User'
      ]);
    });

    // Add managers
    this.managers.forEach((manager, index) => {
      rows.push([
        this.users.length + index + 1,
        manager.name,
        manager.contactNo,
        manager.email,
        this.getDepartmentName(manager.departmentId),
        'Manager'
      ]);
    });

    // Add employees
    this.employeesList.forEach((employee, index) => {
      rows.push([
        this.users.length + this.managers.length + index + 1,
        employee.name,
        employee.contactNo,
        employee.email,
        this.getDepartmentName(employee.departmentId),
        'Employee'
      ]);
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
  }

  private generateHTMLContent(): string {
    let html = '';

    // Users section
    if (this.users.length > 0) {
      html += '<h2 class="section-title">👥 Users</h2>';
      html += '<table>';
      html += '<thead><tr><th>SL.No</th><th>Name</th><th>Contact</th><th>Email</th><th>Department</th></tr></thead>';
      html += '<tbody>';
      this.users.forEach((user, index) => {
        html += `<tr><td>${index + 1}</td><td>${user.name}</td><td>${user.contactNo}</td><td>${user.email}</td><td>${this.getDepartmentName(user.departmentId)}</td></tr>`;
      });
      html += '</tbody></table>';
    }

    // Managers section
    if (this.managers.length > 0) {
      html += '<h2 class="section-title">👔 Managers</h2>';
      html += '<table>';
      html += '<thead><tr><th>SL.No</th><th>Name</th><th>Contact</th><th>Email</th><th>Department</th></tr></thead>';
      html += '<tbody>';
      this.managers.forEach((manager, index) => {
        html += `<tr><td>${index + 1}</td><td>${manager.name}</td><td>${manager.contactNo}</td><td>${manager.email}</td><td>${this.getDepartmentName(manager.departmentId)}</td></tr>`;
      });
      html += '</tbody></table>';
    }

    // Employees section
    if (this.employeesList.length > 0) {
      html += '<h2 class="section-title">👷 Employees</h2>';
      html += '<table>';
      html += '<thead><tr><th>SL.No</th><th>Name</th><th>Contact</th><th>Email</th><th>Department</th></tr></thead>';
      html += '<tbody>';
      this.employeesList.forEach((employee, index) => {
        html += `<tr><td>${index + 1}</td><td>${employee.name}</td><td>${employee.contactNo}</td><td>${employee.email}</td><td>${this.getDepartmentName(employee.departmentId)}</td></tr>`;
      });
      html += '</tbody></table>';
    }

    return html;
  }

  private convertCSVToExcel(csvData: string): string {
    // Simple Excel XML format
    const rows = csvData.split('\n');
    let excelXML = '<?xml version="1.0"?>\n';
    excelXML += '<?mso-application progid="Excel.Sheet"?>\n';
    excelXML += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    excelXML += ' xmlns:o="urn:schemas-microsoft-com:office:office"\n';
    excelXML += ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n';
    excelXML += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    excelXML += ' <Worksheet ss:Name="Admin Data">\n';
    excelXML += '  <Table>\n';

    rows.forEach(row => {
      if (row.trim()) {
        const cells = row.split(',');
        excelXML += '   <Row>\n';
        cells.forEach(cell => {
          excelXML += `    <Cell><Data ss:Type="String">${cell.trim()}</Data></Cell>\n`;
        });
        excelXML += '   </Row>\n';
      }
    });

    excelXML += '  </Table>\n';
    excelXML += ' </Worksheet>\n';
    excelXML += '</Workbook>';

    return excelXML;
  }

  private convertHTMLToDOCX(htmlContent: string): string {
    // Simple DOCX XML format (minimal implementation)
    let docxXML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    docxXML += '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n';
    docxXML += ' <w:body>\n';
    docxXML += '  <w:p><w:r><w:t>Admin Management Data</w:t></w:r></w:p>\n';

    // Convert HTML tables to DOCX format
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
    const tables = doc.querySelectorAll('table');

    tables.forEach(table => {
      docxXML += '  <w:tbl>\n';
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        docxXML += '   <w:tr>\n';
        const cells = row.querySelectorAll('td, th');
        cells.forEach(cell => {
          docxXML += '    <w:tc><w:p><w:r><w:t>';
          docxXML += cell.textContent || '';
          docxXML += '</w:t></w:r></w:p></w:tc>\n';
        });
        docxXML += '   </w:tr>\n';
      });
      docxXML += '  </w:tbl>\n';
    });

    docxXML += ' </w:body>\n';
    docxXML += '</w:document>';

    return docxXML;
  }
}
