import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService, UserDetails, TokenPayload } from '../authentication.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import { AppComponent } from '../app.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-contactmail',
  templateUrl: './contactmail.component.html',
  styleUrls: ['./contactmail.component.css']
})
export class ContactmailComponent implements OnInit {
  details: UserDetails;
  fullname: String;
  userid: string;
  email: string;
  csvcontacts: any;
  mycsvcontact: any;
  checkedid = [];
  searchdata: string;
  checkedcontacts: any;
  isSelected = false;
  loading = false;

  page = 0;
  limit = 10;
  lastpage: any;
  showprev: boolean = true;
  shownext: boolean = true;
  records: any;
  empty: Object;
  res: boolean =false;
  constructor(
    private http: HttpClient,
    private auth: AuthenticationService,
    private AppComponent: AppComponent,
     private _location: Location

  ) { }

  backClicked() {
    this._location.back();
  }
  ngOnInit() {
  this.getmails(this.page, this.limit)
  }

  getmails(page, limit) {
 if (page == 0) {
      this.showprev = false;
    } else {
      this.showprev = true;
    }
    this.auth.profile().subscribe(user => {
      this.details = user;
      this.fullname = this.details.name;
      this.userid = this.details._id;
      this.email = this.details.email;
      // console.log(this.useremail)
      this.http.post(this.AppComponent.BASE_URL + '/api/getcsvcontacts/' + page + '/' + limit, { userid: this.userid })
        .subscribe(data => {
          this.res=true;
           if (data != "NO records Found") {
             this.empty =""
          this.csvcontacts = data;
          this.mycsvcontact = this.csvcontacts.data;
            this.records = this.csvcontacts.count;
            // console.log("this.csvcontacts.count"),this.csvcontacts.count
          this.lastpage = Math.ceil(this.records / limit);
          if (page == (this.lastpage - 1)) {
            this.shownext = false;
          }
          else {
            this.shownext = true;
          }
           }
            else{
             this.shownext = false;
             this.showprev =false;
             this.empty="No records found";
          }
        });
    });

  }

  pageination(move) {
    if (move == 'p') {
      this.page = this.page - 1;
    }
    else if (move == 'n') {
      this.page = this.page + 1;
    }
    this.getmails(this.page, this.limit)
  }
  uploadcsvcontacts(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      this.loading = true;
      formData.append('filetoupload', file, file.name);
      formData.append('userid', this.userid);
      this.http.post(this.AppComponent.BASE_URL + '/api/uploadsmartmailcsv', formData)
        .subscribe(data => {
          this.loading = false;
          event.target.value = '';
          // this.http.post(this.AppComponent.BASE_URL + '/api/getcsvcontacts', { userid: this.userid })
          //   .subscribe(data => {
          //     this.csvcontacts = data;
          //     this.mycsvcontact = this.csvcontacts.data;
          //   });
            this.getmails(this.page, this.limit)

        });
    }
  }


  updatecontact(id, name, company, contact, email) {
    this.http.post(this.AppComponent.BASE_URL + '/api/updatesmartmailcontact', { id: id, name: name, company: company, contact: contact, email: email })
      .subscribe(data => {
        alert('Record Update Successfully');
        // this.http.post(this.AppComponent.BASE_URL + '/api/getcsvcontacts', { userid: this.userid })
        //   .subscribe(data => {
        //     this.csvcontacts = data;
        //     this.mycsvcontact = this.csvcontacts.data;
        //   });
            this.getmails(this.page, this.limit)

      });
  }

  filterarray() {
    var search = this.searchdata;
    var filteredarray = this.mycsvcontact.filter(function (el) {
      // return el.fromemail == search || el.toemail == search || el.subject == search

      return el.name.indexOf(search) > -1 || el.company.indexOf(search) > -1 || el.email.indexOf(search) > -1 || el.contact.indexOf(search) > -1
    });
    this.mycsvcontact = filteredarray;
  }

  checkAll(ev) {
    this.mycsvcontact.forEach(x => x.selected = ev.target.checked);
    this.isSelected = true;
  }

  isAllChecked() {
    if (this.isSelected == true)
      return this.mycsvcontact.every(_ => _.selected);
  }

  deletecontact() {
    this.checkedcontacts = this.mycsvcontact.filter(_ => _.selected);
    if (this.checkedcontacts.length == 0) {
      alert('Please Check At Least One Record')
    }
    else {
      if (confirm("Are you sure to delete the selected records")) {
        this.checkedid = [];
        for (let i = 0; i < this.checkedcontacts.length; i++) {
          this.checkedid.push({ id: this.checkedcontacts[i]._id });
        }
        this.http.post(this.AppComponent.BASE_URL + '/api/deletesmartmailcontact', { contactid: this.checkedid })
          .subscribe(data => {
            // this.http.post(this.AppComponent.BASE_URL + '/api/getcsvcontacts', { userid: this.userid })
            //   .subscribe(data => {
            //     this.csvcontacts = data;
            //     this.mycsvcontact = this.csvcontacts.data;
            //   });

            this.getmails(this.page, this.limit)

          });
      }
    }
  }

  downloadascsv() {
    var options = {
      headers: ["Id", "Name", "Company", "Email", "Contact", "Email Sent"]
    };
    new Angular5Csv(this.mycsvcontact, 'Report', options);

  }
  logout() {
    this.auth.logout();
  }
}
