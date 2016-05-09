/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var location = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            "_id" : null,
            "accountId": 0,
            "name": "",
            "address": "",
            "address2": "",
            "city": "",
            "state": "",
            "zip": "",
            "country": "",
            "lat": "",
            "lng": "",
            "description": "",
            "url": "",
            "sl_pages_url": "",
            "email": "",
            "email_link": "",
            "hours": "",
            "phone": "",
            "fax": "",
            "image": "",
            "tags": "",
            "option_value": "",
            "attributes": "",
            "neat_title": "",
            "web_link": "",
            "url_link": "",
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
        table: "locations",
        idStrategy: "uuid"
    }
});

$$.m.Location = location;

module.exports = location;
