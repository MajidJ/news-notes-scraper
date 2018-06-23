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
    // db.Article.remove({}, function(err) {
    //     if (err) console.log(err);
    // })
    // .then(function(dbArticle) {
    //     console.log('removed articles');
    // })
    // .catch(function(err) {
    //     // res.json(err);
    //     console.log(err);
    // });

    // db.Note.remove({}, function(err) {
    //     if (err) console.log(err);
    // })
    // .then(function(dbNote) {
    //     console.log('removed notes');
    // })
    // .catch(function(err) {
    //     // res.json(err);
    //     console.log(err);
    // });

    request(url, function(err, response, html) {
        const $ = cheerio.load(html);
        const results = [];
        $('.story-heading').each(function(i, elem) {
            let result = {};
            result.title = $(elem).children('a').text().trim();
            result.link = $(elem).children('a').attr('href');
            result.summary = $(elem).parent().children('.summary').text();
            if (result.title && result.link && result.summary) {
                // console.log(result);
                db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    if (err.code === 11000) {
                        console.log('Scraped article is a duplicate in the db. Not added.')
                    } else {
                        console.log(err);
                    }
                });
            }
        });
        return res.send("Scrape Complete");
    });
});

app.get('/articles/:id', function(req, res) {
    db.Article.find({_id: req.params.id})
        .populate("notes")
        .then(function(dbArticle) {
            res.render('article', {dbArticle: dbArticle});
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.post('/notes/:articleId', function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.articleId }, {$push: { notes: dbNote._id }}, { new: true });
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});



app.delete('/delete/articles/:articleId', function(req, res) {
    db.Article.remove({_id: req.params.articleId})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        })
});

app.delete('/delete/notes/:articleId/:noteId', function(req, res) {
    db.Note.remove({_id: req.params.noteId})
        .then(function(dbNote) {
            return db.Article.update({_id: req.params.articleId}, {$pull : {notes: req.params.noteId}})
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
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

app.get('/api/articles/:articleId', function(req, res) {
    db.Article.findOne({_id: req.params.articleId})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.get('/api/notes/:noteId', function(req, res) {
    db.Note.findOne({_id: req.params.noteId})
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