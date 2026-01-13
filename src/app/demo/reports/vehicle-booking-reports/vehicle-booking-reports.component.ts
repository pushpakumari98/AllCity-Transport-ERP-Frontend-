import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { BookingStatus } from '../../../enums/booking-status.enum';
import { VehicleStatus } from '../../../enums/vehicle-status.enum';
import { VehicleType } from '../../../enums/vehicle-type.enum';
import { ConfirmationDialogComponent } from '../../admin-management/confirmation-dialog/confirmation-dialog.component';
import { BookingModalComponent } from '../../vehicle-management/bookings/booking-modal/booking-modal.component';
import { VehicleBooking } from '../../vehicle-management/bookings/models/vehicle-booking.model';
import { BookingService } from '../../vehicle-management/bookings/services/booking.service';

@Component({
  selector: 'app-vehicle-booking-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule, ConfirmationDialogComponent, BookingModalComponent],
  templateUrl: './vehicle-booking-reports.component.html',
  styleUrls: ['./vehicle-booking-reports.component.scss']
})
export class VehicleBookingReportsComponent implements OnInit {

  bookings: VehicleBooking[] = [];
  filteredBookings: VehicleBooking[] = [];
  loading = false;
  selectedFilter = 'today';
  filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' }
  ];

  // Stats
  totalBookings = 0;
  todayBookings = 0;
  weekBookings = 0;
  monthBookings = 0;
  yearBookings = 0;

  // Modal properties
  showConfirmationDialog = false;
  showBookingModal = false;
  editMode = false;
  selectedBookingForEdit?: any;
  selectedBookingForDelete?: any;

  constructor(private bookingService: BookingService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadBookings();
    // Set default filter to today
    this.selectedFilter = 'today';
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getBookedVehicles().subscribe({
      next: (res) => {
        console.log("BOOKINGS REPORTS:", res);
        // If backend returns empty data, load mock data
        if (!res || res.length === 0) {
          this.loadMockData();
        } else {
          // Merge backend data with local bookings
          const localBookings = this.getStoredBookings();
          this.bookings = [...res, ...localBookings];
        }
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error("Error fetching bookings:", err);
        // Load mock data and merge with local bookings
        this.loadMockData();
        const localBookings = this.getStoredBookings();
        this.bookings = [...this.bookings, ...localBookings];
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
        this.snackBar.open('Loaded sample booking data for demo', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  private getStoredBookings(): VehicleBooking[] {
    const stored = localStorage.getItem('bookedVehicles');
    return stored ? JSON.parse(stored) : [];
  }

  private loadMockData() {
    // Get today's date and calculate dates for different periods
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);

    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    this.bookings = [
      // TODAY - 2 bookings
      {
        id: 1,
        bookingId: "BK-" + today.getTime().toString().slice(-8),
        vehicle: {
          id: 101,
          vehicleNumber: "MH-12-AB-1234",
          vehicleModel: "Tata Ace",
          vehicleType: VehicleType.TRUCK,
          status: VehicleStatus.AVAILABLE
        },
        vehicleNo: "MH-12-AB-1234",
        startedFrom: "Mumbai",
        destination: "Delhi",
        vehicleType: VehicleType.TRUCK,
        driverName: "Rajesh Kumar",
        bookingDate: today.toISOString().split('T')[0], // Today
        bookingStatus: BookingStatus.COMPLETED,
        vehicleStatus: VehicleStatus.AVAILABLE,
        bookingHire: 15000,
        bookingAdvance: 5000,
        bookingBalance: 10000,
        bookingReceivedDate: today.toISOString().split('T')[0],
        detain: "None",
        podReceived: true,
        podDocument: "POD001",
        lorryBalancePaidDate: today.toISOString().split('T')[0]
      },
      {
        id: 2,
        bookingId: "BK-" + (today.getTime() + 1).toString().slice(-8),
        vehicle: {
          id: 102,
          vehicleNumber: "KA-05-CD-5678",
          vehicleModel: "Toyota Innova",
          vehicleType: VehicleType.CAR,
          status: VehicleStatus.IN_PROGRESS
        },
        vehicleNo: "KA-05-CD-5678",
        startedFrom: "Bangalore",
        destination: "Chennai",
        vehicleType: VehicleType.CAR,
        driverName: "Priya Sharma",
        bookingDate: today.toISOString().split('T')[0], // Today
        bookingStatus: BookingStatus.PENDING,
        vehicleStatus: VehicleStatus.IN_PROGRESS,
        bookingHire: 20000,
        bookingAdvance: 10000,
        bookingBalance: 10000
      },

      // THIS WEEK - 3 bookings
      {
        id: 3,
        bookingId: "BK-" + yesterday.getTime().toString().slice(-8),
        vehicle: {
          id: 103,
          vehicleNumber: "TN-09-EF-9012",
          vehicleModel: "Ashok Leyland",
          vehicleType: VehicleType.TRUCK,
          status: VehicleStatus.AVAILABLE
        },
        vehicleNo: "TN-09-EF-9012",
        startedFrom: "Chennai",
        destination: "Hyderabad",
        vehicleType: VehicleType.TRUCK,
        driverName: "Amit Singh",
        bookingDate: yesterday.toISOString().split('T')[0], // Yesterday (this week)
        bookingStatus: BookingStatus.COMPLETED,
        vehicleStatus: VehicleStatus.AVAILABLE,
        bookingHire: 25000,
        bookingAdvance: 8000,
        bookingBalance: 17000,
        bookingReceivedDate: yesterday.toISOString().split('T')[0],
        detain: "None",
        podReceived: true,
        podDocument: "POD002",
        lorryBalancePaidDate: yesterday.toISOString().split('T')[0]
      },
      {
        id: 4,
        bookingId: "BK-" + threeDaysAgo.getTime().toString().slice(-8),
        vehicle: {
          id: 104,
          vehicleNumber: "AP-05-GH-3456",
          vehicleModel: "Mahindra Van",
          vehicleType: VehicleType.VAN,
          status: VehicleStatus.AVAILABLE
        },
        vehicleNo: "AP-05-GH-3456",
        startedFrom: "Hyderabad",
        destination: "Pune",
        vehicleType: VehicleType.VAN,
        driverName: "Suresh Patel",
        bookingDate: threeDaysAgo.toISOString().split('T')[0], // 3 days ago (this week)
        bookingStatus: BookingStatus.INPROGRESS,
        vehicleStatus: VehicleStatus.IN_PROGRESS,
        bookingHire: 12000,
        bookingAdvance: 4000,
        bookingBalance: 8000
      },

      // THIS MONTH - 2 additional bookings
      {
        id: 5,
        bookingId: "BK-" + lastWeek.getTime().toString().slice(-8),
        vehicle: {
          id: 105,
          vehicleNumber: "RJ-14-IJ-7890",
          vehicleModel: "Tata 407",
          vehicleType: VehicleType.TRUCK,
          status: VehicleStatus.AVAILABLE
        },
        vehicleNo: "RJ-14-IJ-7890",
        startedFrom: "Jaipur",
        destination: "Delhi",
        vehicleType: VehicleType.TRUCK,
        driverName: "Vikram Rao",
        bookingDate: lastWeek.toISOString().split('T')[0], // Last week (this month)
        bookingStatus: BookingStatus.COMPLETED,
        vehicleStatus: VehicleStatus.AVAILABLE,
        bookingHire: 18000,
        bookingAdvance: 6000,
        bookingBalance: 12000,
        bookingReceivedDate: lastWeek.toISOString().split('T')[0],
        detain: "Minor delay",
        podReceived: true,
        podDocument: "POD003",
        lorryBalancePaidDate: lastWeek.toISOString().split('T')[0]
      },

      // THIS YEAR - 3 additional bookings
      {
        id: 6,
        bookingId: "BK-" + twoWeeksAgo.getTime().toString().slice(-8),
        vehicle: {
          id: 106,
          vehicleNumber: "GJ-18-KL-1234",
          vehicleModel: "Bharat Benz",
          vehicleType: VehicleType.TRUCK,
          status: VehicleStatus.AVAILABLE
        },
        vehicleNo: "GJ-18-KL-1234",
        startedFrom: "Ahmedabad",
        destination: "Mumbai",
        vehicleType: VehicleType.TRUCK,
        driverName: "Rahul Mehta",
        bookingDate: twoWeeksAgo.toISOString().split('T')[0], // 2 weeks ago (this year)
        bookingStatus: BookingStatus.COMPLETED,
        vehicleStatus: VehicleStatus.AVAILABLE,
        bookingHire: 30000,
        bookingAdvance: 10000,
        bookingBalance: 20000,
        bookingReceivedDate: twoWeeksAgo.toISOString().split('T')[0],
        detain: "None",
        podReceived: true,
        podDocument: "POD004",
        lorryBalancePaidDate: twoWeeksAgo.toISOString().split('T')[0]
      },
      {
        id: 7,
        bookingId: "BK-" + lastMonth.getTime().toString().slice(-8),
        vehicle: {
          id: 107,
          vehicleNumber: "WB-02-MN-5678",
          vehicleModel: "Volvo Truck",
          vehicleType: VehicleType.TRUCK,
          status: VehicleStatus.AVAILABLE
        },
        vehicleNo: "WB-02-MN-5678",
        startedFrom: "Kolkata",
        destination: "Patna",
        vehicleType: VehicleType.TRUCK,
        driverName: "Anil Gupta",
        bookingDate: lastMonth.toISOString().split('T')[0], // Last month (this year)
        bookingStatus: BookingStatus.COMPLETED,
        vehicleStatus: VehicleStatus.AVAILABLE,
        bookingHire: 35000,
        bookingAdvance: 15000,
        bookingBalance: 20000,
        bookingReceivedDate: lastMonth.toISOString().split('T')[0],
        detain: "Weather delay",
        podReceived: true,
        podDocument: "POD005",
        lorryBalancePaidDate: lastMonth.toISOString().split('T')[0]
      },
      {
        id: 8,
        bookingId: "BK-" + twoMonthsAgo.getTime().toString().slice(-8),
        vehicle: {
          id: 108,
          vehicleNumber: "UP-32-OP-9012",
          vehicleModel: "Eicher Truck",
          vehicleType: VehicleType.TRUCK,
          status: VehicleStatus.AVAILABLE
        },
        vehicleNo: "UP-32-OP-9012",
        startedFrom: "Lucknow",
        destination: "Kanpur",
        vehicleType: VehicleType.TRUCK,
        driverName: "Mohan Das",
        bookingDate: twoMonthsAgo.toISOString().split('T')[0], // 2 months ago (this year)
        bookingStatus: BookingStatus.COMPLETED,
        vehicleStatus: VehicleStatus.AVAILABLE,
        bookingHire: 22000,
        bookingAdvance: 8000,
        bookingBalance: 14000,
        bookingReceivedDate: twoMonthsAgo.toISOString().split('T')[0],
        detain: "None",
        podReceived: true,
        podDocument: "POD006",
        lorryBalancePaidDate: twoMonthsAgo.toISOString().split('T')[0]
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

    this.todayBookings = this.bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    }).length;

    this.weekBookings = this.bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate >= weekStart;
    }).length;

    this.monthBookings = this.bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate >= monthStart;
    }).length;

    this.yearBookings = this.bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate >= yearStart;
    }).length;

    this.totalBookings = this.bookings.length;
  }

  applyFilter() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log('Applying filter:', this.selectedFilter);
    console.log('Today date string:', todayStr);

    switch (this.selectedFilter) {
      case 'today':
        this.filteredBookings = this.bookings.filter(b => {
          const bookingDateStr = b.bookingDate;
          console.log('Comparing booking date:', bookingDateStr, 'with today:', todayStr);
          return bookingDateStr === todayStr;
        });
        console.log('Today filtered bookings:', this.filteredBookings.length);
        break;

      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekStartStr = weekStart.toISOString().split('T')[0];

        this.filteredBookings = this.bookings.filter(b => {
          const bookingDateStr = b.bookingDate;
          return bookingDateStr >= weekStartStr;
        });
        console.log('Week filtered bookings:', this.filteredBookings.length, 'from:', weekStartStr);
        break;

      case 'thisMonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        this.filteredBookings = this.bookings.filter(b => {
          const bookingDateStr = b.bookingDate;
          return bookingDateStr >= monthStartStr;
        });
        console.log('Month filtered bookings:', this.filteredBookings.length, 'from:', monthStartStr);
        break;

      case 'thisYear':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearStartStr = yearStart.toISOString().split('T')[0];

        this.filteredBookings = this.bookings.filter(b => {
          const bookingDateStr = b.bookingDate;
          return bookingDateStr >= yearStartStr;
        });
        console.log('Year filtered bookings:', this.filteredBookings.length, 'from:', yearStartStr);
        break;

      default:
        this.filteredBookings = [...this.bookings];
        console.log('All bookings:', this.filteredBookings.length);
    }

    console.log('Final filtered bookings count:', this.filteredBookings.length);
  }

  onFilterChange() {
    this.applyFilter();
  }

  // Export methods
  exportToCSV() {
    if (this.filteredBookings.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    const data = this.filteredBookings.map(booking => [
      booking.bookingId || '',
      booking.vehicle?.vehicleNumber || '',
      booking.vehicleType || '',
      booking.driverName || '',
      booking.startedFrom || '',
      booking.destination || '',
      booking.bookingDate || '',
      booking.bookingStatus || '',
      booking.vehicleStatus || '',
      booking.bookingHire || '',
      booking.bookingAdvance || '',
      booking.bookingBalance || '',
      booking.bookingReceivedDate || '',
      booking.detain || '',
      booking.podReceived ? 'Yes' : 'No',
      booking.podDocument || '',
      booking.lorryBalancePaidDate || '',
      booking.bookingDate || ''
    ]);

    const headers = ['Booking ID', 'Vehicle Number', 'Vehicle Type', 'Driver Name', 'Started From', 'Destination', 'Booking Date', 'Booking Status', 'Vehicle Status', 'Hire Amount', 'Advance', 'Balance', 'Received Date', 'Detain', 'POD Received', 'POD Document', 'Balance Paid Date', 'Booking Date'];
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicle-booking-reports.csv';
    link.click();

    this.snackBar.open('CSV exported successfully!', '', { duration: 3000 });
  }

  exportToExcel() {
    if (this.filteredBookings.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    import('xlsx').then(({ utils, writeFile }) => {
      const worksheet = utils.json_to_sheet(this.filteredBookings);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Booking Reports');
      writeFile(workbook, 'vehicle-booking-reports.xlsx');
      this.snackBar.open('Excel exported successfully!', '', { duration: 3000 });
    }).catch(error => {
      console.error('Excel export error:', error);
      this.snackBar.open('Error exporting to Excel. Please try again.', '', { duration: 3000 });
    });
  }

  exportToPDF() {
    if (this.filteredBookings.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    import('jspdf').then(({ jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text('AllCity Transport - Vehicle Booking Reports', 20, 20);
      let y = 40;
      pdf.setFontSize(12);
      pdf.text('Booking ID | Vehicle Number | Driver | From | To | Status | Hire', 20, y);
      y += 20;
      this.filteredBookings.forEach(booking => {
        pdf.text(`${booking.bookingId} | ${booking.vehicle?.vehicleNumber} | ${booking.driverName} | ${booking.startedFrom} | ${booking.destination} | ${booking.bookingStatus} | ₹${booking.bookingHire}`, 20, y);
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save('vehicle-booking-reports.pdf');
      this.snackBar.open('PDF exported successfully!', '', { duration: 3000 });
    }).catch(error => {
      console.error('PDF export error:', error);
      this.snackBar.open('Error exporting to PDF. Please try again.', '', { duration: 3000 });
    });
  }

  exportToDocx() {
    if (this.filteredBookings.length === 0) {
      this.snackBar.open('No data to export', '', { duration: 3000 });
      return;
    }

    try {
      const htmlContent = `
        <html>
          <head><title>AllCity Transport - Vehicle Booking Reports</title></head>
          <body>
            <h1>AllCity Transport - Vehicle Booking Report</h1>
            <table border="1" style="border-collapse: collapse;">
              <tr>
                <th>Booking ID</th><th>Vehicle Number</th><th>Vehicle Type</th><th>Driver Name</th><th>Started From</th><th>Destination</th><th>Booking Date</th><th>Booking Status</th><th>Vehicle Status</th><th>Hire Amount</th><th>Advance</th><th>Balance</th><th>Received Date</th><th>Detain</th><th>POD Received</th><th>POD Document</th><th>Balance Paid Date</th><th>Booking Date</th>
              </tr>
              ${this.filteredBookings.map(b => `<tr><td>${b.bookingId}</td><td>${b.vehicle?.vehicleNumber}</td><td>${b.vehicleType}</td><td>${b.driverName}</td><td>${b.startedFrom}</td><td>${b.destination}</td><td>${b.bookingDate}</td><td>${b.bookingStatus}</td><td>${b.vehicleStatus}</td><td>₹${b.bookingHire}</td><td>₹${b.bookingAdvance}</td><td>₹${b.bookingBalance}</td><td>${b.bookingReceivedDate}</td><td>${b.detain}</td><td>${b.podReceived ? 'Yes' : 'No'}</td><td>${b.podDocument}</td><td>${b.lorryBalancePaidDate}</td><td>${b.bookingDate}</td></tr>`).join('')}
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'vehicle-booking-reports.doc';
      link.click();

      this.snackBar.open('DOCX exported successfully!', '', { duration: 3000 });
    } catch (error) {
      console.error('DOCX export error:', error);
      this.snackBar.open('Error exporting to DOCX. Please try again.', '', { duration: 3000 });
    }
  }

  printBookings() {
    const printHtml = `
      <div style="position: relative; background-image: url('assets/logo/allcity-transport-logo.svg'); background-repeat: no-repeat; background-position: center; background-size: 500px 500px; opacity: 0.08;">
        <div style="position: relative; z-index: 2; background: white; padding: 20px;">
          <h1>AllCity Transport - Vehicle Booking Reports</h1>
          <p><strong>Filter:</strong> ${this.filterOptions.find(f => f.value === this.selectedFilter)?.label}</p>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ddd; padding: 8px;">Booking ID</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Vehicle Number</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Vehicle Type</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Driver Name</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Started From</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Destination</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Booking Date</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Booking Status</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Vehicle Status</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Hire Amount</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Advance</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Balance</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Received Date</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Detain</th>
                <th style="border: 1px solid #ddd; padding: 8px;">POD Received</th>
                <th style="border: 1px solid #ddd; padding: 8px;">POD Document</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Lorry Balance Paid Date</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Booking Date</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredBookings.map(b => `<tr><td style="border: 1px solid #ddd; padding: 8px;">${b.bookingId}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.vehicle?.vehicleNumber}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.vehicleType}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.driverName}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.startedFrom}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.destination}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.bookingDate}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.bookingStatus}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.vehicleStatus}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${b.bookingHire}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${b.bookingAdvance}</td><td style="border: 1px solid #ddd; padding: 8px;">₹${b.bookingBalance}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.bookingReceivedDate}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.detain}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.podReceived ? 'Yes' : 'No'}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.podDocument}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.lorryBalancePaidDate}</td><td style="border: 1px solid #ddd; padding: 8px;">${b.bookingDate}</td></tr>`).join('')}
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
  editBooking(booking: any) {
    this.selectedBookingForEdit = booking;
    this.editMode = true;
    this.showBookingModal = true;
  }

  deleteBooking(booking: any) {
    this.selectedBookingForDelete = booking;
    this.showConfirmationDialog = true;
  }

  // Modal event handlers
  onConfirmDelete() {
    if (this.selectedBookingForDelete) {
      // Remove from local arrays
      this.bookings = this.bookings.filter(b => b.id !== this.selectedBookingForDelete!.id);
      this.filteredBookings = this.filteredBookings.filter(b => b.id !== this.selectedBookingForDelete!.id);

      this.snackBar.open('Booking record deleted successfully', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });

      // Recalculate stats after deletion
      this.calculateStats();

      this.showConfirmationDialog = false;
      this.selectedBookingForDelete = undefined;
    }
  }

  onCancelDelete() {
    this.showConfirmationDialog = false;
    this.selectedBookingForDelete = undefined;
  }

  // Modal event handlers
  onBookingSaved(booking: any) {
    if (this.editMode) {
      // Update existing booking
      const index = this.bookings.findIndex(b => b.id === booking.id);
      if (index !== -1) {
        this.bookings[index] = booking;
        // Also update in filtered array
        const filteredIndex = this.filteredBookings.findIndex(b => b.id === booking.id);
        if (filteredIndex !== -1) {
          this.filteredBookings[filteredIndex] = booking;
        }
      }
    } else {
      // Add new booking (though we don't create new from reports page)
      this.bookings.push(booking);
    }

    this.snackBar.open('Booking updated successfully!', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });

    this.closeBookingModal();
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedBookingForEdit = undefined;
    this.editMode = false;
  }
}
