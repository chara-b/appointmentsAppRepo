import { Injectable } from '@angular/core';
// tslint:disable-next-line: max-line-length
import { CanActivate, Router, CanDeactivate, NavigationEnd, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpserviceService } from './httpservice.service';
import { Observable } from 'rxjs';
import { Mail } from './post';
import { DataserviceService } from './dataservice.service';
import { async } from '@angular/core/testing';
import { IfStmt } from '@angular/compiler';


@Injectable({
  providedIn: 'root'
})

// if i de-comment the interfaces that i commented below i need to implement these
// modules into the class signature too ... the modules are: , CanActivateChild, CanDeactivate<unknown>, CanLoad
export class GuardisemployeeGuard implements CanActivate {
Isemployee = false;
shownName: any;

// FOR REDIRECTION AFTER TRYING TO ACCESS A PAGE FROM THE URL BAR MANUALLY
// since role authorization makes no sense for this app since a user can have both roles
// user role and employee role this doesn't imply that he can access a page from the url bar
// without logging out and then logging in again, so every attempt of trying to navigate to a page
// manually from the url bar must not be allowed and this can be achieved by simply redirecting every
// GET request to a specific page saying that manual navigation is not allowed!
// so every time someone is requesting all the specified pages via the url bar he will be redirected
// to that specific error page instead...

// tslint:disable-next-line: max-line-length tslint:disable-next-line: variable-name
constructor(private msg: DataserviceService, private httpservice: HttpserviceService, private _router: Router){} // i just implemented the http and auth methods inside the same file called httpservice... that's why i created an instance authService of type httpService...

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {

    
 this.msg.currentLabelName.subscribe((res: any) => {

    this.shownName = res

});

       // tslint:disable-next-line: ban-types
       return new Promise((resolve: Function, reject: Function) => {

        // logic of this guard
 //if(this.shownName !== 'Default Name' && this.shownName !== undefined) {
  this.httpservice.getTokensPayload().subscribe((res: any) => {
    this.shownName = res['email']; 

          this.httpservice.findEmployeesEmailInDb({email: this.shownName}).subscribe((res: any) => {
              if (res.length === 1) {
                resolve(true);
              }
            else {
                this._router.navigate(['/accessdenied']); // it redirects to that page i
                reject(false);
              }
              });
  // }
          });

        })
  }


/*

    this.msg.currentLabelName.subscribe(res => this.shownName = res);

    const m: Mail = {
      email: this.shownName
    };


    this.httpservice.findUserEmailInDb(m).subscribe((res: any) => {
        if (res.length === 1) {
          if ((res[0])['email'] === this.shownName) {
          this.Isuser = true;
          return true;
          }
        }
  //  }
    });

  //  this._router.navigate(['/accessdenied']); // it redirects to that page instead!

    return false; // which means don't allow manual navigation via the url bar since the returned value is false!


    // }
    */
 }

