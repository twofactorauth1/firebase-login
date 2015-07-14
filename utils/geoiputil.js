/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var request = require('request');
var log =  $$.g.getLogger("geoiputil");
var providerURL = 'http://ipinfo.io';

var geoiputil = {


    getGeoForIP: function(ip, fn) {
        log.debug('>> getGeoForIP(' + ip + ')');
        var url = providerURL + '/' + ip + '/geo';
        request(url, function(err, resp, body) {
            if(err) {
                log.error('Error getting geo info: ', err);
                return fn(err, null);
            }
            /*
             {
             "ip": "8.8.8.8",
             "loc": "37.385999999999996,-122.0838",
             "city": "Mountain View",
             "region": "California",
             "country": "US",
             }
             */
            log.debug('<< getGeoForIP', body);
            var json = JSON.parse(body);
            return fn(null, json);
        });
    }

}


$$.u = $$.u || {};
$$.u.geoiputil = geoiputil;

module.exports = geoiputil;