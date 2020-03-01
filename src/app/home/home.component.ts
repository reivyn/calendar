import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  currentDate: Date;
  monthWeeks: [any];
  selectedDate: any;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  selectedMonth: number;
  selectedYear: number;

  constructor() {
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
        this.monthWeeks[0][year][month][weekCount].push({monthDay: new Date(year, month, 1 - i).getDate(), dayDisabled: true});
      }

      for (let i = 0, l = totalMonthDays; i < l; i++) {
        const dayNumber = new Date(year, month, i + 1).getDay();

        if (dayNumber < 6) {
          this.monthWeeks[0][year][month][weekCount].push({monthDay: i + 1, reminders: []});
        } else {
          this.monthWeeks[0][year][month][weekCount].push({monthDay: i + 1, reminders: []});
          if (i + 1 !== l) {
            this.monthWeeks[0][year][month].push([]);
            weekCount++;
          }
        }
      }

      for (let i = 0; i < lastDay; i++) {
        this.monthWeeks[0][year][month][weekCount].push({monthDay: new Date(year, month, i + 1).getDate(), dayDisabled: true});
      }
    }

    console.log(this.monthWeeks);
  }

  getCurrentMonth() {
    this.selectedDate = this.currentDate;
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();
    this.getCalendar(this.currentDate);
  }

  getPreviousMonth() {
    const dt = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth());
    const p = new Date(dt.setDate(dt.getDate() - 1));

    this.selectedDate = p;
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();

    this.getCalendar(p);

  }

  getNextMonth() {
    const dt = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 2);
    const p = new Date(dt.setDate(dt.getDate() - 1));

    this.selectedDate = p;
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();
    this.getCalendar(p);
  }

  setReminder() {
    console.log('Set Reminder');
  }
}
