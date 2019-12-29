import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UploadEvent, UploadFile, FileSystemFileEntry } from 'ngx-file-drop';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AuthenticationService, UserDetails } from '../authentication.service';
import { INgxMyDpOptions, IMyDateModel } from 'ngx-mydatepicker';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TypeCheckCompiler } from '@angular/compiler/src/view_compiler/type_check_compiler';
import { variable } from '@angular/compiler/src/output/output_ast';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { NgProgressModule } from 'ngx-progressbar';
import { NgProgress } from 'ngx-progressbar';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
// import {ModalModule} from 'ngx-modal';
// import { DialogService } from 'ng2-bootstrap-modal';
// import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Location } from '@angular/common';

@Component({
  selector: 'app-digital-sign',
  templateUrl: './digital-sign.component.html',
  styleUrls: ['./digital-sign.component.css']
})

export class DigitalSignComponent implements OnInit {
  details: UserDetails;
  innerHtml: SafeHtml;
  pdfpath: any;
  pdfname: any;
  loading = false;
  files: UploadFile[] = [];
  fullname: String;
  firstName: String;
  email: String;
  lastName: String;
  userid: String;
  count: any;
  error: String;
  contactList: any;
  contacts = [];
  mycontacts: any;
  showcontacts: any;
  contactdata: any;
  contactid: String;
  type: String;
  digitalpath: String;
  editcontacttype: String;
  newtype: String;
  contactfirstName: String;
  contactlastName: String;
  contactemail: String;
  contactaddress: String;
  contactsubject: String;
  contactmessage: String;
  documentcount: string;
  showexpdate = false;
  priority = false;
  expirationdate: String;
  firstnameerror: String;
  lasterror: String;
  emailerror: String;
  nocontacts: String;
  adduserarray = [];
  isdisabled = false;
  adduserresult: any;
  pdferror: String;
  uploadedPercentage = 0;
  message: any;
  message2: any;

  showMessage = false;
  percentmessage: any;
  showpercentMessage = false;
  pdfid: any;
  myOptions: INgxMyDpOptions = {
    // other options...
    dateFormat: 'mm-dd-yyyy',
    closeSelectorOnDocumentClick: false
  };
  template: string = `<img src="../../assets/img/ezgif.com-gif-makerold.gif" style="margin-left:200px"/>`;

  model: any = { jsdate: new Date() };
  @ViewChild('addparticipantModal') addparticipantModal: any;
  @ViewChild('contactdetailModal') contactdetailModal: any;
  @ViewChild('mycontactsModal') mycontactsModal: any;
  @ViewChild('participantModal') participantModal: any;
  @ViewChild('addyourselfModal') addyourselfModal: any;
  @ViewChild('editparticipantModal') editparticipantModal: any;

  constructor(private http: HttpClient,
    private domSanitizer: DomSanitizer,
    private auth: AuthenticationService,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinnerService: Ng4LoadingSpinnerService,
    public progressService: NgProgress,
    private slimLoadingBarService: SlimLoadingBarService,
    // private dialogService: DialogService
    private _location: Location

  ) { }
  backClicked() {
    this._location.back();
  }
  addparticipantForm = this.fb.group({
    newtype: ['', Validators.required],
    firstName: ['', Validators.required],
    email: ['', Validators.required],
    lastName: ['', Validators.required],
    address: [],
    subject: [],
    message: []
  });

  contactdetailForm = this.fb.group({
    type: ['', Validators.required],
    firstName: ['', Validators.required],
    email: ['', Validators.required],
    lastName: ['', Validators.required],
    address: [],
    subject: [],
    message: []
  });

