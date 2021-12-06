const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')
let stringify = require('json-stringify-safe');
// to run redis we need to install redis server via the .exe file from the official website
// and then install redis client via npm here too
var redis = require('redis'); 
// By default redis.createClient() will use 127.0.0.1 and port 6379.
// this creates a new client.
var client = redis.createClient(); 
var bcrypt = require('bcrypt');
const saltRounds = 15; // The cost factor (which is the saltRounds) controls how much time is needed 
// to calculate a single BCrypt hash. 
// The higher the cost factor, the more hashing rounds are done.
// The more time is necessary, the more difficult is brute-forcing.
var nodemailer = require('nodemailer');


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // when we set headers in the frontend to be sent we need to declare them here to be allowed in the backend
    next();
}

app.use(allowCrossDomain);
   

app.use(express.json()); // χάρης αυτό μπορούμε άνετα να κάνουμε parse το εισερχόμενο json με
// τον εξής τρόπο req.body.ΤοΌνομαΤηςΜεταβλητήΤηςΟποίαςΘέλουμεΤηνΤιμή και όλο αυτό να το αποθηκεύσουμε
// σε μια καινούρια μεταβλητή έτσι var Myvar = req.body.whatever;


// Configure MySQL connection ... db connection credentials ...
var mysql = require('mysql')
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'appointmentsdb'
});

//Establish MySQL connection
connection.connect(function(err) {
    if (err) 
       throw err
    else {
        console.log('Connected to MySQL');
        // Start the app when connection is ready
        app.listen(3000);
        console.log('Server is listening on port 3000');
  }
 });

 // REDIS CONNECTION...
 client.on('connect', function() {
    console.log('Redis client connected and is running localhost on port 6379 by default');
  });

client.on('error', function (err) {
    console.log('Something went wrong and we couldn\'t connect to redis client ' + err);
  }); 


// routes


/* useful queries of the update mysql query...
connection.query('UPDATE moviesdb.clickedmovie SET TimesClicked = TimesClicked + 1 WHERE MovieID = ?', [req.params.id])
connection.query('UPDATE moviesdb.clickedmovie SET TimesSecondMethodClicked = TimesSecondMethodClicked + 1 WHERE MovieID = ?', [req.params.id])
connection.query('INSERT INTO moviesdb.movieclicked (IncomingMovieID, SecondMethodClicked, ThirdMethodClicked, Timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [req.params.id, true, false])  
                
*/
    

    
    
// CREATE USER + hash his password
app.post('/api/adduser', function(req, res) {

    let password;
// hashing the password before inserting it into db
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        if(err) {throw err} 
        else {
        password = hash;

        connection.query('INSERT INTO appointmentsdb.UsersTable (firstname, lastname, email, password, policy, status) VALUES (?, ?, ?, ?, ?, ?)', [req.body.firstname, req.body.lastname, req.body.email, password, req.body.policy, req.body.status] , (err) => {
       
            if(err) {
                res.send({serversais: 'User could not be created. You either entered an already registered email/org or the network failed. Try again'});
             }
             else {
  
                res.send({serversais: 'Your account has been created. You can now log in.'});
              }
  
          })
        }
    })
})
  


// CREATE EMPLOYEE + hash his password
app.post('/api/addemployee', function(req, res) {

    let password;
// hashing the password before inserting it into db
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        if(err) {throw err} 
        else {
        password = hash;

        connection.query('INSERT INTO appointmentsdb.EmployeesTable (firstname, lastname, org, password, email, policy, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.body.firstname, req.body.lastname, req.body.org, password, req.body.email, req.body.policy, req.body.status] , (err) => {
       
            if(err) {
                res.send({serversais: 'Employee could not be created. You either entered an already registered email/org or the network failed. Try again'});
             }
             else {
  
                res.send({serversais: 'Your account has been created. You can now log in.'});
              }
  
          })
        }
    })
})
  





// GET all appointments scheduled for a specific organization
        app.post('/api/orgappointments/', verifyToken, (req, res) => {

            connection.query('SELECT email, day, time FROM appointmentsdb.approvedappointments WHERE org = ?', [req.body.org], (err, rows) => {
                if(err) {
                    res.send({serversais: 'Error... Could not get appointments for ' + req.body.org});
                 }
                 else {
                     res.send(rows)
                }
            })
                
         
        })

        


// GET all appointments scheduled for a specific user
app.post('/api/userappointments', verifyToken, (req, res) => {

    connection.query('SELECT org, day, time FROM appointmentsdb.approvedappointments WHERE email = ?', [req.body.email], (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get appointments for user with given email address ' + req.body.email});
         }
         else {
             res.send(rows)
        }
    })
        
 
})

