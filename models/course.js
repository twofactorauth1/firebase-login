/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./base.model.js');
var constants = requirejs("constants/constants");

var course = $$.m.ModelBase.extend({

    defaults: function () {
        return {
            _id: null,
            title: null,
            template: null,
            subdomain: null,
            subtitle: null,
            body: null,
            description: null,
            price: 0,
            showExitIntentModal: false,
            /**
             * @videos
             * [{
             *       videoId: String,
             *       videoUrl: String,
             *       subject: String,
             *       videoPreviewUrl: String,
             *       videoBigPreviewUrl: String,
             *       videoTitle: String,
             *       videoSubtitle: String,
             *       videoBody: String,
             *       scheduledHour: Number,
             *       scheduledMinute: Number,
             *       scheduledDay: Number,
             *       isPremium: Boolean
             *   }]
             */
            videos: [

            ],
            userId: null,
            accountId: null
        };
    },


    transients: {
        deepCopy: true,
        public: [function (json, options) {

        }]
    },


    serializers: {
        db: function (json) {

        }
    },


    initialize: function (options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "courses",
        idStrategy: "increment",
        cache: true
    }
});

$$.m.Course = course;

module.exports.Course = course;
