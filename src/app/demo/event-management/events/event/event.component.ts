import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BookingStatus } from '../../../../enums/booking-status.enum';
import { Category } from '../../../../enums/category.enum';
import { Department } from '../../../../enums/department.enum';
import { EventType } from '../../../../enums/event-type.enum';
import { VehiclePriority } from '../../../../enums/vehicle-priority.enum';
import { EventService } from '../../../../eventservices/event.service';
import { EventModel } from '../../../../model/event.model';
import { NotificationService } from '../../../../shared/services/notification.service';



@Component({
  selector: 'app-event',
  standalone: true,
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FullCalendarModule]
})
export class EventComponent implements OnInit {

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.openEdit.bind(this)
  };
  events: EventModel[] = [];

  showModal = false;
  editMode = false;

  // Enum arrays for dropdowns
  eventTypes = Object.values(EventType);
  departments = Object.values(Department);
  vehiclePriorities = Object.values(VehiclePriority);
  bookingStatuses = Object.values(BookingStatus);
  categories = Object.values(Category);

  form: EventModel = {
    title: '',
    description: '',
    eventType: '',
    category: '',
    vehiclePriority: '',
    bookingStatus: '',
    department: '',
    isPrivateEvent: false,
    isDepartmentEvent: false,
    isVehicleUpdate: false,
    startDate: '',
    dueDate: '',
    endDate: ''
  };

  constructor(private service: EventService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.service.getAll().subscribe({
      next: (res) => {
        this.events = res.map(e => ({
          ...e,
          color: this.getColor(e)
        }));

        this.calendarOptions = {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
          },
          events: res.map(e => {
            // Build title with visual indicators
            let title = e.title;
            if (e.isPrivateEvent) title = '🔒 ' + title;
            if (e.isDepartmentEvent) title = '👥 ' + title;
            if (e.isVehicleUpdate) title = '🌐 ' + title;

            return {
              id: String(e.id),
              title: title,
              start: e.startDate ? e.startDate.split('T')[0] : undefined, // Use date only for all-day events
              end: e.endDate ? e.endDate.split('T')[0] : undefined,
              allDay: true, // Mark as all-day events
              color: this.getColor(e),
              extendedProps: {
                description: e.description,
                category: e.category,
                bookingStatus: e.bookingStatus,
                vehiclePriority: e.vehiclePriority,
                department: e.department,
                isPrivateEvent: e.isPrivateEvent,
                isDepartmentEvent: e.isDepartmentEvent,
                isVehicleUpdate: e.isVehicleUpdate
              }
            };
          }),
          dateClick: this.handleDateClick.bind(this),
          eventClick: this.openEdit.bind(this)
        };
      },
      error: (error) => {
        console.error('Failed to load events:', error);
        // Keep the default calendarOptions with empty events
      }
    });
  }

  // EVENT COLOR RULES - Updated according to requirements
  getColor(e: EventModel): string {
    // Tasks (Due Date) red colour - highest priority
    if (e.category?.toLowerCase() === 'task' && e.dueDate) {
      return 'red';
    }

    // Completed Tasks green
    if (e.bookingStatus?.toLowerCase() === 'completed') {
      return 'green';
    }

    // Overdue Tasks red
    if (e.bookingStatus?.toLowerCase() === 'overdue') {
      return 'red';
    }

    // Critical Priority red
    if (e.vehiclePriority?.toLowerCase() === 'critical') {
      return 'red';
    }

    // High Priority yellow
    if (e.vehiclePriority?.toLowerCase() === 'high') {
      return 'yellow';
    }

    // Low Priority orange
    if (e.vehiclePriority?.toLowerCase() === 'low') {
      return 'orange';
    }

    // Regular Events blue - default
    return 'blue';
  }

  handleDateClick(arg: any) {
    this.resetForm();
    this.form.startDate = arg.dateStr;
    this.form.endDate = arg.dateStr;
    this.showModal = true;
  }

  openEdit(info: any) {
    const event = this.events.find(e => String(e.id) === info.event.id);
    if (event) {
      // Convert ISO datetime strings back to date-only strings for form inputs
      const formData = { ...event };
      if (formData.startDate && formData.startDate.includes('T')) {
        formData.startDate = formData.startDate.split('T')[0];
      }
      if (formData.endDate && formData.endDate.includes('T')) {
        formData.endDate = formData.endDate.split('T')[0];
      }
      if (formData.dueDate && formData.dueDate.includes('T')) {
        formData.dueDate = formData.dueDate.split('T')[0];
      }

      this.form = formData;
      this.editMode = true;
      this.showModal = true;
    }
  }

  saveEvent() {
    console.log('Save event called. Edit mode:', this.editMode);
    console.log('Form data:', this.form);

    if (!this.form.title || this.form.title.trim() === '') {
      alert('Title is required');
      return;
    }

    // Convert date strings to ISO datetime strings for backend
    const formData = { ...this.form };
    if (formData.startDate) {
      formData.startDate = new Date(formData.startDate).toISOString();
    }
    if (formData.endDate) {
      formData.endDate = new Date(formData.endDate).toISOString();
    }
    if (formData.dueDate) {
      formData.dueDate = new Date(formData.dueDate).toISOString();
    }

    console.log('Processed form data:', formData);

    if (this.editMode) {
      console.log('Updating event with ID:', this.form.id);
      this.service.update(this.form.id!, formData).subscribe({
        next: (result) => {
          console.log('Update successful:', result);
          console.log('Calling notifyEventUpdated with:', { title: this.form.title, id: this.form.id });
          this.notificationService.notifyEventUpdated({ title: this.form.title, id: this.form.id });
          this.close();
          this.loadEvents();
        },
        error: (error) => {
          console.error('Update failed:', error);
          alert('Failed to update event: ' + (error.error?.message || error.message));
        }
      });
    } else {
      console.log('Creating new event');
      this.service.createEvent(formData).subscribe({
        next: (result) => {
          console.log('Create successful:', result);
          this.notificationService.notifyEventCreated({ title: this.form.title, id: result.id });
          this.close();
          this.loadEvents();
        },
        error: (error) => {
          console.error('Create failed:', error);
          alert('Failed to create event: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  deleteEvent() {
    if (this.form.id) {
      const eventTitle = this.form.title;
      console.log('Deleting event with title:', eventTitle, 'and ID:', this.form.id);
      this.service.delete(this.form.id).subscribe(() => {
        console.log('Delete successful, calling notifyEventDeleted with:', { title: eventTitle, id: this.form.id });
        this.notificationService.notifyEventDeleted({ title: eventTitle, id: this.form.id });
        this.close();
        this.loadEvents();
      });
    }
  }

  close() {
    this.showModal = false;
    this.editMode = false;
  }

  resetForm() {
    this.form = {
      title: '',
      description: '',
      eventType: '',
      category: '',
      vehiclePriority: '',
      bookingStatus: '',
      department: '',
      isPrivateEvent: false,
      isDepartmentEvent: false,
      isVehicleUpdate: false,
      startDate: '',
      endDate: '',
      dueDate: ''
    };
  }

}
