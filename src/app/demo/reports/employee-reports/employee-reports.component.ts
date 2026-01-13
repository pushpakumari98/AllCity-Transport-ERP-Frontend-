import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { AdminService, Employee } from '../../admin-management/admin.service';
import { ConfirmationDialogComponent } from '../../admin-management/confirmation-dialog/confirmation-dialog.component';
import { EmployeeModalComponent } from '../../admin-management/employee-modal/employee-modal.component';

@Component({
  selector: 'app-employee-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent, EmployeeModalComponent],
  templateUrl: './employee-reports.component.html',
  styleUrls: ['./employee-reports.component.scss']
})
export class EmployeeReportsComponent implements OnInit {

  employees: Employee[] = [];
  employeesList: Employee[] = [];
  departments: any[] = [];
  filteredEmployees: Employee[] = [];
  loading = false;
  selectedFilter = 'today';
  filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' }
  ];

  // Stats
  todayEmployees = 0;
  weekEmployees = 0;
  monthEmployees = 0;
  yearEmployees = 0;

  // Company details for print/bill layout
  companyDetails = {
    name: 'AllCity Transport Services',
    address: '123 Transport Hub, City Center',
    phone: '+91 98765 43210',
    email: 'contact@allcitytransport.com',
    website: 'www.allcitytransport.com',
    gstNo: 'GSTIN: 22AAAAA0000A1Z5'
  };

  // Modal properties
  showEmployeeList = true;
  showConfirmationDialog = false;
  showEmployeeModal = false;
  employeeModalEditMode = false;
  selectedEmployeeForModal: Employee | null = null;

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees() {
    this.loading = true;
    // Since we don't have a join date in the model, we'll treat all as "this year" for demo
    this.adminService.getEmployees().subscribe({
      next: (res) => {
        this.employees = res;
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching employees:", err);
        this.loadMockData();
        this.loading = false;
        this.snackBar.open('Loaded sample employee data for demo', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  loadDepartments() {
    this.adminService.getDepartments().subscribe({
      next: (res) => {
        this.departments = res;
      },
      error: (err) => {
        this.departments = [
          { id: 1, name: 'Human Resources' },
          { id: 2, name: 'Operations' },
          { id: 3, name: 'Finance' },
          { id: 4, name: 'Management' }
        ];
      }
    });
  }

  private loadMockData() {
    this.employees = [
      {
        id: 1,
        name: "Rajesh Kumar",
        contactNo: "9876543210",
        email: "rajesh@allcity.com",
        designation: "Manager",
        departmentId: 4,
        role: 4,
        dateOfJoining: "2023-01-15",
        qualificationDocument: "rajesh_cv.pdf"
      },
      {
        id: 2,
        name: "Priya Sharma",
        contactNo: "9876543211",
        email: "priya@allcity.com",
        designation: "HR Executive",
        departmentId: 1,
        role: 1,
        dateOfJoining: "2023-03-20",
        qualificationDocument: "priya_cv.pdf"
      },
      {
        id: 3,
        name: "Amit Singh",
        contactNo: "9876543212",
        email: "amit@allcity.com",
        designation: "Operations Manager",
        departmentId: 4,
        role: 4,
        dateOfJoining: "2022-11-10",
        qualificationDocument: "amit_cv.pdf"
      },
      {
        id: 4,
        name: "Sneha Patel",
        contactNo: "9876543213",
        email: "sneha@allcity.com",
        designation: "Accountant",
        departmentId: 3,
        role: 1,
        dateOfJoining: "2023-05-08",
        qualificationDocument: "sneha_cv.pdf"
      },
      {
        id: 5,
        name: "Vikram Rao",
        contactNo: "9876543214",
        email: "vikram@allcity.com",
        designation: "Operations Supervisor",
        departmentId: 2,
        role: 6,
        dateOfJoining: "2023-02-28",
        qualificationDocument: "vikram_cv.pdf"
      }
    ];
    this.calculateStats();
    this.applyFilter();
  }

  calculateStats() {
    // For demo purposes, distribute employees across periods
    this.todayEmployees = 1;
    this.weekEmployees = 2;
    this.monthEmployees = 3;
    this.yearEmployees = this.employees.length;
  }

  applyFilter() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.selectedFilter) {
      case 'today':
        // Show only 1st employee for demo
        this.filteredEmployees = this.employees.slice(0, 1);
        break;
      case 'thisWeek':
        // Show first 2 employees for demo
        this.filteredEmployees = this.employees.slice(0, 2);
        break;
      case 'thisMonth':
        // Show first 3 employees for demo
        this.filteredEmployees = this.employees.slice(0, 3);
        break;
      case 'thisYear':
        // Show all employees
        this.filteredEmployees = [...this.employees];
        break;
      default:
        this.filteredEmployees = [...this.employees];
    }
  }

  onFilterChange() {
    this.applyFilter();
  }

  getDepartmentName(departmentId: number): string {
    const dept = this.departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown';
  }

  // Export methods
  exportToCSV() {
    if (this.filteredEmployees.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    const data = this.filteredEmployees.map(employee => [
      employee.id || '',
      employee.name || '',
      employee.contactNo || '',
      employee.email || '',
      employee.designation || '',
      this.getDepartmentName(employee.departmentId) || ''
    ]);

    const headers = ['ID', 'Employee Name', 'Contact Number', 'Email', 'Designation', 'Department'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'employee-reports.csv';
    link.click();

    this.snackBar.open('CSV exported successfully!', '', { duration: 3000 });
  }

  exportToPDF() {
    if (this.filteredEmployees.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Employee Reports', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('ID | Employee Name | Contact | Email | Designation', 20, y);
      y += 20;
      this.filteredEmployees.forEach(employee => {
        pdf.text(`${employee.id} | ${employee.name} | ${employee.contactNo} | ${employee.email} | ${employee.designation}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('employee-reports.pdf');
      this.snackBar.open('PDF exported successfully!', '', { duration: 3000 });
    }).catch(error => {
      console.error('PDF export error:', error);
      this.snackBar.open('Error exporting to PDF. Please try again.', '', { duration: 3000 });
    });
  }

  exportToDocx() {
    if (this.filteredEmployees.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    try {
      const htmlContent = `
        <html>
          <head><title>AllCity Transport - Employee Reports</title></head>
          <body>
            <h1>AllCity Transport - Employee Report</h1>
            <table border="1" style="border-collapse: collapse;">
              <tr>
                <th>ID</th><th>Employee Name</th><th>Contact Number</th><th>Email</th><th>Designation</th><th>Department</th>
              </tr>
              ${this.filteredEmployees.map(employee => `<tr><td>${employee.id}</td><td>${employee.name}</td><td>${employee.contactNo}</td><td>${employee.email}</td><td>${employee.designation}</td><td>${this.getDepartmentName(employee.departmentId)}</td></tr>`).join('')}
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'employee-reports.doc';
      link.click();

      this.snackBar.open('DOCX exported successfully!', '', { duration: 3000 });
    } catch (error) {
      console.error('DOCX export error:', error);
      this.snackBar.open('Error exporting to DOCX. Please try again.', '', { duration: 3000 });
    }
  }

  // Excel Export with Professional Formatting
  exportToExcel() {
    try {
      // Prepare data for Excel
      const headers = [
        { A: 'Report Type', B: 'Employee Report' },
        { A: 'Generated Date', B: new Date().toLocaleDateString() },
        { A: 'Time Period', B: this.filterOptions.find(f => f.value === this.selectedFilter)?.label || 'All Time' },
        { A: 'Total Records', B: this.filteredEmployees.length },
        { A: '', B: '' }, // Empty row
        { A: 'Sr.No', B: 'Employee ID', C: 'Employee Name', D: 'Designation', E: 'Department' },
        { A: '', B: 'Contact Number', C: 'Email Address', D: '', E: '' },
        { A: '', B: '', C: '', D: '', E: '' } // Empty row before data
      ];

      // Add employee data
      const employeeData = this.filteredEmployees.map((employee, index) => ({
        A: index + 1,
        B: employee.id,
        C: employee.name,
        D: employee.designation,
        E: this.getDepartmentName(employee.departmentId),
        F: employee.contactNo,
        G: employee.email
      }));

      // Company header data
      const companyHeader = [
        { A: 'AllCity Transport Services', B: '', C: '', D: '', E: '' },
        { A: '123 Transport Hub, City Center', B: '', C: '', D: '', E: '' },
        { A: 'Phone: +91 98765 43210 | Email: contact@allcitytransport.com', B: '', C: '', D: '', E: '' },
        { A: 'GSTIN: 22AAAAA0000A1Z5', B: '', C: '', D: '', E: '' },
        { A: '', B: '', C: '', D: '', E: '' } // Empty row
      ];

      // Combine all data
      const excelData = [
        ...companyHeader,
        ...headers,
        ...employeeData
      ];

      // Create workbook and worksheet
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData, { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skipHeader: true });

      // Set column widths
      const colWidths = [
        { wch: 8 },   // A - Sr.No
        { wch: 12 },  // B - Employee ID
        { wch: 20 },  // C - Employee Name
        { wch: 15 },  // D - Designation
        { wch: 15 },  // E - Department
        { wch: 15 },  // F - Contact Number
        { wch: 25 }   // G - Email Address
      ];
      ws['!cols'] = colWidths;

      // Style the cells (limited styling possible with xlsx)
      // Company header styling (rows 1-4)
      if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 14, color: { rgb: 'FF000000' } } };
      if (ws['A2']) ws['A2'].s = { font: { sz: 11, color: { rgb: 'FF666666' } } };
      if (ws['A3']) ws['A3'].s = { font: { sz: 11, color: { rgb: 'FF666666' } } };
      if (ws['A4']) ws['A4'].s = { font: { sz: 11, color: { rgb: 'FF666666' } } };

      // Report info styling (rows 6-9)
      const reportInfoRows = [6, 7, 8, 9];
      reportInfoRows.forEach(rowNum => {
        const cellA = `A${rowNum}`;
        if (ws[cellA]) {
          ws[cellA].s = { font: { bold: true, color: { rgb: 'FF2C3E50' } } };
        }
      });

      // Header styling (rows 10-11)
      for (let col = 0; col <= 6; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 10, c: col });
        const cellRef2 = XLSX.utils.encode_cell({ r: 11, c: col });
        if (ws[cellRef]) {
          ws[cellRef].s = { fill: { fgColor: { rgb: 'FF007BFF' } }, font: { bold: true, color: { rgb: 'FFFFFFFF' } } };
        }
        if (ws[cellRef2] && ws[cellRef2].v) {
          ws[cellRef2].s = { fill: { fgColor: { rgb: 'FF007BFF' } }, font: { bold: true, color: { rgb: 'FFFFFFFF' } } };
        }
      }

      // Data rows styling (starting from row 12)
      for (let rowIdx = 12; rowIdx <= excelData.length; rowIdx++) {
        for (let col = 0; col <= 6; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: rowIdx - 1, c: col });
          if (ws[cellRef]) {
            ws[cellRef].s = {
              border: {
                top: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
                bottom: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
                left: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
                right: { style: 'thin', color: { rgb: 'FFCCCCCC' } }
              }
            };
          }
        }
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Employee Report');

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `Employee_Report_${this.selectedFilter}_${timestamp}.xlsx`;

      // Save the file
      XLSX.writeFile(wb, filename);

      this.snackBar.open(`Excel file "${filename}" downloaded successfully!`, 'Open Download', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });

    } catch (error) {
      console.error('Excel export error:', error);
      this.snackBar.open('Error exporting to Excel. Please try again.', '', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
    }
  }

  // Print functionality
  printReport() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = this.generatePrintContent();

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  private generatePrintContent(): string {
    const logoUrl = 'assets/logo/logo.jpg';
    const watermarkUrl = 'assets/logo/logo.jpg';

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Employee Report - ${this.selectedFilter}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            @media print {
              body { font-size: 12px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-details { margin-bottom: 20px; }
              .logo { width: 100px; height: auto; }
              .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                opacity: 0.1;
                z-index: -1;
                width: 300px;
                height: auto;
              }
              .table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              .table th, .table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              .table th {
                background-color: #007bff;
                color: white;
                font-weight: bold;
                text-align: center;
              }
              .report-title { font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; }
              .bill-footer { margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
              .contact-info { font-size: 10px; color: #666; }
            }
          </style>
        </head>
        <body>
          <!-- Watermark -->
          <img src="${watermarkUrl}" alt="Watermark" class="watermark">

          <!-- Header -->
          <div class="header">
            <img src="${logoUrl}" alt="Company Logo" class="logo">
            <h1>${this.companyDetails.name}</h1>
            <div class="company-details">
              <p>${this.companyDetails.address}</p>
              <p>Phone: ${this.companyDetails.phone} | Email: ${this.companyDetails.email}</p>
              <p>GST No: ${this.companyDetails.gstNo}</p>
            </div>
          </div>

          <!-- Report Title -->
          <h2 class="report-title">Employee Report - ${this.filterOptions.find(f => f.value === this.selectedFilter)?.label || 'All Employees'}</h2>

          <!-- Report Info -->
          <table class="table" style="margin-bottom: 20px; width: 50%;">
            <tr>
              <td><strong>Total Employees:</strong> ${this.filteredEmployees.length}</td>
              <td><strong>Generated Date:</strong> ${new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Report Period:</strong> ${this.filterOptions.find(f => f.value === this.selectedFilter)?.label || 'All Time'}</td>
              <td><strong>Report Type:</strong> Employee Information Summary</td>
            </tr>
          </table>

          <!-- Employee Table -->
          <table class="table">
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>ID</th>
                <th>Employee Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Contact Number</th>
                <th>Email Address</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredEmployees.map((employee, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${employee.id}</td>
                  <td>${employee.name}</td>
                  <td>${employee.designation}</td>
                  <td>${this.getDepartmentName(employee.departmentId)}</td>
                  <td>${employee.contactNo}</td>
                  <td>${employee.email}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Footer -->
          <div class="bill-footer">
            <div class="contact-info">
              <p><strong>Contact Information:</strong></p>
              <p>Address: ${this.companyDetails.address}</p>
              <p>Phone: ${this.companyDetails.phone} | Email: ${this.companyDetails.email}</p>
              <p>Website: ${this.companyDetails.website}</p>
              <p><em>Thank you for choosing ${this.companyDetails.name}</em></p>
              <p><small>This is a system generated report</small></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Modal methods
  onConfirmDelete() {
    if (this.selectedEmployeeForModal) {
      // For demo purposes, just remove from local array
      this.employees = this.employees.filter(emp => emp.id !== this.selectedEmployeeForModal!.id);
      this.filteredEmployees = this.filteredEmployees.filter(emp => emp.id !== this.selectedEmployeeForModal!.id);
      this.snackBar.open('Employee deleted successfully', '', { duration: 3000 });
    }
    this.showConfirmationDialog = false;
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
  }

  closeEmployeeModal() {
    this.showEmployeeModal = false;
    this.selectedEmployeeForModal = null;
  }

  onEmployeeModalSaved(employee: Employee) {
    if (this.employeeModalEditMode) {
      // Update existing employee
      const index = this.employees.findIndex(emp => emp.id === employee.id);
      if (index !== -1) {
        this.employees[index] = employee;
      }
    } else {
      // Add new employee
      employee.id = Math.max(...this.employees.map(e => e.id || 0)) + 1;
      this.employees.push(employee);
    }
    this.applyFilter();
    this.closeEmployeeModal();
  }

  // Additional methods for employee management
  editEmployee(employee: Employee) {
    this.selectedEmployeeForModal = { ...employee };
    this.employeeModalEditMode = true;
    this.showEmployeeModal = true;
  }

  deleteEmployee(employee: Employee) {
    this.selectedEmployeeForModal = employee;
    this.showConfirmationDialog = true;
  }

  addEmployee() {
    this.selectedEmployeeForModal = null;
    this.employeeModalEditMode = false;
    this.showEmployeeModal = true;
  }
}
