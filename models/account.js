require('./model.base');

var account = $$.m.ModelBase.extend({

    defaults: {
        _id: null,
        company: null, // { name:string, type:int, size:int }
        subdomain:"",
        domain:"",
        token:""
    },

    initialize: function(options) {

    }
}, {

    COMPANY_TYPES: {
        PROFESSIONAL:1,
        BUSINESS:2
    },

    COMPANY_SIZE: {
        SMALL: 1,
        MEDIUM: 2,
        LARGE: 3,
        ENTERPRISE: 4
    },

    db: {
        storage: "mongo",
        table: "accounts"
    }
});

$$.m.Account = account;

module.exports = account;