app.post('/api/sendappointmentforapproval', verifyToken, function(req, res){
    // h rpush kanei push se lista sto redis. h lista exei onoma pou tin kanoume get meta idio me to key pou tis dinoume
    // diladi to stringify(req.body.email) kai kanei mesa tis push kathe ena stringify object pou tis stelnoume
    // set in redis all pending approval appointments that the users submits ...
    client.lpush(stringify(req.body.email), stringify(req.body), function(err, reply) {
        if(err) {
            console.log('Error at setting the pending appointments submitted in redis...', err);
            res.send({serversais: 'Could not set your appointment for pending approval'});
            console.log(req.body)
        } else {
            console.log('Your pending appointment is in redis now');
            res.send({serversais: 'We\'ve set your appointment and is pending approval now'});
            console.log(reply)
        }
    });  

// sets the same list as above but this time key is different, before we set as key the email
// so we can retrieve by email for user's page all his appointments and now we set the same list in redis
// again but with the org as the key so each time a user adds a new appointment to that org list 
// we will be able to retrieve them all easily in an employee's page where we'll need only the organization's 
// that he works in appointments!
    client.lpush(stringify(req.body.org), stringify(req.body), function(err, reply) {
        if(err) {
            console.log('Error at setting the pending appointments submitted in redis...', err);
          //  res.send({serversais: 'Could not set your appointment for pending approval'});
            console.log(req.body)
        } else {
            console.log('Your pending appointment is in redis now');
          //  res.send({serversais: 'We\'ve set your appointment and is pending approval now'});
            console.log(reply)
           // console.log(req.body.org)
        }
    }); 

})


// get all pending for logged in user only
app.post('/api/getpendingappointments', verifyToken, function(req, res){
// get all appointments that are pending approval from redis according to email key so all pending ones for this specific user get retrieved
    client.lrange(stringify(req.body.email), 0, -1, (err, object) => { // h lrange kanei get listes apo to redis
        if(err) {
            console.log('Error at getting pending appointments from redis', err)
        } else if (object !== null) {
            console.log('Redis retrieved all pending appointments')
            // console.log(object)
            res.send(object)
         //   console.log(object)
        }
    
    });

})


// get all pending for a specific org only
app.post('/api/getpendingappointmentsfororg', verifyToken, function(req, res){
    // get all appointments that are pending approval from redis according to email key so all pending ones for this specific user get retrieved 
    client.lrange(stringify(req.body.org), 0, -1, (err, object) => { // h lrange kanei get listes apo to redis
            if(err) {
                console.log('Error at getting pending appointments for this org from redis', err)
            } else if (object !== null) {
                console.log('Redis retrieved all pending appointments')
                // console.log(object)

                res.send(object)
             //   console.log(object)
            }
        
        });
    
    })

app.post('/api/cancelpendingappointment', verifyToken, function(req, res){
    client.lrem(stringify(req.body.email), 0, stringify({org: req.body.org, day: req.body.day, time: req.body.time, email: req.body.email}), (err, response) => { // h del mporei na thelei key of the object kai oxi olo to object gia na kanei delete to record apo to redis

        if(err) {
            console.log('Error... Can not delete the key you requested from redis')
            res.send({serversais: 'Error... Appointment could not be deleted from pending mode.'})   
        } else if (response == 1) {
            console.log('Key was successfully deleted')
            res.send({serversais: 'Appointment is not in pending mode anymore.'})
        } else if (response == 0) {
            console.log('Key was not deleted. It does not exists.')
            res.send({serversais: 'Appointment could not be deleted from pending mode.'})   
        }
    
    });
/* // diagrafei oli ti lista tin opoia orizei pros diagrafi to klidi stringify(req.body.org) or stringify(req.body.email) analogos pio balo diladi diagrafei ola ta appointments per user kai per org
    client.del(stringify(req.body.org), (err, resp) => {
        if(err) {
            console.log('Error... Can not delete the key you requested from redis')
           /// res.send({serversais: 'Error... Appointment could not be deleted from pending mode.'})   
        } else if (resp == 1) {
            console.log('All keys deleted')
           // res.send({serversais: 'Appointment is not in pending mode anymore.'})
        } else if (resp == 0) {
            console.log('Key not deleted.')
          //  res.send({serversais: 'Appointment could not be deleted from pending mode.'})   
        }
    
    })
*/
})

