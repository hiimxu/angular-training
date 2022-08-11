import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  userInfo: any = window.localStorage.getItem('userInfor');

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.userInfo == null) {
      this.userInfo = localStorage.getItem('userInfor');
      console.log(this.userInfo);
    } else {
      return;
    }
  }

  logout() {
    localStorage.removeItem('userInfor');
    localStorage.clear();
    this.userInfo = null;
    if (this.userInfo == null) {
      this.router.navigate(['']);
    }
  }
}
