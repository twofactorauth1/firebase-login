
/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var models = require('./models');
var routes = require('./routes');
var authRoutes = require('./routes/auth');
var crmRoutes = require('./routes/crm');
var clientRoutes = require('./routes/client');
var customerRoutes = require('./routes/customer');
var subdomainAuthorize = require('./middlewares/subdomainAuthorize');
var passportHelper = require('./helpers/passport');
var constants = require('./constants');

var app = express();

//passport setup
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    passportHelper.deserializeUser(id, done);
});
passport.use(new LocalStrategy({usernameField: 'email',
                               passwordField: 'password'},
                               function (email, password, done) {
                                return passportHelper.localStrategyCallback(email, password, done);
                              }
));
passport.use(new FacebookStrategy({clientID: constants.FACEBOOK_CLIENT_ID,
                                  clientSecret: constants.FACEBOOK_CLIENT_SECRET,
                                  callbackURL: 'http://localhost:3000/login/facebook/callback'},
                                  function (accessToken, refreshToken, profile, done) {
                                    passportHelper.createFacebookUser(accessToken, refreshToken, profile, done);
                                  }
));
console.info('Enabling passport settings.');

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
console.info('Passport middleware enabled.');
//app.use(subdomainAuthorize()); //TODO: enable it before final deployment.
console.info('Subdomain authorization middleware enabled.');
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  mongoose.connect('mongodb://localhost/bioindigenous');
}
// production only
else {
  mongoose.connect('mongodb://indigenous:$Oxf25Ufo$@novus.modulusmongo.net:27017/H2inesux');
}

// views and routes
app.get('/', routes.index);
app.post('/login/', authRoutes.login);
app.get('/logout/', authRoutes.logout);
app.get('/login/facebook/', passport.authenticate('facebook', {scope: ['email']}));
app.get('/login/facebook/callback/', passport.authenticate('facebook', {successRedirect: '/',
                                                                      failureRedirect: '/login/facebook'}));
app.get('/crm', crmRoutes.index);
app.post('/client/add/', clientRoutes.add);
app.post('/customer/add/', customerRoutes.add);

http.createServer(app).listen(app.get('port'), function(){
  console.info('Express server listening on port ' + app.get('port'));
});