// post an approved appointment to db and remove it from redis since it's approved!
app.post('/api/postpendingappointmenttodbafterapproval', verifyTokenWithoutPassingTokensEmailInRequest, function(req, res){

// if approve button is clicked from the frontend then make that appointment approved ans save it in db
connection.query('INSERT INTO appointmentsdb.approvedappointments (org, email, day, time, employeemail) VALUES (?, ?, ?, ?, ?)', [req.body.org, req.body.email, req.body.day, req.body.time, req.body.employeemail] , (err) => {
       
    if(err) {
        res.send({serversais: 'Error no appointment has been approved. Nothing inserted to db'});
     }
     else {

        res.send({serversais: 'The appointment has been approved and inserted to db!'});
      }

  })

    // now remove it from redis since it's approved! 0 means that it will remove all items that were found equal to the key... the key is the first argument...
    client.lrem(stringify(req.body.email), 0, stringify({org: req.body.org, day: req.body.day, time: req.body.time, email: req.body.email}), (err, response) => { // h del mporei na thelei key of the object kai oxi olo to object gia na kanei delete to record apo to redis

        if(err) {
            console.log('Error... Can not delete the key you requested from redis')
           /// res.send({serversais: 'Error... Appointment could not be deleted from pending mode.'})   
        } else if (response == 1) {
            console.log('Key was successfully deleted')
           // res.send({serversais: 'Appointment is not in pending mode anymore.'})
        } else if (response == 0) {
            console.log('Key was not deleted. It does not exists.')
          //  res.send({serversais: 'Appointment could not be deleted from pending mode.'})   
        }
    
    });

    client.lrem(stringify(req.body.org), 0, stringify({org: req.body.org, day: req.body.day, time: req.body.time, email: req.body.email}), (err, response) => { // h del mporei na thelei key of the object kai oxi olo to object gia na kanei delete to record apo to redis

        if(err) {
            console.log('Error... Can not delete the key you requested from redis')
           /// res.send({serversais: 'Error... Appointment could not be deleted from pending mode.'})   
        } else if (response == 1) {
            console.log('Key was successfully deleted')
           // res.send({serversais: 'Appointment is not in pending mode anymore.'})
        } else if (response == 0) {
            console.log('Key was not deleted. It does not exists.')
          //  res.send({serversais: 'Appointment could not be deleted from pending mode.'})   
        }
    
    });
})



// delete an appointment that has been approved or cancel it if it's in pending status...
app.post('/api/deleteappointment/', verifyToken, function(req, res){
    connection.query('DELETE FROM appointmentsdb.approvedappointments WHERE email = ? AND org = ? AND day = ? AND time = ?', [req.body.email, req.body.org, req.body.day, req.body.time], (err) => {
       
        if(err) {
           res.send({serversais: 'Sorry, could not delete your appointment.'});
        }
        else{
            res.send({serversais: 'Selected appointment deleted successfully'});
        }
       
      });

      // after you deleted from already approved ones insert it into the rejected ones...
    connection.query('INSERT INTO appointmentsdb.rejectedAppointments (org, email, day, time, employeemail) VALUES (?, ?, ?, ?, ?)', [req.body.org, req.body.email, req.body.day, req.body.time, 'Rejected by you after being approved'] , (err) => {
        if(err) {
            console.log('Error... Could not insert deleted appointments to rejected table in db... ', err)
    //  res.send({serversais: 'Error... Could not insert deleted appointments to rejected table in db... '});
         }
         else {
             console.log('Deleted Appointment inserted to rejected table in db')
            // res.send({serversais: 'Deleted Appointment inserted to rejected table in db'})
        }
    })

});

// delete an employee's account...
app.post('/api/deleteemployeeaccount', verifyToken, function(req, res){
    connection.query('DELETE FROM appointmentsdb.EmployeesTable WHERE email = ?', [req.body.email], (err) => {
       
        if(err) {
           res.send({serversais: 'Sorry, could not delete your account.'});
        }
        else{
            res.send({serversais: 'Your account has been deleted successfully'});
        }
       
      });

});

// delete a user's account...
app.post('/api/deleteuseraccount', verifyToken, function(req, res){
    connection.query('DELETE FROM appointmentsdb.UsersTable WHERE email = ?', [req.body.email], (err) => {
       
        if(err) {
           res.send({serversais: 'Sorry, could not delete your account.'});
        }
        else{
            res.send({serversais: 'Your account has been deleted successfully'});
        }
       
      });

});

// finds the name of the org that an employee works according to email provided... we need this so we can
// retrieve from redis only the pending appointments commited for that specific org the logged in
// employee is working to...
app.post('/api/findorgofemployee', verifyToken, function(req, res){
    connection.query('SELECT org FROM appointmentsdb.employeestable WHERE email = ?', [req.body.email], (err, orgname) => {
       
        if(err) {
           res.send({serversais: 'Sorry, could not find employee\s organization name according to email provided.'});
        }
        else{
            res.send(orgname);
        }
       
      });

});
// GET org names submitted in db so we delete them from select element so they can not be selected again
// this happens because each org must be selected by 1 employee only
app.get('/api/orgnames', cachedOrgNames, getOrgNamesStoredAndCacheThem); 


