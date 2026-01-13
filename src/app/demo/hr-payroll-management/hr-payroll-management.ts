import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// Interfaces for leave management
interface LeaveType {
  id: number;
  name: string;
  maxDaysPerYear: number;
  description: string;
  status: 'Active' | 'Inactive';
}

interface LeaveApplication {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

interface Employee {
  id: number;
  name: string;
  designation?: string;
}

@Component({
  selector: 'app-hr-payroll-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './hr-payroll-management.html',
  styleUrls: ['./hr-payroll-management.scss']
})
export class HrPayrollManagement implements OnInit {

  // Mock employee data - in real app this would come from service
  employees: Employee[] = [
    { id: 1, name: 'John Doe', designation: 'Employee' },
    { id: 2, name: 'Jane Smith', designation: 'Manager' },
    { id: 3, name: 'Bob Johnson', designation: 'Employee' },
    { id: 4, name: 'Alice Brown', designation: 'User' },
    { id: 5, name: 'Charlie Wilson', designation: 'Employee' }
  ];

  // Leave management properties
  leaveTypes: LeaveType[] = [];
  leaveApplications: LeaveApplication[] = [];
  showLeaveApplicationModal = false;
  showLeaveTypesModal = false;
  showConfirmationDialog = false;
  showExportDropdown = false;
  leaveApplicationForm: FormGroup;
  leaveTypeForm: FormGroup;
  editMode = false;
  selectedLeaveApplication?: LeaveApplication;
  selectedLeaveApplicationToDelete?: LeaveApplication;
  private nextLeaveTypeId = 1;
  private nextLeaveApplicationId = 1;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForms();
    this.loadDefaultLeaveTypes();
  }

  // Initialize forms for leave management
  private initializeForms() {
    this.leaveApplicationForm = this.fb.group({
      employeeId: [null, Validators.required],
      leaveTypeId: [null, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required]
    });

    this.leaveTypeForm = this.fb.group({
      name: ['', Validators.required],
      maxDaysPerYear: [null, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required]
    });
  }

  // Load default leave types
  private loadDefaultLeaveTypes() {
    this.leaveTypes = [
      {
        id: this.nextLeaveTypeId++,
        name: 'Annual Leave',
        maxDaysPerYear: 30,
        description: 'Regular annual leave entitlement',
        status: 'Active'
      },
      {
        id: this.nextLeaveTypeId++,
        name: 'Casual Leave',
        maxDaysPerYear: 12,
        description: 'Short-term personal leave',
        status: 'Active'
      },
      {
        id: this.nextLeaveTypeId++,
        name: 'Maternity Leave',
        maxDaysPerYear: 180,
        description: 'Leave for new mothers',
        status: 'Active'
      },
      {
        id: this.nextLeaveTypeId++,
        name: 'Paternity Leave',
        maxDaysPerYear: 15,
        description: 'Leave for new fathers',
        status: 'Active'
      },
      {
        id: this.nextLeaveTypeId++,
        name: 'Sick Leave',
        maxDaysPerYear: 12,
        description: 'Medical leave for illness',
        status: 'Active'
      }
    ];
  }

  // Leave management methods
  openLeaveApplicationModal() {
    this.leaveApplicationForm.reset();
    this.showLeaveApplicationModal = true;
  }

  closeLeaveApplicationModal() {
    this.showLeaveApplicationModal = false;
  }

