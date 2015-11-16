/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var manager = require('../sitemigration_manager');
require('../model/sitemigration');
var log = $$.g.getLogger("sitemigration_middleware");


module.exports = {
    checkForRedirect: function(req, resp, next) {
        //log.debug('checkForRedirect ' + req.host + ' ' + req.path);
        manager.getMigrationByDomain(req.host, function(err, migration){
            if(err || !migration) {
                return next();
            } else {
                var found = false;
                _.each(migration.get('redirects'), function(redirect){
                    if(redirect.path.toLowerCase() === req.path.toLowerCase()) {
                        log.debug('\n\nredirecting from ' + req.path + ' to ' + redirect.destination + '\n');
                        resp.writeHead (301, {'Location':redirect.destination});
                        resp.end();
                        found = true;
                        return manager.updateRedirectAccessCount(migration.get('domain'), redirect.path, function(){});
                    }
                });
                if(found !== true) {
                    return next();
                }

            }
        });

    }
}