// make the actual request to db
function getOrgNamesStoredAndCacheThem(req, res, next) {

    connection.query('SELECT org FROM appointmentsdb.employeestable', (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get org names from db'});
         }
         else {
            console.log('Fetching Org Names... Making call to db...')
            // let's now put the whole json array came from db into redis!
            // redis cache for orgnames expires after 30 sec cause db might get updated with newly added
            // org names registered by employees, so the cache needs to be updated too every now and then...
            client.setex('registeredorgnames', 30, stringify(rows), function(err, reply) {
                if(err) {
                    console.log('Error at setting the org names submitted till now in db in redis...', err);
                } else {
                    console.log('Redis has set your org names submitted till now in db in redis');
                }
            });  

             res.send(rows)
        }
    })
}
// cache middleware
function cachedOrgNames(req, res, next) {


    client.get('registeredorgnames', (err, object) => {
        if(err) {
            console.log('Error at getting org names that were stored in redis and were submitted in db...')
        } else if (object !== null) {
            console.log('Redis retrieved all org names which came from db and were stored in redis cache')
            res.send(object)
        } else {
            next();
        }
    
    });
    
}

// get emails submitted so to hint them as already submitted in the sign up form so the user don't need to
// rewrite his info after a failed submition since email column is unique in db and that will fire an error
app.get('/api/useremailsindb', cachedUseremails, getUserEmailsStoredAndCacheThem);

// make the actual request to db
function getUserEmailsStoredAndCacheThem(req, res, next) {
// oraio mysql query gia na pairnei kai apo tous dio diaforetikous pinakes tin koini stili me ta mails addresses pou exoun
// 'SELECT email as eml FROM appointmentsdb.employeestable UNION ALL SELECT email as mail FROM appointmentsdb.userstable'
    connection.query('SELECT email FROM appointmentsdb.userstable', (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get user emails from db'});
         }
         else {
            console.log('Fetching User Emails... Making call to db...')
            // let's now put the whole json array came from db into redis!
            // redis cache for orgnames expires after 30 sec cause db might get updated with newly added
            // emails registered by employees or users, so the cache needs to be updated too every now and then...
            // first parameter is the key which will be stored in redis 
            // second parameter is the expiration seconds
            // third parameter is the actual value which will be stored
            client.setex('registeredusermails', 30, stringify(rows), function(err, reply) {
                if(err) {
                    console.log('Error at setting the user emails came from db in redis...', err);
                } else {
                    console.log('Redis has set your user emails came from db');
                }
            });  
             res.send(rows)
        }
    })
}
// cache middleware for emails to be checked if exist for the sign up form
function cachedUseremails(req, res, next) {

// get the string with key the first parameter...
    client.get('registeredusermails', (err, object) => {
        if(err) {
            console.log('Error at getting user emails submitted in db and cached redis...')
        } else if (object !== null) {
            console.log('Redis retrieved all user emails which came from db and cached in redis')
            res.send(object)
        } else {
            next();
        }
    
    });
    
}

// get emails submitted so to hint them as already submitted in the sign up form so the user don't need to
// rewrite his info after a failed submition since email column is unique in db and that will fire an error
app.get('/api/employeemailsindb', cachedEmployeesemails, getEmployeeEmailsStoredAndCacheThem);


// make the actual request to db
function getEmployeeEmailsStoredAndCacheThem(req, res, next) {
// oraio mysql query gia na pairnei kai apo tous dio diaforetikous pinakes tin koini stili me ta mails addresses pou exoun
// 'SELECT email as eml FROM appointmentsdb.employeestable UNION ALL SELECT email as mail FROM appointmentsdb.userstable'
    connection.query('SELECT email FROM appointmentsdb.employeestable', (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get employees\' emails from db'});
         }
         else {
            console.log('Fetching Employees\' Emails... Making call to db...')
            // let's now put the whole json array came from db into redis!
            // redis cache for orgnames expires after 30 sec cause db might get updated with newly added
            // emails registered by employees or users, so the cache needs to be updated too every now and then...
            // first parameter is the key which will be stored in redis 
            // second parameter is the expiration seconds
            // third parameter is the actual value which will be stored
            client.setex('registeredemployeesmails', 30, stringify(rows), function(err, reply) {
                if(err) {
                    console.log('Error at setting the employees\' emails came from db in redis...', err);
                } else {
                    console.log('Redis has set your employees\' emails came from db');
                }
            });  
             res.send(rows)
        }
    })
}
// cache middleware for emails to be checked if exist for the sign up form
function cachedEmployeesemails(req, res, next) {

// get the string with key the first parameter...
    client.get('registeredemployeesmails', (err, object) => {
        if(err) {
            console.log('Error at getting employees\' emails submitted in db and cached redis...')
        } else if (object !== null) {
            console.log('Redis retrieved all employees\' emails which came from db and cached in redis')
            res.send(object)
        } else {
            next();
        }
    
    });
    
}
// select codes generated just to check validity of an employee sign up process by comparing the code he inserted
app.post('/api/codes', (req, res) => {

    connection.query('SELECT email FROM appointmentsdb.codestable WHERE email = ?', req.body.email, (error, response) => {
        if(error) {
            res.send({serversais: 'User not found'});
        } else if ( response.length === 0 ) { // if email is not found then mysql will return an empty array of 0 length so this check works fine!
                res.send({serversais: 'User not found to be able to sign up as employee. You must contact the admin to submit you first and give you a code'});
            } else {
                connection.query('SELECT codes FROM appointmentsdb.codestable WHERE email = ?', req.body.email, (err, codehashindb) => {
                if(err){
                    res.send({serversais: 'Error... no code found for given email. Please contact admin to provide you a code'})
                } else {
                    bcrypt.compare(req.body.code, codehashindb[0].codes, function (err, result) {
                        if (result) {
                            res.send({serversais: 'found'}); // or a redirect method instead...
                        } else {
                         res.send({serversais: 'Incorrect CODE'});

                        }
                }
             )}
            })
        }
    })
        
 
})