  submitLeaveApplication() {
    if (this.leaveApplicationForm.invalid) {
      alert('Please fill all required fields!');
      return;
    }

    const formValue = this.leaveApplicationForm.value;
    const employee = this.employees.find(emp => emp.id === formValue.employeeId);
    const leaveType = this.leaveTypes.find(lt => lt.id === formValue.leaveTypeId);

    if (!employee || !leaveType) {
      alert('Invalid employee or leave type selected!');
      return;
    }

    const leaveApplication: LeaveApplication = {
      id: this.nextLeaveApplicationId++,
      employeeId: employee.id,
      employeeName: employee.name,
      leaveTypeId: leaveType.id,
      leaveTypeName: leaveType.name,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      reason: formValue.reason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    this.leaveApplications.push(leaveApplication);
    alert('Leave application submitted successfully!');
    this.closeLeaveApplicationModal();
  }

  openLeaveTypesModal() {
    this.leaveTypeForm.reset();
    this.showLeaveTypesModal = true;
  }

  closeLeaveTypesModal() {
    this.showLeaveTypesModal = false;
  }

  addLeaveType() {
    if (this.leaveTypeForm.invalid) {
      alert('Please fill all required fields!');
      return;
    }

    const formValue = this.leaveTypeForm.value;
    const newLeaveType: LeaveType = {
      id: this.nextLeaveTypeId++,
      name: formValue.name,
      maxDaysPerYear: formValue.maxDaysPerYear,
      description: formValue.description,
      status: 'Active'
    };

    this.leaveTypes.push(newLeaveType);
    alert('Leave type added successfully!');
    this.closeLeaveTypesModal();
  }

  getEmployeeName(id: number): string {
    const employee = this.employees.find(emp => emp.id === id);
    return employee ? employee.name : 'Unknown';
  }

  getLeaveTypeName(id: number): string {
    const leaveType = this.leaveTypes.find(lt => lt.id === id);
    return leaveType ? leaveType.name : 'Unknown';
  }

  toggleExportDropdown() {
    this.showExportDropdown = !this.showExportDropdown;
  }

  printLeaveApplications() {
    window.print();
  }

  exportLeaveApplications(format: string = 'csv') {
    switch (format) {
      case 'csv':
        this.exportLeaveApplicationsToCSV();
        break;
      case 'pdf':
        this.exportLeaveApplicationsToPDF();
        break;
      case 'excel':
        this.exportLeaveApplicationsToExcel();
        break;
      case 'docx':
        this.exportLeaveApplicationsToDOCX();
        break;
      default:
        this.exportLeaveApplicationsToCSV();
    }
  }

  private exportLeaveApplicationsToCSV() {
    const csvData = this.convertLeaveApplicationsToCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave-applications.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private exportLeaveApplicationsToPDF() {
    const htmlContent = this.generateLeaveApplicationsHTMLContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Leave Applications Data</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Leave Applications Data</h1>
            ${htmlContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  private exportLeaveApplicationsToExcel() {
    const csvData = this.convertLeaveApplicationsToCSV();
    const excelData = this.convertCSVToExcel(csvData);
    const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave-applications.xls';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private exportLeaveApplicationsToDOCX() {
    const htmlContent = this.generateLeaveApplicationsHTMLContent();
    const docxContent = this.convertHTMLToDOCX(htmlContent);
    const blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave-applications.docx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private convertLeaveApplicationsToCSV(): string {
    const headers = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Applied Date'];
    const rows = [];

    this.leaveApplications.forEach((application) => {
      rows.push([
        application.employeeName,
        application.leaveTypeName,
        application.startDate,
        application.endDate,
        application.reason,
        application.status,
        application.appliedDate
      ]);
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    return csvContent;
  }

  private generateLeaveApplicationsHTMLContent(): string {
    let html = '';

    if (this.leaveApplications.length > 0) {
      html += '<table>';
      html += '<thead><tr><th>Employee</th><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Reason</th><th>Status</th><th>Applied Date</th></tr></thead>';
      html += '<tbody>';
      this.leaveApplications.forEach((application) => {
        html += `<tr><td>${application.employeeName}</td><td>${application.leaveTypeName}</td><td>${application.startDate}</td><td>${application.endDate}</td><td>${application.reason}</td><td>${application.status}</td><td>${application.appliedDate}</td></tr>`;
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
    excelXML += ' <Worksheet ss:Name="Leave Applications">\n';
    excelXML += '  <Table>\n';

    rows.forEach(row => {
      if (row.trim()) {
        const cells = row.split(',');
        excelXML += '   <Row>\n';
        cells.forEach(cell => {
          // Remove quotes from CSV data for Excel
          const cleanCell = cell.replace(/^"|"$/g, '');
          excelXML += `    <Cell><Data ss:Type="String">${cleanCell}</Data></Cell>\n`;
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
    docxXML += '  <w:p><w:r><w:t>Leave Applications Data</w:t></w:r></w:p>\n';

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
