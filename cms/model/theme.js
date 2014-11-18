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

            initial : {
                index : {
                    header : 1,
                    'image-text' : 1,
                    'feature-list' : 3,
                    footer: 1
                },
                blog : {
                    header : 1,
                    blog : 1,
                    footer : 1
                },
                'single-post' : {
                    'header' : 1,
                    'single-post' : 1,
                    'footer' : 1
                },
                landing : {
                    'feature-block' : 1
                }
            },


            /**
             * Created by data
             *
             * @property created
             * @type {Object}
             * @default {}
             */
            created: {
                date: new Date(),
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
                date: null,
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