// if user calls this entpoint since the middleware is added if the user has sent an invalid token 
// then this entpoint's code is not executed the middleware responds with a 401 status by itself
// so by this way we are getting authenticated before taking the action to generate codes that only the
// admin can do
app.post('/api/generatedcodes', verifyTokenWithoutPassingTokensEmailInRequest, (req, res) => {
    let code;
// hashing the code before inserting it into db
    bcrypt.hash(stringify(req.body.code), saltRounds, function (err, hash) {
        if(err) {
            res.send({serversais: 'Something went wrong while encrypting the code...'})
            throw err
            
        } 
        else {
        code = hash;
        }

    connection.query('INSERT INTO appointmentsdb.codestable (codes, email) VALUES (?, ?)', [code, req.body.email], (error, response) => {
        if(error) {
            res.send({serversais: 'could not insert code and email into codestable'});
         } else {
             res.send({serversais: 'code and email inserted'})
         }
})
})
})


app.post('/api/userlogin', (req, res) => {

    connection.query('SELECT email FROM appointmentsdb.userstable WHERE email = ?', req.body.email, (error, response) => {
        if(error) {
            res.send({serversais: 'An error occured while searching for email existance in db'});
        } else if ( response.length === 0 ) { // if email is not found then mysql will return an empty array of 0 length so this check works fine!
            res.send({serversais: 'User not found. Sign Up first'});
        } else {
            connection.query('SELECT password FROM appointmentsdb.userstable WHERE email = ?', req.body.email, (err, passwordhashindb) => {
                if(err){
                    res.send({serversais: 'An error occured while trying to find a matching password for given email. This email/user might not exist!'})
                } else if (passwordhashindb.length === 0) {
                    res.send({serversais: 'Error... no password found for given email. Sign up first'});
                } else {
                    bcrypt.compare(req.body.password, passwordhashindb[0].password, function (err, result) {
                        if (result) {
                            // we'll now create a payload object to be inserted into jwt below
                            // as its payload... by convention we use subject as the object's key
                            // and then we pass its value which is something like an id or something that
                            // characterises the user who is trying to log in...
                            let payload = { subject: req.body.email } // here for this req.body.email we've found a record with a password matched the one submitted so this email is an existed one as a record so we can use it as the jwt's payload so we don't need to query the db to have it here for this purpose
                            let token = jwt.sign(payload, 'secretkey') // 2nd parameter here is the secret key which can be anything...
                            res.status(200).send({ token }); // or a .redirect() method instead maybe not decided yet...
                          
                        } else if(err) {
                         res.send({serversais: 'A mysql error happened while comparing the hash of the password given with the hash of the matched password in db'});

                        } else if (!result) { // result here returns true or false i saw that via a console log
                            
                            res.send({serversais: 'Incorrect Password'});

                        }
                }
             )}
            })
        }
    })
        
 
})


