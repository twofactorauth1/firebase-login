/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var sessionEvent = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            "session_id": "",
            "session_start": 0,
            "session_end": 0,
            "referrer": {
                /*
                "domain": "main.indigenous.local",
                "protocol": "http",
                "port": "3000",
                "source": "http://main.indigenous.local:3000/",
                "path": "/",
                "anchor": ""
                */
            },
            "session_length": 0,
            "permanent_tracker": "",
            "fingerprint": 0,
            /*"ip_geo_info": {

                "province": "California",
                "city": "San Diego",
                "postal_code": "92115",
                "continent": "North America",
                "country": "United States"

            },*/
            "ip_address": "127.0.0.1",

            "user_agent": {
                "device": "",
                "engine": {
                    "version": "",
                    "name": ""
                },
                "os": {
                    "version": "",
                    "name": ""
                },
                "browser": {
                    "major": "",
                    "version": "",
                    "name": ""
                }
            },
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "session_events",
        idStrategy: "uuid"
    }
});

$$.m.SessionEvent = sessionEvent;

module.exports = sessionEvent;
