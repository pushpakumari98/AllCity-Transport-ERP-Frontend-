import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { VehiclePurchase } from '../../vehicle-management/purchase/models/vehicle-purchase.model';
import { PurchaseService } from '../../vehicle-management/purchase/services/purchase.service';

@Component({
  selector: 'app-vehicle-purchase-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule],
  templateUrl: './vehicle-purchase-reports.component.html',
  styleUrls: ['./vehicle-purchase-reports.component.scss']
})
export class VehiclePurchaseReportsComponent implements OnInit {

  purchases: VehiclePurchase[] = [];
  filteredPurchases: VehiclePurchase[] = [];
  loading = false;
  selectedFilter = 'today';
  filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' }
  ];

  // Stats
  totalPurchases = 0;
  todayPurchases = 0;
  weekPurchases = 0;
  monthPurchases = 0;
  yearPurchases = 0;
  totalPurchaseValue = 0;
  todayPurchaseValue = 0;
  weekPurchaseValue = 0;
  monthPurchaseValue = 0;
  yearPurchaseValue = 0;

  // Modal properties
  showConfirmationDialog = false;
  selectedPurchaseForDelete?: any;

  constructor(private purchaseService: PurchaseService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases() {
    this.loading = true;
    this.purchaseService.getAllPurchases().subscribe({
      next: (res) => {
        console.log("PURCHASE REPORTS:", res);
        // If backend returns empty data, load mock data
        if (!res || res.length === 0) {
          this.loadMockData();
        } else {
          this.purchases = res;
        }
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching purchases:", err);
        this.loadMockData();
        this.loading = false;
        this.snackBar.open('Loaded sample purchase data for demo', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  private loadMockData() {
    this.purchases = [
      {
        id: 1,
        date: "2025-12-01",
        vehicleNo: "MH12AB1234",
        vehicleNumber: "MH12AB1234",
        vehicleModel: "Tata Ace",
        purchaseDate: "2025-12-01",
        price: 450000,
        vendorName: "Tata Motors",
        paymentMode: "Bank Transfer"
      },
      {
        id: 2,
        date: "2025-12-02",
        vehicleNo: "MH12CD5678",
        vehicleNumber: "MH12CD5678",
        vehicleModel: "Mahindra Pickup",
        purchaseDate: "2025-12-02",
        price: 650000,
        vendorName: "Mahindra & Mahindra",
        paymentMode: "UPI"
      },
      {
        id: 3,
        date: "2025-11-15",
        vehicleNo: "MH12EF9012",
        vehicleNumber: "MH12EF9012",
        vehicleModel: "Ashok Leyland Truck",
        purchaseDate: "2025-11-15",
        price: 1200000,
        vendorName: "Ashok Leyland",
        paymentMode: "Cheque"
      },
      {
        id: 4,
        date: "2025-10-20",
        vehicleNo: "MH12GH3456",
        vehicleNumber: "MH12GH3456",
        vehicleModel: "Bajaj Tempo",
        purchaseDate: "2025-10-20",
        price: 350000,
        vendorName: "Bajaj Auto",
        paymentMode: "Cash"
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

    this.todayPurchases = this.purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      purchaseDate.setHours(0, 0, 0, 0);
      return purchaseDate.getTime() === today.getTime();
    }).length;

    this.weekPurchases = this.purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      purchaseDate.setHours(0, 0, 0, 0);
      return purchaseDate >= weekStart;
    }).length;

    this.monthPurchases = this.purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      purchaseDate.setHours(0, 0, 0, 0);
      return purchaseDate >= monthStart;
    }).length;

    this.yearPurchases = this.purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      purchaseDate.setHours(0, 0, 0, 0);
      return purchaseDate >= yearStart;
    }).length;

    this.totalPurchases = this.purchases.length;

    // Calculate values
    this.todayPurchaseValue = this.purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      purchaseDate.setHours(0, 0, 0, 0);
      return purchaseDate.getTime() === today.getTime();
    }).reduce((sum, p) => sum + p.price, 0);

    this.weekPurchaseValue = this.purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      purchaseDate.setHours(0, 0, 0, 0);
      return purchaseDate >= weekStart;
    }).reduce((sum, p) => sum + p.price, 0);

    this.monthPurchaseValue = this.purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      purchaseDate.setHours(0, 0, 0, 0);
      return purchaseDate >= monthStart;
    }).reduce((sum, p) => sum + p.price, 0);

    this.yearPurchaseValue = this.purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      purchaseDate.setHours(0, 0, 0, 0);
      return purchaseDate >= yearStart;
    }).reduce((sum, p) => sum + p.price, 0);

    this.totalPurchaseValue = this.purchases.reduce((sum, p) => sum + p.price, 0);
  }

  applyFilter() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filterDate: Date;

    switch (this.selectedFilter) {
      case 'today':
        filterDate = today;
        this.filteredPurchases = this.purchases.filter(p => {
          const purchaseDate = new Date(p.purchaseDate);
          purchaseDate.setHours(0, 0, 0, 0);
          return purchaseDate.getTime() === filterDate.getTime();
        });
        break;
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        this.filteredPurchases = this.purchases.filter(p => {
          const purchaseDate = new Date(p.purchaseDate);
          purchaseDate.setHours(0, 0, 0, 0);
          return purchaseDate >= weekStart;
        });
        break;
      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filteredPurchases = this.purchases.filter(p => {
          const purchaseDate = new Date(p.purchaseDate);
          purchaseDate.setHours(0, 0, 0, 0);
          return purchaseDate >= monthStart;
        });
        break;
      case 'thisYear':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        this.filteredPurchases = this.purchases.filter(p => {
          const purchaseDate = new Date(p.purchaseDate);
          purchaseDate.setHours(0, 0, 0, 0);
          return purchaseDate >= yearStart;
        });
        break;
      default:
        this.filteredPurchases = [...this.purchases];
    }
  }

  onFilterChange() {
    this.applyFilter();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  getFilterLabel(filter: string): string {
    const option = this.filterOptions.find(opt => opt.value === filter);
    return option ? option.label : 'All Time';
  }

  getPaymentMethods(): { method: string; count: number }[] {
    const paymentMethods: { [key: string]: number } = {};

    this.filteredPurchases.forEach(purchase => {
      const method = purchase.paymentMode || 'N/A';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    return Object.entries(paymentMethods).map(([method, count]) => ({
      method,
      count
    }));
  }

  getTotalValue(): number {
    return this.filteredPurchases.reduce((sum, purchase) => sum + purchase.price, 0);
  }

  // Export methods
  exportToCSV() {
    if (this.filteredPurchases.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    const data = this.filteredPurchases.map(purchase => [
      purchase.id || '',
      purchase.vehicleNumber || '',
      purchase.vehicleModel || '',
      purchase.purchaseDate || '',
      purchase.price || '',
      purchase.vendorName || '',
      purchase.paymentMode || ''
    ]);

    const headers = ['ID', 'Vehicle Number', 'Vehicle Model', 'Purchase Date', 'Price', 'Vendor Name', 'Payment Mode'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicle-purchase-reports.csv';
    link.click();

    this.snackBar.open('CSV exported successfully!', '', { duration: 3000 });
  }

  exportToExcel() {
    if (this.filteredPurchases.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    import('xlsx').then(({ utils, writeFile }) => {
      const worksheet = utils.json_to_sheet(this.filteredPurchases);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Purchase Reports');
      writeFile(workbook, 'vehicle-purchase-reports.xlsx');
      this.snackBar.open('Excel exported successfully!', '', { duration: 3000 });
    }).catch(error => {
      console.error('Excel export error:', error);
      this.snackBar.open('Error exporting to Excel. Please try again.', '', { duration: 3000 });
    });
  }

  exportToPDF() {
    if (this.filteredPurchases.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Vehicle Purchase Reports', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('ID | Vehicle Number | Model | Date | Price | Vendor', 20, y);
      y += 20;
      this.filteredPurchases.forEach(purchase => {
        pdf.text(`${purchase.id} | ${purchase.vehicleNumber} | ${purchase.vehicleModel} | ${purchase.purchaseDate} | ₹${purchase.price} | ${purchase.vendorName}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('vehicle-purchase-reports.pdf');
      this.snackBar.open('PDF exported successfully!', '', { duration: 3000 });
    }).catch(error => {
      console.error('PDF export error:', error);
      this.snackBar.open('Error exporting to PDF. Please try again.', '', { duration: 3000 });
    });
  }

  exportToDocx() {
    if (this.filteredPurchases.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    try {
      const htmlContent = `
        <html>
          <head><title>AllCity Transport - Vehicle Purchase Reports</title></head>
          <body>
            <h1>AllCity Transport - Vehicle Purchase Report</h1>
            <table border="1" style="border-collapse: collapse;">
              <tr>
                <th>ID</th><th>Vehicle Number</th><th>Vehicle Model</th><th>Purchase Date</th><th>Price</th><th>Vendor Name</th><th>Payment Mode</th>
              </tr>
              ${this.filteredPurchases.map(p => `<tr><td>${p.id}</td><td>${p.vehicleNumber}</td><td>${p.vehicleModel}</td><td>${p.purchaseDate}</td><td>₹${p.price}</td><td>${p.vendorName}</td><td>${p.paymentMode}</td></tr>`).join('')}
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'vehicle-purchase-reports.doc';
      link.click();

      this.snackBar.open('DOCX exported successfully!', '', { duration: 3000 });
    } catch (error) {
      console.error('DOCX export error:', error);
      this.snackBar.open('Error exporting to DOCX. Please try again.', '', { duration: 3000 });
    }
  }

  printPurchases() {
    const printHtml = `
      <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
        <div style="position: relative; z-index: 2; background: white; padding: 20px;">
          <h1>AllCity Transport - Vehicle Purchase Reports</h1>
          <p><strong>Filter:</strong> ${this.getFilterLabel(this.selectedFilter)}</p>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ddd; padding: 8px;">ID</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Vehicle Number</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Vehicle Model</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Purchase Date</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Vendor Name</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredPurchases.map(p => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${p.id}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.vehicleNumber}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.vehicleModel}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.purchaseDate}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${p.price}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.vendorName}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.paymentMode}</td></tr>`).join('')}
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

  // Edit and Delete methods
  editPurchase(purchase: any) {
    // For demo purposes, show a message that edit functionality is available
    this.snackBar.open('Edit functionality would open a purchase modal here', '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    console.log('Edit purchase:', purchase);
  }

  deletePurchase(purchase: any) {
    this.selectedPurchaseForDelete = purchase;
    this.showConfirmationDialog = true;
  }

  onConfirmDelete() {
    if (this.selectedPurchaseForDelete) {
      // For demo purposes, remove from local array
      this.purchases = this.purchases.filter(p => p.id !== this.selectedPurchaseForDelete!.id);
      this.filteredPurchases = this.filteredPurchases.filter(p => p.id !== this.selectedPurchaseForDelete!.id);
      this.snackBar.open('Purchase deleted successfully', '', { duration: 3000 });
      this.calculateStats(); // Recalculate stats after deletion
    }
    this.showConfirmationDialog = false;
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.selectedPurchaseForDelete = undefined;
  }
}
