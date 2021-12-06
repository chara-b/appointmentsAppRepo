import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of,  throwError } from 'rxjs';
import { User, Mail, Organization, Appointment, Employee, Code, Credentials, Appointment2 } from './post';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HttpserviceService {

  // posts: any[];

  readonly ROOT_URL = 'http://localhost:3000/api';  // BASE URL to web api where server.js file listens

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };


  // constructor has dependency injection in it!
  // an http instance of httpclient module is instantiated first
  // and then constructor creates this service's object with this
  // http dependency in it. For this to work httpclient is registered
  // in app.module.ts file so angular be able to make use of the
  // injectable module upon this dependency injection here
  // the whole service is also registered there as a provider in that
  // app.module.ts file
  constructor(private http: HttpClient, private _router: Router) { }


// GET all appointments scheduled for a specific organization
  getAllAppointmentsForAnOrg(organization: Organization) {

    const cred = JSON.stringify(organization);
    return this.http.post(this.ROOT_URL + '/orgappointments/', cred, this.httpOptions);
  }



  // GET all appointments of a user by getting via post method instead get method
  getUserAppointments(usermail: Mail) {

    const email = JSON.stringify(usermail); // this holds just the email of the user we need to get his appointments

    return this.http.post(this.ROOT_URL + '/userappointments', email, this.httpOptions);
  }

  // get pending appointments from redis
  getPendingAppointments(usermail: Mail) {
    const email = JSON.stringify(usermail);
    return this.http.post(this.ROOT_URL + '/getpendingappointments', email, this.httpOptions);
  }

    // get pending appointments from redis according to org name that the employee belongs to so he can see
    // how many appointments for his org he has to approve...
    getPendingAppointmentsForThisOrg(orgName: Organization) {
      const OrgName = JSON.stringify(orgName);
      return this.http.post(this.ROOT_URL + '/getpendingappointmentsfororg', OrgName, this.httpOptions);
    }

// send a new appointment's info into backend as a json to add this new appointment's info into redis
// in-memory db so to get approved or discarded
sendAppointmentForApproval(apntment: Appointment) {

  const appointment = JSON.stringify(apntment);
  return this.http.post(this.ROOT_URL + '/sendappointmentforapproval', appointment, this.httpOptions);
}

  postPendingAppointmentToDBAfterApproval(appoint: Appointment) {
    const appointment = JSON.stringify(appoint);
    return this.http.post(this.ROOT_URL + '/postpendingappointmenttodbafterapproval', appointment, this.httpOptions);
  }


// send a new user's info into backend as a json to add this new user's info into db
  addUser(user: User) {

    const newuser = JSON.stringify(user);
    return this.http.post(this.ROOT_URL + '/adduser', newuser, this.httpOptions);
  }


  addEmployee(employeee: Employee) {

    const employee = JSON.stringify(employeee);
    return this.http.post(this.ROOT_URL + '/addemployee', employee, this.httpOptions);
  }

  findWhatOrgIsCurrentEmployee(mail: Mail) {
    const email = JSON.stringify(mail);
    return this.http.post(this.ROOT_URL + '/findorgofemployee', email, this.httpOptions);
  }
// PUT: update a field of your profile in db
// this value parameter here comes from either a user or an employee who wants to update his info details
// for some reason and there's a specific key-value pair inside this object which tells the backend if
// the update is performed by a user or an employee so the correct table to be updated the users table or
// the employees table. This key-value pair is either (e-mail: "something@hotmail.com") or (org: "some organization name")
// in both cases email and org are unique so by this we identify if this update came from a user with the unique
// email provided or an employee with the unique org name where he works
updateYourProfileInfo(value: object) {
  // tslint:disable-next-line: variable-name
  const updated_value = JSON.stringify(value);

  return this.http.put(this.ROOT_URL + '/updateprofile', updated_value, this.httpOptions);
}


updateYourAppointmentInfo(value: object) {
  // tslint:disable-next-line: variable-name
  const updated_value = JSON.stringify(value);

  return this.http.put(this.ROOT_URL + '/updateappointment', updated_value, this.httpOptions);
}


// DELETE: delete an appointment after it has been approved or cancel it before it is approved
// note that we don't need an extra method to cancel an appointment since we'll check in the backend later
// if this appointment exists in redis and if it does then this request means cancel it otherwise means delete it!
// In redis we suppose that we store appointments that they are pending approval when they get approved they are
// deleted from redis this is how we recognise if an appointment is for cancelation or complete deletion
deleteAppointment(apntment: Appointment) {

    const appointment = JSON.stringify(apntment);
    return this.http.post<any>(this.ROOT_URL + '/deleteappointment/', appointment, this.httpOptions);

}

