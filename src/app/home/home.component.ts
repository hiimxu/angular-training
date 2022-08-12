import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PrimeNGConfig } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoginComponent } from '../login/login.component';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild(LoginComponent) obj!: LoginComponent;
  today: string = new Date().toISOString();

  //user data from local storage
  userObj: any;
  userStr: any;

  products: any[] = [];

  constructor(
    private http: HttpClient,
    private primengConfig: PrimeNGConfig,
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {}

  //Request for get method
  searchKeyword!: FormGroup;

  search: any = {
    keyword: '',
    pageSize: '10',
    pageNumber: '1',
  };

  searchData() {
    this.searchKeyword = this.formBuilder.group({
      keyword: '',
    });
    return this.searchKeyword;
  }

  //search actions
  handleSearch() {
    this.search = {
      ...this.search,
      keyword: this.searchKeyword.get('keyword')?.value,
    };
    console.log(this.search);
    this.getData(this.search);
  }

  //control dialog
  displayAdd: boolean = false;
  displayDelete: boolean = false;
  displayEdit: boolean = false;
  displaySearch: boolean = false;

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
        this.closeSearchDialog()
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
        this.showMessage({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Thêm thành công',
        });
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
        this.showMessage({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Xóa thành công',
        });
        setTimeout(() => {
          this.closeDeleteDialog();
        }, 1000);
        this.getData(this.search);
      });
  }

  //edit product
  editItemSelected: any = {};

  formEdit!: FormGroup;

  editData() {
    this.formEdit = this.formBuilder.group({
      codeEdit: '',
      titleEdit: '',
      activeEdit: true,
    });
  }

  async selectEditItem(product: any) {
    console.log(product);

    this.editItemSelected = product;

    const reqH = new HttpHeaders({
      authorization: 'bearer ' + this.userObj.access_token,
    });

    let result = await this.http
      .get(
        'https://api-dev-voffice.v-soft.vn/api/DocumentType/Get/' + product.id,
        { headers: reqH }
      )
      .subscribe((response: any) => (this.editItemSelected = response.value));

    console.log(this.editItemSelected);

    this.showEditDialog();
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
        console.log('edit success');
        this.showMessage({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Chỉnh sửa thành công',
        });
        setTimeout(() => {
          this.closeEditDialog();
        }, 1000);
        this.getData(this.search);
      });
  }

  submitEdit() {
    const userData = this.userData();
    const submitObj: any = {
      code: this.formEdit.get('codeEdit')?.value,
      title: this.formEdit.get('titleEdit')?.value,
      active: this.formEdit.get('activeEdit')?.value,
      createdBy: '' + userData.userId,
      createdOn: this.today,
      editedBy: '' + userData.userId,
      editedOn: this.today,
      deleted: 0,
      documentDelivereds: this.editItemSelected?.documentDelivereds,
      documentReceiveds: this.editItemSelected?.documentReceiveds,
      id: this.editItemSelected?.id,
    };
    console.log(submitObj);
    if (submitObj) {
      this.editProduct(submitObj);
    } else {
      return;
    }
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

  //edit dialog
  showEditDialog() {
    this.displayEdit = true;
  }
  closeEditDialog() {
    this.displayEdit = false;
  }
  //mobile search dialog
  showSearchDialog() {
    this.displaySearch = true;
  }
  closeSearchDialog() {
    this.displaySearch = false;
  }

  //message dialog
  showMessage(mess: any) {
    this.messageService.add({
      key: 'tl',
      severity: mess.severity,
      summary: mess.summary,
      detail: mess.detail,
    });
  }

  ngOnInit(): void {
    this.searchData();
    this.addData();
    this.editData();
    this.userData();
    this.getData(this.search);
  }
}
