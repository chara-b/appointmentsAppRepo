import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DataserviceService } from 'src/app/dataservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpserviceService } from 'src/app/httpservice.service';
import { Code } from 'src/app/post';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html',
  styleUrls: ['./adminpage.component.scss']
})
export class AdminpageComponent implements OnInit {

CodeForm: FormGroup;
shownName: any;
fourDigitNumber: number;
hide = true;
show = '';
dataSource: any;
displayedColumnsInfo: string[] = ['FirstName', 'LastName', 'Organization', 'Email'];


 // tslint:disable-next-line: max-line-length
 constructor(private msg: DataserviceService, private snackbar: MatSnackBar, private httpservice: HttpserviceService) { }

 ngOnInit(): void {
   this.show = 'tableview';
   this.changeLabelNameWithObservablesService();

   this.msg.currentLabelName.subscribe(name => this.shownName = name);

   this.CodeForm = new FormGroup({

    email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(50), Validators.minLength(7)]),
    password: new FormControl(null, [Validators.required])


});
 }


 changeLabelNameWithObservablesService(){ // gets the email from tokens payload in case of page refresh to
  // show as label in the toolbar user's email...
  this.httpservice.getTokensPayload().subscribe((res: any) => {
    // tslint:disable-next-line: no-string-literal
    this.shownName = res['email'];
    this.snackbar.open('Hi ' + this.shownName + '! Welcome to your page', 'Dismiss', {duration: 5000, panelClass: ['dark-snackbar']});
  });
  this.msg.changeValueOfLabelName(this.shownName);
}

showView(show?: any){
  this.show = show;
  this.dataSource = [];


  if (this.show === 'profile') { // if this variable becomes false this means that the info div will be rendered so get the info to render
    this.httpservice.getEmployeeInfo().subscribe((res: any[]) => {

      this.dataSource = new MatTableDataSource(res);

    });
  }
}



SubmitCode() {

  const credentials: Code = {
    email: this.CodeForm.get('email').value,
    code: this.CodeForm.get('password').value
  };

 // this.shownName = this.CodeForm.get('email').value;
  this.httpservice.postCode(credentials).subscribe((res: any) => {

    // tslint:disable-next-line: no-string-literal
    this.snackbar.open(res['serversais'], 'Dismiss', {duration: 5000, panelClass: ['dark-snackbar']});


  });


}



GenerateCode() {
  const min = 1000;
  const max = 9999;
  this.fourDigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  this.CodeForm.get('password').patchValue(this.fourDigitNumber);
}


// the httpservice implements authentication service methods too ... i was bored to create a different file
logOut() {
  this.snackbar.dismiss();
  this.httpservice.logOut();
}






}

