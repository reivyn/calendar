import {Component, OnInit} from '@angular/core';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

export interface CalendarDate {
  year: number;
  month: number;
  week: number;
  weekDay: number;
  day: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  constructor(private modalService: NgbModal, private fb: FormBuilder) {
  }

  currentDate: Date;
  monthWeeks: [any];
  selectedDate: any;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  colorsOption = [
    {name: 'Blue', rgb: '#007bff'},
    {name: 'Indigo', rgb: '#6610f2'},
    {name: 'Purple', rgb: '#6f42c1'},
    {name: 'Pink', rgb: '#e83e8c'},
    {name: 'Red', rgb: '#dc3545'},
    {name: 'Orange', rgb: '#fd7e14'},
    {name: 'Yellow', rgb: '#ffc107'},
    {name: 'Green', rgb: '#28a745'},
    {name: 'Teal', rgb: '#20c997'},
    {name: 'Cyan', rgb: '#17a2b8'}
  ];
  selectedMonth: number;
  selectedYear: number;
  closeResult: string;
  reminderForm: FormGroup;
  tempModalData: CalendarDate;
  colorPickerState = false;


  private static getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnInit(): void {
    this.currentDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    this.selectedDate = this.currentDate;
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();

    this.monthWeeks = [{
      [this.selectedYear]: {
        [this.selectedMonth]: []
      }
    }];
    this.reminderForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(30)]],
      time: [{hour: 12, minute: 0o0}, [Validators.required]],
      color: ['', [Validators.required]],
    });

    this.getCalendar(this.currentDate);
  }

  getCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = 6 - new Date(year, month + 1, 0).getDay();
    const totalMonthDays = new Date(year, month + 1, 0).getDate();
    let weekCount = 0;

    if (this.monthWeeks[0][year] === undefined) {
      this.monthWeeks[0][year] = [];
    }

    if (this.monthWeeks[0][year][month] === undefined) {
      this.monthWeeks[0][year][month] = [];
    }

    if (this.monthWeeks[0][year][month].length === 0) {
      this.monthWeeks[0][year][month][0] = [];

      for (let i = firstDay; i > 0; i--) {
        this.monthWeeks[0][year][month][weekCount].push({date: {day: new Date(year, month, 1 - i).getDate()}, option: {disabled: true}});
      }

      for (let i = 0, l = totalMonthDays; i < l; i++) {
        const dayNumber = new Date(year, month, i + 1).getDay();

        if (dayNumber < 6) {
          this.monthWeeks[0][year][month][weekCount].push({
            date: {year, month, week: weekCount, weekDay: dayNumber, day: i + 1},
            reminders: [],
            option: {}
          });
        } else {
          this.monthWeeks[0][year][month][weekCount].push({
            date: {year, month, week: weekCount, weekDay: dayNumber, day: i + 1},
            reminders: [],
            option: {}
          });
          if (i + 1 !== l) {
            this.monthWeeks[0][year][month].push([]);
            weekCount++;
          }
        }
      }

      for (let i = 0; i < lastDay; i++) {
        this.monthWeeks[0][year][month][weekCount].push({date: {day: new Date(year, month, i + 1).getDate()}, option: {disabled: true}});
      }
    }

    console.log(this.monthWeeks);
  }

  getMonth(type: string) {
    if (type === 'current') {
      this.selectedDate = this.currentDate;
    } else {
      const selectedMonth = type === 'previous' ? this.selectedDate.getMonth() : this.selectedDate.getMonth() + 2;
      const dateTime = new Date(this.selectedDate.getFullYear(), selectedMonth);
      this.selectedDate = new Date(dateTime.setDate(dateTime.getDate() - 1));
    }
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();
    this.getCalendar(this.selectedDate);
  }

  openReminderModal(targetModal, data) {
    this.tempModalData = data;
    this.modalService.open(targetModal, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      console.log(this.closeResult);
    }, (reason) => {
      this.closeResult = `Dismissed ${HomeComponent.getDismissReason(reason)}`;
      console.log(this.closeResult);
    });
  }

  setReminder() {
    console.log(this.reminderForm.get('title').value);
    console.log(this.reminderForm.get('time').value);
    console.log(this.reminderForm.get('color').value);
    console.log('Set Reminder');
    console.log(this.tempModalData);
    console.log(this.monthWeeks[0][this.tempModalData.year][this.tempModalData.month][this.tempModalData.week]);
    const year = this.tempModalData.year;
    const month = this.tempModalData.month;
    const week = this.tempModalData.week;
    const weekDay = this.tempModalData.weekDay;
    this.monthWeeks[0][year][month][week][weekDay].reminders.push({
      title: this.reminderForm.get('title').value,
      time: this.reminderForm.get('time').value,
      color: this.reminderForm.get('color').value
    });
    this.modalService.dismissAll();
    this.reminderForm.patchValue({
      title: '',
      time: {hour: 12, minute: 0o0},
      color: '#007bff'
    });
  }
}
