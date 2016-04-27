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
            log.setLevel(props.logLevel);
            log._debug = function(accountId, userId, msg) {
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
                this.debug(msg);
            };

            log._error = function(accountId, userId, msg) {
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
                this.error(msg);
            };
            return log;
        };
    }
};