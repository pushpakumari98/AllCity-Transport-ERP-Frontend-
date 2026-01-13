import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../vehicle-management/drivers/services/driver.service';
import { Driver } from '../../vehicle-management/drivers/models/driver.model';
import { DriverModalComponent } from '../../vehicle-management/drivers/driver-modal/driver-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-driver-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule, DriverModalComponent],
  templateUrl: './driver-reports.component.html',
  styleUrls: ['./driver-reports.component.scss']
})
export class DriverReportsComponent implements OnInit {

  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  loading = false;
  selectedFilter = 'today';
  filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' }
  ];

  // Stats
  totalDrivers = 0;
  todayDrivers = 0;
  weekDrivers = 0;
  monthDrivers = 0;
  yearDrivers = 0;

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
  showConfirmationDialog = false;
  showDriverModal = false;
  editMode = false;
  selectedDriverForEdit?: Driver;
  selectedDriverForDelete?: Driver;

  constructor(private driverService: DriverService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers() {
    this.loading = true;
    this.driverService.getAllDrivers().subscribe({
      next: (res) => {
        console.log("DRIVER REPORTS:", res);
        // If backend returns empty data, load mock data
        if (!res || res.length === 0) {
          this.loadMockData();
        } else {
          this.drivers = res;
        }
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching drivers:", err);
        this.loadMockData();
        this.loading = false;
        this.snackBar.open('Loaded sample driver data for demo', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  private loadMockData() {
    this.drivers = [
      {
        id: 1,
        serialNumber: "DRV001",
        date: new Date().toISOString().split('T')[0], // Today
        vehicleNumber: "MH12-A1234",
        driverName: "Rajesh Kumar",
        startedFrom: "Mumbai",
        destination: "Delhi",
        carryMaterialType: "Electronics",
        contactNumber: "9876543210",
        address: "Andheri West, Mumbai"
      },
      {
        id: 2,
        serialNumber: "DRV002",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        vehicleNumber: "MH12-B5678",
        driverName: "Priya Sharma",
        startedFrom: "Pune",
        destination: "Bangalore",
        carryMaterialType: "Industrial Goods",
        contactNumber: "9876543211",
        address: "Koregaon Park, Pune"
      },
      {
        id: 3,
        serialNumber: "DRV003",
        date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], // Last week
        vehicleNumber: "MH12-C9012",
        driverName: "Amit Singh",
        startedFrom: "Ahmedabad",
        destination: "Mumbai",
        carryMaterialType: "Textiles",
        contactNumber: "9876543212",
        address: "Maninagar, Ahmedabad"
      }
    ];
    this.calculateStats();
    this.applyFilter();
  }

  calculateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    this.todayDrivers = this.drivers.filter(d => {
      const driverDate = new Date(d.date);
      driverDate.setHours(0, 0, 0, 0);
      return driverDate.getTime() === today.getTime();
    }).length;

    this.weekDrivers = this.drivers.filter(d => {
      const driverDate = new Date(d.date);
      driverDate.setHours(0, 0, 0, 0);
      return driverDate >= weekStart;
    }).length;

    this.monthDrivers = this.drivers.filter(d => {
      const driverDate = new Date(d.date);
      driverDate.setHours(0, 0, 0, 0);
      return driverDate >= monthStart;
    }).length;

    this.yearDrivers = this.drivers.filter(d => {
      const driverDate = new Date(d.date);
      driverDate.setHours(0, 0, 0, 0);
      return driverDate >= yearStart;
    }).length;

    this.totalDrivers = this.drivers.length;
  }

  applyFilter() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filterDate: Date;

    switch (this.selectedFilter) {
      case 'today':
        filterDate = today;
        this.filteredDrivers = this.drivers.filter(d => {
          const driverDate = new Date(d.date);
          driverDate.setHours(0, 0, 0, 0);
          return driverDate.getTime() === filterDate.getTime();
        });
        break;
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        this.filteredDrivers = this.drivers.filter(d => {
          const driverDate = new Date(d.date);
          driverDate.setHours(0, 0, 0, 0);
          return driverDate >= weekStart;
        });
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filteredDrivers = this.drivers.filter(d => {
          const driverDate = new Date(d.date);
          driverDate.setHours(0, 0, 0, 0);
          return driverDate >= monthStart;
        });
        break;
      case 'thisYear':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        this.filteredDrivers = this.drivers.filter(d => {
          const driverDate = new Date(d.date);
          driverDate.setHours(0, 0, 0, 0);
          return driverDate >= yearStart;
        });
        break;
      default:
        this.filteredDrivers = [...this.drivers];
    }
  }

  onFilterChange() {
    this.applyFilter();
  }

  // Export methods
  exportToCSV() {
    if (this.filteredDrivers.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    const data = this.filteredDrivers.map(driver => [
      driver.serialNumber || '',
      driver.driverName || '',
      driver.vehicleNumber || '',
      driver.contactNumber || '',
      driver.startedFrom || '',
      driver.destination || '',
      driver.carryMaterialType || '',
      driver.address || '',
      driver.date || ''
    ]);

    const headers = ['Serial Number', 'Driver Name', 'Vehicle Number', 'Contact Number', 'From Location', 'Destination', 'Material Type', 'Address', 'Registration Date'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'driver-reports.csv';
    link.click();

    this.snackBar.open('CSV exported successfully!', '', { duration: 3000 });
  }

  exportToExcel() {
    try {
      // Prepare data for Excel
      const headers = [
        { A: 'Report Type', B: 'Driver Report' },
        { A: 'Generated Date', B: new Date().toLocaleDateString() },
        { A: 'Time Period', B: this.filterOptions.find(f => f.value === this.selectedFilter)?.label || 'All Time' },
        { A: 'Total Records', B: this.filteredDrivers.length },
        { A: '', B: '' }, // Empty row
        { A: 'Sr.No', B: 'Serial Number', C: 'Driver Name', D: 'Vehicle Number', E: 'Contact Number' },
        { A: '', B: 'From Location', C: 'Destination', D: 'Material Type', E: 'Address' },
        { A: '', B: 'Registration Date', C: '', D: '', E: '' },
        { A: '', B: '', C: '', D: '', E: '' } // Empty row before data
      ];

      // Add driver data
      const driverData = this.filteredDrivers.map((driver, index) => ({
        A: index + 1,
        B: driver.serialNumber,
        C: driver.driverName,
        D: driver.vehicleNumber,
        E: driver.contactNumber,
        F: driver.startedFrom,
        G: driver.destination,
        H: driver.carryMaterialType,
        I: driver.address,
        J: driver.date
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
        ...driverData
      ];

      // Create workbook and worksheet
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData, { header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], skipHeader: true });

      // Set column widths
      const colWidths = [
        { wch: 8 },   // A - Sr.No
        { wch: 15 },  // B - Serial Number
        { wch: 20 },  // C - Driver Name
        { wch: 15 },  // D - Vehicle Number
        { wch: 15 },  // E - Contact Number
        { wch: 12 },  // F - From Location
        { wch: 12 },  // G - Destination
        { wch: 15 },  // H - Material Type
        { wch: 25 },  // I - Address
        { wch: 15 }   // J - Registration Date
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
      for (let col = 0; col <= 9; col++) {
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
        for (let col = 0; col <= 9; col++) {
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
      XLSX.utils.book_append_sheet(wb, ws, 'Driver Report');

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `Driver_Report_${this.selectedFilter}_${timestamp}.xlsx`;

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

  exportToPDF() {
    if (this.filteredDrivers.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Driver Reports', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('Sr.No | Serial No | Driver Name | Vehicle No | Contact', 20, y);
      y += 20;
      this.filteredDrivers.forEach((driver, index) => {
        pdf.text(`${index + 1} | ${driver.serialNumber} | ${driver.driverName} | ${driver.vehicleNumber} | ${driver.contactNumber}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('driver-reports.pdf');
      this.snackBar.open('PDF exported successfully!', '', { duration: 3000 });
    }).catch(error => {
      console.error('PDF export error:', error);
      this.snackBar.open('Error exporting to PDF. Please try again.', '', { duration: 3000 });
    });
  }

  exportToDocx() {
    if (this.filteredDrivers.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    try {
      const htmlContent = `
        <html>
          <head><title>AllCity Transport - Driver Reports</title></head>
          <body>
            <h1>AllCity Transport - Driver Report</h1>
            <table border="1" style="border-collapse: collapse;">
              <tr>
                <th>Sr.No</th><th>Serial Number</th><th>Driver Name</th><th>Vehicle Number</th><th>Contact Number</th><th>From Location</th><th>Destination</th><th>Material Type</th><th>Address</th><th>Registration Date</th>
              </tr>
              ${this.filteredDrivers.map((driver, index) => `<tr><td>${index + 1}</td><td>${driver.serialNumber}</td><td>${driver.driverName}</td><td>${driver.vehicleNumber}</td><td>${driver.contactNumber}</td><td>${driver.startedFrom}</td><td>${driver.destination}</td><td>${driver.carryMaterialType}</td><td>${driver.address}</td><td>${driver.date}</td></tr>`).join('')}
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'driver-reports.doc';
      link.click();

      this.snackBar.open('DOCX exported successfully!', '', { duration: 3000 });
    } catch (error) {
      console.error('DOCX export error:', error);
      this.snackBar.open('Error exporting to DOCX. Please try again.', '', { duration: 3000 });
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
          <title>Driver Report - ${this.selectedFilter}</title>
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
          <h2 class="report-title">Driver Report - ${this.filterOptions.find(f => f.value === this.selectedFilter)?.label || 'All Drivers'}</h2>

          <!-- Report Info -->
          <table class="table" style="margin-bottom: 20px; width: 50%;">
            <tr>
              <td><strong>Total Drivers:</strong> ${this.filteredDrivers.length}</td>
              <td><strong>Generated Date:</strong> ${new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Report Period:</strong> ${this.filterOptions.find(f => f.value === this.selectedFilter)?.label || 'All Time'}</td>
              <td><strong>Report Type:</strong> Driver Information Summary</td>
            </tr>
          </table>

          <!-- Driver Table -->
          <table class="table">
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Serial No</th>
                <th>Driver Name</th>
                <th>Vehicle No</th>
                <th>Contact</th>
                <th>From</th>
                <th>To</th>
                <th>Material</th>
                <th>Address</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredDrivers.map((driver, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${driver.serialNumber}</td>
                  <td>${driver.driverName}</td>
                  <td>${driver.vehicleNumber}</td>
                  <td>${driver.contactNumber}</td>
                  <td>${driver.startedFrom}</td>
                  <td>${driver.destination}</td>
                  <td>${driver.carryMaterialType}</td>
                  <td>${driver.address}</td>
                  <td>${driver.date}</td>
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

  // Edit and Delete methods
  editDriver(driver: Driver) {
    this.selectedDriverForEdit = driver;
    this.editMode = true;
    this.showDriverModal = true;
  }

  deleteDriver(driver: Driver) {
    this.selectedDriverForDelete = driver;
    this.showConfirmationDialog = true;
  }

  onConfirmDelete() {
    if (this.selectedDriverForDelete) {
      // For demo purposes, remove from local array
      this.drivers = this.drivers.filter(d => d.id !== this.selectedDriverForDelete!.id);
      this.filteredDrivers = this.filteredDrivers.filter(d => d.id !== this.selectedDriverForDelete!.id);
      this.snackBar.open('Driver deleted successfully', '', { duration: 3000 });
      this.calculateStats(); // Recalculate stats after deletion
    }
    this.showConfirmationDialog = false;
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.selectedDriverForDelete = undefined;
  }

  // Modal event handlers
  onDriverSaved(driver: any) {
    if (this.editMode) {
      // Update existing driver
      const index = this.drivers.findIndex(d => d.id === driver.id);
      if (index !== -1) {
        this.drivers[index] = driver;
        // Also update in filtered array
        const filteredIndex = this.filteredDrivers.findIndex(d => d.id === driver.id);
        if (filteredIndex !== -1) {
          this.filteredDrivers[filteredIndex] = driver;
        }
      }
    } else {
      // Add new driver (though we don't create new from reports page)
      this.drivers.push(driver);
    }

    this.snackBar.open('Driver updated successfully!', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });

    this.closeDriverModal();
  }

  closeDriverModal() {
    this.showDriverModal = false;
    this.selectedDriverForEdit = undefined;
    this.editMode = false;
  }
}
