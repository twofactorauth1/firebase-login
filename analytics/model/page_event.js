/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var pageEvent = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            session_id: null,
            start_time: 0,
            end_time: 0,//calculated
            url: {
                domain: "",
                protocol: "",
                port: 0,
                source: "",
                path: "/",
                anchor: ""
            },
            pageActions: [
                /*
                 {y:0, x:0, type:'mm', ms:0}
                 */
            ],
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "page_events",
        idStrategy: "uuid"
    }
});

$$.m.PageEvent = pageEvent;

module.exports = pageEvent;



