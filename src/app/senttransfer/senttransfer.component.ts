import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService, UserDetails, TokenPayload} from '../authentication.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AppComponent} from '../app.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-senttransfer',
  templateUrl: './senttransfer.component.html',
  styleUrls: ['./senttransfer.component.css']
})
export class SenttransferComponent implements OnInit {

  details: UserDetails;
  fullname: String;
  userid: string;
  useremail:string;
  mails:any;
  sentmails:any;
  checkedmails:any;
  checkedid=[];
  isSelected = false;
  searchdata:string;
  email: string;
   page = 0;
  limit = 10;
  showprev: boolean;
  empty: boolean;
  records: any;
  lastpage: number;
  shownext: boolean;
  emptyMsg: string;
  constructor(
    private http: HttpClient,
    private auth: AuthenticationService,
    private AppComponent:AppComponent,
    public _location :Location

  ) { }
  backClicked() {
    this._location.back();
  }
getReadMails(page, limit) {
    if (page == 0) {
      this.showprev = false;
    } else {
      this.showprev = true;
    }
      this.http.post(this.AppComponent.BASE_URL + '/api/getfiletransfermail/' + page + '/' + limit, { userid: this.userid })
        .subscribe(data => {
          if (data != "NO records Found") {
            this.empty = false;
            this.mails = data;
            this.records = this.mails.count;
            this.sentmails = this.mails.data;
            console.log(this.sentmails)
            this.lastpage = Math.ceil(this.records / limit);
            if (page == (this.lastpage - 1)) {
              this.shownext = false;
            }
            else {
              this.shownext = true;
            }
          }
          else {
            this.shownext = false;
            this.showprev = false;
            this.empty = true;
            this.emptyMsg = "No records found";
          }
        });
  }
   pageination(move) {
    if (move == 'p') {
      this.page = this.page - 1;
    }
    else if (move == 'n') {
      this.page = this.page + 1;
    }
    this.getReadMails(this.page, this.limit)


  }
  ngOnInit() {
    this.auth.profile().subscribe(user => {
      this.details = user;
      this.fullname = this.details.name;
      this.userid = this.details._id;
      this.email = this.details.email;
     // console.log(this.useremail)
    //  this.http.post(this.AppComponent.BASE_URL+'/api/getfiletransfermail', {userid:this.userid})
    //  .subscribe(data => {
    //    this.mails = data;
    //    this.sentmails= this.mails.data.reverse();
    //  });
      this.getReadMails(this.page, this.limit)

    });
  }

  filterarray() {
    var search = this.searchdata;
    var filteredarray = this.mails.data.filter(function (el) {
   // return el.fromemail == search || el.toemail == search || el.subject == search

   return  el.fromemail.indexOf(search)>-1 || el.toemail.indexOf(search)>-1 || el.subject.indexOf(search)>-1
    });
    this.sentmails=filteredarray;
  }

  checkAll(ev) {
    this.sentmails.forEach(x => x.selected = ev.target.checked);
    this.isSelected = true;
  }
  
  isAllChecked() {
    if(this.isSelected == true)
    return this.sentmails.every(_ => _.selected);
  }
  logout() {
    this.auth.logout();
  }
  deletemails() {
    this.checkedmails= this.sentmails.filter(_ => _.selected);
    if(this.checkedmails.length == 0 ) {
      alert('Please Check At Least One Record')
    }
    else {
      if(confirm("Are you sure to delete the selected records")) {
        this.checkedid = [];
       for( let i = 0;i<this.checkedmails.length;i++) {
        this.checkedid.push({id:this.checkedmails[i]._id});
       }
      //  this.http.post(this.AppComponent.BASE_URL+'/api/deletefiletransfermail', movefiletransfermailstotrash
       this.http.post(this.AppComponent.BASE_URL+'/api/movefiletransfermailstotrash', 
      {mailid:this.checkedid})
       .subscribe(data => {
           this.getReadMails(this.page, this.limit);

        // this.http.post(this.AppComponent.BASE_URL+'/api/getfiletransfermail', {userid:this.userid})
        // .subscribe(data => {
        //   this.mails = data;
        //   this.sentmails= this.mails.data.reverse();
        // });
       });  
    }

    }
  }
}
