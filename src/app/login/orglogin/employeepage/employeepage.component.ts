import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { DataserviceService } from 'src/app/dataservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpserviceService } from 'src/app/httpservice.service';
import { Mail, Organization, Appointment, Appointment2 } from 'src/app/post';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-employeepage',
  templateUrl: './employeepage.component.html',
  styleUrls: ['./employeepage.component.scss']
})
export class EmployeepageComponent implements OnInit {

show = ''; // this variable is acting as a switch that when it's on true the table is displayed otherwise
// the profile info div of this employee's component is displayed!
shownName: any;
displayedColumns: string[] = ['Organization', 'Day', 'Time', 'Email', 'Status', 'Action'];
displayedColumnsRejected: string[] = ['Organization', 'Day', 'Time', 'Email', 'Status'];
displayedColumnsApproved: string[] = ['Organization', 'Day', 'Time', 'Email', 'Status'];
displayedColumnsInfo: string[] = ['FirstName', 'LastName', 'Organization', 'Email'];

pendingAppointments = [];
approvedAppointments = [];
rejectedAppointments = [];
dataSource: any;
dataSource2: any;
dataSource3: any;
dataSource4: any;
// MatPaginator Inputs
length: any; // gia to length tou paginator...
length2: any; // gia to length tou paginator...
length3: any; // gia to length tou paginator...

pageSize = 2;
pageSize2 = 2;
pageSize3 = 2;

// MatPaginator Output
pageEvent: PageEvent;
pageEvent2: PageEvent;
pageEvent3: PageEvent;

@ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
employeesOrgName: any;
conflicts = false; // if it's true it activates the send notification button that will inform the user that his appointment
// can't be approved because of some conflict either in db if already exists or in redis if there are 2 or more same pending appointments
sendbuttonOn = false;
clickedline: any;
// is coming here from the dialog component after it closes




  // tslint:disable-next-line: max-line-length
  constructor(public dialog: MatDialog, private msg: DataserviceService, private snackbar: MatSnackBar, private httpservice: HttpserviceService) { }

  ngOnInit(): void {
    this.show = 'tableview';
    this.changeLabelNameWithObservablesService();

    this.msg.currentLabelName.subscribe(name => this.shownName = name);

    this.getUserAppointmentsFromRedis();

    this.length = this.pendingAppointments.length; // gia to length tou paginator...
    this.length2 = this.approvedAppointments.length; // gia to length tou paginator...
    this.length3 = this.rejectedAppointments.length; // gia to length tou paginator...

  }

  showView(show?: any){
    this.show = show;
    this.dataSource4 = [];

    this.getUserAppointmentsFromRedis();

    if (this.show === 'profile') { // if this variable becomes false this means that the info div will be rendered so get the info to render
      this.httpservice.getEmployeeInfo().subscribe((res: any[]) => {

        this.dataSource4 = new MatTableDataSource(res);
        // this.dataSource4.paginator = this.paginator.toArray()[3];
      });
    }
  }

  changeLabelNameWithObservablesService(){ // gets the email from tokens payload in case of page refresh to
    // show as label in the toolbar user's email...
    this.httpservice.getTokensPayload().subscribe((res: any) => {
      this.shownName = res['email'];
      this.snackbar.open('Hi ' + this.shownName + '! Welcome to your page', 'Dismiss', {duration: 5000, panelClass: ['dark-snackbar']});
      this.msg.changeValueOfLabelName(this.shownName);
    });

  }