app.post('/api/orglogin', (req, res) => {

    connection.query('SELECT email FROM appointmentsdb.employeestable WHERE email = ?', req.body.email, (err, response) => {
        if(err) {
            res.send({serversais: 'An error occured while searching for email existance in db'});
         } else if ( response.length === 0 ) { // if email is not found then mysql will return an empty array of 0 length so this check works fine!
               res.send({serversais: 'User not found. Sign Up first'});
         } else {
            connection.query('SELECT password FROM appointmentsdb.employeestable WHERE email = ?', req.body.email, (err, passwordhashindb) => {
                if(err){
                    res.send({serversais: 'An error occured while trying to find a matching password for given email. This email/user might not exist!'})
                } else if (passwordhashindb.length === 0) {
                    res.send({serversais: 'Error... no password found for given email. Sign up first'});
                } else {
                    bcrypt.compare(req.body.password, passwordhashindb[0].password, function (err, result) {
                        if (result) {
                            
                            // we'll now create a payload object to be inserted into jwt below
                            // as its payload... by convention we use subject as the object's key
                            // and then we pass its value which is something like an id or something that
                            // characterises the user who is trying to log in...
                            let payload = { subject: req.body.email } // here for this req.body.email we've found a record with a password matched the one submitted so this email is an existed one as a record so we can use it as the jwt's payload so we don't need to query the db to have it here for this purpose
                            let token = jwt.sign(payload, 'secretkey') // 2nd parameter here is the secret key which can be anything...
                            res.status(200).send({ token }); // or a .redirect() method instead maybe not decided yet...
                       
                        } else if(err) {
                         res.send({serversais: 'A mysql error happened while comparing the hash of the password given with the hash of the matched password in db'});

                        } else if (!result) { // result here returns true or false i saw that via a console log
                            
                            res.send({serversais: 'Incorrect Password'});

                        }
                }
             )}
            })
        }
    })
        
 
})


// Middleware to verify token for authentication
function verifyToken(req, res, next) {
// the token is in the headers of the req so let's create a check if this authoriazation property exists
// in the headers
if (!req.headers.authorization){
    return res.status(401).send('Unauthorized Request. No Token found')
} // else let's extract the token value from the bearer token

let token = req.headers.authorization.split(' ')[1] // here split on the  space and extract only the first index of the array (which is the 2nd item of the items splitted) with the splitted items that the split() method created!
if (token === 'null') {
    return res.status(401).send('Unauthorized Request. Token found with null payload')
}
// else if the token exists we verify it using the jsonwebtoken package
// the verify() method returns the decoded token only if it is valid!
// if it's invalid it means no payload returned! which means that if there is no payload we must return a 401
// status...
let payload = jwt.verify(token, 'secretkey')
// console.log(payload)
if(!payload) {
    return res.status(401).send('Unauthorized Request. Token could not be verified')
}
// gia na iparxei sto localstorage tou browser token me payload ena sigekrimeno mail
// auto simenei oti to req.body.email pou stin ousia einai
// to email field tis login formas kanonika tha prepei na einai idio me to payload ston token to opoio payload
// exei dimiourgithi kata to login entpoint pio pano pou molis egiropoioithei to oti email kai password
// einai mia iparkti eggrafi sti basi tote stelnetai to token sto frontend me payload auto to mail
// kai kata to logout to token auto diagrafetai gia na stalei allo me neo mail os payload an o xristis kani
// login me allo mail apo to idio mixanima...
req.body.email = payload.subject // to payload einai to mesaio tmima enos token esto tou xx.yy.zz diladi
// to yy tmima ara sto diko mas token to payload einai to email pou apokodikopoieitai apo to 
// mesaio tmima sto opoio exei dimiourgithi sti login methodo pio pano... ! opote to pername afou exei
// ginei verified kai ara ginei kai decoded mesa sto req.body.email kai sinexizoume to execution
// bgainontas apo to middleware kalontas tin next() kai sinexizontas me ton kodika sto kaloumeno
// entpoint mono an to token exei ginei varified!
// console.log(payload.subject) // this is the decoded value that the token has as its 2nd part between the 2 dots --> xx.yy.zz
next()

}

// merikes fores theloume na ginei to authentication apo auto to middleware alla epidi to apopano middleware
// pernaei sto request to email pou krivei mesa sto soma tou to token kai meta sinexizei to request tin poreia
// tou kanonika sto soma tou api pou kalestike emeis mporei na min theloume autin tin allagi alla na theloume to
// authenticate xoris omos tin allagi auti ara se tetoies periptoseis xrisimopoioume auto to middleware
// gia authentication...
function verifyTokenWithoutPassingTokensEmailInRequest(req, res, next) {

if (!req.headers.authorization){
    return res.status(401).send('Unauthorized Request. No Token found')
} 
let token = req.headers.authorization.split(' ')[1]
if (token === 'null') {
    return res.status(401).send('Unauthorized Request. Token found with null payload')
}

let payload = jwt.verify(token, 'secretkey')
console.log(payload)
if(!payload) {
    return res.status(401).send('Unauthorized Request. Token could not be verified')
}

next()


}

app.get('/api/gettokenspayload', verifyToken, (req, res) => {
    res.send({email: req.body.email})
})




