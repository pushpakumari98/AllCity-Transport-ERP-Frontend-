// angular import
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NotificationService, NotificationItem } from 'src/app/shared/services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nav-right',
  imports: [CommonModule, SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit, OnDestroy {
  // public props
  notifications: NotificationItem[] = [];
  unreadCount: number = 0;
  currentTheme: 'light' | 'dark' = 'light';
  private subscription: Subscription = new Subscription();

  // constructor
  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
  }

  ngOnInit() {
    // Subscribe to notifications
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }
    this.applyTheme();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Get unread count for template
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Format time difference
  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours} hour`;
    return `${Math.floor(hours / 24)} days`;
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  clearAll() {
    this.notificationService.clearAll();
  }

  trackByNotification(index: number, notification: NotificationItem): string {
    return notification.id;
  }

  getNotificationTypeClass(type: string): string {
    switch (type) {
      case 'booking': return 'notification-booking';
      case 'sale': return 'notification-sale';
      case 'driver': return 'notification-driver';
      case 'purchase': return 'notification-purchase';
      default: return 'notification-info';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'booking': return 'icon-calendar';
      case 'sale': return 'icon-dollar-sign';
      case 'driver': return 'icon-user-plus';
      case 'purchase': return 'icon-package';
      default: return 'icon-bell';
    }
  }

  // User menu actions
  openSettings() {
    this.snackBar.open('Settings panel coming soon!', '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    // TODO: Implement settings modal/component
  }

  openProfile() {
    this.snackBar.open('Profile management coming soon!', '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    // TODO: Navigate to profile page or open modal
  }

  openMessages() {
    this.snackBar.open('Messages panel coming soon!', '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    // TODO: Navigate to messages inbox
  }

  lockScreen() {
    this.snackBar.open('Screen locked! Click to unlock.', 'Unlock', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    // In a real app, this would show a lock screen overlay
    // For demo, just show notification
  }

  // Theme methods
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    localStorage.setItem('theme', this.currentTheme);
    this.snackBar.open(`Switched to ${this.currentTheme} theme`, '', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  applyTheme() {
    const body = document.body;
    if (this.currentTheme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  logout() {
    // Clear all stored data
    localStorage.clear();
    sessionStorage.clear();

    // Show logout confirmation
    this.snackBar.open('Logged out successfully!', '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });

    // Navigate to login page
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }
}
