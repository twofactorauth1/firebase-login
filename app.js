/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014-2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

if (process.env.ENABLE_MONITORING == "true") {
	require('./configs/newrelicjs.config');
}

/*
 //Do not delete this
 //requires: "nodetime": "~0.8.15" to run
 require('nodetime').profile({
 accountKey: 'bdd766862005ebc9c88fc409cef27c60921f2774',
 appName: 'Node.js Application'
 });
 */

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
    , mongoskin = require('mongoskin')
    , mongodb = mongoskin.db(mongoConfig.MONGODB_CONNECT, {safe: true})
    , mongoStore = new MongoStore(mongodb)
    , consolidate = require('consolidate')
    , busboy = require('connect-busboy')
    , urlUtils =null;


//---------------------------------------------------------
//Load globally accessible libraries
//---------------------------------------------------------
_ = require('underscore');
moment = require('moment');
require('./utils/commonutils');
require('./utils/errors');
require('./utils/jsvalidate');

//Load JQuery Deferred, ensure $ is available
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

mongoStore.on('connect', function () {
    log.info("Session store is ready for use");
});

mongoStore.on('error', function (err) {
    log.error("An error occurred connecting to MongoDB Session Storage", err);
});


//---------------------------------------------------------
//  SET UP EMAILER
//---------------------------------------------------------
require('./configs/nodemailer.config').configure();


//------------------------------------------------------
// SET UP AWS
//------------------------------------------------------

var aws = require('aws-sdk');
var awsConfigs = require('./configs/aws.config');
aws.config.update(awsConfigs);

// RequestTimeTooSkewed error with S3 upload
// aws.config.update({
//     correctClockSkew: true
// });

//---------------------------------------------------------
//  INIT APPLICATION
//---------------------------------------------------------
app = express();
global.app = app;

// View engine
app.set('view options', { layout: false });

var hbs = consolidate.handlebars;
app.engine('html', hbs);
app.engine('hbs', hbs);
app.engine('handlebars', hbs);
app.engine('dot', consolidate.dot);
app.engine('jade', consolidate.jade);

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'templates'));