  getUserAppointmentsFromRedis(){ // the signature is misleading this method actually gets appointments from both redis
    // and db and fills up all tables...
    this.approvedAppointments = [];
    this.pendingAppointments = [];
    this.rejectedAppointments = [];
    this.dataSource = [];
    this.dataSource2 = [];
    this.dataSource3 = [];

    // gets all pending appointments for this org from redis!
    const email: Mail = {
      email: this.shownName
    };
    this.httpservice.findWhatOrgIsCurrentEmployee(email).subscribe((res: any) => {
      this.employeesOrgName = res[0].org;

      const orgName: Organization = {
      email: this.shownName,
      org: this.employeesOrgName
    };

      // tslint:disable-next-line: no-shadowed-variable
      this.httpservice.getPendingAppointmentsForThisOrg(orgName).subscribe((response: any[]) => {

      this.pendingAppointments = [];
      // tslint:disable-next-line: no-string-literal
      for (const row of response) {
        const obj = JSON.parse(row);
        // tslint:disable-next-line: no-string-literal
        const time = obj['time'];
        // tslint:disable-next-line: no-string-literal tslint:disable-next-line: max-line-length
        const day = obj['day'];
        // epeidi to vies diabazei apo sigekrimena key names opos exoun oristhei kai sto post.ts arxeio
        // prepei na trabiksoume apo to res array apo kathe tou grammi ena ena ta stoixeia kai na ta
        // kataxorisoume se nea onomata kleidion prin kanoume push olo to row
        // tslint:disable-next-line: max-line-length tslint:disable-next-line: no-string-literal
        this.pendingAppointments.push({org: obj['org'], day: day, time: time, email: obj['email'], status: 'Pending Approval...'});
        this.dataSource = new MatTableDataSource(this.pendingAppointments);
        this.dataSource.paginator = this.paginator.toArray()[0];
      }
     }
    );
  });

////
    this.httpservice.getApprovedByEmployee().subscribe((resp: any[]) => {

  this.approvedAppointments = [];
  // tslint:disable-next-line: no-string-literal
  for (const row of resp) {
  //  const obj = JSON.parse(row);

    this.approvedAppointments.push({Organization: row['org'], Day: row['day'], Time: row['time'], Email: row['email'], Status: 'Approved by ' + this.shownName});
    this.dataSource2 = new MatTableDataSource(this.approvedAppointments.reverse());
    this.dataSource2.paginator = this.paginator.toArray()[1];
  }
});


////
    this.httpservice.getRejectedByEmployee().subscribe((resp: any[]) => {

  this.rejectedAppointments = [];
  // tslint:disable-next-line: no-string-literal
  for (const row of resp) {
  //  const obj = JSON.parse(row);

    this.rejectedAppointments.push({Organization: row['org'], Day: row['day'], Time: row['time'], Email: row['email'], Status: 'Rejected by ' + this.shownName});
    this.dataSource3 = new MatTableDataSource(this.rejectedAppointments.reverse());
    this.dataSource3.paginator = this.paginator.toArray()[2];
  }
});



}



  // the httpservice implements authentication service methods too ... i was bored to create a different file
  logOut() {
    this.snackbar.dismiss();
    this.httpservice.logOut();
  }

  ConfirmApprovalBeforeActualApproval(line?: any, rowIndex?: any) {
    this.conflicts = false;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      height: '200px',
      disableClose: true,
      data: {
        // tslint:disable-next-line: max-line-length
        message: [3, [line, this.pendingAppointments, rowIndex, this.shownName]] // 2 means that the dialof component will render the 2nd view in the *ngIf in the template
      } // this metadata obj is passed so we make use of 1 dialog modal component which has multiple views
      // and we choose which one we want to render by passing a number... This metadata obj parameter
      // can be parsed in the dialog component via the @Inject(MAT_DIALOG_DATA) public data which we
      // injected into the constructor of the component
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'justclosethepopup'){
        this.conflicts = true;
        this.clickedline = rowIndex;

    }
    else if(result === 'justclosethepopup2'){
      // this.conflicts = result;
     // this.getUserAppointmentsFromRedis();
    }
      else if(result !== 'justclosethepopup'){
        
        this.getUserAppointmentsFromRedis();
      const appointment: Appointment2 = {
        org: line.org,
        day: line.day,
        time: line.time,
        email: line.email,
        employeemail: this.shownName
      };
      this.httpservice.sendApprovalEmail(appointment).subscribe((res) => {
        this.snackbar.open(res['serversais'], 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});
      });

    }
    });
  }

  Reject(line?: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      height: '200px',
      disableClose: true,
      data: {
        // tslint:disable-next-line: max-line-length
        message: [6, [line, this.pendingAppointments, this.shownName]] // 2 means that the dialof component will render the 2nd view in the *ngIf in the template
      } // this metadata obj is passed so we make use of 1 dialog modal component which has multiple views
      // and we choose which one we want to render by passing a number... This metadata obj parameter
      // can be parsed in the dialog component via the @Inject(MAT_DIALOG_DATA) public data which we
      // injected into the constructor of the component
    });
    dialogRef.afterClosed().subscribe(result => {
    if(result !== undefined){
     // this.getUserAppointmentsFromRedis();
     this.SendEmail(line);
    }
     // tslint:disable-next-line: max-line-length
     // this.snackbar.open('An email was sent to ' + `${line.Email}` + ' about appointment\'s rejection', 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});

    });
  }


  SendEmail(line: any) { // after sending the email the appointment that conflicts with another one gets
    // deleted by the same endpoint that makes the email sending! a response from the server is coming back
    // telling us what has happend! that response is getting printed here in the snackbar below!

    const appointment: Appointment2 = {
      org: line.org,
      day: line.day,
      time: line.time,
      email: line.email,
      employeemail: this.shownName
    };
    this.httpservice.sendEmail(appointment).subscribe((res) => {
      this.snackbar.open(res['serversais'], 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});
    });

    this.httpservice.rejectAppointment(appointment).subscribe((res) => {
      this.snackbar.open(res['serversais'], 'Dismiss', {duration: 25000, panelClass: ['dark-snackbar']});
    // tslint:disable-next-line: max-line-length
    //  this.snackbar.open('An email was sent to ' + `${line.Email}` + ' about appointment\'s rejection', 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});

    });

    this.getUserAppointmentsFromRedis();
    this.conflicts = false;
  }

}



