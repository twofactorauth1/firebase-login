/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

require('./../../../models/base.model.js');

var devicetype = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            description: null,
            model: null,
            manufacturer: null,
            readingTypes: [],
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "devicetypes"
    }
});

$$.m.DeviceType = devicetype;

module.exports = devicetype;
