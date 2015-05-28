/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var sitemigration = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id : null,
            account_id: null,
            domain: '',
            redirects: [
                {
                    path: '',
                    destination: '',
                    accessCount: 0,
                    lastAccessed: null
                }
            ],
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
        table: "sitemigration",
        idStrategy: "uuid",
        cache: true
    }
});

$$.m.SiteMigration = sitemigration;

module.exports = sitemigration;
