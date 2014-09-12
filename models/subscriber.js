/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./base.model.js');
var constants = requirejs("constants/constants");

var subscriber = $$.m.ModelBase.extend({

    defaults: function () {
        return {
            _id: null,
            email: null,
            courseId: null,
            subscribeDate: null,
            timezoneOffset: null,
            userId: null
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
        table: "subscribers",
        idStrategy: "increment",
        cache: true
    }
});

$$.m.Subscriber = subscriber;

module.exports.Subscriber = subscriber;
