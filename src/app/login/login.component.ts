import { JsonPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  userObj: any;
  userStr: any;
  header = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  });
  submitForm: any = {};

  //login error
  error: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      username: '',
      password: '',
    });
  }
  login() {
    this.submitForm = new URLSearchParams({
      username: this.form.get('username')?.value,
      password: this.form.get('password')?.value,
      grant_type: 'password',
    });
    const reqH = new HttpHeaders({
      'Content-Type': 'application/x-www-urlencoded',
    });
    this.http
      .post('https://api-dev-voffice.v-soft.vn/token', this.submitForm, {
        headers: reqH,
      })
      .subscribe(
        (response: any) => {
          // if (response.status === 200) {
          localStorage.setItem('userInfor', JSON.stringify(response));
          this.userStr = localStorage.getItem('userInfor');
          this.userObj = JSON.parse(this.userStr);
          console.log(typeof this.userObj);
          console.log('login success');
          this.router.navigate(['']).then(() => {
            window.location.reload();
          });
        },
        (err: any) => {
          this.showMessage({
            severity: 'error',
            summary: 'Đăng nhập thất bại',
            detail: err.error.error_description,
          });
        }
      );
  }
  showMessage($event: any) {
    this.messageService.add({
      key: 'tl',
      severity: $event.severity,
      summary: $event.summary,
      detail: $event.detail,
    });
  }
}
