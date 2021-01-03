var express = require("express");
var upload = require("express-fileupload");
var cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
app.use(bodyParser.urlencoded({ extended: false}));
app.use (upload());
app.use(cors());
app.use(cookieParser());
app.post ("/sendMessage", (req, res)=>{
    console.log ("message received:");
	//console.log ("cookies: "+req.cookies);
	//const questions = JSON.parse(req.body.questions);
	const obj = {
		lastName: req.body.lastName,
		firstName: req.body.firstName,
		email: req.body.email,
		message: req.body.message,
		questions: JSON.parse(req.body.questions)
	};
    console.log ("message received: "+obj.email);

    var MongoClient = require('mongodb').MongoClient;
    const url = "mongodb://localhost:27017/";

    MongoClient.connect(url, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("training");
        dbo.collection("contacts").insertOne(obj);
    });
	res.cookie('contact', obj).send("Sent");

	res.end();
});
app.get ("/message",(req, res)=>{
	var MongoClient = require('mongodb').MongoClient;
    const url = "mongodb://localhost:27017/";

    MongoClient.connect(url, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("training");
		 dbo.collection("contacts").find({email: req.query.em}).toArray(function (err, result) {
            if (err)
                throw err;
			res.json (result[0]);
            db.close();
			res.end();
        });
    });
});
//res.end(cookies);
app.get("/login",  (req, res) =>{
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h3>Login:</h3><form action="login" method="post">');
    res.write('Username: <input type="text" name="username" placeholder="username"><br/><br/>');    
    res.write(' Password: &nbsp;<input type="password" name="password" placeholder="password"><br/>');
    res.write('<p><input type="submit" value="Login"></p>');
    res.write('</form>');
    res.end();
});
app.post ("/login", (req, res) =>{
	const user = {
		username: req.body.username,
		password: req.body.password
	};

	res.cookie('user', user.username).send("logged in");
	//res.json(user);
	res.end();
});
app.get("/private", (req, res) => {
  if (!req.cookies.token) return res.status(401).send();
  res.status(200).json({ secret: req.cookies.token });
});
app.get("/uploadForm",  (req, res) =>{
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" target="sub" enctype="multipart/form-data">');
    res.write('<input type="text" name="id" value="0"><br>');    
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form><iframe id="sub" name="sub"/>');
    res.end();
});
app.get('/set-cookie-test', function(req, res){
	res.writeHead(200, {
      "Set-Cookie": "token=encryptedstring; HttpOnly",
      "Access-Control-Allow-Credentials": "true"
    })
    .send();
});
app.get('/cookie-test', function(req, res){
    // check the request for existing cookies named "example"
    let existingCookie = req.cookies["request-example"];

    if (existingCookie) {
        // to send a cookie in the response
		console.log('already-had-cookie');
        res.cookie('cookie-test', 'true').send();
    } else {
		console.log('already-has-no-cookie');
        res.cookie('cookie-test', 'false').send();
    }
	/*
	browser.setCookie({
    httpOnly: false,
    name: "cookie-test22",
    path: "/",
    secure: false,
    sessionId: browser.sessionId,
    value: "test",
    state: "success" // or "failure"
});
*/
});
app.listen(4000);

const sendUserIdCookie = (contact, res) => {
 // Our token expires after one day
 const oneDayToSeconds = 24 * 60 * 60;
 res.cookie('contact', contact,  
 { maxAge: oneDayToSeconds,
 // You can't access these tokens in the client's javascript
   httpOnly: true,
   // Forces to use https in production
   secure: true
  }).send('cookie set');
};