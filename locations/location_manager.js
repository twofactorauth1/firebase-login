/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var dao = require('./dao/location.dao.js');
var log = $$.g.getLogger("location_manager");

module.exports = {

    log:log,

    findLocations: function(accountId, userId, lat, lon, distance, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> findLocations');
        var query = {accountId:accountId};
        dao.findNear(query, 'loc', lat, lon, null, distance, $$.m.Location, function(err, locations){
            if(err) {
                self.log.error('Error finding locations:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< findLocations');
                return fn(null, locations);
            }
        });
    }


};
