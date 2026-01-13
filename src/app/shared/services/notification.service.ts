import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationItem {
  id: string;
  type: 'booking' | 'sale' | 'driver' | 'purchase' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  private storageKey = 'notifications';

  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.loadNotifications();
  }

  get notifications(): NotificationItem[] {
    return this.notificationsSubject.value;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const newNotification: NotificationItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      icon: this.getIconForType(notification.type),
      ...notification
    };

    const currentNotifications = this.notifications;
    const updatedNotifications = [newNotification, ...currentNotifications];

    // Keep only last 50 notifications
    if (updatedNotifications.length > 50) {
      updatedNotifications.splice(50);
    }

    this.saveNotifications(updatedNotifications);
    this.notificationsSubject.next(updatedNotifications);
  }

  markAsRead(notificationId: string) {
    const notifications = this.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.saveNotifications(notifications);
    this.notificationsSubject.next(notifications);
  }

  markAllAsRead() {
    const notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications(notifications);
    this.notificationsSubject.next(notifications);
  }

  clearAll() {
    this.saveNotifications([]);
    this.notificationsSubject.next([]);
  }

  removeNotification(notificationId: string) {
    const notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(notifications);
    this.notificationsSubject.next(notifications);
  }

  private getIconForType(type: string): string {
    switch (type) {
      case 'booking': return 'feather icon-calendar';
      case 'sale': return 'feather icon-dollar-sign';
      case 'driver': return 'feather icon-user-plus';
      case 'purchase': return 'feather icon-package';
      default: return 'feather icon-bell';
    }
  }

  private saveNotifications(notifications: NotificationItem[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private loadNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const notifications: NotificationItem[] = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const processedNotifications = notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next(processedNotifications);
      } else {
        // Add some sample notifications for demo
        this.addSampleNotifications();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.addSampleNotifications();
    }
  }

  private addSampleNotifications() {
    const sampleNotifications: NotificationItem[] = [
      {
        id: '1',
        type: 'booking',
        title: 'New Vehicle Booking',
        message: 'Vehicle Truck-001 was booked successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        icon: this.getIconForType('booking')
      },
      {
        id: '2',
        type: 'sale',
        title: 'Vehicle Sold',
        message: 'Vehicle Car-005 was sold for ₹850,000',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: false,
        icon: this.getIconForType('sale')
      },
      {
        id: '3',
        type: 'driver',
        title: 'New Driver Added',
        message: 'Driver "Rajesh Kumar" was registered',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        icon: this.getIconForType('driver')
      }
    ];

    this.notificationsSubject.next(sampleNotifications);
    this.saveNotifications(sampleNotifications);
  }

  // Public methods for triggering specific notification types
  notifyBooking(bookingDetails: any) {
    this.addNotification({
      type: 'booking',
      title: 'Vehicle Booked Successfully',
      message: `Vehicle ${bookingDetails.vehicleId || 'N/A'} booked from ${bookingDetails.startedFrom || 'N/A'} to ${bookingDetails.destination || 'N/A'}`,
      data: bookingDetails
    });
  }

  notifySale(saleDetails: any) {
    this.addNotification({
      type: 'sale',
      title: 'Vehicle Sold Successfully',
      message: `Vehicle ${saleDetails.vehicleId || 'N/A'} sold for vehicle at ${saleDetails.date || 'N/A'}`,
      data: saleDetails
    });
  }

  notifyDriverAdded(driverDetails: any) {
    this.addNotification({
      type: 'driver',
      title: 'Driver Added Successfully',
      message: `Driver "${driverDetails.driverName || driverDetails.serialNumber || 'N/A'}" registered`,
      data: driverDetails
    });
  }

  notifyPurchase(purchaseDetails: any) {
    this.addNotification({
      type: 'purchase',
      title: 'Vehicle Purchased',
      message: `New vehicle ${purchaseDetails.vehicleModel || purchaseDetails.vehicleId || 'N/A'} added to fleet`,
      data: purchaseDetails
    });
  }

  notifyEventCreated(eventDetails: any) {
    console.log('NotificationService: notifyEventCreated called with:', eventDetails);
    this.addNotification({
      type: 'info',
      title: 'Event Created',
      message: `New event "${eventDetails.title}" has been created`,
      data: eventDetails
    });
    console.log('NotificationService: notification added for event creation');
  }

  notifyEventUpdated(eventDetails: any) {
    console.log('NotificationService: notifyEventUpdated called with:', eventDetails);
    this.addNotification({
      type: 'info',
      title: 'Event Updated',
      message: `Event "${eventDetails.title}" has been updated`,
      data: eventDetails
    });
    console.log('NotificationService: notification added for event update');
  }

  notifyEventDeleted(eventDetails: any) {
    console.log('NotificationService: notifyEventDeleted called with:', eventDetails);
    this.addNotification({
      type: 'info',
      title: 'Event Deleted',
      message: `Event "${eventDetails.title}" has been deleted`,
      data: eventDetails
    });
    console.log('NotificationService: notification added for event deletion');
  }
}
