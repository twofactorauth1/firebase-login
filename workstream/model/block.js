/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

/**
 * @class Block
 */
var block = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            name:'',
            link:'',
            helpText:'',
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
        table: "blocks",
        idStrategy: "uuid"
    }
});

$$.m.Block = block;

module.exports = block;
