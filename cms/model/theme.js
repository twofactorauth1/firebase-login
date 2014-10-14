/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var theme = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The Id of this instance,
             *
             * @property _id
             * @type {Guid}
             * @default ""
             */
            _id: "",

            name: '',

            accountId: 0,

            isPublic: false,

            previewUrl: '',

            config: {},

            /**
             * Created by data
             *
             * @property created
             * @type {Object}
             * @default {}
             */
            created: {
                date: "",
                by: null
            },


            /**
             * Modified by data
             *
             * @property modified
             * @type {Object}
             * @default {}
             */
            modified: {
                date: "",
                by: null
            }
        }
    },

    serializers: {

    },


    initialize: function(options) {

    },


    validate: function() {
        return true;
    }

}, {
    db: {
        storage: "mongo",
        table: "themes",
        idStrategy: "uuid"
    }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.Theme = theme;

module.exports = theme;
