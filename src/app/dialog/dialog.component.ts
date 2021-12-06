import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Appointment, Mail, Appointment2 } from '../post';
import { HttpserviceService } from '../httpservice.service';
import { ReplaySubject } from 'rxjs';



@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

submitAppointmentForm: FormGroup;
view: number;
// tslint:disable-next-line: variable-name
scheduled_at: any;
email: any;
// tslint:disable-next-line: variable-name
organizations_retrieved_from_api = [];
disablebutton: boolean;
cellMustbedisabled: any;
arraywithduplicatespositions = [];
disableRowIndex: any;

//itexistsindb = false;
//itexistsinredis = false;
pendingAppointments = [];
conflictsarray = [];



  // tslint:disable-next-line: max-line-length
  constructor(@Inject(MAT_DIALOG_DATA) public data, private snackbar: MatSnackBar, public dialogRef: MatDialogRef<DialogComponent>, private httpservice: HttpserviceService) { }

  ngOnInit(): void {
    this.view = this.data.message[0];
    if (this.view === 2) { // the 2nd view is the one that brings the email logged-in in the metadata obj while opening
      // the modal... the first item in that metadata list is accessed with a 0 in that list...
      this.email = this.data.message[1];
    }
    this.submitAppointmentForm = new FormGroup({
      org: new FormControl(null, Validators.required),
      day: new FormControl(null, Validators.required),
      time: new FormControl(null, Validators.required)
  });

  }

  SubmitAppointment() {
    // tslint:disable-next-line: max-line-length
    // now let's create our final obj pou tha steiloume piso sto backend gia kataxorisi...
    const appointment: Appointment = {
      org: this.submitAppointmentForm.get('org').value,
      day: new Date(this.submitAppointmentForm.get('day').value).toLocaleDateString(),
      time: this.submitAppointmentForm.get('time').value, // we send a converted into 1 timestamp
      // the time and date field so we save it into db as a timestamp and not separately
      email: this.email // the email of the submitter ! we need to send this because the employee needs to know
      // the email of the submitter in case he needs to send him an email to choose different time and day for his appointment
    };

    this.httpservice.sendAppointmentForApproval(appointment).subscribe((res: any) => {
      // tslint:disable-next-line: no-string-literal
      this.snackbar.open(res['serversais'], 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});
    });
    this.dialogRef.close('ok');
  }


  iAgree() {
    this.dialogRef.close('true');
  }

  CheckConflictsBeforeApproval()  {
    this.pendingAppointments = [];
    this.conflictsarray = [];
    // we also need to check for conflicts with the ones approved in db too ! so we need to get them and concat
    // them with the (this.data.message[1])[1] which has the pending ones where we can find conflicts too inside them!
   this.httpservice.findIfAppointmentExistsInDB((this.data.message[1])[0]).subscribe((res: any) => {
     if(res.length !== 0){
     // this.itexistsindb = true; 
      this.snackbar.open('We could not Approve because we\'ve found it already in db!', 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});
      this.dialogRef.close('justclosethepopup'); // pernontas to edo to stelnei sti subscribe tis afterClosed()
     } else if (res.length === 0) {
       // else if the response from db brings us an empty array which means 
       // that there is no similar appointment in db like the one we check here and therefore 
       // we have no conflict with appointments already in db with this one, try search in redis if there is 
       // any similar ones in pending mode so to inform about this kind of conflict...
      this.httpservice.getPendingAppointmentsForThisOrg((this.data.message[1])[0]).subscribe((res: any) => {

        this.pendingAppointments = [];
      // tslint:disable-next-line: no-string-literal
      for (const row of res) {
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
    
      }
      this.conflictsarray = HasDuplicates(this.pendingAppointments);
      if(this.conflictsarray.length >= 1) {
        for (let i = 0; i < this.conflictsarray.length; i++){
          if((this.data.message[1])[2] === this.conflictsarray[i].thisrow || (this.data.message[1])[2] === this.conflictsarray[i].withthisrow) // if in redis we've found more than 2 or just 2 same appointments then set below variable to true...
          {
            this.snackbar.open('We could not Approve because we found it twice in pending mode!', 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});
            this.dialogRef.close('justclosethepopup'); // pernontas to edo to stelnei sti subscribe tis afterClosed()          
        
          } else {
            this.Approve();
          //  this.dialogRef.close();
          }
        }
        }
       });

     }
   });

          // here check the conflicts among all appointments and propose new day and time to users
    // i parakato sinartisi epistrefei enan array opou exei se kathe tou thesi ena object to opoio
    // anaferei poia eggrafi se poia thesi tou table kanei conflict me poia
   ///   this.arraywithduplicatespositions = HasDuplicates(arraytocheckforconflicts);
    // tslint:disable-next-line: max-line-length
   ///   if (this.arraywithduplicatespositions.length !== 0){
    // tslint:disable-next-line: prefer-for-of
  ///  for (let i = 0; i < this.arraywithduplicatespositions.length; i++) {
      // tslint:disable-next-line: max-line-length
  ///  if ((this.data.message[1])[2] === this.arraywithduplicatespositions[i].thisrow || (this.data.message[1])[2] === this.arraywithduplicatespositions[i].withthisrow) { // (this.data.message[1])[2] holds the index of the row that was clicked

     ///   this.disableRowIndex = (this.data.message[1])[2];
        // tslint:disable-next-line: max-line-length
       /// this.snackbar.open('We could not Approve because we found confliction!', 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});
      ///  this.dialogRef.close(this.disableRowIndex); // pernontas to edo to stelnei sti subscribe tis afterClosed()
            // pou kalesame sto component apo to opoio kaloume to modal na anoiksei opote pernontas to edo to stelnoume
            // piso os apantisi!

      // tslint:disable-next-line: max-line-length                      // this.disableRowIndex is created due to the fact that we need a check here so the row won't create conflict with its own self and not gets approved because of that because noone gets conflicted with his own self so in other words this.disableRowIndex is equal is actually the same variable as (this.data.message[1])[2])                              
   ///   } else if (((this.data.message[1])[2] !== this.arraywithduplicatespositions[i].thisrow && this.disableRowIndex !== (this.data.message[1])[2]) || ((this.data.message[1])[2] !== this.arraywithduplicatespositions[i].withthisrow && this.disableRowIndex !== (this.data.message[1])[2]) ) {
    ///    this.Approve();
     ///   this.dialogRef.close();
   ///   }
  ///  }
 /// }
   ///   if (this.arraywithduplicatespositions.length === 0) {
  ///  this.Approve();
  ///  this.dialogRef.close();

  ///}
  ///  });
  }


