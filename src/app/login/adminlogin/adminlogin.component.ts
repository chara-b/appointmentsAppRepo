import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataserviceService } from 'src/app/dataservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpserviceService } from 'src/app/httpservice.service';
import { Credentials } from 'src/app/post';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-adminlogin',
  templateUrl: './adminlogin.component.html',
  styleUrls: ['./adminlogin.component.scss']
})
export class AdminloginComponent implements OnInit {
  AdminloginForm: FormGroup;
  hide = true; // metabliti 'diakoptis' gia to pedio tou password an einai of
  // type = password i of type = text gia na fainetai i na kribetai o kodikos me koukides
  emails = [];
  emailexists = false;
  shownName = '';

  // tslint:disable-next-line: max-line-length tslint:disable-next-line: variable-name
  constructor(private _router: Router, private msg: DataserviceService, private snackbar: MatSnackBar, private httpservice: HttpserviceService) { }

  ngOnInit(): void {

    this.AdminloginForm = new FormGroup({

      email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50), Validators.minLength(7)]),
      password: new FormControl(null, [Validators.required])


  });

  }
 // this method is called when form gets submitted
 AdminLogin() {
  document.getElementById('spinner').style.visibility = 'visible';
  // alert(this.signupUserForm.status); --> einai xrisimo gia na kanoume log to status tis formas
  // an einai VALID or INVALID diladi !
  const credentials: Credentials = {
        email: this.AdminloginForm.get('email').value,
        password: this.AdminloginForm.get('password').value
      };

  this.shownName = this.AdminloginForm.get('email').value;
  this.httpservice.loginorg(credentials).subscribe((res: any) => {
        if (res.token){ // if res returns the token navigate to employee page

        localStorage.setItem('token', res.token);
        this._router.navigate(['/adminpage']);
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
              this._router.navigate(['/adminlogin']);
            }
          }
        });

  }
  changeLabelNameWithObservablesService(){
    this.msg.changeValueOfLabelName(this.shownName);
  }
}

