import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OrgloginComponent } from './login/orglogin/orglogin.component';
import { EmployeepageComponent } from './login/orglogin/employeepage/employeepage.component';
import { UserloginComponent } from './login/userlogin/userlogin.component';
import { UserpageComponent } from './login/userlogin/userpage/userpage.component';
import { HomeComponent } from './home/home.component';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
import { ErrorpageComponent } from './errorpage/errorpage.component';
import { RouteGuard} from './routeguard.guard';
import { AdminloginComponent } from './login/adminlogin/adminlogin.component';
import { AdminpageComponent } from './login/adminlogin/adminpage/adminpage.component';
import { GuardisemployeeGuard } from './guardisemployee.guard';
import { MasterGuard } from './master.guard';
import { GUARDS } from './post';

// the routes is nothing but just an object containing a path which is reflected in the url
// and the component to be rendered when we navigate to that corresponding path...
// each route we need to register here is a separate object inside below array of objects!
const routes: Routes = [

  { path: '', component: WelcomepageComponent },
  { path: 'signup', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'orglogin', component: OrgloginComponent },
  { path: 'employeepage', component: EmployeepageComponent, canActivate: [MasterGuard],
  data: {
    guards: [
        GUARDS.GUARD1,
        GUARDS.GUARD2
    ]
  }
  }, //
  { path: 'userlogin', component: UserloginComponent },
  { path: 'userpage', component: UserpageComponent, canActivate: [MasterGuard],
  data: {
    guards: [
        GUARDS.GUARD1,
        GUARDS.GUARD3
    ]
  }
  }, //
  { path: 'logout', component: LoginComponent },
  { path: 'accessdenied', component: ErrorpageComponent },
  { path: 'adminlogin', component: AdminloginComponent },
  { path: 'adminpage', component: AdminpageComponent, canActivate: [MasterGuard],
  data: {
    guards: [
        GUARDS.GUARD1,
        GUARDS.GUARD4
    ]
  }
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
// tslint:disable-next-line: max-line-length
export const routingComponents = [WelcomepageComponent, HomeComponent, LoginComponent, OrgloginComponent, EmployeepageComponent, UserloginComponent, UserpageComponent, AdminloginComponent, AdminpageComponent];
