const express = require('express');
const request = require('request');
const app = express();
// to run redis we need to install redis server via the .exe file from the official website
// and then install redis client via npm here too
var redis = require('redis'); 
// By default redis.createClient() will use 127.0.0.1 and port 6379.
// this creates a new client.
var client = redis.createClient({
    host: 'localhost',
    port: 6379
}); 


client.on('connect', function() {
    console.log('Redis client connected and is running localhost on port 6379 by default');
  });

client.on('error', function (err) {
    console.log('Something went wrong and we couldn\'t connect to redis client ' + err);
  }); 



var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);
   

app.use(express.json());


const port = process.env.port || 5000;
app.listen(port, () => {
    console.log(`proxy listens on port: ${port}`);
});



// make the actual request to 3rd party api
function getOrgNames(req, res, next) {
    request('https://hr.apografi.gov.gr/api/public/organizations', function (error, response, body) {
        if(error) {
            res.send({serversais: 'An error occured'})
        } else {
      
            console.log('Fetching Org Names... Making call to 3rd party api...')
            // let's now put the whole json array that the 3rd party api gave us back into redis!
            client.set('organizations', body, function(err, reply) {
                if(err) {
                    console.log('Error at setting the json array of the response of 3rd api in redis...');
                } else {
                    console.log('Redis has set your json array of the response of 3rd api in redis');
                }
            });  

            res.send(body) 
        }  
    })
}

app.get('/api/orgnamesfromthirdpartyapi', cacheOrgNames, getOrgNames);

// cache middleware
function cacheOrgNames(req, res, next) {


    client.get('organizations', (err, object) => {
        if(err) {
            console.log('Error at getting json array of org names came from 3rd api and cached in redis...')
        } else if (object !== null) {
            console.log('Redis retrieved all org names came from 3rd api and cached in redis')
            res.send(object)
        } else {
            next();
        }
    
    });
    
}

