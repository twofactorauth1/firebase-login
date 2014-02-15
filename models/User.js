require('./model.base');

var user = $$.m.ModelBase.extend({

    defaults: {
        _id: null,
        accountId: null,
        username:"",
        email: "",
        credentials: [], //[ { type:int, username:string, password:string, oathtoken:string } ]
        name:""
    },

    initialize: function(options) {

    },


    getCredentials: function(type) {
        var credentials = this.get("credentials"), creds;
        for(var i = 0; i < credentials.length; i++) {
            if (credentials[i].type == type) {
                return creds = credentials[i];
            }
        }
        return null;
    },


    setCredentials: function(options) {
        var credentials = this.get("credentials"), creds;
        for(var i = 0; i < credentials.length; i++) {
            if (credentials[i].type == options.type) {
                creds = credentials[i];
                break;
            }
        }

        var isNew = false;
        if (creds == null) {
            isNew = true;
        }

        switch(options.type) {
            case $$.m.User.CREDENTIAL_TYPES.LOCAL:
                creds = creds || {};
                creds.type = options.type;
                creds.username = options.username;
                creds.password = options.password;
                break;
            case $$.m.User.CREDENTIAL_TYPES.FACEBOOK:
                creds = creds || {};
                break;
            case $$.m.User.CREDENTIAL_TYPES.TWITTER:
                creds = creds || {};
                break;
            case $$.m.User.CREDENTIAL_TYPES.LINKDIN:
                creds = creds || {};
                break;
        }

        if (creds != null && isNew == true) {
            credentials.push(creds);
        }
    }

}, {

    CREDENTIAL_TYPES: {
        LOCAL: 1,
        FACEBOOK: 2,
        TWITTER: 3,
        LINKDIN: 4
    },

    db: {
        storage: "mongo",
        table: "users"
    }
});

$$.m.User = user;

module.exports.User = user;
