import { Injectable } from '@angular/core';
// tslint:disable-next-line: max-line-length
import { CanActivate, Router, CanDeactivate, NavigationEnd, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpserviceService } from './httpservice.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

// if i de-comment the interfaces that i commented below i need to implement these
// modules into the class signature too ... the modules are: , CanActivateChild, CanDeactivate<unknown>, CanLoad
export class RouteGuard implements CanActivate {
loggedInUserMail = '';

// FOR REDIRECTION AFTER TRYING TO ACCESS A PAGE FROM THE URL BAR MANUALLY
// since role authorization makes no sense for this app since a user can have both roles
// user role and employee role this doesn't imply that he can access a page from the url bar
// without logging out and then logging in again, so every attempt of trying to navigate to a page
// manually from the url bar must not be allowed and this can be achieved by simply redirecting every
// GET request to a specific page saying that manual navigation is not allowed!
// so every time someone is requesting all the specified pages via the url bar he will be redirected
// to that specific error page instead...

// tslint:disable-next-line: max-line-length tslint:disable-next-line: variable-name
constructor(private _router: Router, private httpservice: HttpserviceService){} // i just implemented the http and auth methods inside the same file called httpservice... that's why i created an instance authService of type httpService...

// A  guard with dependency
// constructor(private _Guard4DependencyService:  Guard4DependencyService) {}



// , route: ActivatedRouteSnapshot enallaktiki parametros ston constructor
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
  //  const requiresLogin = route.data.requiresLogin;
  //  if (requiresLogin) {
  //    this.httpservice.getTokensPayload().subscribe((res: any) => {
       //   this.loggedInUserMail = res['email'];
    //  })&& this.loggedInUserMail === 'maria@gmail.com'

    // tslint:disable-next-line: ban-types
    return new Promise((resolve: Function, reject: Function) => {
      // logic of this guard
      if (this.httpservice.loggedIn()) {
          resolve(true);
      } else {
        this._router.navigate(['/accessdenied']); // it redirects to that page instead!
        reject(false);
      }
  });

/*
      if (this.authService.loggedIn()) {
        // tslint:disable-next-line: max-line-length
        return true; // by returning true the "canActivate: [RouteguardGuard]" property in app-routing.module.ts routes array gets activated and blocks the navigation to that path if condition is met

  }

  //  }
    else {

      this._router.navigate(['/accessdenied']); // it redirects to that page instead!
      return false; // which means don't allow manual navigation via the url bar since the returned value is false!

    }
  }
*/

  /*
  canDeactivate(): boolean {

   // tslint:disable-next-line: max-line-length
   if (this.authService.loggedIn()) { // apla sto http service epidi bariomoun
    // na ftiakso neo service file kai na to onomaso auth service piga kai ilopoiisa
    // kai methodous pou apla kanoun get to token apo to localstorage sto idio arxeio
    // pou kalo to backend genika
      return false;
   } else {
      return true;
    }
  }


  canActivateChild(){
  }

  canLoad(){
  }
*/
}
}
