/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./../../../models/base.model.js');

var readingType = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            description: null,
            valueTypes: null,
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "readingtypes"
    }
});

$$.m.ReadingType = readingType;

module.exports = readingType;
