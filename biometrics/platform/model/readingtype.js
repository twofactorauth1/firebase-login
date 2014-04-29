/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./../../../models/base.model.js');

var readingtype = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            unit: null,
            description: null,
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

$$.m.ReadingType = readingtype;

module.exports = readingtype;
