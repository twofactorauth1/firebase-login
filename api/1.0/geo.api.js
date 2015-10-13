/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var GeoDao = require('../../dao/geo.dao');
var geoConfig = require('../../configs/geo.config');
var Lob = require('lob')(geoConfig.lob.key);

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "geo",

    dao: GeoDao,

    initialize: function() {
        //GET
        app.get(this.url('search/address/:address'), this.setup.bind(this), this.searchAddress.bind(this));
        app.get(this.url('address/verify'), this.setup.bind(this), this.verifyAddress.bind(this));
    },


    searchAddress: function(req,resp) {
        var self = this;
        GeoDao.searchAddressString(req.params.address, function(err, value) {
            if (err) {
                self.wrapError(resp, 500, "Error searching address", err, value);
            } else {
                resp.send(value);
            }
        });
    },

    verifyAddress: function(req, resp) {
        var self = this;
        self.log.debug('>> verifyAddress');
        var address1 = req.query.address1;
        var address2 = req.query.address2;
        var city = req.query.city;
        var state = req.query.state;
        var zip = req.query.zip;
        var country = req.query.country;

        Lob.verification.verify({
            address_line1: address1,
            address_line2: address2,
            address_city: city,
            address_state: state,
            address_zip: zip,
            address_country: country
        }, function (err, res) {
            console.log (err, res);
            resp.send(res);
        });
    }
});

module.exports = new api();

