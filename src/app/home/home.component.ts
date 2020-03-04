import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {WeatherService} from '../services/weather.service';
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {Observable} from 'rxjs';

// Interface declaration
export interface CalendarDate {
  index?: number;
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

  // Variables Declarations
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
  selectedReminder: any;
  customReminderStatus = false;
  editReminderStatus = false;
  editReminderDay = false;
  showEditButton = false;
  totalMonthDays: number;
  editReminderInput: boolean;

  // Static Methods declaration
  // Static method to formatting datetime numbers
  private static pad(i: number): string {
    i = i === 0o0 ? 0 : i;
    return i < 10 ? `0${i}` : `${i}`;
  }

  ngOnInit(): void {
    this.currentDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    this.selectedDate = this.currentDate;
    this.selectedMonth = this.selectedDate.getMonth();
    this.selectedYear = this.selectedDate.getFullYear();
    this.tempModalData = {year: '', month: '', week: '', weekDay: '', day: '1'};

    // Initialized basic structure of calendar information array
    this.monthWeeks = [{
      [this.selectedYear]: {
        [this.selectedMonth]: []
      }
    }];

    // Initialized reactive form for modal form
    this.reminderForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(30)]],
      day: ['', [
        Validators.required,
        Validators.max(new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate())
      ]],
      time: [{hour: 12, minute: 0}, [Validators.required]],
      city: ['', Validators.required],
      color: ['', [Validators.required]],
      forecast: [{weather: '', temp: ''}]
    });
    this.getCalendar(this.currentDate);
  }

  // Function to rendering the calendar
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
  }

  // Function to generate Year for calendar
  private generateYear(year: number) {
    this.monthWeeks[0][year] = [];
  }

  // Function to generate Month for the calendar
  private generateMonth(year: number, month: number) {
    this.monthWeeks[0][year][month] = [];
  }

  // Function to generate the Weeks of the calendar
  private generateWeeks(year: number, month: number) {
    this.monthWeeks[0][year][month][0] = [];
  }

  // Function to get and render the query month
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

  // Function to get the week of a day on depend of the Year and Month
  getMonthWeek(year, month, day) {
    return new Promise<{ week: number, weekDay: number }>(resolve => {
      this.monthWeeks[0][year][month].map((x, index, arr) => {
        arr[index].map(y => {
          if (y.date.week !== undefined) {
            if (y.date.day === day) {
              resolve({week: y.date.week, weekDay: y.date.weekDay});
            }
          }
        });
      });
    });
  }

  // Function to open the template modal
  openReminderModal(targetModal) {
      this.modalService.open(targetModal, {ariaLabelledBy: 'modal-reminder'});
  }

  // Function to add reminders to the calendar on depend of the type
  // Type Default: Add on clicked day of the month | Type Custom: Add on any day of the month
  addReminder(targetModal, data, type = 'default') {
    this.tempModalData = data;
    this.showEditButton = false;
    this.editReminderInput = false;
    if (type === 'default') {
      this.editReminderDay = false;
      this.customReminderStatus = false;
      this.selectedReminder = this.monthWeeks[0][data.year][data.month][data.week][data.weekDay].reminders;
      this.reminderForm.get('day').setValue(this.tempModalData.day);
    } else if (type === 'custom') {
      this.editReminderDay = true;
      this.customReminderStatus = true;
      this.selectedReminder = this.monthWeeks[0][data.year][data.month];
    }

    this.reminderForm.get('title').reset();
    this.reminderForm.get('city').reset();
    this.reminderForm.get('color').reset();
    this.reminderForm.get('color').setValue('');
    this.openReminderModal(targetModal);
  }

  // Open and show a created reminder when you click on it
  showReminder(targetModal, data, index) {
    this.showEditButton = true;
    this.editReminderInput = true;
    this.tempModalData = Object.assign({index}, data);
    this.selectedReminder = this.monthWeeks[0][data.year][data.month][data.week][data.weekDay].reminders;
    this.reminderForm.patchValue({
      title: this.selectedReminder[index].title,
      day: this.selectedReminder[index].day,
      time: {
        // tslint:disable-next-line:radix
        hour: Number.parseInt(this.selectedReminder[index].time.hour),
        // tslint:disable-next-line:radix
        minute: Number.parseInt(this.selectedReminder[index].time.minute)
      },
      city: this.selectedReminder[index].city,
      color: this.selectedReminder[index].color,
      forecast: this.selectedReminder[index].forecast,
    });
    this.openReminderModal(targetModal);
  }

  // Unlock the inputs to make the reminder editable
  editReminder() {
    this.showEditButton = false;
    this.editReminderDay = true;
    this.editReminderStatus = true;
    this.editReminderInput = false;
  }

  // Add or update reminder data on a day of the calendar
  async setReminder() {

    // Clean datetime values
    this.reminderForm.get('time').setValue({
      hour: HomeComponent.pad(this.reminderForm.get('time').value.hour),
      minute: HomeComponent.pad(this.reminderForm.get('time').value.minute)
    });

    // Set and check weather if the reminder is created in the current date
    let dayWeather: any = '';
    const today = new Date().getDate();
    if (today === this.reminderForm.get('day').value) {
      const weather: { weather: any; temp: any } | Observable<unknown> | any = await this.getWeather(this.reminderForm.get('city').value);
      if (weather === 'Error') {
        dayWeather = 'City not found';
      } else {
        dayWeather = {weather: weather?.weather, temp: this.temperatureConverter(weather?.temp)};
      }
    }

    // Add new reminder to the calendar on a specific day
    if (!this.editReminderStatus) {
      if (!this.customReminderStatus) {
        this.selectedReminder.push({
          title: this.reminderForm.get('title').value,
          day: this.reminderForm.get('day').value,
          time: this.reminderForm.get('time').value,
          city: this.reminderForm.get('city').value,
          color: this.reminderForm.get('color').value,
          forecast: dayWeather
        });
        this.sortReminders(this.selectedReminder);
      } else if (this.customReminderStatus) {
        // tslint:disable-next-line:radix
        const monthWeek = await this.getMonthWeek(this.tempModalData.year, this.tempModalData.month, this.reminderForm.get('day').value);
        this.selectedReminder[monthWeek.week][monthWeek.weekDay].reminders.push({
          title: this.reminderForm.get('title').value,
          day: this.reminderForm.get('day').value,
          time: this.reminderForm.get('time').value,
          city: this.reminderForm.get('city').value,
          color: this.reminderForm.get('color').value,
          forecast: dayWeather
        });
        this.sortReminders(this.selectedReminder[monthWeek.week][monthWeek.weekDay].reminders);
        this.editReminderDay = false;
        this.customReminderStatus = false;
      }
    } else if (this.editReminderStatus) {
      // Check and set new data to an exiting reminder
      const index = this.tempModalData.index;
      if (this.reminderForm.get('day').value !== this.tempModalData.day) {
        const monthWeek = await this.getMonthWeek(this.tempModalData.year, this.tempModalData.month, this.reminderForm.get('day').value);
        const dataUpdated = {
          title: this.reminderForm.get('title').value,
          day: this.reminderForm.get('day').value,
          time: this.reminderForm.get('time').value,
          city: this.reminderForm.get('city').value,
          color: this.reminderForm.get('color').value,
          forecast: dayWeather
        };
        this.selectedReminder.splice(index, 1);
        // tslint:disable-next-line:max-line-length
        this.monthWeeks[0][this.tempModalData.year][this.tempModalData.month][monthWeek.week][monthWeek.weekDay].reminders.push(dataUpdated);
        this.sortReminders(this.monthWeeks[0][this.tempModalData.year][this.tempModalData.month][monthWeek.week][monthWeek.weekDay].reminders);
      } else {
        this.selectedReminder[index].title = this.reminderForm.get('title').value;
        this.selectedReminder[index].day = this.reminderForm.get('day').value;
        this.selectedReminder[index].time = this.reminderForm.get('time').value;
        this.selectedReminder[index].city = this.reminderForm.get('city').value;
        this.selectedReminder[index].color = this.reminderForm.get('color').value;
        this.selectedReminder[index].forecast = dayWeather;
        this.sortReminders(this.selectedReminder);
      }
      this.showEditButton = true;
      this.editReminderDay = false;
      this.editReminderStatus = false;
      this.editReminderInput = true;
    }

    // Restore the values of the form to default
    this.reminderForm.patchValue({
      title: '',
      day: '',
      time: {hour: 12, minute: 0o0},
      city: '',
      color: '',
      forecast: {weather: '', temp: ''}
    });

    // Close the modal
    this.modalService.dismissAll();
  }

  // Function to sort the reminders by HH:MM
  sortReminders(data) {
    data.sort((a, b) => {
      return (a.time.hour + a.time.minute) - (b.time.hour + b.time.minute);
    });
  }

  // Call HTTP service to get the current Weather by City
  async getWeather(city) {
    try {
      return await this.weatherService.getWeather(city);
    } catch (e) {
      return 'Error';
    }
  }

  // Convert Kelvin to Celsius
  temperatureConverter(valNum) {
    valNum = parseFloat(valNum);
    return valNum - 273.15;
  }

}
