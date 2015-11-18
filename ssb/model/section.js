/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

/**
 * @class Section
 */
var section = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            _id: null,
            accountId:null,
            layout: '',
            components: [],//array of components, similar to what's on pages now

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
        table: "sections",
        idStrategy: "uuid"
    }
});

$$.m.ssb = $$.m.ssb || {};
$$.m.ssb.Section = section;

module.exports = section;