// delete your account if you're a user
deleteUserAccount(usermail: Mail) {

  const email = JSON.stringify(usermail);
  return this.http.post(this.ROOT_URL + '/deleteuseraccount', email, this.httpOptions);


}


// delete your account if you're an employee
deleteEmployeeAccount(employeemail: Mail) {

  const email = JSON.stringify(employeemail);
  return this.http.post(this.ROOT_URL + '/deleteemployeeaccount', email, this.httpOptions);


}

// retrieve all org names from given api
// this causes cors problem gia auto dimiourgithike ena arxeio sto path tou project /src/proxy.js
// gia to opoio isxiei to parakato...
/*
      This proxy is for requesting the resource (the 3rd party api) through it.
      This proxy is written in express and this proxy is the one who does the actual request to
      the 3rd party api! we just need to hit this proxy's entpoint from here via below method
      And in that server response (proxy's response) now you can allow cross-origin header.
*/
getOrgNames() {
  return this.http.get<any[]>('http://localhost:5000/api/orgnamesfromthirdpartyapi');
}


// get org names so we delete them from select element since they must be submitted only once by one employee
getOrgNamesSignedInDb() {
  return this.http.get<any[]>(this.ROOT_URL + '/orgnames');
}

findUserEmailInDb(m: Mail) {
  const email = JSON.stringify(m);
  return this.http.post<any[]>(this.ROOT_URL + '/finduseremailindb', email, this.httpOptions);
}
findEmployeesEmailInDb(m: Mail) {
  const email = JSON.stringify(m);
  return this.http.post<any[]>(this.ROOT_URL + '/findemployeemailindb', email, this.httpOptions);
}

getCodes(objcode: Code) {
  const codeobj = JSON.stringify(objcode);
  return this.http.post(this.ROOT_URL + '/codes', codeobj, this.httpOptions);

}

login(obj: Credentials) {
  const cred = JSON.stringify(obj);
  return this.http.post(this.ROOT_URL + '/userlogin', cred, this.httpOptions);
}
loginorg(obj: Credentials) {
  const cred = JSON.stringify(obj);
  return this.http.post(this.ROOT_URL + '/orglogin', cred, this.httpOptions);
}



// get token from localstorage
getToken(){
  return localStorage.getItem('token');
}

loggedIn(){
  return localStorage.getItem('token');
}

logOut(){
  localStorage.removeItem('token');
  this._router.navigate(['/login']);
}

getTokensPayload(){
  return this.http.get<any[]>(this.ROOT_URL + '/gettokenspayload');
}

cancelPendingAppointment(appointment: Appointment) {
  // tslint:disable-next-line: variable-name
  const canceled_appointment = JSON.stringify(appointment);
  return this.http.post(this.ROOT_URL +  '/cancelpendingappointment', canceled_appointment, this.httpOptions);

}

sendEmail(appointmnt: Appointment) {
  const appointment = JSON.stringify(appointmnt);
  return this.http.post(this.ROOT_URL + '/sendemail', appointment, this.httpOptions);
}


sendApprovalEmail(appointmnt: Appointment) {
  const appointment = JSON.stringify(appointmnt);
  return this.http.post(this.ROOT_URL + '/sendapprovalemail', appointment, this.httpOptions);
}


rejectAppointment(appointment: Appointment2) {
  const ap = JSON.stringify(appointment);
  return this.http.post(this.ROOT_URL + '/reject', ap, this.httpOptions);
}

getUserRejected(usermail: Mail) {
  const useremail = JSON.stringify(usermail);
  return this.http.post(this.ROOT_URL + '/getuserrejected', useremail, this.httpOptions);
}

getRejectedByEmployee() {
  return this.http.get<any[]>(this.ROOT_URL + '/getrejectedbyemployee');
}

postCode(cod: Code) {
  const code = JSON.stringify(cod);
  return this.http.post(this.ROOT_URL + '/generatedcodes', code, this.httpOptions);
}

getApprovedByEmployee() {
  return this.http.get<any[]>(this.ROOT_URL + '/getapprovedbyemployee');
}

getAllApprovedAppointments() {
  return this.http.get<any[]>(this.ROOT_URL + '/getallapproved');
}

getEmployeeInfo() {
  return this.http.get<any[]>(this.ROOT_URL + '/getemployeesinfo');
}

getUserInfo() {
  return this.http.get<any[]>(this.ROOT_URL + '/getuserinfo');
}




findIfAppointmentExistsInDB(thedayandtime: Appointment) {
  const dayandtime = JSON.stringify(thedayandtime);
  return this.http.post(this.ROOT_URL + '/findIfAppointmentExistsInDB', dayandtime, this.httpOptions);
}

}

