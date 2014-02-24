
//---------------------------------------------------------
//  SETUP REQUIREJS FOR SHARED RESOURCES
//---------------------------------------------------------
require('./configs/requirejs.config');


//---------------------------------------------------------
//  SETUP NAMESPACES
//---------------------------------------------------------
require('./utils/namespaces');


/**
 * Module dependencies.
 */

var express = require('express')
    , connect = require('connect')
    , http = require('http')
    , path = require('path')
    , passport = require('passport')
    , flash = require('connect-flash')
    , appConfig = require('./configs/app.config')
    , mongoConfig = require('./configs/mongodb.config')
    , MongoStore = require('connect-mongo-store')(express)
    , mongoStore = new MongoStore(mongoConfig.MONGODB_CONNECT);


//---------------------------------------------------------
//Load globally accessible libraries
//---------------------------------------------------------
_ = require('underscore');
requirejs('utils/commonutils');
require('./utils/jsvalidate');
var deferred = require("jquery-deferred");
if (typeof $ == 'undefined') {
    $ = {};
}
_.extend($, deferred);


//---------------------------------------------------------
//  SETUP LOGGING
//---------------------------------------------------------
require('./configs/log4js.config').configure();
var log = $$.g.getLogger("app");
log.info("Log4js setup successfully");



//-----------------------------------------------------
//  CONFIGURE PASSPORT & STRATEGIES
//-----------------------------------------------------
require('./authentication/passport.setup');


//---------------------------------------------------------
//  SETUP APP CACHE
//---------------------------------------------------------
$$.g.cache = require('./configs/cache.config').configure();
log.info("Global App Cache setup");


//---------------------------------------------------------
//  LIST FOR CONNECTIONS TO MONGODB SESSION STORE
//---------------------------------------------------------

mongoStore.on('connect', function() {
    log.info("Session store is ready for use");
});

mongoStore.on('error', function() {
    log.error("An error occurred connecting to MongoDB Session Storage");
});


//---------------------------------------------------------
//  SET UP EMAILER
//---------------------------------------------------------
require('./configs/nodemailer.config').configure();


//---------------------------------------------------------
//  INIT APPLICATION
//---------------------------------------------------------
app = express();
global.app = app;

// all environments
app.set('views', path.join(__dirname, appConfig.view_dir));
app.set('view options', { layout:false });
app.set('view engine', appConfig.view_engine);
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('mys3cr3tco00k13s'));
app.use(express.session({
    store: mongoStore,
    secret: 'mys3cr3t',
    cookie: {maxAge:24*60*60*1000} //stay open for 1 day of inactivity
}));

//Middle ware to refresh the session cookie expiration on every hit
app.use(function(req, res, next) {
    req.session._garbage = Date();
    req.session.touch();
    next();
});

//app.use(express.session({ secret:'mys3cr3ts3sEss10n' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//app.use(subdomainAuthorize()); //TODO: enable it before final deployment.
app.use(app.router);
app.use(connect.compress());
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.configure('staging', function() {
    //TODO - Set up proper error handling for production environments
    app.use(express.errorHandler());
});

app.configure('production', function() {
    //TODO - Set up proper error handling for production environments
    app.use(express.errorHandler());
});


//-----------------------------------------------------
//  START LISTENING
//-----------------------------------------------------
var setUpListener = function(app) {
    app.listen(appConfig.port, function(){
        log.info("Express server listening on port " + appConfig.port);
        if (cluster != null) {
            if (cluster.worker != null) {
                log.info("Cluster Worker " + cluster.worker.id + " running");
            }
        }
    });
};


//-----------------------------------------------------
//  CLUSTERING
//-----------------------------------------------------
if (appConfig.cluster == true) {
    var cluster = require('cluster');
    if (cluster.isMaster) {
        var cpuCount = require('os').cpus().length;

        var freeCpus = appConfig.freeCpus;
        cpuCount = cpuCount - freeCpus;

        if (cpuCount <= 0) {
            cpuCount = 1;
        }

        for (var i = 0; i < cpuCount; i += 1) {
            log.info("Creating worker...");
            cluster.fork();
        }

        cluster.on('listening', function(worker, address) {
            log.info("A worker is now connected to " + address.address + ":" + address.port);
        });

        cluster.on('disconnect', function(worker) {
            log.info('The worker #' + worker.id + ' has disconnected');
        });

        // Listen for dying workers
        cluster.on('exit', function (worker) {

            // Replace the dead worker,
            // we're not sentimental
            log.error('The Worker #' + worker.id + ' has died');
            log.error('... Restarting new worker');
            cluster.fork();
        });
    } else {
        setUpListener(app);
    }
} else {
    setUpListener(app);
}


//-----------------------------------------------------
//  SETUP ROUTING
//-----------------------------------------------------
require('./routers/router.manager');


//-----------------------------------------------------
//  SETUP API
//-----------------------------------------------------
require('./api/api.manager');
