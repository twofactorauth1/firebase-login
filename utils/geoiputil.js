/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var request = require('request');
var log =  $$.g.getLogger("geoiputil");
var providerURL = 'http://ipinfo.io';
var maxmind = require('maxmind');
var initialized = false;

var geoiputil = {

    mmdb: null,

    _initialize: function() {
        var self = this;
        if(!initialized) {
            self.mmdb = maxmind.open('./utils/GeoLite2-City.mmdb');
            initialized = true;
        }
    },


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
            try {
                var json = JSON.parse(body);
                return fn(null, json);
            } catch(exception) {
                log.warn('Exception parsing geoIP return:', exception);
                return fn(null, null);
            }


        });
    },

    getMaxMindGeoForIP: function(ip, fn) {
        var self = this;
        self._initialize();
        var result = self.mmdb.get(ip);
        result = self._sanitizeMMResult(ip, result);
        //log.debug('maxmind thinks ip[' + ip + '] is:', result);
        fn(null, result);
    },

    _sanitizeMMResult: function(ip, result) {
        var obj = {
            ip: ip
        };
        if(result) {
            if(result.city && result.city.names) {
                obj.city = result.city.names.en;
            }
            if(result.continent && result.continent.names) {
                obj.continent_code = result.continent.code;
                obj.continent = result.continent.names.en;
            }
            if(result.country && result.country.names) {
                obj.country = result.country.iso_code;
                obj.countryName = result.country.names.en;
            }
            if(result.location) {
                obj.timezone = result.location.time_zone;
                obj.loc = result.location.latitude + ',' + result.location.longitude;
            }
            if(result.postal) {
                obj.postal = result.postal.code;
            }
            if(result.subdivisions && result.subdivisions[0] && result.subdivisions[0].names) {
                obj.state = result.subdivisions[0].iso_code;
                obj.region = result.subdivisions[0].names.en;
            }
        }

        return obj;
    }
};


$$.u = $$.u || {};
$$.u.geoiputil = geoiputil;

module.exports = geoiputil;