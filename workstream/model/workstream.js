/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

/**
 * @class Workstream
 */
var workstream = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId:0,
            unlockVideoUrl:'',
            unlocked: false,
            completed: false,
            blocks:[],
            deepDiveVideoUrls:[],
            analyticWidgets:[],
            name: '',
            _v:"0.1",
            created: {
                date: new Date(),
                by: null
            },

            modified: {
                date: new Date(),
                by: null
            }
        }
    },

    initialize: function(options) {

    }


}, {
    db: {
        storage: "mongo",
        table: "workstreams",
        idStrategy: "uuid"
    }
});

$$.m.Workstream = workstream;

module.exports = workstream;