app.use(connect.compress());
app.use(express.compress());
app.use(express.favicon());
app.use(busboy());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
//-----------------------------------------------------
//  SETUP Robots.txt
//-----------------------------------------------------
app.use(function (req, res, next) {
    if ('/robots.txt' == req.url) {
        if(!urlUtils) {
            urlUtils = require('./utils/urlutils');
        }

        var host = req.host;
        if(req.headers['x-host']) {
            host = req.headers['x-host'];
        }
        var parsedUrl = urlUtils.getSubdomainFromHost(host);
        if(parsedUrl.subdomain && !parsedUrl.isMainApp && !parsedUrl.isOrgRoot && parsedUrl.subdomain !== 'ruckus') {
            //console.log('short-circuit');
            res.type('text/plain');
            res.send("User-agent: *\nDisallow: /");
        } else {
            //console.log('next');
            next();
        }

    } else {
        next();
    }
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser('mys3cr3tco00k13s'));
/*
var sess = {
    store: mongoStore,
    secret: 'mys3cr3t',
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        domain: appConfig.cookie_subdomain
    }, //stay open for 1 day of inactivity across all subdomains
    key: appConfig.cookie_name};
*/
/*
if (appConfig.cookie_subdomain === '.indigenous.io' || appConfig.cookie_subdomain === '.test.indigenous.io') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
*/
//app.use(express.session(sess));
//-----------------------------------------------------
// MULTIPLE DOMAIN SESSION COOKIES
//-----------------------------------------------------
var mwCache = Object.create(null);

function virtualHostSession(req, res, next) {
    var host = req.get('host'); //maybe normalize with toLowerCase etc
    var hostSession = null;// can't cache this for now... bummer.
    if (!hostSession) {
        //console.log('No hostSession for ' + host);
        if(host && host.replace(':3000', '').endsWith('gorvlvr.com')) {
            //console.log('using .gorvlvr.com');
            var sess = {
                store: mongoStore,
                secret: 'mys3cr3t',
                cookie: {
                    maxAge: 24 * 60 * 60 * 1000,
                    domain: '.gorvlvr.com'
                }, //stay open for 1 day of inactivity across all subdomains
                key: 'gorvlvr_connect.sid'
            };
            hostSession = mwCache[host] = express.session(sess);
        } else if(host && host.replace(':3000', '').endsWith('videoautoresponder.com')){
            var sess = {
                store: mongoStore,
                secret: 'mys3cr3t',
                cookie: {
                    maxAge: 24 * 60 * 60 * 1000,
                    domain: '.videoautoresponder.com'
                }, //stay open for 1 day of inactivity across all subdomains
                key: 'videoautoresponder_connect.sid'
            };
            hostSession = mwCache[host] = express.session(sess);
        } else if(host && host.replace(':3000', '').endsWith('securematics.com')){
            var sess = {
                store: mongoStore,
                secret: 'mys3cr3t',
                cookie: {
                    maxAge: 24 * 60 * 60 * 1000,
                    domain: '.securematics.com'
                }, //stay open for 1 day of inactivity across all subdomains
                key: 'securematics_connect.sid'
            };
            hostSession = mwCache[host] = express.session(sess);
        } else if(host && host.replace(':3000', '').endsWith('techevent.us')){
            var sess = {
                store: mongoStore,
                secret: 'mys3cr3t',
                cookie: {
                    maxAge: 24 * 60 * 60 * 1000,
                    domain: '.techevent.us'
                }, //stay open for 1 day of inactivity across all subdomains
                key: 'techevent_connect.sid'
            };
            hostSession = mwCache[host] = express.session(sess);
        } else if(host && host.replace(':3000', '').endsWith('leadsource.cc')){
            var sess = {
                store: mongoStore,
                secret: 'mys3cr3t',
                cookie: {
                    maxAge: 24 * 60 * 60 * 1000,
                    domain: '.leadsource.cc'
                }, //stay open for 1 day of inactivity across all subdomains
                key: 'leadsource_connect.sid'
            };
            hostSession = mwCache[host] = express.session(sess);
        } else if(host && host.replace(':3000', '').endsWith('amrvlvr.com')){
            var sess = {
                store: mongoStore,
                secret: 'mys3cr3t',
                cookie: {
                    maxAge: 24 * 60 * 60 * 1000,
                    domain: '.amrvlvr.com'
                }, //stay open for 1 day of inactivity across all subdomains
                key: 'amrvlvr_connect.sid'
            };
            hostSession = mwCache[host] = express.session(sess);
        } else if(host && host.replace(':3000', '').endsWith('newplatform.net')){
            var sess = {
                store: mongoStore,
                secret: 'mys3cr3t',
                cookie: {
                    maxAge: 24 * 60 * 60 * 1000,
                    domain: '.newplatform.net'
                }, //stay open for 1 day of inactivity across all subdomains
                key: 'newplatform_connect.sid'
            };
            hostSession = mwCache[host] = express.session(sess);
        } else {
            //console.log('creating session for ' + appConfig.cookie_subdomain);
            var sess1 = {
                store: mongoStore,
                secret: 'mys3cr3t',
                cookie: {
                    maxAge: 24 * 60 * 60 * 1000,
                    domain: appConfig.cookie_subdomain
                }, //stay open for 1 day of inactivity across all subdomains
                key: appConfig.cookie_name
            };
            hostSession = mwCache[host] = express.session(sess1);
        }
    } else {
        //console.log('Using this session:', hostSession);
    }
    hostSession(req, res, next);
    //don't need to call next since hostSession will do it for you
}

app.use(virtualHostSession);
//Middle ware to refresh the session cookie expiration on every hit
app.use(function (req, res, next) {
    req.session._garbage = Date();
    req.session.touch();
    next();
});


//app.use(express.session({ secret:'mys3cr3ts3sEss10n' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);

// Handle 404
app.use(function (req, res) {
    res.status(400);
    res.render('404.html', {title: '404: File Not Found'});
});
var exceptionlogger = require('./utils/exceptionlogger');
// Handle 500
app.use(function (error, req, res, next) {
    console.dir(error);
    exceptionlogger.logIt(error, function(){
        res.status(500);
        res.render('500.html', {title: '500: Internal Server Error', error: error});
    });

});

/*
app.use(function(req, res) {
    res.sendfile('./public/index.html');
});
*/
//app.use(connect.compress());

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.configure('staging', function () {
    //TODO - Set up proper error handling for production environments
    app.use(express.errorHandler());
});

app.configure('production', function () {
    //TODO - Set up proper error handling for production environments
    app.use(express.errorHandler());
});

//-----------------------------------------------------
// SETUP CROSS-DOMAIN SCRIPTING WHITELIST
//-----------------------------------------------------

var allowCrossDomain = function (req, res, next) {
    var allowedHost = appConfig.xdhost_whitelist;
    if (allowedHost.indexOf(req.headers.origin) !== -1 || allowedHost.indexOf(req.headers.host) !== -1) {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-USER-ID, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
        next();
    } else {
        res.send({auth: false});
    }
};
log.info('Allowing xd scripting calls from: ' + appConfig.xdhost_whitelist.join());
app.use(allowCrossDomain);

//prerender?
//app.use(require('prerender-node').set('prerenderServiceUrl', 'http://localhost:3002/'));
app.use(require('prerender-node').set('prerenderToken', 'zGq6CesNtm0s9kUTJXhG'));

//-----------------------------------------------------
//  START LISTENING
//-----------------------------------------------------
servers = [];  //global
var setUpListener = function (app) {
    var server = app.listen(appConfig.port, function () {
        log.info("Express server listening on port " + appConfig.port);
        if (cluster != null) {
            if (cluster.worker != null) {
                log.info("Cluster Worker " + cluster.worker.id + " running");
            }
        }
    });
    server.timeout = 1000*60*30;
    servers.push(server);
};


//-----------------------------------------------------
//  CLUSTERING
//-----------------------------------------------------
if (appConfig.cluster == true && process.env.NODE_ENV != "testing") {
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

        cluster.on('listening', function (worker, address) {
            log.info("A worker is now connected to " + address.address + ":" + address.port);
        });

        cluster.on('disconnect', function (worker) {
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
//  SETUP API
//-----------------------------------------------------
require('./api/api.manager');

//-----------------------------------------------------
//  SETUP ROUTING
//-----------------------------------------------------
require('./routers/router.manager');
require('./routers/page.server.router');

//-----------------------------------------------------
//  SETUP Persistent Scheduling
//-----------------------------------------------------
if (process.env.NODE_ENV != "testing" && appConfig.runJobs === true) {
    if(!cluster || cluster.isMaster) {
        var drone = require('schedule-drone');
        var scheduledjobs_manager = require('./scheduledjobs/scheduledjobs_manager');
        drone.setConfig(
            {
                persistence:{
                    type:'mongodb',
                    connectionString:mongoConfig.MONGODB_SINGLE_HOST,
                    eventsCollection: 'scheduled_events',
                    options:{}
                }
            }
        );
        var scheduler = drone.daemon();
        $$.u = $$.u || {};
        $$.u.scheduler = scheduler;
        log.debug('Started scheduler');
        scheduledjobs_manager.setScheduler(scheduler);
        //scheduler.scheduleAndStore( '*/5 * * * * *', 'scheduledJob', {id:'jobId'}, function(){log.debug('callback')});
        /*
         scheduler.on('scheduledJob', function(params){
         log.debug('got these params:', params);
         scheduledjobs_manager.handleJob(params.id, function(){});
         });
         */
        scheduledjobs_manager.startup(function(){log.debug('scheduledjobs_manager initialized')});
    }

} else {
    log.debug('Skipping scheduler');
}

//-----------------------------------------------------
//  SETUP RENDER HELPERS
//-----------------------------------------------------
Handlebars = require('handlebars');
requirejs('libs_misc/handlebars/handlebarshelpers');
requirejs('libs_misc/handlebars/indigenoushelpers');

//-----------------------------------------------------
//  SETUP ANALYTICS PROCESSING JOB
//-----------------------------------------------------
if (process.env.NODE_ENV != "testing") {//disables the collator for unit tests
    if(!cluster || cluster.isMaster) {
        var analyticsTimerConfig = require('./configs/analyticstimer.config');
        log.info('Starting analytics job to run every ' + analyticsTimerConfig.ANALYTICS_JOB_MS + 'ms');
        analyticsTimerConfig.startJob();
    } else {
        log.debug('Worker skipping analytics jobs');
    }

}
//-----------------------------------------------------
//  CATCH UNCAUGHT EXCEPTIONS - Log them and email the error
//-----------------------------------------------------

process.on('uncaughtException', function (err) {
    log.error("Stack trace: " + err.stack);
    log.error('Caught exception: ', err);
    exceptionlogger.logIt(err, function(){
        //$$.g.mailer.sendMail("errors@indigenous.io", "{ENTER YOUR EMAIL ADDRESS HERE}", null, "Uncaught Error occurred - " + process.env.NODE_ENV, null, err + ":  " + err.stack, function(err, value) {
        process.exit(1);
        //});
    });

});
