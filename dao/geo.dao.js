/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./base.dao');
var request = require('request');
var geoConfig = require('../configs/geo.config');

var dao = {

    options: {
        name:"geo.dao",
        defaultModel:null
    },


    searchAddressString: function(addressString, fn) {
        var self = this;
        var url = geoConfig.openStreetMaps.constructSearchForAddress(addressString);

        request(url, function(err, resp, body) {
            if (!err) {
                var address = null;

                try {
                    var json = JSON.parse(body);
                    if (json != null && _.isArray(json) && json.length > 0 && json[0].address != null) {
                        var _address = json[0].address;
                        if (_address != null) {
                            address = {
                                address:_address.house_number + " " + _address.road,
                                address2:"",
                                city:_address.hamlet,
                                state:_address.state,
                                zip:_address.postcode,
                                country:_address.country,
                                countryCode:_address.country_code,
                                displayName: json[0].display_name,
                                lat:json[0].lat,
                                lon:json[0].lon
                            };
                        }
                    }
                } catch (exception) {
                    self.log.error('exception searching for address: ', exception);
                }



                if (address == null) {

                    var address = {
                        error:"No address found",
                        addressString: addressString
                    }
                }

                fn(null, address);
            } else {
                fn (err, resp);
            }
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.GeoDao = dao;

module.exports = dao;

