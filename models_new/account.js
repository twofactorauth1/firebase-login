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
}, {
    db: {
        storage: "mongo",
        table: "accounts"
    }
});

$$.m.Account = account;

module.exports.Account = account;
