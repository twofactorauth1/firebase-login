/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var campaign = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId: 0,
            title: "",
            status: "active",
            visibility: 1,
            startDate: null,
            steps: [],

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
        table: "campaigns",
        idStrategy: "uuid"
    }
});

$$.m.Campaign = campaign;

module.exports = campaign;
