/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var emailmessage = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            batchId:null,
            accountId: null,
            userId: null,
            sender:null,
            receiver:null,
            content:null,
            sendDate:null,
            deliveredDate:null,
            openedDate:null,
            clickedDate:null,
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
        table: "emailmessages",
        idStrategy: "uuid"
    }
});

$$.m.Emailmessage = emailmessage;

module.exports = emailmessage;
