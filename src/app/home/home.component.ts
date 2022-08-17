import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PrimeNGConfig } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoginComponent } from '../login/login.component';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  today: string = new Date().toISOString();

  //control dialog
  displayAdd: boolean = false;
  displayDelete: boolean = false;
  displayEdit: boolean = false;
  displaySearch: boolean = false;

  //user data from local storage
  userObj: any;
  userStr: any;

  products: any[] = [];
  page: any = {};

  //edit product
  editItemSelected: any = {};
  editItem: number = 0;

  
  searchKeyword!: FormGroup;

  //delete product
  deleteIdSelected: number = 0;

  search: any = {
    keyword: '',
    pageSize: '10',
    pageNumber: '1',
  };

  //paginator
  first: number = 0;
  last: number = 0;
  rowIndex: number = 1;

  constructor(
    private http: HttpClient,
    private primengConfig: PrimeNGConfig,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {}

  paginate(event: any) {
    this.page = {};
    const pageIndex = event.first / event.rows + 1;
    const pageSize = event.rows;
    this.search = {
      ...this.search,
      pageNumber: pageIndex,
      pageSize: pageSize,
    };

    this.getData(this.search);
    event.pageCount = this.page.pagesCount;
  }
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

    this.getData(this.search);
  }

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
        this.page = {
          ...this.page,
          pagesCount: response.pagesCount,
          pageSize: response.pageSize,
          pageNumber: response.pageNumber,
          totalItems: response.totalItems,
        };
        this.first = response.pageSize * (response.pageNumber - 1);
        this.last = this.first + response.pageSize;
        if (this.last <= response.totalItems) {
          this.last = this.first + response.pageSize;
        } else {
          this.last = response.totalItems;
        }
        console.log(this.page);

        // console.log(this.pagesCount);
        this.products = [...response.data];
        this.closeSearchDialog();
      });
  }

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
        if (response.isSuccess && response.isValid) {
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
        } else {
          console.log(response.message);
        }
      });
  }

  async selectEditItem(product: any) {
    const reqH = new HttpHeaders({
      authorization: 'bearer ' + this.userObj.access_token,
    });
    this.editItem = product;

    let result = await this.http
      .get(
        'https://api-dev-voffice.v-soft.vn/api/DocumentType/Get/' + product.id,
        { headers: reqH }
      )
      .subscribe((response: any) => (this.editItemSelected = response.value));
    console.log('prev state:');
    console.log(this.editItemSelected);

    this.showEditDialog();
  }

  //CONTROLS DIALOG
  //add dialog
  showAddDialog() {
    this.displayAdd = true;
    console.log(this.displayAdd);
  }
  closeAddDialog($event: boolean) {
    this.displayAdd = $event;
    console.log('close add dialog');
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
  closeEditDialog($event: boolean) {
    this.displayEdit = $event;
    console.log('close edit dialog');
  }
  //mobile search dialog
  showSearchDialog() {
    this.displaySearch = true;
  }
  closeSearchDialog() {
    this.displaySearch = false;
  }

  //message dialog
  showMessage($event: any) {
    this.messageService.add({
      key: 'tl',
      severity: $event.severity,
      summary: $event.summary,
      detail: $event.detail,
    });
  }

  reloadData($event: boolean) {
    if ($event === true) {
      this.getData(this.search);
    }
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('userInfor');
    if (!userData) {
      this.router.navigate(['/login']);
    }
    this.searchData();
    this.userData();
    if (userData) {
      this.getData(this.search);
    }
  }
}
