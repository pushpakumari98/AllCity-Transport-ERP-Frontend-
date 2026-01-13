import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SaleService } from '../services/sale.service';
import { VehicleSale } from '../models/vehicle-sale.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../admin-management/confirmation-dialog/confirmation-dialog.component';
import { SaleModalComponent } from '../sale-modal/sale-modal.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, ConfirmationDialogComponent, SaleModalComponent],
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss']
})
export class SalesListComponent implements OnInit {

  sales: VehicleSale[] = [];
  loading = false;
  showSaleModal = false;
  showConfirmationDialog = false;
  editMode = false;
  selectedSale?: VehicleSale;
  saleToDelete?: VehicleSale;
  hasLocalUpdates = false;

  constructor(
    private saleService: SaleService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales() {
    this.loading = true;
    this.saleService.getAllSales().subscribe({
      next: (res) => {
        console.log("SALES BACKEND RESPONSE:", res);
        this.sales = res;
        this.hasLocalUpdates = false;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching sales:", err);
        // Load mock data for demonstration when backend is not available
        this.loadMockData();
        this.loading = false;
        this.snackBar.open('Loaded sample sales data for demonstration', '', {
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
        weight: 500.50,
        lorryHire: 1000.00,
        commission: 50.00,
        bility: 100.00,
        paymentMode: "UPI",
        petrolPump: "ABC Petrol",
        totalAdvance: 500.00
      },
      {
        id: 2,
        vehicleId: "V002",
        date: "2025-12-02",
        lorryNumber: "LN002",
        weight: 750.25,
        lorryHire: 1500.00,
        commission: 75.00,
        bility: 150.00,
        paymentMode: "IMPS",
        petrolPump: "XYZ Fuel",
        totalAdvance: 750.00
      }
    ];
  }

  addSale() {
    // Navigate to the dedicated sale form page
    this.router.navigate(['/sale']);
  }

  updateSale(sale: VehicleSale) {
    this.editMode = true;
    this.selectedSale = sale;
    this.showSaleModal = true;
  }

  deleteSale(sale: VehicleSale) {
    this.saleToDelete = sale;
    this.showConfirmationDialog = true;
  }

  onConfirmDelete() {
    if (this.saleToDelete) {
      this.showConfirmationDialog = false;
      this.saleService.deleteSale(this.saleToDelete.id!).subscribe({
        next: () => {
          this.removeSaleFromList(this.saleToDelete!.id!);
          this.saleToDelete = undefined;
        },
        error: (err) => {
          console.error('Error deleting sale:', err);
          this.removeSaleFromList(this.saleToDelete!.id!); // Remove anyway for demo
          this.saleToDelete = undefined;
        }
      });
    }
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.saleToDelete = undefined;
  }

  private removeSaleFromList(saleId: number) {
    if (!this.hasLocalUpdates) {
      this.sales = [...this.sales];
      this.hasLocalUpdates = true;
    }
    this.sales = this.sales.filter(s => s.id !== saleId);
  }

  trackBySaleId(index: number, sale: VehicleSale): string {
    return sale.vehicleId;
  }

  // Export methods
  exportToCSV() {
    const data = this.sales.map(sale => [
      sale.date || '',
      sale.lorryNumber || '',
      sale.weight || '',
      sale.lorryHire || '',
      sale.commission || '',
      sale.bility || '',
      sale.paymentMode || '',
      sale.petrolPump || '',
      sale.totalAdvance || ''
    ]);

    const headers = ['Date', 'Lorry Number', 'Weight (kg)', 'Lorry Hire', 'Commission', 'Bility', 'Payment Mode', 'Petrol Pump', 'Total Advance'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sold-vehicles-list.csv';
    link.click();
  }

  exportToExcel() {
    import('xlsx').then(({ utils, writeFile }) => {
      const worksheet = utils.json_to_sheet(this.sales);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Sold Vehicles');
      writeFile(workbook, 'sold-vehicles-list.xlsx');
    });
  }

  exportToPDF() {
    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Sold Vehicles List', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('Lorry # | Weight | Hire | Commission | Mode', 20, y);
      y += 20;
      this.sales.forEach(sale => {
        pdf.text(`${sale.lorryNumber} | ${sale.weight}kg | ₹${sale.lorryHire} | ₹${sale.commission} | ${sale.paymentMode}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('sold-vehicles-list.pdf');
    });
  }

  exportToDocx() {
    const htmlContent = `
      <html>
        <head><title>AllCity Transport - Sold Vehicles List</title></head>
        <body>
          <h1>AllCity Transport - Sold Vehicles Report</h1>
          <table border="1" style="border-collapse: collapse;">
            <tr>
              <th>Date</th><th>Lorry Number</th><th>Weight</th><th>Lorry Hire</th><th>Commission</th><th>Payment Mode</th><th>Petrol Pump</th><th>Total Advance</th>
            </tr>
            ${this.sales.map(s => `<tr><td>${s.date}</td><td>${s.lorryNumber}</td><td>${s.weight}kg</td><td>₹${s.lorryHire}</td><td>₹${s.commission}</td><td>${s.paymentMode}</td><td>${s.petrolPump}</td><td>₹${s.totalAdvance}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sold-vehicles-list.doc';
    link.click();
  }

  printSoldVehicles() {
    const printHtml = `
      <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
        <div style="position: relative; z-index: 2; background: white; padding: 20px;">
          <h1>AllCity Transport - Sold Vehicles List</h1>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Lorry Number</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Weight</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Lorry Hire</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Commission</th>
              </tr>
            </thead>
            <tbody>
              ${this.sales.map(s => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${s.date}</td><td style="border: 1px solid #ddd; padding: 8px;">${s.lorryNumber}</td><td style="border: 1px solid #ddd; padding: 8px;">${s.weight}kg</td><td style="border: 1px solid #ddd; padding: 8px;">₹${s.lorryHire}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${s.commission}</td></tr>`).join('')}
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

  closeSaleModal() {
    this.showSaleModal = false;
  }

  onSaleSaved(updatedSale: any) {
    if (!this.hasLocalUpdates) {
      this.sales = [...this.sales];
      this.hasLocalUpdates = true;
    }

    const index = this.sales.findIndex(s => s.id === updatedSale.id);
    if (index !== -1) {
      // Update existing sale
      this.sales[index] = { ...this.sales[index], ...updatedSale };
    } else {
      // Add new sale
      this.sales.push({ id: updatedSale.id, ...updatedSale });
    }
    this.sales = [...this.sales]; // Trigger change detection
  }
}
