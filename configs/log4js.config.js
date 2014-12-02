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
        props.logLevel = log4js.levels.WARN;//TODO: Make this configurable
        break;
    case 'staging':
        props.logLevel = log4js.levels.DEBUG;
        break;
    case 'development':
        props.logLevel = log4js.levels.DEBUG;
        break;
    case 'testing':
        props.logLevel = log4js.levels.DEBUG;
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
            return log;
        };
    }
};