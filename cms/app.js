
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var passportHelper = require('./helpers/passport');
var auth = require('./routes/auth');
var app = express();

//passport auth setup
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    passportHelper.deserializeUser(id, done);
});

//passport local auth setup
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, function (email, password, done) {
    return passportHelper.localStrategyCallback(email, password, done);
}));

passport.use(new FacebookStrategy({clientID: '594182237332636', clientSecret: '3edc02755477b84040c4a26075da1e72', callbackURL: 'http://localhost:3000/login/facebook/callback'}, function (accessToken, refreshToken, profile, done) {
    passportHelper.createFacebookUser(accessToken, refreshToken, profile, done);
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
    mongoose.connect('mongodb://localhost/bioindigenousCMS');
}

app.get('/', routes.index);
app.get('/profile', user.profile);
app.post('/login', auth.login);
app.get('/logout', auth.logout);
app.get('/login/facebook', passport.authenticate('facebook', {scope: ['email']}));
app.get('/login/facebook/callback', passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login/facebook'}));

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

// require('./models.user').User.create();
