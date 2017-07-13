/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var quotedao = require('./dao/quote.dao.js');
var log = $$.g.getLogger("quote_manager");
var async = require('async');
var s3dao = require('../dao/integrations/s3.dao.js');
var awsConfig = require('../configs/aws.config');
var appConfig = require('../configs/app.config');
var notificationConfig = require('../configs/notification.config');
var userDao = require('../dao/user.dao');
var emailMessageManager = require('../emailmessages/emailMessageManager');
var userManager = require('../dao/user.manager');
require('./model/quote');
var ziManager = require('../zedinterconnect/zi_manager');

var accountDao = require('../dao/account.dao');


module.exports = {
	
    
    
};
