/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var promotion = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            title: null,
            description: null,
            accountId: null,
            userId : null,
            attachment: null,
            startDate: null,
            expirationDate: null,
            vendor: null,
            promoImage: null,
            promoCode: null,
            products: null,
            report: null,
            type: null,
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

    },

    getReportRange: function(){
        var _dateInterval = "";
        if(this.get("report") && this.get("report").schedule && this.get("report").startDate){
            if(this.get("report").schedule === 'WEEKLY'){
                _dateInterval = moment(this.get("report").startDate).format("MMMM D, YYYY") + " - " + moment(this.get("report").startDate).add(7, 'days').format("MMMM D, YYYY")
            }
            else if(this.get("report").schedule === 'MONTHLY'){
                _dateInterval = moment(this.get("report").startDate).format("MMMM D, YYYY") + " - " + moment(this.get("report").startDate).add(1, 'months').format("MMMM D, YYYY")
            }
        }
        return _dateInterval;
    },
    getReportDate: function(){        
        return moment().format("MMMM D, YYYY");
    }

}, {
    db: {
        storage: "mongo",
        table: "promotions",
        idStrategy: "uuid"
    }
});

$$.m.Promotion = promotion;

module.exports = promotion;