Approve() {
    // approve appointment ... submit it in db and delete it from redis ... there is an endpoint created just for this reason...

// the this.data.message[1] holds the whole row as retrieved from the table which means that
// this is not the right form to send back to the backend, so now let's create the right form to send below...
// this.data.message[0] is the metadata property of the modal that holds the number of view to render!
    const appointmt: Appointment2 = {
      org: (this.data.message[1])[0].org,
      day: (this.data.message[1])[0].day,
      time: (this.data.message[1])[0].time,
      email: (this.data.message[1])[0].email,
      employeemail: (this.data.message[1])[3]
    };
    this.httpservice.postPendingAppointmentToDBAfterApproval(appointmt).subscribe((res: any) => {
      // tslint:disable-next-line: no-string-literal
      this.snackbar.open(res['serversais'], 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});
      this.dialogRef.close();
    });
    // To this.data.message[1] einai to table row pou egine clicked gia na ginei approved kai exei
    // ginei passed edo via the data property of modal's metadata object on its opening!
    // To this.data.message[1] nai men einai ena object alla oxi me katallilo periexomeno
    // etsi opos ena object pou dexetai to api mas opote prepei na kanoume extract apo auto
    // mono tis plirofories pou theloume kai na desoume ena neo object pou tha steiloume piso opos kanoume
    // parapano!

 }

 Reject() {
//  const appointment: Appointment2 = {
  //  org: (this.data.message[1])[0].Organization,
  //  day: (this.data.message[1])[0].Day,
  //  time: (this.data.message[1])[0].Time,
  //  email: (this.data.message[1])[0].Email,
  //  employeemail: (this.data.message[1])[2]
//  };

 // this.httpservice.rejectAppointment(appointment).subscribe((res) => {
   // this.snackbar.open(res['serversais'], 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});
    this.dialogRef.close('rejectafterclose'); // to string auto pernietai isa isa gia na epistrepsei mia timi meta
    // to kleisimo kai na katalabei to employeepage oti prepei na steilei mail kai na kanei reject gt an den
    // pernousa mia timi edo epistrofis tixaia tote tha ekane aplo cancel to dialog box xoris kapoia energia pou zitise o xristis
 // });
 }


onCancel() {
  this.dialogRef.close();
 }
 onCancel2() {
 // this.dialogRef.close(this.arraywithduplicatespositions);
 this.dialogRef.close('justclosethepopup');
 }
 onCancel3(){
  this.dialogRef.close('justclosethepopup2');
 }

getOrgNames() {

    this.httpservice.getOrgNames().subscribe((res: any[]) => {

      this.organizations_retrieved_from_api = []; // this is here because we need to empty the array before
      // filling it up angain next time on a second request
      // tslint:disable-next-line: no-string-literal
      for (const obj of res['data']) {
        // tslint:disable-next-line: no-string-literal
        this.organizations_retrieved_from_api.push(obj['preferredLabel']);
      }
    });

  }

confirmDeleteAppointmentFromDB() {

   const appointment: Appointment = {
     org: (this.data.message[1])[1].Organization,
     day: (this.data.message[1])[1].Day,
     time: (this.data.message[1])[1].Time,
     email: (this.data.message[1])[0]
   };

   this.httpservice.deleteAppointment(appointment).subscribe((res) => {
     this.snackbar.open(res['serversais'], 'Dismiss', {duration: 5000, panelClass: ['dark-snackbar']});
     this.dialogRef.close();
    });

}

confirmCancelationOfAppointment() {

     const appointment: Appointment = {
        org: (this.data.message[1])[1].Organization,
        day: (this.data.message[1])[1].Day,
        time: (this.data.message[1])[1].Time,
        email: (this.data.message[1])[0]
      };

     this.httpservice.cancelPendingAppointment(appointment).subscribe((res) => {
        this.snackbar.open(res['serversais'], 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']});
        this.dialogRef.close();
      });

}

}
function HasDuplicates(array) {
  const positionsWithConflicts = [];
 // let counter = 0; // counts how many duplicates we have...
  for (let i = 0; i < array.length; i++) {
    for (let y = i + 1; y < array.length; y++){
      if ((array[i].day === array[y].day) && (array[i].time === array[y].time)) {
        positionsWithConflicts.push({thisrow: i, withthisrow: y}); // {thisrow: i, withthisrow: y}
      }
    }
  }
 // counter = positionsWithConflicts.length;
  return positionsWithConflicts;
}












