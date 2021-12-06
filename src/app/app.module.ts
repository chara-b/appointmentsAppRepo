import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule, routingComponents } from './app-routing.module';

import { AppComponent } from './app.component';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
import { DialogComponent } from './dialog/dialog.component';
import { ErrorpageComponent } from './errorpage/errorpage.component';


import { HttpserviceService } from './httpservice.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokeninterceptorserviceService } from './tokeninterceptorservice.service';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { AdminloginComponent } from './login/adminlogin/adminlogin.component';
import { AdminpageComponent } from './login/adminlogin/adminpage/adminpage.component';
import { GuardisemployeeGuard } from './guardisemployee.guard';
import { MasterGuard } from './master.guard';


@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    WelcomepageComponent,
    DialogComponent,
    ErrorpageComponent,
    AdminloginComponent,
    AdminpageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatCheckboxModule,
    MatPaginatorModule,
    HttpClientModule,
    MatSortModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatDialogModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatTableModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  providers: [HttpserviceService,
    { provide:  HTTP_INTERCEPTORS,
      useClass: TokeninterceptorserviceService,
      multi: true // we set this property too so we can use multiple interceptors if required!
    },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    MasterGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
