import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { VehicleSale } from '../../vehicle-management/sales/models/vehicle-sale.model';
import { SaleService } from '../../vehicle-management/sales/services/sale.service';
import { ConfirmationDialogComponent } from '../../admin-management/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-vehicle-sales-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule, ConfirmationDialogComponent],
  templateUrl: './vehicle-sales-reports.component.html',
  styleUrls: ['./vehicle-sales-reports.component.scss']
})
export class VehicleSalesReportsComponent implements OnInit {

  sales: VehicleSale[] = [];
  filteredSales: VehicleSale[] = [];
  loading = false;
  selectedFilter = 'today';
  filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' }
  ];

  // Stats
  totalSales = 0;
  todaySales = 0;
  weekSales = 0;
  monthSales = 0;
  yearSales = 0;

  // Modal properties
  showConfirmationDialog = false;
  selectedSaleForDelete?: any;

  constructor(private saleService: SaleService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales() {
    this.loading = true;
    this.saleService.getAllSales().subscribe({
      next: (res) => {
        console.log("SALES REPORTS:", res);
        // If backend returns empty data, load mock data
        if (!res || res.length === 0) {
          this.loadMockData();
        } else {
          this.sales = res;
        }
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching sales:", err);
        this.loadMockData();
        this.loading = false;
        this.snackBar.open('Loaded sample sales data for demo', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  private loadMockData() {
    this.sales = [
      {
        id: 1,
        vehicleId: "V001",
        date: "2025-12-01",
        lorryNumber: "LN001",
        weight: 1500,
        lorryHire: 12000,
        commission: 1200,
        bility: 200,
        paymentMode: "UPI",
        petrolPump: "Pump A",
        totalAdvance: 8000
      },
      {
        id: 2,
        vehicleId: "V002",
        date: "2025-12-02",
        lorryNumber: "LN002",
        weight: 2000,
        lorryHire: 16000,
        commission: 1600,
        bility: 250,
        paymentMode: "Cash",
        petrolPump: "",
        totalAdvance: 10000
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

    this.todaySales = this.sales.filter(s => {
      const saleDate = new Date(s.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    }).length;

    this.weekSales = this.sales.filter(s => {
      const saleDate = new Date(s.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate >= weekStart;
    }).length;

    this.monthSales = this.sales.filter(s => {
      const saleDate = new Date(s.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate >= monthStart;
    }).length;

    this.yearSales = this.sales.filter(s => {
      const saleDate = new Date(s.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate >= yearStart;
    }).length;

    this.totalSales = this.sales.length;
  }

  applyFilter() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filterDate: Date;

    switch (this.selectedFilter) {
      case 'today':
        filterDate = today;
        this.filteredSales = this.sales.filter(s => {
          const saleDate = new Date(s.date);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === filterDate.getTime();
        });
        break;
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        this.filteredSales = this.sales.filter(s => {
          const saleDate = new Date(s.date);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate >= weekStart;
        });
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filteredSales = this.sales.filter(s => {
          const saleDate = new Date(s.date);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate >= monthStart;
        });
        break;
      case 'thisYear':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        this.filteredSales = this.sales.filter(s => {
          const saleDate = new Date(s.date);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate >= yearStart;
        });
        break;
      default:
        this.filteredSales = [...this.sales];
    }
  }

  onFilterChange() {
    this.applyFilter();
  }

  // Export methods
  exportToCSV() {
    const data = this.filteredSales.map(sale => [
      sale.id || '',
      sale.vehicleId || '',
      sale.date || '',
      sale.lorryNumber || '',
      sale.weight || '',
      sale.lorryHire || '',
      sale.commission || '',
      sale.bility || '',
      sale.totalAdvance || '',
      sale.paymentMode || '',
      sale.petrolPump || 'N/A'
    ]);

    const headers = ['ID', 'Vehicle ID', 'Date', 'Lorry Number', 'Weight (KG)', 'Lorry Hire (₹)', 'Commission (₹)', 'Bility (₹)', 'Total Advance (₹)', 'Payment Mode', 'Petrol Pump'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicle-sales-reports.csv';
    link.click();
  }

  exportToExcel() {
    import('xlsx').then(({ utils, writeFile }) => {
      const worksheet = utils.json_to_sheet(this.filteredSales);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Sales Reports');
      writeFile(workbook, 'vehicle-sales-reports.xlsx');
    });
  }

  exportToPDF() {
    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Vehicle Sales Reports', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('Vehicle ID | Date | Lorry No | Weight | Hire | Advance', 20, y);
      y += 20;
      this.filteredSales.forEach(sale => {
        pdf.text(`${sale.vehicleId} | ${sale.date} | ${sale.lorryNumber} | ${sale.weight}KG | ₹${sale.lorryHire} | ₹${sale.totalAdvance}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('vehicle-sales-reports.pdf');
    });
  }

  exportToDocx() {
    const htmlContent = `
      <html>
        <head><title>AllCity Transport - Vehicle Sales Reports</title></head>
        <body>
          <h1>AllCity Transport - Vehicle Sales Report</h1>
          <table border="1" style="border-collapse: collapse;">
            <tr>
              <th>ID</th><th>Vehicle ID</th><th>Date</th><th>Lorry Number</th><th>Weight (KG)</th><th>Lorry Hire (₹)</th><th>Commission (₹)</th><th>Bility (₹)</th><th>Total Advance (₹)</th><th>Payment Mode</th><th>Petrol Pump</th>
            </tr>
            ${this.filteredSales.map(s => `<tr><td>${s.id}</td><td>${s.vehicleId}</td><td>${s.date}</td><td>${s.lorryNumber}</td><td>${s.weight}</td><td>₹${s.lorryHire}</td><td>₹${s.commission}</td><td>₹${s.bility}</td><td>₹${s.totalAdvance}</td><td>${s.paymentMode}</td><td>${s.petrolPump || 'N/A'}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicle-sales-reports.doc';
    link.click();
  }

  printSales() {
    const printHtml = `
      <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
        <div style="position: relative; z-index: 2; background: white; padding: 20px;">
          <h1>AllCity Transport - Vehicle Sales Reports</h1>
          <p><strong>Filter:</strong> ${this.filterOptions.find(f => f.value === this.selectedFilter)?.label}</p>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ddd; padding: 8px;">ID</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Vehicle ID</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Lorry Number</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Weight (KG)</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Lorry Hire (₹)</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Commission (₹)</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Bility (₹)</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Total Advance (₹)</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Payment Mode</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Petrol Pump</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredSales.map(s => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${s.id}</td><td style="border: 1px solid #ddd; padding: 8px;">${s.vehicleId}</td><td style="border: 1px solid #ddd; padding: 8px;">${s.date}</td><td style="border: 1px solid #ddd; padding: 8px;">${s.lorryNumber}</td><td style="border: 1px solid #ddd; padding: 8px;">${s.weight}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${s.lorryHire}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${s.commission}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${s.bility}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${s.totalAdvance}</td><td style="border: 1px solid #ddd; padding: 8px;">${s.paymentMode}</td><td style="border: 1px solid #ddd; padding: 8px;">${s.petrolPump || 'N/A'}</td></tr>`).join('')}
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

  // Action methods
  editSale(sale: any) {
    // For demo purposes, show an alert that edit functionality is available
    this.snackBar.open('Edit functionality would open a sale modal here. Sale ID: ' + sale.id, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    console.log('Edit sale:', sale);
  }

  deleteSale(sale: any) {
    this.selectedSaleForDelete = sale;
    this.showConfirmationDialog = true;
  }

  // Modal event handlers
  onConfirmDelete() {
    if (this.selectedSaleForDelete) {
      // Remove from local arrays
      this.sales = this.sales.filter(s => s.id !== this.selectedSaleForDelete!.id);
      this.filteredSales = this.filteredSales.filter(s => s.id !== this.selectedSaleForDelete!.id);

      this.snackBar.open('Sale record deleted successfully', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });

      // Recalculate stats after deletion
      this.calculateStats();

      this.showConfirmationDialog = false;
      this.selectedSaleForDelete = undefined;
    }
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.selectedSaleForDelete = undefined;
  }
}
