import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Appointment, Mail } from 'src/app/post';
import { DataserviceService } from 'src/app/dataservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { HttpserviceService } from 'src/app/httpservice.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-userpage',
  templateUrl: './userpage.component.html',
  styleUrls: ['./userpage.component.scss']
})
export class UserpageComponent implements OnInit {

  // it stores something like the rows below after user has submitted an appointment... then the table in
  // the frontend reads from the 2 tables below each row to be displayed
  //  [{Organization: 6, Day: 'Saturday', Time: '24:00'},
  //  {Organization: 7, Day: 'Sunday', Time: '17:00'}];

pendingAppointments = [];
approvedAppointments = [];
rejectedAppointments = [];
displayedColumnsInfo: string[] = ['FirstName', 'LastName', 'Email'];
show = ''; // this variable is acting as a switch that when it's on true the table is displayed otherwise
// the profile info div of this employee's component is displayed!
dataSource: any;
dataSource2: any;
dataSource3: any;
dataSource4: any;
shownName: any;
displayedColumns: string[] = ['Organization', 'Day', 'Time', 'Status', 'Action'];
displayedColumnsRejected: string[] = ['Organization', 'Day', 'Time', 'Status'];
editUserForm: FormGroup;
// columnsToDisplay: string[] = this.displayedColumns.slice();
// MatPaginator Inputs
length: any; // gia to length tou paginator...
length2: any;
length3: any;
pageSize = 2;
pageSize2 = 2;
pageSize3 = 2;
// MatPaginator Output
pageEvent: PageEvent;
pageEvent2: PageEvent;
pageEvent3: PageEvent;
// @ViewChild(MatPaginator) paginator: MatPaginator;
// @ViewChild(MatPaginator) paginator2: MatPaginator;
@ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
scheduled_at: any;
editClicked: boolean;





  // tslint:disable-next-line: max-line-length
  constructor(public dialog: MatDialog, private msg: DataserviceService, private snackbar: MatSnackBar, private httpservice: HttpserviceService) { }

  ngOnInit(): void {
    this.show = 'tableview';
    this.changeLabelNameWithObservablesService();

    this.msg.currentLabelName.subscribe(name => this.shownName = name);

    this.editUserForm = new FormGroup({
      day: new FormControl(null, [Validators.required]),
      time: new FormControl(null, [Validators.required])
  });

    this.getUserAppointmentsFromBothRedisAndDB();

    this.length = this.pendingAppointments.length; // gia to length tou paginator...
    this.length2 = this.approvedAppointments.length; // gia to length tou paginator...
    this.length3 = this.rejectedAppointments.length; // gia to length tou paginator...


  }

  changeLabelNameWithObservablesService(){ // gets the email from tokens payload in case of page refresh to
    // show as label in the toolbar user's email...
    this.httpservice.getTokensPayload().subscribe((res: any) => {
      this.shownName = res['email'];
      this.snackbar.open('Hi ' + this.shownName + '! Welcome to your page', 'Dismiss', {duration: 5000, panelClass: ['dark-snackbar']});
      this.msg.changeValueOfLabelName(this.shownName);
    });

  }

  showView(show?: any){
    this.show = show;
    this.dataSource4 = [];

    this.getUserAppointmentsFromBothRedisAndDB();

    if (this.show === 'profile') { // if this variable becomes false this means that the info div will be rendered so get the info to render
      this.httpservice.getUserInfo().subscribe((res: any[]) => {

        this.dataSource4 = new MatTableDataSource(res);
       // this.dataSource4.paginator = this.paginator.toArray()[3];
      });
    }
  }