  ngOnInit() {
    this.type = 'Remote Signer';
    this.digitalpath = localStorage.getItem('digitalpath')

    this.auth.profile().subscribe(user => {
      // this.spinnerService.show();
      this.details = user;
      this.fullname = this.details.name;
      this.email = this.details.email;
      this.digitalpath = localStorage.getItem('digitalpath');
      const nameArr = this.fullname.split(' ');
      if (nameArr.length > 2) {
        this.lastName = nameArr.pop();
        this.firstName = nameArr.join(' ');
      } else {
        this.firstName = nameArr[0];
        this.lastName = nameArr[nameArr.length - 1];
      }
      this.userid = this.details._id;
      this.http.get('https://ezeeboss.com:3001/api/documentcount/' + this.userid)
        .subscribe(data => {
          this.count = data;
          this.documentcount = 'Ref-' + this.count.data;
          localStorage.setItem('docid', this.documentcount);
          this.http.get('https://ezeeboss.com:3001/api/mycontacts/' + this.userid)
            // tslint:disable-next-line:no-shadowed-variable
            .subscribe(data => {
              this.showcontacts = data;
              this.mycontacts = this.showcontacts.data;
              if (!this.mycontacts.length) {
                this.nocontacts = 'No Contacts';
              }
            });
        });
    });

  }
  fileDrop() {
    console.log('this.files');
    this.spinnerService.hide();
  }
  fileChange(event) {

    const fileList: FileList = event.target.files;
    this.pdfname = event.target.files[0].name;
    var extension = event.target.files[0].type;
    if (extension == 'application/pdf') {
      if (fileList.length > 0) {
        this.pdferror = '';
        const file: File = fileList[0];
        const formData: FormData = new FormData();

        this.showMessage = false;
        this.showpercentMessage = false;
        formData.append('filetoupload', file, file.name);


        this.http.post('https://ezeeboss.com:3001/api/uploadfile', formData, {
          reportProgress: true, observe: 'events'
        })
          .subscribe((event: HttpEvent<any>) => {
            switch (event.type) {
              case HttpEventType.Sent:
                this.slimLoadingBarService.start();
                break;
              case HttpEventType.Response:
                var cx = HttpEventType.Response;

                if (cx) {
                  //  console.log("hide........")
                  this.spinnerService.hide();
                }
                this.slimLoadingBarService.complete();
                this.showMessage = true;

                this.message2 = "Uploaded Successfully";
                this.showpercentMessage = false;
                break;
              case 1: {
                if (Math.round(this.uploadedPercentage) !== Math.round(event['loaded'] / event['total'] * 100)) {
                  this.uploadedPercentage = event['loaded'] / event['total'] * 100;
                  this.showpercentMessage = true;
                  this.percentmessage = Math.round(this.uploadedPercentage);
                  this.slimLoadingBarService.progress = Math.round(this.uploadedPercentage);
                  if (this.slimLoadingBarService.progress == 100) {
                    this.spinnerService.show();
                  }
                }
              }
                break;

            }
            if ((event as any).body) {
              this.pdfpath = (event as any).body.path;
              localStorage.setItem('pdfid', (event as any).body.pdfid);
              localStorage.setItem('pdfpath', (event as any).body.path);
              this.innerHtml = this.domSanitizer.bypassSecurityTrustHtml(
                '<object data="' + 'https://ezeeboss.com:3001' + (event as any).body.path + '" type="application/pdf" class="embed-responsive-item">' +
                'Object' + (event as any).body.path + ' failed' +
                '</object>');
              this.spinnerService.hide();
              //  (event as any).target.value = '';
            }

          }, error => {
            // console.log(error);
            this.message2 = "Something went wrong";
            // this.showMessage = true;
            this.spinnerService.hide();
            this.slimLoadingBarService.reset();
          });
      }

    }
  }

  clear() {
    this.innerHtml = '';
    this.pdfpath = '';
  }
  showpdf() {
    this.innerHtml = this.domSanitizer.bypassSecurityTrustHtml(
      '<object data="' + 'https://ezeeboss.com:3001' + this.pdfpath + '" type="application/pdf" class="embed-responsive-item">' +
      'Object' + this.pdfpath + ' failed' +
      '</object>');
    //  alert("clicked")

    // setTimeout(function(){ 
    this.spinnerService.hide();
    //    }, 6000);
  }

