console.log('Runner');
_ = require('underscore');
require('./configs/log4js.config').configure();
var log = $$.g.getLogger("runner");
log.info("Log4js setup successfully");

require('./utils/namespaces');
var collater = require('./analytics/analytics_collater');

collater.findCheckGroupAndSend(function(){console.log('done.');  process.exit();});