  addAppointment() {
    // add new rows with scheduled appointments here!
    // open dialog modal
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      height: '560px',
      data: {
        message: [2, this.shownName] // 2 means that the dialof component will render the 2nd view in the *ngIf in the template
      } // this metadata obj is passed so we make use of 1 dialog modal component which has multiple views
      // and we choose which one we want to render by passing a number... This metadata obj parameter
      // can be parsed in the dialog component via the @Inject(MAT_DIALOG_DATA) public data which we
      // injected into the constructor of the component
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
      this.getUserAppointmentsFromBothRedisAndDB();
      }
    });


  }


  getUserAppointmentsFromBothRedisAndDB(){
    this.approvedAppointments = [];
    this.pendingAppointments = [];
    this.rejectedAppointments = [];
    this.dataSource = [];
    this.dataSource2 = [];
    this.dataSource3 = [];
    // gets all approved ones straight from db!
    const email: Mail = {
      email: this.shownName
    };
    this.httpservice.getUserAppointments(email).subscribe((resp: any[]) => {

      this.approvedAppointments = [];
      // tslint:disable-next-line: no-string-literal
      for (const row of resp) {
      //  const obj = JSON.parse(row);

        this.approvedAppointments.push({Organization: row['org'], Day: row['day'], Time: row['time'], Status: 'Approved'});
        this.dataSource2 = new MatTableDataSource(this.approvedAppointments.reverse());
        this.dataSource2.paginator = this.paginator.toArray()[1];
      }
    });

    // gets all pending appointments from redis!

    this.httpservice.getPendingAppointments(email).subscribe((res: any[]) => {

      this.pendingAppointments = [];
      // tslint:disable-next-line: no-string-literal
      for (const row of res) {
        const obj = JSON.parse(row);
        // epeidi to vies diabazei apo sigekrimena key names opos exoun oristhei kai sto post.ts arxeio
        // prepei na trabiksoume apo to res array apo kathe tou grammi ena ena ta stoixeia kai na ta
        // kataxorisoume se nea onomata kleidion prin kanoume push olo to row
        // tslint:disable-next-line: max-line-length tslint:disable-next-line: no-string-literal
        this.pendingAppointments.push({Organization: obj['org'], Day: obj['day'], Time: obj['time'], Status: 'Pending...'});
        this.dataSource = new MatTableDataSource(this.pendingAppointments);
        this.dataSource.paginator = this.paginator.toArray()[0]; // this paginator is an
        // array since we have 2 tables to paginate in this component...
      }
     }
    );

// gets all rejected appointments from db!

// tslint:disable-next-line: align
this.httpservice.getUserRejected(email).subscribe((res: any[]) => {

  this.rejectedAppointments = [];
  // tslint:disable-next-line: no-string-literal
  for (const row of res) {
  //  const obj = JSON.parse(row);
    // epeidi to vies diabazei apo sigekrimena key names opos exoun oristhei kai sto post.ts arxeio
    // prepei na trabiksoume apo to res array apo kathe tou grammi ena ena ta stoixeia kai na ta
    // kataxorisoume se nea onomata kleidion prin kanoume push olo to row
    // tslint:disable-next-line: max-line-length tslint:disable-next-line: no-string-literal
    this.rejectedAppointments.push({Organization: row['org'], Day: row['day'], Time: row['time'], Status: 'Rejected by: ' + row['employeemail']});
    this.dataSource3 = new MatTableDataSource(this.rejectedAppointments.reverse());
    this.dataSource3.paginator = this.paginator.toArray()[2]; // this paginator is an
    // array since we have 2 tables to paginate in this component...
  }
 }
);



  }





/*
  editAppointment(event?: any, incoming_row?: any) {
    this.editClicked = false;
    if (event.target.value === 'Done') {
      // steile to updated field sti basi

      // kai kane to editClicked false
      this.editClicked = false;
    } else {
      this.editClicked = true;
    }
  }
*/
  deleteAppointment(incoming_row?: any) {

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      height: '200px',
      disableClose: true,
      data: {
        // tslint:disable-next-line: max-line-length
        message: [4, [this.shownName, incoming_row]] // 2 means that the dialof component will render the 2nd view in the *ngIf in the template
      } // this metadata obj is passed so we make use of 1 dialog modal component which has multiple views
      // and we choose which one we want to render by passing a number... This metadata obj parameter
      // can be parsed in the dialog component via the @Inject(MAT_DIALOG_DATA) public data which we
      // injected into the constructor of the component
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getUserAppointmentsFromBothRedisAndDB();
    });

  }

  cancelAppointment(incoming_row?: any) {

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      height: '200px',
      disableClose: true,
      data: {
        // tslint:disable-next-line: max-line-length
        message: [5, [this.shownName, incoming_row]] // 2 means that the dialof component will render the 2nd view in the *ngIf in the template
      } // this metadata obj is passed so we make use of 1 dialog modal component which has multiple views
      // and we choose which one we want to render by passing a number... This metadata obj parameter
      // can be parsed in the dialog component via the @Inject(MAT_DIALOG_DATA) public data which we
      // injected into the constructor of the component
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getUserAppointmentsFromBothRedisAndDB();
    });

  }



// the httpservice implements authentication service methods too ... bariomoun na ftiakso neo arxeio gia auti ti douleia...
  logOut() {
    this.snackbar.dismiss();
    this.httpservice.logOut(); // diagrafetai to token me to logout!
  }


}
