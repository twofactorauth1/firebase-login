/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../../../models/base.model.js');

var twonetuser = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "twonetuser",
        idStrategy: "uuid"
    }
});

$$.m.TwonetUser = twonetuser;

module.exports = twonetuser;
