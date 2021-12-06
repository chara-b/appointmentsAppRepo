import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpserviceService } from 'src/app/httpservice.service';
import { User, Employee, Credentials } from 'src/app/post';
import { DataserviceService } from 'src/app/dataservice.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, CanDeactivate } from '@angular/router';

@Component({
  selector: 'app-userlogin',
  templateUrl: './userlogin.component.html',
  styleUrls: ['./userlogin.component.scss']
})
export class UserloginComponent implements OnInit {

  loginUserForm: FormGroup;
  hide = true; // metabliti 'diakoptis' gia to pedio tou password an einai of
  // type = password i of type = text gia na fainetai i na kribetai o kodikos me koukides
  emails = [];
  emailexists = false;
  shownName = '';
  loading = false;


  // tslint:disable-next-line: max-line-length tslint:disable-next-line: variable-name
  constructor(private msg: DataserviceService, private _router: Router, private snackbar: MatSnackBar, private httpservice: HttpserviceService) { }


  ngOnInit() {

      this.loginUserForm = new FormGroup({

          email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50), Validators.minLength(7)]),
          password: new FormControl(null, [Validators.required])


      });

  }


  // this method is called when form gets submitted
  LoginUser() {
document.getElementById('spinner').style.visibility = 'visible';
// this.loading = false;
// alert(this.signupUserForm.status); --> einai xrisimo gia na kanoume log to status tis formas
// an einai VALID or INVALID diladi !
const credentials: Credentials = {
      email: this.loginUserForm.get('email').value,
      password: this.loginUserForm.get('password').value
    };
this.shownName = this.loginUserForm.get('email').value;
this.httpservice.login(credentials).subscribe((res: any) => {
if (res.token){ // if res returns the token navigate to user page

// now let's store the token which comes from the backend to localstorage
localStorage.setItem('token', res.token);
this._router.navigate(['/userpage']);
// this.loading = true;
this.changeLabelNameWithObservablesService(); // update the observable with new
  // value each time someone logs in so the Label Name when entering in his account changes per person


// tslint:disable-next-line: no-string-literal
} else {// if res does not return any token then this means that it returns a json
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
      this._router.navigate(['/userlogin']);
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
    this.httpservice.getUserEmailsInDb().subscribe((res: any[]) => {


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
      if (this.loginUserForm.get('email').value === this.emails[email]){
        this.emailexists = true;
      }
    }
  }
*/


}
