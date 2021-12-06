/* create db with specified character set so it stores greek language too! */
CREATE DATABASE appointmentsdb COLLATE utf8_unicode_ci;

/* create table UsersTable */
CREATE TABLE appointmentsdb.userstable (firstname CHAR(30) NOT NULL, lastname CHAR(30) NOT NULL, email VARCHAR(50) NOT NULL UNIQUE, password CHAR(60) NOT NULL, policy BOOLEAN NOT NULL, status CHAR(20) NOT NULL);



/* create EmployeesTable table */
CREATE TABLE appointmentsdb.employeestable (firstname CHAR(30) NOT NULL, lastname CHAR(30) NOT NULL, org CHAR(100) NOT NULL UNIQUE, password CHAR(60) NOT NULL, email VARCHAR(50) NOT NULL UNIQUE, policy BOOLEAN NOT NULL, status CHAR(20) NOT NULL);
  
/* create codestable table */
CREATE TABLE appointmentsdb.codestable (codes CHAR(60) NOT NULL UNIQUE, email VARCHAR(50) NOT NULL UNIQUE);

/* create ApprovedAppointments table */
CREATE TABLE appointmentsdb.approvedappointments (org CHAR(100) NOT NULL, email VARCHAR(50) NOT NULL, day VARCHAR(50) NOT NULL, time VARCHAR(50) NOT NULL, employeemail VARCHAR(50) NOT NULL);


/* create ApprovedAppointments table */
CREATE TABLE appointmentsdb.rejectedappointments (org CHAR(100) NOT NULL, email VARCHAR(50) NOT NULL, day VARCHAR(50) NOT NULL, time VARCHAR(50) NOT NULL, employeemail VARCHAR(50) NOT NULL);



/* insert admin's data... */
INSERT INTO appointmentsdb.employeestable (firstname, lastname, org, password, email, policy, status) VALUES ('Admin', 'Admin', 'Dimosio', '$2b$15$/25UJbC636toPlXUD0Gi8uJ9BKx61M2ha5BYCYJZP4mD3DTw6IIM6', 'admin@appointments.gov.gr', '1', 'Active');
  

/* drop a needless column from ApprovedAppointments table  
ALTER TABLE appointmentsdb.ApprovedAppointments DROP TimestampTemp; */

