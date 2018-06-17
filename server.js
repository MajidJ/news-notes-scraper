const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
// import mongoose from 'mongoose';
const app = express();
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>');
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
const PORT = process.env.PORT || 3000;

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname)));
 
app.get('/', function (req, res) {
    res.render('home');
});
 
app.listen(PORT, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });