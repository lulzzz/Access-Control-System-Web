/* Receiving Message from user */
/* Using an pure platform */
const express = require('express');
const app = express();
// component
const fs = require('fs');
const url = require('url');
const path = require('path');
// Security
const helmet = require('helmet');

const bodyParser = require('body-parser');
const jsonfs = require('jsonfile');
const moment = require('moment');

const min_jsondb = require('./min_jsondb');
const gate = require('./gate');
// Compile at first
gate.compile();

/* Redirect views path */
app.set('views', path.join(__dirname, 'web/views'));

/* Setting static directory */
app.use(express.static('database'));
app.use(express.static('wiring'));
// Parsing setting
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// Security
app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.referrerPolicy());

/* Setting view engine as EJS file */
app.set('view engine', 'ejs');

const server = require('http').createServer(app);

// Get Service Main Page
app.get('/',function(req,res){
    // Welcome page for Gate system
    res.render('index',{
        title: "Access-Control-System"
    });
});

// Get Sign Up usage
app.get('/register',function(req,res){
    var userinfo = url.parse(req.url,true);
    console.log("User Name : " + userinfo.query.usr);
    console.log("User Email : " + userinfo.query.email);

    // FIXME Add into database
    min_jsondb.addUser(userinfo.query.usr,userinfo.query.email,function(err,msg){
        if(err == 0){
            console.log("Error when add user. msg :"+msg);
        }
        else{
            // Successfully enroll
            res.render('redirectpage',{
                title: "Open Gate!",
                msg: "Redirect..."
            });
            // open the gate
            gate.openGate(userinfo.query.usr,moment().format('YYYY-MM-DD-hh-mm-ss-a'));
        }
    });
});

// Open gate
app.get('/openGate',function(req,res){
    var userinfo = url.parse(req.url,true);
    console.log("User Name : " + userinfo.query.loginID);

    // Check database
    min_jsondb.scanUser(userinfo.query.loginID,function(err,msg){
        if(err == 0){
            console.log("Error when scan user. msg :"+msg);
        }
        else{
            res.render('redirectpage',{
                title: "Open Gate!",
                msg: "Redirect..."
            });
            // open the gate
            gate.openGate(userinfo.query.loginID,moment().format('YYYY-MM-DD-hh-mm-ss-a'));
        }
    })
});

server.listen(process.env.npm_package_config_port, function() {
		var host = server.address().address;
		var port = server.address().port;

		// Log: Server listening
		console.log("[INFO] ACSW server is listening at " + host + ": " + port);
});