  filedropped(event: UploadEvent) {

    this.files = event.files;
    if (!this.files) {
      this.spinnerService.hide();
    }

      if (this.files[0].fileEntry.name.split('.').pop() != 'pdf') {
      this.spinnerService.hide();
    } 
    for (const droppedFile of event.files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        if (fileEntry.name.split('.').pop() === 'pdf' || fileEntry.name.split('.').pop() === 'PDF') {
          this.pdferror = ''
          fileEntry.file((file: File) => {
            this.pdfname = fileEntry.name;
            const formData = new FormData();
            this.showpercentMessage = false;
            formData.append('filetoupload', file, droppedFile.relativePath);
            this.http.post('https://ezeeboss.com:3001/api/uploadfile', formData, {
              reportProgress: true, observe: 'events'
            })
              .subscribe((event: HttpEvent<any>) => {
                switch (event.type) {
                  case HttpEventType.Sent:
                    this.slimLoadingBarService.start();
                    break;
                  case HttpEventType.Response:
                    var cx = HttpEventType.Response;

                    if (cx) {
                      // console.log("hide........")
                    }
                    this.slimLoadingBarService.complete();
                    this.showMessage = true;
                    this.message2 = "Uploaded Successfully";
                    this.showpercentMessage = false;
                    break;

                  case 1: {
                    if (Math.round(this.uploadedPercentage) !== Math.round(event['loaded'] / event['total'] * 100)) {
                      this.uploadedPercentage = event['loaded'] / event['total'] * 100;
                      this.showpercentMessage = true;
                      this.percentmessage = Math.round(this.uploadedPercentage);
                      this.slimLoadingBarService.progress = Math.round(this.uploadedPercentage);
                      if (this.slimLoadingBarService.progress == 100) {
                        this.spinnerService.show();
                      }
                    } else {
                      console.log("inelse")
                    }
                    break;
                  }
                }

                if ((event as any).body) {
                  //  console.log((event as any).body)
                  this.pdfpath = (event as any).body.path;
                  this.pdfid = (event as any).body.pdfid;
                  localStorage.setItem('pdfid', (event as any).body.pdfid);
                  localStorage.setItem('pdfpath', (event as any).body.path);
                  const element: HTMLElement = document.getElementById('showpdf') as HTMLElement;
                  element.click();

                  (<any>document.getElementsByClassName("drop-zone")[0]).style.zIndex = 0;

                  // this.spinnerService.hide();
                  //  (event as any).body.target.value = '';

                }

              }), error => {
                console.log(error);
                this.spinnerService.hide();
                this.message2 = "Something went wrong";
                this.slimLoadingBarService.reset();
              };

          });
        } else {
           this.spinnerService.hide();
          this.pdferror = 'Please Upload Pdf Files Only';
        }
      } else {
      }
    }
  }


  defauldate(event) {
    if (event.target.checked) {
      const date = new Date();
      let dd = date.getDate();
      let mm = date.getMonth() + 1; //January is 0!
      const yyyy = date.getFullYear();
      if (dd < 10) {
        // dd = '0' + dd;
      }
      if (mm < 10) {
        // mm = '0' + mm;
      }
      const today = mm + '-' + dd + '-' + yyyy;
      localStorage.setItem('expdate', today);
    } else {
      localStorage.setItem('expdate', '');
    }
    // this.expirationdate = today;
    // console.log(this.expirationdate);
  }

  onDateChanged(event: IMyDateModel): void {
    localStorage.setItem('expdate', event.formatted);
  }

  removeerror() {
    this.error = null;
  }

  // --------------------------- edit contacts ---------------------//

  editcontacts(id: String) {
    this.spinnerService.show();
    // this.loading = true;
    this.editparticipantModal.open();
    this.http.get('https://ezeeboss.com:3001/api/contactdetail/' + id)
      .subscribe(data => {
        this.contactdata = data;
        this.editcontacttype = this.contactdata.data[0].type;
        this.contactid = this.contactdata.data[0]._id;
        this.contactfirstName = this.contactdata.data[0].firstName;
        this.contactlastName = this.contactdata.data[0].lastName;
        this.contactemail = this.contactdata.data[0].email;
        this.contactaddress = this.contactdata.data[0].address;
        this.contactsubject = this.contactdata.data[0].subject;
        this.contactmessage = this.contactdata.data[0].message;
        this.spinnerService.hide();
      }, err => {
        this.error = err;
        this.spinnerService.hide();

      });
  }

  //------------------------------- update contact -------------------------------// 

  editparticipant() {
    this.http.post('https://ezeeboss.com:3001/api/updatepartcipant',
      {
        firstName: this.contactfirstName, lastName: this.contactlastName, email: this.contactemail, address: this.contactaddress,
        subject: this.contactsubject, message: this.contactmessage, type: this.editcontacttype, userid: this.userid
      })
      .subscribe(data => {
        var index = this.contacts.findIndex(x => x.id == this.contactid);
        this.contacts[index].name = this.contactfirstName + ' ' + this.contactlastName;
        this.contacts[index].id = this.contactid;
        this.contacts[index].type = this.editcontacttype;
        this.contacts[index].email = this.contactemail;
        this.editparticipantModal.close();
      })

  }

  changepriority(nowpriority, newpriority) {
    const name = this.contacts[nowpriority].name;
    const id = this.contacts[nowpriority].id;
    const type = this.contacts[nowpriority].type;
    const email = this.contacts[nowpriority].email;
    this.contacts[nowpriority].name = this.contacts[newpriority].name;
    this.contacts[nowpriority].id = this.contacts[newpriority].id;
    this.contacts[nowpriority].type = this.contacts[newpriority].type;
    this.contacts[nowpriority].email = this.contacts[newpriority].email;
    this.contacts[newpriority].name = name;
    this.contacts[newpriority].id = id;
    this.contacts[newpriority].type = type;
    this.contacts[newpriority].email = email;

  }

  // ------------------------ add new participant --------------------- //

  addnewparticipant(e) {

    let type = this.addparticipantForm.controls.newtype.value;
    if (type === '') {
      type = 'Remote Signer';
    }
    const firstName = this.addparticipantForm.controls.firstName.value;
    const lastName = this.addparticipantForm.controls.lastName.value;
    const email = this.addparticipantForm.controls.email.value;
    const address = this.addparticipantForm.controls.address.value;
    const subject = this.addparticipantForm.controls.subject.value;
    const message = this.addparticipantForm.controls.message.value;
    const emailalreadyexist = this.contacts.some(function (el) {
      return el.email === email;
    });
    if (firstName === '') {
      this.firstnameerror = 'First Name is mandatory to proceed';
      return false;
    } else {
      this.firstnameerror = null;
    }
    if (lastName === '') {
      this.lasterror = 'Last Name is mandatory to proceed';
      return false;
    } else {
      this.lasterror = null;
    }
    if (email === '') {
      this.emailerror = 'Email is mandatory to proceed';
      return false;
    } else {
      const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (regex.test(email)) {
        this.emailerror = null;
      } else {
        this.emailerror = 'Email Should be valid';
        return false;
      }
      this.emailerror = null;
    }

    if (!emailalreadyexist) {
      this.spinnerService.show();
      this.http.post('https://ezeeboss.com:3001/api/addnewparticipant',
        {
          firstName: firstName, lastName: lastName, email: email, address: address,
          subject: subject, message: message, userId: this.userid, docId: this.documentcount,
          type: type, priority: this.contacts.length + 1, expiration: this.myOptions
        })
        .subscribe(data => {
          this.spinnerService.hide();
          this.contactList = data;
          if (this.contactList.message === 1) {
            this.contacts.push({ id: this.contactList.id, name: firstName + ' ' + lastName, type: type, email: email });
            this.addparticipantForm.reset();
            this.addparticipantModal.close();
          } else {
            this.error = 'This Email is already in your Contacts.You can add from there!!!';
          }
        }, err => {
          this.error = 'Something Went Wrong.Please Try Again !!!';
        });
    } else {
      this.error = 'Email Already Exists';
    }
  }
  // ------------------------ get contact details ------------- //
