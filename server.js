const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser') 
const app = express();
const cheerio = require('cheerio')
const $ = cheerio.load('<h2 class="title">Hello world</h2>')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
 
app.get('/', function (req, res) {
    res.render('home');
});
 
app.listen(3000);