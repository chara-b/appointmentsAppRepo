export interface User {

    firstname: any;
    lastname: any;
    email: any;
    password: any;
    policy: any;
    status: any;
}

export interface Employee {

    firstname: any;
    lastname: any;
    org: any;
    password: any;
    email: any;
    policy: any;
    status: any;
}

export interface Appointment {

    org: any;
    day: any;
    time: any;
    email: any;
}

export interface Appointment2 { // this is used only when we want to save the employees email who made an approval or rejection in db!
    org: any;   // cause this interface includes the employeemail property!
    day: any;
    time: any;
    email: any;
    employeemail: any;
}

// to check user mail at sign up and throw errors
export interface Mail {
    email: any;
}
// to retrieve org info and check in sign up form for errors
export interface Organization {
    email: any;
    org: any;
}
// for login
export interface Credentials {
    email: any;
    password: any;
}
// for code field in sign up form
export interface Code {
    email: any;
    code: any;
}

export const GUARDS = {
    GUARD1: 'isLoggedIn',
    GUARD2: 'isEmployee',
    GUARD3: 'isUser',
    GUARD4: 'isAdmin',
};
// import {Component} from '@angular/core';

// export interface PeriodicElement {

// Organization: number;
// Day: string;
// Time: any;
// }