close(){
      this.mycontactsModal.close();
      this.addparticipantModal.open()
}
  contactdetail(id: String) {
    this.error = null;
    this.mycontactsModal.close();
    this.spinnerService.show();
    //this.loading = true;
    this.http.get('https://ezeeboss.com:3001/api/contactdetail/' + id)
      .subscribe(data => {
        this.contactdata = data;
        this.type = 'Remote Signer';
        this.contactid = this.contactdata.data[0]._id;
        this.contactfirstName = this.contactdata.data[0].firstName;
        this.contactlastName = this.contactdata.data[0].lastName;
        this.contactemail = this.contactdata.data[0].email;
        this.contactdetailModal.open();
        this.spinnerService.hide();
        // this.loading = false;
      }, err => {
        this.error = err;
        this.spinnerService.hide();
        //  this.loading = false;
      });
  }

  // ------------------------ add participant from contacts------ //


  addfromcontact(form) {
    let type = form.type;
    if (type === '') {
      type = 'Remote Signer';
    }

    const contactId = form.contactid;
    const firstName = form.firstName;
    const lastName = form.lastName;
    const email = form.email;
    const address = form.address;
    const subject = form.subject;
    const message = form.message;
    const emailalreadyexist = this.contacts.some(function (el) {
      return el.email === email;
    });
    if (firstName === '') {
      this.firstnameerror = 'First Name is mandatory to proceed';
      return false;
    } else {
      this.firstnameerror = null;
    }
    if (lastName === '') {
      this.lasterror = 'Last Name is mandatory to proceed';
      return false;
    } else {
      this.lasterror = null;
    }
    if (email === '') {
      this.emailerror = 'Email is mandatory to proceed';
      return false;
    } else {
      const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (regex.test(email)) {
        this.emailerror = null;
      } else {
        this.emailerror = 'Email Should be valid';
        return false;
      }
      this.emailerror = null;
    }
    if (!emailalreadyexist) {
      this.contactList = 'a';
      this.contacts.push({ id: contactId, name: firstName + ' ' + lastName, type: type, email: email });
      this.contactdetailForm.reset();
      this.contactdetailModal.close();
    } else {
      this.error = 'Email Already Exists';
    }
  }

  // ------------------------ add yourself --------------------- //

  addyourself(form) {
    this.isdisabled = true;
    // console.log(form.type);
    let type = form.type;
    if (type === null) {
      type = 'Remote Signer';
    }
    const firstName = form.firstName;
    const lastName = form.lastName;
    const email = form.email;
    const address = form.address;
    const subject = form.subject;
    const message = form.message;
    const emailalreadyexist = this.contacts.some(function (el) {
      return el.email === email;
    });
    if (firstName === '') {
      this.firstnameerror = 'First Name is mandatory to proceed';
      this.isdisabled = false;
      return false;
    } else {
      this.firstnameerror = null;
    }
    if (lastName === '') {
      this.lasterror = 'Last Name is mandatory to proceed';
      this.isdisabled = false;
      return false;
    } else {
      this.lasterror = null;
    }
    if (email === '') {
      this.emailerror = 'Email is mandatory to proceed';
      this.isdisabled = false;
      return false;
    } else {
      const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (regex.test(email)) {
        this.emailerror = null;
      } else {
        this.emailerror = 'Email Should be valid';
        this.isdisabled = false;
        return false;
      }
      this.emailerror = null;
    }


    if (!emailalreadyexist) {
      this.http.post('https://ezeeboss.com:3001/api/addnewparticipant',
        {
          firstName: firstName, lastName: lastName, email: email, address: address,
          subject: subject, message: message, type: type, userId: this.userid
        })
        .subscribe(data => {
          this.contactList = data;
          // console.log("this.contactList->", this.contactList)
          if (this.contactList.message === 1 || this.contactList.message === 2) {
            // arr.push(item);

            this.contacts.push({ name: firstName + ' ' + lastName, type: type, email: email, id: this.contactList.id });
            // console.log("data pushed", this.contacts);
            // this.addparticipantForm.reset();
            this.addyourselfModal.close();
          } else {
            this.error = 'This Email is already in your Contacts.You can add from there!!!';
          }
        }, err => {
          this.error = 'Something Went Wrong.Please Try Again !!!';
        });
    } else {
      this.error = 'Email Already Exists';
    }
  }


  openaddyourself() {
    this.isdisabled = false;
    this.addyourselfModal.open();
  }

  // ----------------------------- delete contact --------------------------- //

  deletecontact(email: String) {
    const emailalreadyexist = this.contacts.some(function (el) {
      return el.email === email;
    });
    if (emailalreadyexist) {
      if (this.contacts.length === 1) {
        this.contactList = '';
      }
      for (let i = 0; i < this.contacts.length; i++) {
        if (this.contacts[i].email && this.contacts[i].email === email) {
          this.contacts.splice(i, 1);
          break;
        }
      }
    }
  }

  addzindex() {
    this.spinnerService.show();
    (<any>document.getElementsByClassName("drop-zone")[0]).style.zIndex = 1;
  }

  // ----------------------------------------- add users to document -------------------------- //

  adduserstodocument() {

    // this.loading = true;
    this.spinnerService.show();
    let withimage = true;
    this.activatedRoute.params.subscribe((params: Params) => {
      const type = params['type'];
      if (type == 'wi') {
        withimage = true
      }
      else {
        withimage = false
      }
    })

    for (let i = 0; i < this.contacts.length; i++) {
      console.log("-->",this.contacts[i])
      this.adduserarray.push({ id: this.contacts[i].id ,role:this.contacts[i].type});
    }

    let postdata = {
      pdfid: localStorage.getItem('pdfid'),
      userid: this.details._id,
      docid: localStorage.getItem('docid'),
      expdate: localStorage.getItem('expdate'),
      usertosign: this.adduserarray,
      sendername: this.fullname,
      priority: this.priority,
      withimage: withimage
    };


    this.http.post('https://ezeeboss.com:3001/api/addusertodocument', postdata)
      .subscribe(data => {
        this.spinnerService.hide();
        //  this.loading = false;
        this.adduserresult = data;
        if (this.adduserresult.message === 'success') {
          this.router.navigateByUrl('/pdfsign');
        } else {
          // this.loading = false;
          this.spinnerService.hide();
          alert(this.adduserresult.message);
        }
        // console.log(data);
      });
  }

  // ------------------------------------------
  logout() {
    this.auth.logout();
  }

  addpatipant() {
    // console.log('called');
    this.firstnameerror = null;
    this.lasterror = null;
    this.emailerror = null;
    this.participantModal.open();
  }
  addnewparticipantmodal() {
    this.firstnameerror = null;
    this.lasterror = null;
    this.emailerror = null;
    //this.firstName = null;
    this.addparticipantForm.reset();
    this.newtype = 'Remote Signer';
    this.addparticipantModal.open();
    this.participantModal.close();
  }
  priorityreq(event) {
    if (event.target.checked) {
      this.priority = true;
    } else {
      this.priority = false;
    }
  }
}