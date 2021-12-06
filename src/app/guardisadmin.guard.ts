import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataserviceService } from './dataservice.service';
import { HttpserviceService } from './httpservice.service';
import { Mail } from './post';

@Injectable({
  providedIn: 'root'
})
export class GuardisadminGuard implements CanActivate {
  Isadmin = false;
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
  //  const requiresLogin = route.data.requiresLogin;
  //  if (requiresLogin) {

    this.msg.currentLabelName.subscribe((res: any) => {

      this.shownName = res
  
  });

  

    return new Promise((resolve: Function, reject: Function) => {
      // logic of this guard
      this.httpservice.getTokensPayload().subscribe((res: any) => {
        this.shownName = res['email']; 
    
      this.httpservice.findEmployeesEmailInDb({email: this.shownName}).subscribe((res: any) => {
        if (res.length === 1) {
          resolve(true);
        } else {
          this._router.navigate(['/accessdenied']); // it redirects to that page i
          reject(false);
      }
  //  }
    });
  });
})
/*
    this.httpservice.findEmployeesEmailInDb(m).subscribe((res: any) => {
        if (res.length === 1) {
          if ((res[0])['email'] === 'admin@appointments.gov.gr') {
          this.Isadmin = true;
          return true;
          }
        }
  //  }
    });

   // this._router.navigate(['/accessdenied']); // it redirects to that page instead!

    return false; // which means don't allow manual navigation via the url bar since the returned value is false!


    // }
 }
*/
}
}
