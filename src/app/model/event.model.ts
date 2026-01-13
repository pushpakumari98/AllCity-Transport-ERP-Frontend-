export interface EventModel {
  id?: number;

  title: string;
  description?: string;

  eventType?: string;
  category?: string;           // Enum name strings expected by backend (WORKSHOP, EVENT, TASK, MEETING)
  vehiclePriority?: string;    // (LOW, MEDIUM, HIGH, CRITICAL)
  bookingStatus?: string;      // (UPCOMING, INPROGRESS, COMPLETED, PENDING, OVERDUE, CANCELLED)

  department?: string;

  isPrivateEvent?: boolean;
  isDepartmentEvent?: boolean;
  isVehicleUpdate?: boolean;

  // backend uses LocalDateTime — we will send ISO datetime strings
  startDate?: string; // "YYYY-MM-DDTHH:mm:ss"
  endDate?: string;   // "YYYY-MM-DDTHH:mm:ss"
  dueDate?: string;   // "YYYY-MM-DDTHH:mm:ss"


}