app.post('/api/sendemail', verifyTokenWithoutPassingTokensEmailInRequest, (req, res) => {

// Below we use the gmail service to send emails from this server.js file...
var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: 'appointmentshua@hotmail.com',
      pass: '098poilkjmnb'
    }
  });
  
  var mailOptions = {
    from: 'appointmentshua@hotmail.com',
    to: req.body.email,
    subject: 'Notification Email',
    html: "Your Appointment can not be scheduled for the time you selected. Please select new time or change day. Appointment/'s info: " + `${req.body.org}` + ' ' + `${req.body.day}` + ' ' + `${req.body.time}` + "<p>---------------------</p><img src='cid:logo'/><p>FROM appointment.gov.gr</p>",
    attachments: [{
        filename: 'logo.png',
        path: 'src/logo.png',
        cid: 'logo' 
   }]
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      res.send({serversais: 'No Email sent.'})
    } else {
      console.log('Email sent: ' + info.response);
      res.send({serversais: 'Email is successfully sent!'})
    }
  });


  connection.query('INSERT INTO appointmentsdb.rejectedAppointments (org, email, day, time, employeemail) VALUES (?, ?, ?, ?, ?)', [req.body.org, req.body.email, req.body.day, req.body.time, req.body.employeemail] , (err) => {
    if(err) {
        console.log('Error... Could not insert rejected appointments to db... ', err)
      //  res.send({serversais: 'Error... Could not insert rejected appointments to db... '});
     }
     else {
        console.log('Rejected Appointment inserted to db', err)
       //  res.send({serversais: 'Rejected Appointment inserted to db'})
    }
})


// now remove it from redis since it's rejected! 0 means that it will remove all items that were found equal to the key... the key is the first argument...
client.lrem(stringify(req.body.email), 0, stringify({org: req.body.org, day: req.body.day, time: req.body.time, email: req.body.email}), (err, response) => { // h del mporei na thelei key of the object kai oxi olo to object gia na kanei delete to record apo to redis

if(err) {
    console.log('Error... Can not delete the key you requested from redis')
   /// res.send({serversais: 'Error... Appointment could not be deleted from pending mode.'})   
} else if (response == 1) {
    console.log('Key was successfully deleted')
   // res.send({serversais: 'Appointment is not in pending mode anymore.'})
} else if (response == 0) {
    console.log('Key was not deleted. It does not exists.')
  //  res.send({serversais: 'Appointment could not be deleted from pending mode.'})   
}

});


// now remove it from redis since it's approved! 0 means that it will remove all items that were found equal to the key... the key is the first argument...
client.lrem(stringify(req.body.org), 0, stringify({org: req.body.org, day: req.body.day, time: req.body.time, email: req.body.email}), (err, response) => { // h del mporei na thelei key of the object kai oxi olo to object gia na kanei delete to record apo to redis

if(err) {
    console.log('Error... Can not delete the key you requested from redis')
   /// res.send({serversais: 'Error... Appointment could not be deleted from pending mode.'})   
} else if (response == 1) {
    console.log('Key was successfully deleted')
   // res.send({serversais: 'Appointment is not in pending mode anymore.'})
} else if (response == 0) {
    console.log('Key was not deleted. It does not exists.')
  //  res.send({serversais: 'Appointment could not be deleted from pending mode.'})   
}

});








})



app.post('/api/reject', verifyTokenWithoutPassingTokensEmailInRequest, (req, res) => {

   // connection.query('INSERT INTO appointmentsdb.rejectedAppointments (org, email, day, time, employeemail) VALUES (?, ?, ?, ?, ?)', [req.body.org, req.body.email, req.body.day, req.body.time, req.body.employeemail] , (err) => {
    //    if(err) {
     //       res.send({serversais: 'Error... Could not insert rejected appointments to db... '});
     //    }
     //    else {
      //       res.send({serversais: 'Rejected Appointment inserted to db'})
      //  }
   // })

   res.send({serversais: 'Appointment asked to be Rejected so we deleted it from redis where the pending ones are stored'})
 // now remove it from redis since it's rejected! 0 means that it will remove all items that were found equal to the key... the key is the first argument...
 client.lrem(stringify(req.body.email), 0, stringify({org: req.body.org, day: req.body.day, time: req.body.time, email: req.body.email}), (err, response) => { // h del mporei na thelei key of the object kai oxi olo to object gia na kanei delete to record apo to redis

    if(err) {
        console.log('Error... Can not delete the key you requested from redis')
       /// res.send({serversais: 'Error... Appointment could not be deleted from pending mode.'})   
    } else if (response == 1) {
        console.log('Key was successfully deleted')
       // res.send({serversais: 'Appointment is not in pending mode anymore.'})
    } else if (response == 0) {
        console.log('Key was not deleted. It does not exists.')
      //  res.send({serversais: 'Appointment could not be deleted from pending mode.'})   
    }

});


 // now remove it from redis since it's approved! 0 means that it will remove all items that were found equal to the key... the key is the first argument...
 client.lrem(stringify(req.body.org), 0, stringify({org: req.body.org, day: req.body.day, time: req.body.time, email: req.body.email}), (err, response) => { // h del mporei na thelei key of the object kai oxi olo to object gia na kanei delete to record apo to redis

    if(err) {
        console.log('Error... Can not delete the key you requested from redis')
       /// res.send({serversais: 'Error... Appointment could not be deleted from pending mode.'})   
    } else if (response == 1) {
        console.log('Key was successfully deleted')
       // res.send({serversais: 'Appointment is not in pending mode anymore.'})
    } else if (response == 0) {
        console.log('Key was not deleted. It does not exists.')
      //  res.send({serversais: 'Appointment could not be deleted from pending mode.'})   
    }

});


})
    

