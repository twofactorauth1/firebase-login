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
