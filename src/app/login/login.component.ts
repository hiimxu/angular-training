import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  header = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  });
  submitForm: any = {};

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}

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
      .subscribe(() => {
        console.log('login success');
      });
  }
}
