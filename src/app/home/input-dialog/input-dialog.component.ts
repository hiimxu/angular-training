import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
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

  //Target element
  @ViewChild('codeInput') codeInput!: ElementRef<HTMLInputElement>;
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

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
  responseCodeIsValid: string = '';

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
          this.responseCodeIsValid = '';
          this.message.emit({
            severity: 'success',
            summary: 'Th??nh c??ng',
            detail: 'Th??m th??nh c??ng',
          });
          setTimeout(() => {
            this.closeDialog();
            this.reload.emit(true);
            this.formAdd.reset();
          }, 1000);
        }
        if (!response.isSuccess && !response.isValid) {
          if (response.brokenRules.length) {
            if (response.brokenRules.length === 1) {
              if (response.brokenRules[0].propertyName === 'Code') {
                this.responseCodeErr = response.brokenRules[0];
                this.codeInput.nativeElement.focus();
              }
              if (response.brokenRules[0].propertyName === 'Title') {
                this.responseTitleErr = response.brokenRules[0];
                this.titleInput.nativeElement.focus();
              }
            } else {
              this.responseCodeErr = response.brokenRules[0];
              this.responseTitleErr = response.brokenRules[1];
              this.codeInput.nativeElement.focus();
            }
          }
          console.log(this.responseCodeErr);
          console.log(this.responseTitleErr);
        } else if (!response.isSuccess) {
          console.log('add failed');
          this.responseCodeIsValid = response.message;
          this.codeInput.nativeElement.focus();
          this.message.emit({
            severity: 'error',
            summary: 'C?? l???i x???y ra',
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
          this.responseCodeIsValid = '';
          this.message.emit({
            severity: 'success',
            summary: 'Th??nh c??ng',
            detail: 'S???a th??nh c??ng',
          });
          setTimeout(() => {
            this.closeDialog();
            this.reload.emit(true);
            this.formAdd.reset();
          }, 1000);
        }
        if (!response.isSuccess && !response.isValid) {
          if (response.brokenRules.length) {
            if (response.brokenRules.length === 1) {
              if (response.brokenRules[0] === 'code') {
                this.responseCodeErr = response.brokenRules[0];
                this.codeInput.nativeElement.focus();
              }
              if (response.brokenRules[0] === 'title') {
                this.responseTitleErr = response.brokenRules[0];
                this.titleInput.nativeElement.focus();
              }
            } else {
              this.responseCodeErr = response.brokenRules[0];
              this.responseTitleErr = response.brokenRules[1];
              this.codeInput.nativeElement.focus();
            }
          }
          this.message.emit({
            severity: 'error',
            summary: 'C?? l???i x???y ra',
            detail: '',
          });
          console.log(this.responseCodeErr);
          console.log(this.responseTitleErr);
        } else if (!response.isSuccess) {
          console.log('add failed');
          this.responseCodeIsValid = response.message;
          this.codeInput.nativeElement.focus();
          this.message.emit({
            severity: 'error',
            summary: 'C?? l???i x???y ra',
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
