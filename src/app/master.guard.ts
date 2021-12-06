import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { GuardisuserGuard } from './guardisuser.guard';
import { GUARDS } from './post';
import { GuardisemployeeGuard } from './guardisemployee.guard';
import { GuardisadminGuard } from './guardisadmin.guard';
import { RouteGuard } from './routeguard.guard';
import { HttpserviceService } from './httpservice.service';
import { DataserviceService } from './dataservice.service';
import { Observable } from 'rxjs';

// import all the guards in the application


@Injectable()
export class MasterGuard implements CanActivate {

    // you may need to include dependencies of individual guards if specified in guard constructor
    // tslint:disable-next-line: max-line-length  tslint:disable-next-line: variable-name
    constructor(private msg: DataserviceService, private _router: Router, private authService: HttpserviceService, private httpservice: HttpserviceService) {}

    private route: ActivatedRouteSnapshot;
    private state: RouterStateSnapshot;

    // This method gets triggered when the route is hit
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {

        this.route = route;
        this.state = state;

        if (!route.data) {
            Promise.resolve(true);
            return;
        }

        // this.route.data.guards is an array of strings set in routing configuration

        if (!this.route.data.guards || !this.route.data.guards.length) {
            Promise.resolve(true);
            return;
        }
        return this.executeGuards();
    }

    // Execute the guards sent in the route data
    private executeGuards(guardIndex: number = 0): Promise<boolean> {
        return this.activateGuard(this.route.data.guards[guardIndex])
            .then(() => {
                if (guardIndex < this.route.data.guards.length - 1) {
                    return this.executeGuards(guardIndex + 1);
                } else {
                    return Promise.resolve(true);
                }
            })
            .catch(() => {
                return Promise.reject(false);
            });
    }

    // Create an instance of the guard and fire canActivate method returning a promise
    private activateGuard(guardKey: string): Promise<boolean> {

        let guard: RouteGuard | GuardisemployeeGuard | GuardisuserGuard | GuardisadminGuard;

        switch (guardKey) {
            case GUARDS.GUARD1:
                guard = new RouteGuard(this._router, this.authService);
                break;
            case GUARDS.GUARD2:
                guard = new GuardisemployeeGuard(this.msg, this.httpservice, this._router);
                break;
            case GUARDS.GUARD3:
                guard = new GuardisuserGuard(this.msg, this.httpservice, this._router);
                break;
            case GUARDS.GUARD4:
                guard = new GuardisadminGuard(this.msg, this.httpservice, this._router);
                break;
            default:
                break;
        }
        return guard.canActivate(this.route, this.state);
    }
}



