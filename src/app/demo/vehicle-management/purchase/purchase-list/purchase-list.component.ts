import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, NavigationEnd } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from '../../../admin-management/confirmation-dialog/confirmation-dialog.component';
import { VehiclePurchase } from '../models/vehicle-purchase.model';
import { PurchaseModalComponent } from '../purchase-modal/purchase-modal.component';
import { PurchaseService } from '../services/purchase.service';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, ConfirmationDialogComponent, PurchaseModalComponent],
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss']
})
export class PurchaseListComponent implements OnInit {

  purchases: VehiclePurchase[] = [];
  loading = false;
  showPurchaseModal = false;
  showConfirmationDialog = false;
  editMode = false;
  selectedPurchase?: VehiclePurchase;
  purchaseToDelete?: VehiclePurchase;
  hasLocalUpdates = false;

  constructor(
    private purchaseService: PurchaseService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log("PurchaseListComponent initialized");
    this.loadPurchases();

    // Force reload when navigating to this component
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/purchase-list') {
        console.log("Navigated to purchase-list, reloading data");
        this.loadPurchases();
      }
    });
  }

  loadPurchases() {
    this.loading = true;
    console.log("Loading purchases...");

    this.purchaseService.getAllPurchases().subscribe({
      next: (res) => {
        console.log("PURCHASES BACKEND RESPONSE:", res);
        if (res && res.length > 0) {
          console.log("Loading from BACKEND, renumbering and setting purchases:", res);
          // Renumber backend data to ensure sequential serial numbers
          const renumberedPurchases = res.map((purchase, index) => ({
            ...purchase,
            slNo: index + 1
          }));
          this.purchases = renumberedPurchases;
          this.hasLocalUpdates = false;
          console.log("Renumbered backend purchases:", renumberedPurchases);
        } else {
          // Backend returned empty, try localStorage
          console.log("Backend empty, checking localStorage...");
          const storedPurchases = this.getStoredPurchases();
          console.log("Stored purchases after renumbering:", storedPurchases);
          if (storedPurchases && storedPurchases.length > 0) {
            this.purchases = storedPurchases;
            this.hasLocalUpdates = true;
            console.log('Backend empty, loaded from localStorage:', storedPurchases.length);
          } else {
            // No purchases in backend or localStorage, show empty list
            this.purchases = [];
            this.hasLocalUpdates = false;
            console.log('No purchases found in backend or localStorage');
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error("Backend error, loading from localStorage:", err);
        // Fallback to local storage
        console.log("Backend error, checking localStorage...");
        const storedPurchases = this.getStoredPurchases();
        console.log("Stored purchases after renumbering:", storedPurchases);
        if (storedPurchases && storedPurchases.length > 0) {
          this.purchases = storedPurchases;
          this.hasLocalUpdates = true;
          console.log('Loaded purchases from localStorage:', storedPurchases.length, storedPurchases);
        } else {
          this.purchases = [];
          this.hasLocalUpdates = false;
          console.log('No purchases found in localStorage');
        }
        this.loading = false;
      }
    });
  }

  private getStoredPurchases(): any[] {
    const stored = localStorage.getItem('vehiclePurchases'); // Use correct localStorage key
    const purchases = stored ? JSON.parse(stored) : [];

    // Renumber serial numbers sequentially (1, 2, 3, 4...)
    if (purchases.length > 0) {
      purchases.forEach((purchase, index) => {
        purchase.slNo = index + 1;
      });

      // Save the renumbered data back to localStorage
      localStorage.setItem('vehiclePurchases', JSON.stringify(purchases));
    }

    return purchases;
  }



  addPurchase() {
    // Navigate to the dedicated purchase form page
    this.router.navigate(['/purchases']);
  }

  updatePurchase(purchase: VehiclePurchase) {
    this.editMode = true;
    this.selectedPurchase = purchase;
    this.showPurchaseModal = true;
  }

  deletePurchase(purchase: VehiclePurchase) {
    this.purchaseToDelete = purchase;
    this.showConfirmationDialog = true;
  }

  onConfirmDelete() {
    if (this.purchaseToDelete) {
      this.showConfirmationDialog = false;
      this.purchaseService.deletePurchase(this.purchaseToDelete.slNo!).subscribe({
        next: () => {
          this.removePurchaseFromList(this.purchaseToDelete!.slNo!);
          this.purchaseToDelete = undefined;
        },
        error: (err) => {
          console.error('Error deleting purchase:', err);
          this.removePurchaseFromList(this.purchaseToDelete!.slNo!); // Remove anyway for demo
          this.purchaseToDelete = undefined;
        }
      });
    }
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.purchaseToDelete = undefined;
  }

  private removePurchaseFromList(purchaseId: number) {
    if (!this.hasLocalUpdates) {
      this.purchases = [...this.purchases];
      this.hasLocalUpdates = true;
    }
    this.purchases = this.purchases.filter(p => p.slNo !== purchaseId);
  }

  trackByPurchaseId(index: number, purchase: VehiclePurchase): string {
    return purchase.vehicleNo;
  }

  // Export methods
  exportToCSV() {
    const data = this.purchases.map(purchase => [
      purchase.slNo || '',
      purchase.date || '',
      purchase.vehicleNo || '',
      purchase.bookingHire || '',
      purchase.bookingReceivingBalanceDate || '',
      purchase.fromLocation || '',
      purchase.toLocation || '',
      purchase.transportName || '',
      purchase.detain || '',
      purchase.podReceivedDate || '',
      purchase.lorryBalancePaidDate || ''
    ]);

    const headers = ['Sl. No', 'Date', 'Vehicle No', 'Booking Hire', 'Booking Receiving Balance Date', 'From Location', 'To Location', 'Transport Name', 'Detain', 'POD Received Date', 'Lorry Balance Paid Date'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicle-purchases-list.csv';
    link.click();
  }

  exportToExcel() {
    import('xlsx').then(({ utils, writeFile }) => {
      const worksheet = utils.json_to_sheet(this.purchases);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Purchased Vehicles');
      writeFile(workbook, 'purchased-vehicles-list.xlsx');
    });
  }

  exportToPDF() {
    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Vehicle Purchases List', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('Sl. No | Date | Vehicle No | Booking Hire | Transport Name', 20, y);
      y += 20;
      this.purchases.forEach(purchase => {
        pdf.text(`${purchase.slNo} | ${purchase.date} | ${purchase.vehicleNo} | ₹${purchase.bookingHire} | ${purchase.transportName}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('vehicle-purchases-list.pdf');
    });
  }

  exportToDocx() {
    const htmlContent = `
      <html>
        <head><title>AllCity Transport - Vehicle Purchases List</title></head>
        <body>
          <h1>AllCity Transport - Vehicle Purchases Report</h1>
          <table border="1" style="border-collapse: collapse;">
            <tr>
              <th>Sl. No</th><th>Date</th><th>Vehicle No</th><th>Booking Hire</th><th>Transport Name</th><th>From Location</th><th>To Location</th>
            </tr>
            ${this.purchases.map(p => `<tr><td>${p.slNo}</td><td>${p.date}</td><td>${p.vehicleNo}</td><td>₹${p.bookingHire}</td><td>${p.transportName}</td><td>${p.fromLocation}</td><td>${p.toLocation}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicle-purchases-list.doc';
    link.click();
  }

  printPurchases() {
    const printHtml = `
      <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
        <div style="position: relative; z-index: 2; background: white; padding: 20px;">
          <h1>AllCity Transport - Vehicle Purchases List</h1>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Sl. No</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Vehicle No</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Booking Hire</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Transport Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">From Location</th>
                <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">To Location</th>
              </tr>
            </thead>
            <tbody>
              ${this.purchases.map(p => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${p.slNo}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.date}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.vehicleNo}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${p.bookingHire}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.transportName}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.fromLocation}</td><td style="border: 1px solid #ddd; padding: 8px;">${p.toLocation}</td></tr>`).join('')}
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

  closePurchaseModal() {
    this.showPurchaseModal = false;
  }

  onPurchaseSaved(updatedPurchase: any) {
    // For demo mode, reload from localStorage to ensure proper renumbering
    if (this.hasLocalUpdates) {
      this.loadPurchases();
    } else {
      // For backend mode, update the specific item
      const index = this.purchases.findIndex(p => p.slNo === updatedPurchase.slNo);
      if (index !== -1) {
        // Update existing purchase
        this.purchases[index] = { ...this.purchases[index], ...updatedPurchase };
        this.purchases = [...this.purchases]; // Trigger change detection
      } else {
        // Reload to get updated data
        this.loadPurchases();
      }
    }
  }
}
