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
            /*
             * Example Step:
             * {
             *      templateId" : "000000-0000-000000-00000000",
                    "offset" : "320000", //in seconds
                    "from" : "john@indigenous.io",
                    "fromName" : 'John Doe',
                    "subject" : 'Email Subject',
                    "content": '<html><body>Stuff</body></html>',
                    "vars": [{

                    }],
                    "scheduled" : {
                        "minute":1,
                        "hour": 2,
                        "day":1
                    },
                    "sendAt" : {
                        "year":2015,
                        "month":2,
                        "day":15,
                        "hour":13,
                        "minute":0
                    }
             * }
             */
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
