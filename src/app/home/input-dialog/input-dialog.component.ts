import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.css'],
})
export class InputDialogComponent implements OnInit {
  //date
  today: string = new Date().toISOString();

  //data input
  @Input() product: any = {};
  @Input() displayDialog: boolean = false;

  //data out put
  @Output() changeDisplay = new EventEmitter<boolean>();
  @Output() message = new EventEmitter<any>();
  @Output() reload = new EventEmitter<boolean>(false);

  //form value
  formAdd!: FormGroup;

  //user data from local storage
  userObj: any;
  userStr: any;

  //error mess
  responseCodeErr: any = {};
  responseTitleErr: any = {};

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}

  dialogData() {
    this.formAdd = this.formBuilder.group({
      code: '',
      title: '',
      active: false,
    });
    return this.formAdd;
  }

  userData() {
    this.userStr = localStorage.getItem('userInfor');
    this.userObj = JSON.parse(this.userStr);
    return this.userObj;
  }

  closeDialog() {
    this.displayDialog = false;
    this.changeDisplay.emit(false);
    this.responseCodeErr = {};
    this.responseTitleErr = {};
    if (this.product) {
      this.product = {};
    } else {
      this.formAdd.reset();
    }
  }

  submit() {
    this.responseCodeErr = {};
    this.responseTitleErr = {};
    if (!this.product?.id) {
      console.log('add dialog');
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
    if (this.product?.id > 0) {
      console.log('edit dialog: ' + this.product.id);
      let userData = this.userData();
      let submitObj: any = {
        code: this.formAdd.get('code')?.value,
        title: this.formAdd.get('title')?.value,
        active: this.formAdd.get('active')?.value,
        createdBy: '' + userData.userId,
        createdOn: this.today,
        editedBy: '' + userData.userId,
        editedOn: this.today,
        deleted: 0,
        documentDelivereds: this.product?.documentDelivereds,
        documentReceiveds: this.product?.documentReceiveds,
        id: this.product?.id,
      };
      console.log(submitObj);
      this.editProduct(submitObj);
    }
  }

  //API
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
        if (response.isSuccess) {
          console.log('add success');
          this.responseCodeErr = {};
          this.responseTitleErr = {};
          this.message.emit({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Thêm thành công',
          });
          setTimeout(() => {
            this.closeDialog();
            this.reload.emit(true);
          }, 1000);
          this.formAdd.reset();
        }
        if (!response.isSuccess && !response.isValid) {
          if (response.brokenRules.length) {
            if (response.brokenRules.length === 1) {
              if (response.brokenRules[0].propertyName === 'Code') {
                this.responseCodeErr = response.brokenRules[0];
              }
              if (response.brokenRules[0].propertyName === 'Title') {
                this.responseTitleErr = response.brokenRules[0];
              }
            } else {
              this.responseCodeErr = response.brokenRules[0];
              this.responseTitleErr = response.brokenRules[1];
            }
          }
          console.log(this.responseCodeErr);
          console.log(this.responseTitleErr);
        } else if (!response.isSuccess) {
          console.log('add failed');
          this.message.emit({
            severity: 'error',
            summary: 'Có lỗi xảy ra',
            detail: response?.message,
          });
        }
      });
  }

  //api edit product
  editProduct(data: any) {
    const reqH = new HttpHeaders({
      authorization: 'bearer ' + this.userObj.access_token,
    });
    this.http
      .put(
        'https://api-dev-voffice.v-soft.vn/api/DocumentType/Update',

        data,
        { headers: reqH }
      )
      .subscribe((response: any) => {
        if (response.isSuccess) {
          console.log('edit success');
          this.responseCodeErr = {};
          this.responseTitleErr = {};
          this.message.emit({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Sửa thành công',
          });
          setTimeout(() => {
            this.closeDialog();
            this.reload.emit(true);
          }, 1000);
          this.formAdd.reset();
        }
        if (!response.isSuccess && !response.isValid) {
          if (response.brokenRules.length) {
            if (response.brokenRules.length === 1) {
              if (response.brokenRules[0] === 'code') {
                this.responseCodeErr = response.brokenRules[0];
                console.log(2);
              }
              if (response.brokenRules[0] === 'title') {
                this.responseTitleErr = response.brokenRules[0];
                console.log(3);
              }
            } else {
              this.responseCodeErr = response.brokenRules[0];
              this.responseTitleErr = response.brokenRules[1];
              console.log(1);
            }
          }
          this.message.emit({
            severity: 'error',
            summary: 'Có lỗi xảy ra',
            detail: '',
          });
          console.log(this.responseCodeErr);
          console.log(this.responseTitleErr);
        } else if (!response.isSuccess) {
          console.log('add failed');
          this.message.emit({
            severity: 'error',
            summary: 'Có lỗi xảy ra',
            detail: response?.message,
          });
        }
      });
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('userInfor');
    this.dialogData();
  }
}
