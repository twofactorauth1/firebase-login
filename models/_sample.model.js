/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

require('./base.model.js');

var model = $$.m.ModelBase.extend({

    defaults: {
    },


    initialize: function(options) {

    }


}, {
    db: {
        storage: "mongo",
        table: "models"
    }
});

$$.m.Model = model;

module.exports = model;
