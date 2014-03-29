/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

require('./model.base');

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
