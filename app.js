/**
 * Module dependencies.
 */
var http = require('http'),
    express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    flash = require('connect-flash');
var express = require('express');
var app = express();

app.configure(function(){
    app.use(express.static(__dirname + '/app'));
    app.use(express.cookieParser('big secret'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieSession());
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
});
var indexController = require('./routes/IndexController');
var wishesController = require('./routes/WishesController');
var registerController = require('./routes/RegisterController');

var http = require('http');
var path = require('path');
var app = express();
var db = require('./config/database');


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log("LocalStrategy working...");
        return done(null, { id: 1, username: 'Joe', password: 'schmo'});
    }
));
var security = require('./config/security');
var User = require('./model/UserModel');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

// passport initialize
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(require('less-middleware')(path.join(__dirname, 'public')));


app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user, done) {
    done(null, user);
});passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.get('/login', function(req, res) {
	res.render('login', {});
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/wishes',
	failureRedirect: '/loginError',
	failureFlash: true
}),
function(req,res){
	res.redirect('/');
});

app.get('/loginError', function(req,res) {
    console.log(req.flash('error'));
    res.redirect('/login');
    });


app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/login');
});

app.get('/', function(req, res) {
	res.redirect('/login')
})

app.get('/register', registerController.index);
app.post('/register', registerController.registerUser);

app.all('/api/*', security.ensureAuthenticated);
app.all('/wishes', security.ensureAuthenticated);

app.get('/wishes', indexController.index);
app.get('/api/wishes', wishesController.allWishes);
app.get('/api/haves', wishesController.allHaves);
app.post('/api/wishes', wishesController.createWish);
app.post('/api/haves', wishesController.createHave);

app.delete('/api/wishes/:wish_id', wishesController.deleteWish);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});