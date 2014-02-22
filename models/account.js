require('./model.base');
var appConfig = require('../configs/app.config');

var account = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            company: {
                name:"",
                type:0,
                size:0,
                logo:""
            },
            subdomain:"",
            domain:"",
            token:""
        }
    },


    serializers: {
        public: function(json) {
            if (this.get("subdomain") != null) {
                json.accountUrl = appConfig.getServerUrl(this.get("subdomain"));
            }
        }
    },


    initialize: function(options) {
        if ($$.u.stringutils.isNullOrEmpty(this.get("token"))) {
            var token = $$.u.idutils.generateUUID();
            this.set({token:token});
        }

        if ($$.u.stringutils.isNullOrEmpty(this.get("subdomain"))) {
            var subdomain = this.get("subdomain");
            subdomain = subdomain.trim().replace(" ", "");
            this.set({subdomain:subdomain});
        }
    }


}, {
    db: {
        storage: "mongo",
        table: "accounts",
        idStrategy: "increment"
    }
});

$$.m.Account = account;

module.exports = account;
