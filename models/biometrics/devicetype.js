/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./../base.model.js');

var devicetype = $$.m.ModelBase.extend({

    defaults: {

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
