// Modules
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const request = require('request');
const cheerio = require('cheerio');
const express = require('express');

// Require all models
const db = require('./models');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Connect To Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Serve the public folder as static directory
app.use(express.static('public'));

// Global Variables
const url = 'https://www.nytimes.com/';
 
// Routes
app.get('/', function (req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        res.render('home', {dbArticle: dbArticle});
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.get('/scrape', function (req, res) {
    db.Article.remove({}, function(err) {
        if (err) console.log(err);
    })
    request(url, function(err, response, html) {
        const $ = cheerio.load(html);
        const results = [];
        $('.story-heading').each(function(i, elem) {
            let result = {};
            result.title = $(elem).children('a').text().trim();
            result.link = $(elem).children('a').attr('href');
            db.Article.create(result)
            .then(function(dbArticle) {
                // console.log(dbArticle);
            })
            .catch(function(err) {
                return res.json(err);
            });
        });
        // db.Article.ensureIndexes({unique: true, dropDups: true}, function(err) {
        //     if (err) {
        //         console.log(err)
        //     } else {
        //         console.log('success');
        //     }
        // });
        return res.send("Scrape Complete");
    });
});

app.get('/articles', function (req, res) {
    db.Article.find({})
        .then(function(dbArticle) {
            res.render('home', {dbArticle: dbArticle});
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.get('/articles/:id', function(req, res) {
    db.Article.find({_id: req.params.id})
        .populate("note")
        .then(function(dbArticle) {
            res.render('article', {dbArticle: dbArticle});
            // res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.post('/notes/:id', function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: { notes: dbNote._id }}, { new: true });
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});



app.delete('/delete/articles/:id', function(req, res) {
    db.Article.remove({_id: req.params.id})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        })
});

app.delete('/delete/notes/:id', function(req, res) {
    db.Note.remove({_id: req.params.id})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        })
});


// API Routes
app.get('/api/articles', function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.get('/api/articles/:id', function(req, res) {
    db.Article.findOne({_id: req.params.id})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.get('/api/notes/:id', function(req, res) {
    db.Note.findOne({_id: req.params.id})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.listen(PORT, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});