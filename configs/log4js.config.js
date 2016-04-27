/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../utils/namespaces');

var log4js = require('log4js');


//---------------------------------------------------------
// CUSTOMIZE THESE
//---------------------------------------------------------

var props = {
    logDir:"Logs",
    logLevel:log4js.levels.ERROR,
    logName:"bio.indigenous.log"
};

switch(process.env.NODE_ENV) {
    case 'production':
        props.logLevel = process.env.LOG_LEVEL || log4js.levels.WARN;
        break;
    case 'staging':
        props.logLevel = process.env.LOG_LEVEL || log4js.levels.DEBUG;
        break;
    case 'development':
        props.logLevel = process.env.LOG_LEVEL || log4js.levels.DEBUG;
        break;
    case 'testing':
        props.logLevel = process.env.LOG_LEVEL || log4js.levels.DEBUG;
        break;
}


//---------------------------------------------------------
// SET UP LOG4JS
//---------------------------------------------------------

var logConfigs = {
    "appenders": [
        {
            "type":"dateFile",
            "filename":props.logName,
            "pattern":"-yyyy-MM-dd"
        },

        {
            "type":"console"
        }
    ],

    "replaceConsole": true
};



module.exports = {
    vars: props,
    configs: logConfigs,
    configure: function() {

        log4js.configure(logConfigs, { cwd:props.logDir });

        //---------------------------------------------------------
        // GLOBAL HELPER METHOD TO GET LOGGER
        //---------------------------------------------------------

        $$.global.getLogger = function(name){
            var cluster = require('cluster');
            if (cluster && cluster.worker && cluster.worker.id) {
                name = name + "(worker: " + cluster.worker.id + ")";
            }
            var log = log4js.getLogger(name);
            if(!log.oldDebug) {
                log.oldDebug = log.debug;
                var debug = function(accountId, userId, msg, obj) {
                    if(arguments.length === 1) {
                        this.oldDebug(accountId);
                    } else if(arguments.length === 2){
                        this.oldDebug(accountId, userId);
                    } else {
                        var prefix = '';
                        if(userId) {
                            prefix = '[user_' + userId  + '] ' + prefix;
                        }
                        if(accountId) {
                            prefix = '[account_' + accountId + '] ' + prefix;
                        }
                        if(prefix.length > 0) {
                            msg = '\x1B[1m\x1B[31m' + prefix + '\x1B[39m\x1B[22m - ' + msg;
                        }
                        if(obj) {
                            this.oldDebug(msg, obj);
                        } else {
                            this.oldDebug(msg);
                        }

                    }
                };
                _.bind(debug, log);
                log.debug = debug;
            }
            if(!log.oldInfo) {
                log.oldInfo = log.info;
                var info = function(accountId, userId, msg, obj) {
                    if(arguments.length === 1) {
                        this.oldInfo(accountId);
                    } else if(arguments.length === 2){
                        this.oldInfo(accountId, userId);
                    } else {
                        var prefix = '';
                        if(userId) {
                            prefix = '[user_' + userId  + '] ' + prefix;
                        }
                        if(accountId) {
                            prefix = '[account_' + accountId + '] ' + prefix;
                        }
                        if(prefix.length > 0) {
                            msg = '\x1B[1m\x1B[31m' + prefix + '\x1B[39m\x1B[22m - ' + msg;
                        }
                        if(obj) {
                            this.oldInfo(msg, obj);
                        } else {
                            this.oldInfo(msg);
                        }

                    }
                };
                _.bind(info, log);
                log.info = info;
            }
            if(!log.oldWarn) {
                log.oldWarn = log.warn;
                var warn = function(accountId, userId, msg, obj) {
                    if(arguments.length === 1) {
                        this.oldWarn(accountId);
                    } else if(arguments.length === 2){
                        this.oldWarn(accountId, userId);
                    } else {
                        var prefix = '';
                        if(userId) {
                            prefix = '[user_' + userId  + '] ' + prefix;
                        }
                        if(accountId) {
                            prefix = '[account_' + accountId + '] ' + prefix;
                        }
                        if(prefix.length > 0) {
                            msg = '\x1B[1m\x1B[31m' + prefix + '\x1B[39m\x1B[22m - ' + msg;
                        }
                        if(obj) {
                            this.oldWarn(msg, obj);
                        } else {
                            this.oldWarn(msg);
                        }

                    }
                };
                _.bind(warn, log);
                log.warn = warn;
            }
            if(!log.oldError) {
                log.oldError = log.error;
                var error = function(accountId, userId, msg, obj) {
                    if(arguments.length === 1) {
                        this.oldError(accountId);
                    } else if(arguments.length === 2){
                        this.oldError(accountId, userId);
                    } else {
                        var prefix = '';
                        if(userId) {
                            prefix = '[user_' + userId  + '] ' + prefix;
                        }
                        if(accountId) {
                            prefix = '[account_' + accountId + '] ' + prefix;
                        }
                        if(prefix.length > 0) {
                            msg = '\x1B[1m\x1B[31m' + prefix + '\x1B[39m\x1B[22m - ' + msg;
                        }
                        if(obj) {
                            this.oldError(msg, obj);
                        } else {
                            this.oldError(msg);
                        }

                    }
                };
                _.bind(error, log);
                log.error = error;
            }
            log.setLevel(props.logLevel);

            return log;
        };
    }
};