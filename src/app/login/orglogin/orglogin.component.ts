import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpserviceService } from 'src/app/httpservice.service';
import { User, Credentials } from 'src/app/post';
import { DataserviceService } from 'src/app/dataservice.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-orglogin',
  templateUrl: './orglogin.component.html',
  styleUrls: ['./orglogin.component.scss']
})
export class OrgloginComponent implements OnInit {

  loginOrgForm: FormGroup;
  hide = true; // metabliti 'diakoptis' gia to pedio tou password an einai of
  // type = password i of type = text gia na fainetai i na kribetai o kodikos me koukides
  emails = [];
  emailexists = false;
  shownName = '';


  // tslint:disable-next-line: variable-name tslint:disable-next-line: max-line-length
  constructor(private _router: Router, private msg: DataserviceService, private snackbar: MatSnackBar, private httpservice: HttpserviceService) { }


  ngOnInit() {

      this.loginOrgForm = new FormGroup({

          email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50), Validators.minLength(7)]),
          password: new FormControl(null, [Validators.required])


      });

  }


  // this method is called when form gets submitted
  LoginOrg() {
document.getElementById('spinner').style.visibility = 'visible';
// alert(this.signupUserForm.status); --> einai xrisimo gia na kanoume log to status tis formas
// an einai VALID or INVALID diladi !
const credentials: Credentials = {
      email: this.loginOrgForm.get('email').value,
      password: this.loginOrgForm.get('password').value
    };

this.shownName = this.loginOrgForm.get('email').value;
this.httpservice.loginorg(credentials).subscribe((res: any) => {
      if (res.token){ // if res returns the token navigate to employee page

      localStorage.setItem('token', res.token);
      this._router.navigate(['/employeepage']);
      this.changeLabelNameWithObservablesService(); // update the observable with new
// value each time someone logs in so the Label Name when entering in his account changes per person


      // tslint:disable-next-line: no-string-literal
      } else { // if res does not return any token then this means that it returns a json
        // with a string as value and we need to print that string into a snackbar to
        // display the error to the user
        document.getElementById('spinner').style.visibility = 'hidden';
        // tslint:disable-next-line: no-string-literal
        this.snackbar.open(res['serversais'], 'Dismiss', {duration: 5000, panelClass: ['dark-snackbar']});
        }
      }, err => { // if an unauthorization happens then redirect to the login screen...
        // eg. if the token gets deleted from localstorage then an action that needs its
        // presense will throw this error and then we'll be redirected back for log in for safety reasons
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this._router.navigate(['/orglogin']);
          }
        }
      });

}
changeLabelNameWithObservablesService(){
  this.msg.changeValueOfLabelName(this.shownName);
}




/*
  getEmails() {

    this.emails.length = 0;
    this.emailexists = false;
    this.httpservice.getEmployeesEmailsInDb().subscribe((res: any[]) => {


      // tslint:disable-next-line: no-string-literal
      for (const eml of res) {
        // tslint:disable-next-line: no-string-literal
        this.emails.push(eml['eml']);
      }
      this.checkIfmailExists();
    });

  }

  checkIfmailExists(){

    for (const email in this.emails) {
      if (this.loginOrgForm.get('email').value === this.emails[email]){
        this.emailexists = true;
      }
    }
  }
*/

}
