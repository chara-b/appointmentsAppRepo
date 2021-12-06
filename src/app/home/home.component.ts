import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, NgForm, FormGroupDirective, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { HttpserviceService } from '../httpservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, Employee, Code, Mail } from '../post';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  signupUserForm: FormGroup;
  // at least one lower case, at least one upper case, at least one digit,
  // at least one symbol, min 8 characters and max 20 characters...
  // password must have the above sequence

  passwordPattern = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$';
  hide = true; // metabliti 'diakoptis' gia to pedio tou password an einai of
  // type = password i of type = text gia na fainetai i na kribetai o kodikos me koukides
  // checked = false; // NOT USED AFTERALL to checkbox field tis formas epikoinoni mono me to view meso ngModel kai enalasei times
  // true false analogos an einai selected i oxi
  hide2 = true; // gia to deutero field me mataki gia eisagogi kodikou ... giati an basizontan kai ta dio
  // fields se mia variable tote tha anabosbinan tautoxrona kai ta dio se click se ena apo auta
  // tslint:disable-next-line: variable-name
  organizations_retrieved_from_api = [];
  useremails = []; // to compare if an email exists so it doesnt allow user to register again with that email as a user
  employeemails = []; // same as above array just for employees this time
  emailexists = false; // general var if mail exists...gets its value if both below vars are true...
  useremailexists = false;
  employeemailexists = false;
  codecorrect = false; // xrisimopoiitai gia na emfanizei to selection me tous foreis an einai true






  // tslint:disable-next-line: max-line-length
  constructor(private snackbar: MatSnackBar, private httpservice: HttpserviceService, public dialog: MatDialog) { }


  ngOnInit() {

      this.getOrgNames(); // we need this to call the 3rd party api once every time the app starts
      // and then store the response into redis

      this.signupUserForm = new FormGroup({
          firstname: new FormControl(null, [Validators.required, Validators.maxLength(30), Validators.minLength(2)]),
          lastname: new FormControl(null, [Validators.required, Validators.maxLength(30), Validators.minLength(2)]),
          // tslint:disable-next-line: max-line-length
          password: new FormControl(null, [Validators.required, Validators.pattern(this.passwordPattern)]),
          // tslint:disable-next-line: max-line-length
          email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50), Validators.minLength(7)]),
          code: new FormControl(null),
          org: new FormControl(null),
          policy: new FormControl(null, Validators.required)
      });

  }


  // this method is called when form gets submitted
  SignUpUser() {
// alert(this.signupUserForm.status); --> einai xrisimo gia na kanoume log se alert popup to status tis formas
// an einai VALID or INVALID diladi !
// tslint:disable-next-line: max-line-length
if (!this.signupUserForm.get('code').value || this.signupUserForm.get('code').value === '') { // this means that we need to create a user and not an employee so this method must make the right call for that purpose!
// this object that we create below is gonna be sent via httpservice to our backend, so we can grab each of
// its properties and insert them into db
const user: User = {
      firstname: this.signupUserForm.get('firstname').value,
      lastname: this.signupUserForm.get('lastname').value,
      email: this.signupUserForm.get('email').value,
      password: this.signupUserForm.get('password').value,
      policy: this.signupUserForm.get('policy').value,
      status: 'Pending'
    };

// this panelClass: ['dark-snackbar'] here inside open method of snackbar is stylized inside global scss styles.scss file
// tslint:disable-next-line: no-string-literal
this.httpservice.addUser(user).subscribe((res) => { this.snackbar.open(res['serversais'], 'Dismiss', {duration: 5000, panelClass: ['dark-snackbar']}); });
// this.signupUserForm.reset();

  } else if (this.signupUserForm.get('code').value && this.codecorrect) {


    const employee: Employee = {
      firstname: this.signupUserForm.get('firstname').value,
      lastname: this.signupUserForm.get('lastname').value,
      org: this.signupUserForm.get('org').value,
      password: this.signupUserForm.get('password').value,
      email: this.signupUserForm.get('email').value,
      policy: this.signupUserForm.get('policy').value,
      status: 'Pending'
    };

    // tslint:disable-next-line: no-string-literal tslint:disable-next-line: max-line-length
    this.httpservice.addEmployee(employee).subscribe((res) => { this.snackbar.open(res['serversais'], 'Dismiss', {duration: 17000, panelClass: ['dark-snackbar']}); });
    // this.signupUserForm.reset();

  }
  this.emailexists = false;
  this.employeemailexists = false;
  this.useremailexists = false;
}
/*
  ifCheckedEnableOrgField() {
    this.checked = !this.checked;

    if (this.checked){
        // if checked make org field required by adding here in this checking method this field's validators...
        this.signupUserForm.get('org').setValidators(Validators.required);
        this.signupUserForm.get('org').updateValueAndValidity();
      } else {
        this.signupUserForm.get('org').clearValidators();
        this.signupUserForm.get('org').updateValueAndValidity();
      }
  }
  */

  checkIfCodeInsertedExists() { // for the validity of the code field inserted.
    // If code field is valid then the select element will appear so the employee
    // can choose an organization from the list

    this.codecorrect = false;
    const obj: Code = {
      email: this.signupUserForm.get('email').value,
      code: this.signupUserForm.get('code').value
    };

    // tslint:disable-next-line: max-line-length
    if (this.signupUserForm.get('email').value && this.signupUserForm.get('code').value) { // user needs to have this email field filled otherwise this method can not
      // procees by sending only code value back in the backend
    this.httpservice.getCodes(obj).subscribe((res: any) => {
      if (res['serversais'] === 'found') {
        this.codecorrect = true;
        this.signupUserForm.get('org').setValidators(Validators.required);
        this.signupUserForm.get('org').updateValueAndValidity();
      } else {
        this.codecorrect = false;
        this.signupUserForm.get('org').clearValidators();
        this.signupUserForm.get('org').updateValueAndValidity();
        this.snackbar.open(res['serversais'], 'Dismiss', {duration: 5000, panelClass: ['dark-snackbar']});
      }
    });

  }
  }
  // retrieve all org names from given api. This in order to retrieve org names make use of a proxy after calling
  // httpservice which then calls the proxy to call the 3rd party api and all this just to get rid of CORS problem
  getOrgNames() {

    this.httpservice.getOrgNames().subscribe((res: any[]) => {

      this.organizations_retrieved_from_api = [];
      // tslint:disable-next-line: no-string-literal
      for (const obj of res['data']) {
        // tslint:disable-next-line: no-string-literal
        this.organizations_retrieved_from_api.push(obj['preferredLabel']);
      }
      this.deleteOrgNameFromArray();
    });

  }
  // this method below checks if an org name exists in db and since each org must have 1 employee
  // this means that we must not allow another one to sign up for the same org so do avoid
  // that we need to delete that org name from the array which we render on view inside the select element
  deleteOrgNameFromArray() {
    this.httpservice.getOrgNamesSignedInDb().subscribe((res: any[]) => {

      // tslint:disable-next-line: no-string-literal
      for (const orgname of res) {
// 0 in indexof means to start from the begining of the array
          const index = this.organizations_retrieved_from_api.indexOf(orgname.org, 0);
          if (index > -1) { // if we have removed all items we'll have removed the 0th too and the index will be -1
          // which means we've got nothing else to remove in that case so we need the index to be > -1
            this.organizations_retrieved_from_api.splice(index, 1); // 1 in splice means that only 1 item will be removed
            // if 0 then none will be removed
         }
      }
    });
  }

  getEmails() { // gets emails submitted from both user and employee tables separately
    // and then calls checkIfmailExists() to decide if an email exist and in which table so to let user
    // know if he is trying to sugn up again as a user using the same email address or as an employee
    // or if he has this email registered at both table which means he has a user account and an employee
    // so he is not allowed to create another account under this email!

  //  this.useremails.length = 0; // ean den adeiaso ton pinaka paei kai kollaei kai tin epomeni
    // partida me email addresses pou erxetai ston pinaka mazi me tis proigoumenes times kai
    // ginetai ena xaos kai proigoumenon kai enimeromenon kataxorimenon email pou erxontai apo ti basi
   // this.employeemails.length = 0;
    this.useremailexists = false;
    this.emailexists = false;
    this.employeemailexists = false;

    const m: Mail = {
      email: this.signupUserForm.get('email').value
    };
    this.httpservice.findUserEmailInDb(m).subscribe((res: any[]) => {

      // tslint:disable-next-line: no-string-literal
      if (res.length >= 1) {
        for (let item of res) {
          if (item['email'] === this.signupUserForm.get('email').value) {
            this.useremailexists = true;
          }
        }
      }// else {
       // this.useremailexists = false;
     // }
      // tslint:disable-next-line: no-string-literal
     // for (const eml of res) {
        // tslint:disable-next-line: no-string-literal
      //  this.useremails.push(eml['email']);
     // }

    });

    this.httpservice.findEmployeesEmailInDb(m).subscribe((res: any[]) => {

      if(res.length >= 1) {
        for(let item of res) {
          if (item['email'] === this.signupUserForm.get('email').value) {
            this.employeemailexists = true;
          }
        }
      }
      // tslint:disable-next-line: no-string-literal
    //  for (const eml of res) {
        // tslint:disable-next-line: no-string-literal
      //  this.employeemails.push(eml['email']);
    //  }
    //  this.checkIfmailExists();
    // tslint:disable-next-line: align
    if (this.useremailexists === true && this.employeemailexists === true) {
      this.emailexists = true;
    }
    });


  }
/*
  checkIfmailExists(){
    this.useremailexists = false;
    this.employeemailexists = false;
    this.emailexists = false;

    for (const email in this.useremails) {
      if (this.signupUserForm.get('email').value === this.useremails[email]){
        this.useremailexists = true;
      }
    }
    for (const email in this.employeemails) {
      if (this.signupUserForm.get('email').value === this.employeemails[email]){
        this.employeemailexists = true;
      }
    }

    if (this.useremailexists && this. employeemailexists) {
      this.emailexists = true;
    }
  }
*/
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      disableClose: true,
      data: {
        message: [1, 0] // 1 means that the dialof component will render the first view in the *ngIf in the template
      } // 0 den xrisimopoieitai alla o pinakas autos prepei na exei ena sigekrimeno megethos
      // toso oso se ola ta simia sta opoia kaleitai i open() tou modal...
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'true') {
      this.signupUserForm.get('policy').setValue(true);
      }
    });
  }


}


