var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var dbCOnnectionObj;

// Connect to the db
var port = process.env.PORT || 8000
MongoClient.connect("mongodb://admin:password@ds145359.mlab.com:45359/globe_trot", function(err, db) {
  if(!err) {
    console.log("Database connection made!");
    dbCOnnectionObj = db;
  }
  else {
      console.log('Error in connecting to database');
  }
});

//adding static files
app.use('/static', express.static('static'));

//setting view engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', function (req, res) {
    var collection = dbCOnnectionObj.collection('users');
    collection.findOne({Email: req.body.email}, function(err, item) {
        if (item) {
            res.cookie('user', req.body.email);
            res.redirect('/dashboard');
        }
        else {
            console.log('Bad req');
        }
    });
});

app.post('/addtrip', function (req, res) {
    var collection = dbCOnnectionObj.collection('TravelDetails');
    collection.insertOne({
        user:'r@gmail.com',
        StartPoint:req.body.origincity,
        EndPoint:req.body.destinationcity,
        StartDate:req.body.startdate},
        function(err, item) {
        if (item) {
            res.redirect('/mytrips');
        }
        else {
            console.log('Bad req');
        }
   });
});

app.get('/dashboard', function (req, res) {
    res.sendFile(__dirname + '/dashboard.html');
});

app.get('/trips', function (req, res) {
    //res.sendFile(__dirname + '/trips.html');
    var dataTrips = [];
    var collection = dbCOnnectionObj.collection('trips');
    collection.find({origin : Rupali},function(err, trips) {
        trips.each(function(err, item){
            if(item)
                dataTrips.push(item);
        });
    });
    setTimeout(function(){
        res.render('trips', {tripsData: dataTrips});
        res.end();
    },500);

});

app.get('/addtrip', function (req, res) {
     res.sendFile(__dirname + '/addtrip.html');
});


app.get('/fire', function (req, res) {
     res.render('firebaseauth');
});

app.get('/mytrips', function (req, res) {
    var userTrips = [];
    var collection = dbCOnnectionObj.collection('TravelDetails');
    collection.find({user: 'r@gmail.com'}, function(err, trips) {
        trips.each(function(err, item){
         if(item)
            userTrips.push(item);
            console.log("userTrips",userTrips);
        });
    });
    setTimeout(function(){
        res.render('mytrips', {trips: userTrips});
        res.end(); 
    },1000);
});

app.listen(port, function() {
    console.log("App is running on port " + port);
});

