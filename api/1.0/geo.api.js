/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var baseApi = require('../base.api');
var GeoDao = require('../../dao/geo.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "geo",

    dao: GeoDao,

    initialize: function() {
        //GET
        app.get(this.url('search/address/:address'), this.isAuthApi, this.searchAddress.bind(this));
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
    }
});

module.exports = new api();

