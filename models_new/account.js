require('./model.base');

var account = $$.m.ModelBase.extend({

    defaults: {
        _id: null,
        companyName:"",
        username:"",
        password:"",
        sessions: [],
        name:""
    },

    initialize: function(options) {

    }
});

$$.m.Account = account;

module.exports.Account = account;