app.post('/api/getuserrejected', verifyToken, (req, res) => {
    connection.query('SELECT * FROM appointmentsdb.rejectedappointments WHERE email = ?', req.body.email, (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get rejected appointments'}, err);
         }
         else {
            res.send(rows);
         }

})
})

app.get('/api/getrejectedbyemployee', verifyToken, (req, res) => {
    connection.query('SELECT * FROM appointmentsdb.rejectedappointments WHERE employeemail = ?', req.body.email, (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get rejected appointments'});
         }
         else {
            res.send(rows);
         }

})
})

app.get('/api/getapprovedbyemployee', verifyToken, (req, res) => {
    connection.query('SELECT * FROM appointmentsdb.approvedappointments WHERE employeemail = ?', req.body.email, (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get approved appointments'});
         }
         else {
            res.send(rows);
         }

})
})

app.get('/api/getallapproved', verifyToken, (req, res) => {
    connection.query('SELECT * FROM appointmentsdb.approvedappointments', (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get approved appointments'});
         } else if ( rows.length === 0 ) { // if email is not found then mysql will return an empty array of 0 length so this check works fine!
            res.send({serversais: 'No rows with approved appointments found'});
      }
         else {
            res.send(rows);
         }

})
})



app.get('/api/getemployeesinfo', verifyToken, (req, res) => {
    connection.query('SELECT firstname, lastname, org, email FROM appointmentsdb.employeestable WHERE email = ?', req.body.email, (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get employee\'s info...'}, err);
         }
         else {
            res.send(rows);
         }

})
})


app.get('/api/getuserinfo', verifyToken, (req, res) => {
    connection.query('SELECT firstname, lastname, email FROM appointmentsdb.UsersTable WHERE email = ?', req.body.email, (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get employee\'s info...'}, err);
         }
         else {
            res.send(rows);
         }

})
})
// helps in the sign up form to check if a user is already signed up as a user so the system won't allow him to 
// sign up again as a user!
app.post('/api/finduseremailindb', (req, res) => {
    connection.query('SELECT email FROM appointmentsdb.UsersTable WHERE email = ?', req.body.email, (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not find user\s email...'}, err);
         }  else {
            res.send(rows);
         }

})
})
// same as the above endpoint ... checks if a user exists as an employee so the system won't allow his subscription as an employee again
app.post('/api/findemployeemailindb', (req, res) => {
    connection.query('SELECT email FROM appointmentsdb.EmployeesTable WHERE email = ?', req.body.email, (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not find employee\'s email...'}, err);
         } else {
            res.send(rows);
         }

})
})


app.post('/api/sendapprovalemail', verifyTokenWithoutPassingTokensEmailInRequest, (req, res) => {

    // Below we use the gmail service to send emails from this server.js file...
    var transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: 'appointmentshua@hotmail.com',
          pass: '098poilkjmnb'
        }
      });
      
      var mailOptions = {
        from: 'appointmentshua@hotmail.com',
        to: req.body.email,
        subject: 'Notification Email',
        html: "Your Appointment can not be scheduled for the time you selected. Please select new time or change day. Appointment/'s info: " + `${req.body.org}` + ' ' + `${req.body.day}` + ' ' + `${req.body.time}` + "<p>---------------------</p><img src='cid:logo'/><p>FROM appointment.gov.gr</p>",
        attachments: [{
            filename: 'logo.png',
            path: 'src/logo.png',
            cid: 'logo' 
       }]
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.send({serversais: 'No Email sent.'})
        } else {
          console.log('Email sent: ' + info.response);
          res.send({serversais: 'Approval email is successfully sent!'})
        }
      });
    
})

app.post('/api/findIfAppointmentExistsInDB', verifyToken, (req, res) => {
    connection.query('SELECT day, time FROM appointmentsdb.approvedappointments WHERE day = ? AND time = ?', [req.body.day, req.body.time], (err, rows) => {
        if(err) {
            res.send({serversais: 'Error... Could not get employee\'s info...'}, err);
         }
         else {
            res.send(rows);
         }
})
}
)




