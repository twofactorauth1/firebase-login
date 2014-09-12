/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var asset = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId: null,
            mimeType: null,
            size: 0,//bytes
            filename: '',//original filename

            url: '',
            source: '',// S3, Dropbox, GoogleDrive
            tags:[], //array of strings

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
        table: "assets",
        idStrategy: "uuid"
    }
});

$$.m.Asset = asset;

module.exports = asset;