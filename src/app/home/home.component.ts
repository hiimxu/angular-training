import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PrimeNGConfig } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  today: string = new Date().toISOString();

  //user data from local storage
  userObj: any;
  userStr: any;

  products: any[] = [];

  constructor(
    private http: HttpClient,
    private primengConfig: PrimeNGConfig,
    private formBuilder: FormBuilder
  ) {}

  //Request for get method
  search: any = {
    keyword: '',
    pageSize: '10',
    pageNumber: '1',
  };

  //control dialog
  displayAdd: boolean = false;
  displayDelete: boolean = false;

  //convert user data to object
  userData() {
    this.userStr = localStorage.getItem('userInfor');
    this.userObj = JSON.parse(this.userStr);
    return this.userObj;
  }

  //call api data table
  getData(data: any) {
    const reqH = new HttpHeaders({
      authorization: 'bearer ' + this.userObj.access_token,
    });
    this.http
      .get(
        'https://api-dev-voffice.v-soft.vn/api/DocumentType/Search?&keyword=' +
          data.keyword +
          '&pageSize=' +
          data.pageSize +
          '&pageNumber=' +
          data.pageNumber +
          '',

        { headers: reqH }
      )
      .subscribe((response: any) => {
        this.products = [...response.data];
        console.log(this.products);
      });
  }

  //taget value addForm
  formAdd!: FormGroup;
  addData() {
    this.formAdd = this.formBuilder.group({
      code: '',
      title: '',
      active: true,
    });
    return this.formAdd;
  }
  submitAdd() {
    let userData = this.userData();
    let submitObj: any = {
      code: this.formAdd.get('code')?.value,
      title: this.formAdd.get('title')?.value,
      active: this.formAdd.get('active')?.value,
      createdBy: '' + userData.userId,
      createdOn: this.today,
      editedBy: '' + userData.userId,
      editedOn: this.today,
      departmentId: '' + userData.departmentId,
      deleted: 0,
    };
    console.log(submitObj);
    this.addProduct(submitObj);
  }
  //call api add product
  addProduct(data: any) {
    const reqH = new HttpHeaders({
      authorization: 'bearer ' + this.userObj.access_token,
    });
    this.http
      .post(
        'https://api-dev-voffice.v-soft.vn/api/DocumentType/Add',

        data,
        { headers: reqH }
      )
      .subscribe((response: any) => {
        console.log('add success');
        setTimeout(() => {
          this.closeAddDialog();
        }, 1500);
        this.getData(this.search);
      });
  }

  //delete product

  deleteIdSelected: number = 0;

  deleteItemSelected(productId: number) {
    this.deleteIdSelected = productId;
    this.showDeleteDialog();
  }

  //delete product
  submitDelete() {
    const userData = this.userData();
    const dataSubmit: any = {
      id: this.deleteIdSelected,
      userId: '' + userData.userId,
    };
    if (this.deleteIdSelected != 0) {
      this.deleteProduct(dataSubmit);
    } else {
      throw new Error('This product invalid!');
    }
  }
  //call api delete product
  deleteProduct(data: any) {
    const reqH = new HttpHeaders({
      authorization: 'bearer ' + this.userObj.access_token,
    });
    this.http
      .post(
        'https://api-dev-voffice.v-soft.vn/api/DocumentType/v2_Delete',

        data,
        { headers: reqH }
      )
      .subscribe((response: any) => {
        console.log('delete success');
        setTimeout(() => {
          this.closeDeleteDialog();
        }, 1000);
        this.getData(this.search);
      });
  }

  //control dialog
  //add dialog
  showAddDialog() {
    this.displayAdd = true;
  }
  closeAddDialog() {
    this.displayAdd = false;
  }

  //delete dialog
  showDeleteDialog() {
    this.displayDelete = true;
  }
  closeDeleteDialog() {
    this.displayDelete = false;
  }

  ngOnInit(): void {
    this.addData();
    this.userData();
    this.getData(this.search);
  }
}
