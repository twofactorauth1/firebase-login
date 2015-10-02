/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model');

var certificate = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,


            "created": {
                "date": new Date(),
                "by": null
            },
            "modified": {
                "date": null,
                "by": null
            },
            "_v": "0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "certificates",
        idStrategy: "uuid"
    }
});

$$.m.Certificate = certificate;

module.exports = certificate;
