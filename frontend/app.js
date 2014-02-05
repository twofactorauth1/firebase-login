
/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var path = require('path');
var passport = require('passport');
var routes = require('./routes');
var user = require('./routes/user');
var subdomainAuthorize = require('./middlewares/subdomainAuthorize');
var passportHelper = require('./helpers/passport');

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
app.use(subdomainAuthorize());
console.info('Subdomain authorization middleware enabled.');
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  mongoose.connect('mongodb://localhost/bioindigenous');
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.info('Express server listening on port ' + app.get('port'));
});
