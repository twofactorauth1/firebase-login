/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var insight = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            "_id" : null,
            "accountId": 0,

            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: new Date(),
                by: null
            },
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "insights",
        idStrategy: "uuid"
    }
});

$$.m.Insight = insight;

module.exports = insight;
