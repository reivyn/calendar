import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {WeatherService} from '../services/weather.service';
import {faEdit, faPlusCircle} from '@fortawesome/free-solid-svg-icons';

export interface CalendarDate {
  year: string;
  month: string;
  week: string;
  weekDay: string;
  day?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  constructor(private modalService: NgbModal, private fb: FormBuilder, private weatherService: WeatherService) {
  }

  currentDate: Date;
  monthWeeks: [any];
  selectedDate: any;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
  reminderForm: FormGroup;
  tempModalData: CalendarDate;
  faPlusCircle = faPlusCircle;
  faEdit = faEdit;
  private fiveDayWeather: any[] | {} = '';
  selectedReminder: any;
  customReminderStatus = false;
  editReminderStatus = false;
  editReminderDay = false;
  showEditButton = false;
  totalMonthDays: number;
  editReminderInput: boolean;

  private static pad(i: number): string {
    i = i === 0o0 ? 0 : i;
    return i < 10 ? `0${i}` : `${i}`;
  }

  ngOnInit(): void {
    // (this.getWeather());
    this.currentDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    this.selectedDate = this.currentDate;
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();
    this.tempModalData = {year: '', month: '', week: '', weekDay: '', day: '1'};

    this.monthWeeks = [{
      [this.selectedYear]: {
        [this.selectedMonth]: []
      }
    }];
    this.reminderForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(30)]],
      day: ['', [
        Validators.required,
        Validators.max(new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate())
      ]],
      time: [{hour: 12, minute: 0}, [Validators.required]],
      city: ['', Validators.required],
      color: ['', [Validators.required]]
    });
    this.getCalendar(this.currentDate);
  }

  getCalendar(date) {
    let weekCount = 0;
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = 6 - new Date(year, month + 1, 0).getDay();
    this.totalMonthDays = new Date(year, month + 1, 0).getDate();

    if (this.monthWeeks[0][year] === undefined) {
      this.generateYear(year);
    }

    if (this.monthWeeks[0][year][month] === undefined) {
      this.generateMonth(year, month);
    }

    if (this.monthWeeks[0][year][month].length === 0) {
      this.generateWeeks(year, month);

      for (let i = firstDay; i > 0; i--) {
        this.monthWeeks[0][year][month][weekCount].push({date: {day: new Date(year, month, 1 - i).getDate()}, option: {disabled: true}});
      }

      for (let i = 0, l = this.totalMonthDays; i < l; i++) {
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

  private generateYear(year: number) {
    this.monthWeeks[0][year] = [];
  }

  private generateMonth(year: number, month: number) {
    this.monthWeeks[0][year][month] = [];
  }

  private generateWeeks(year: number, month: number) {
    this.monthWeeks[0][year][month][0] = [];
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

  getMonthWeek(year, month, day) {
    return new Promise<{ week: number, weekDay: number }>(resolve => {
      this.monthWeeks[0][year][month].map((x, index, arr) => {
        arr[index].map(y => {
          if (y.date.week !== undefined) {
            if (y.date.day === day) {
              console.log(y.date.week);
              console.log(y.date.day);
              resolve({week: y.date.week, weekDay: y.date.weekDay});
            }
          }
        });
      });
    });
  }


  openReminderModal(targetModal) {
    this.modalService.open(targetModal, {ariaLabelledBy: 'modal-reminder'});
  }

  addReminder(targetModal, data, type = 'default') {
    this.tempModalData = data;
    this.showEditButton = false;
    this.editReminderInput = false;
    if (type === 'default') {
      this.selectedReminder = this.monthWeeks[0][data.year][data.month][data.week][data.weekDay].reminders;
      this.reminderForm.get('day').setValue(this.tempModalData.day);
    } else if (type === 'custom') {
      this.editReminderDay = true;
      this.customReminderStatus = true;
      this.selectedReminder = this.monthWeeks[0][data.year][data.month];
    }

    this.openReminderModal(targetModal);
  }

  showReminder(targetModal, data, index) {
    this.showEditButton = true;
    this.editReminderInput = true;
    this.tempModalData = Object.assign({index}, data);
    this.selectedReminder = this.monthWeeks[0][data.year][data.month][data.week][data.weekDay].reminders[index];
    this.reminderForm.patchValue({
      title: this.selectedReminder.title,
      day: this.selectedReminder.day,
      // tslint:disable-next-line:radix
      time: {hour: Number.parseInt(this.selectedReminder.time.hour), minute: Number.parseInt(this.selectedReminder.time.minute)},
      city: this.selectedReminder.city,
      color: this.selectedReminder.color
    });
    this.openReminderModal(targetModal);
  }

  editReminder() {
    this.showEditButton = false;
    this.editReminderDay = true;
    this.editReminderStatus = true;
    this.editReminderInput = false;
  }

  async setReminder() {
    console.log('Set Reminder');
    this.reminderForm.get('time').setValue({
      hour: HomeComponent.pad(this.reminderForm.get('time').value.hour),
      minute: HomeComponent.pad(this.reminderForm.get('time').value.minute)
    });

    if (!this.editReminderStatus) {
      if (!this.customReminderStatus) {
        this.selectedReminder.push({
          title: this.reminderForm.get('title').value,
          day: this.reminderForm.get('day').value,
          time: this.reminderForm.get('time').value,
          city: this.reminderForm.get('city').value,
          color: this.reminderForm.get('color').value
        });
      } else if (this.customReminderStatus) {
        // tslint:disable-next-line:radix
        const monthWeek = await this.getMonthWeek(this.tempModalData.year, this.tempModalData.month, this.reminderForm.get('day').value);
        this.selectedReminder[monthWeek.week][monthWeek.weekDay].reminders.push({
          title: this.reminderForm.get('title').value,
          day: this.reminderForm.get('day').value,
          time: this.reminderForm.get('time').value,
          city: this.reminderForm.get('city').value,
          color: this.reminderForm.get('color').value
        });
        this.editReminderDay = false;
        this.customReminderStatus = false;
      }
    } else if (this.editReminderStatus) {
      this.selectedReminder.title = this.reminderForm.get('title').value;
      this.selectedReminder.day = this.reminderForm.get('day').value;
      this.selectedReminder.time = this.reminderForm.get('time').value;
      this.selectedReminder.city = this.reminderForm.get('city').value;
      this.selectedReminder.color = this.reminderForm.get('color').value;
      this.showEditButton = true;
      this.editReminderDay = false;
      this.editReminderStatus = false;
      this.editReminderInput = true;
    }
    this.reminderForm.patchValue({
      title: '',
      day: '',
      time: {hour: 12, minute: 0o0},
      city: '',
      color: ''
    });

    this.modalService.dismissAll();
  }


  async getWeather() {
    try {

      await this.weatherService.getWheater().subscribe(res => {
        console.log('received');
        this.fiveDayWeather = res;
      });

    } catch (e) {
      console.log('error');
    }


  }

  getWData() {
    console.log(this.fiveDayWeather);
  }


}
