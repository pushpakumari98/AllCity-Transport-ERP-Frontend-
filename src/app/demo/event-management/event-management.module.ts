import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EventComponent } from './events/event/event.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FullCalendarModule,
    ReactiveFormsModule,
    FormsModule,
    EventComponent
  ]
})
export class EventManagementModule { }
