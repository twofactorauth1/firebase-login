/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var promotionReport = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            promotionId:null,
            cardCodeRestrictions:[],
            recipients:[],
            startOn:null,//date
            repeat:null,//weekly, monthly
            sendAt:{
                hourOfDay:15,
                minuteOfDay:0
            },
            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: null,
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
        table: "promotionreports",
        idStrategy: "uuid"
    }
});

$$.m.PromotionReport = promotionReport;

module.exports = promotionReport;
