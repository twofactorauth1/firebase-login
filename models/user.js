require('./model.base');
var crypto = require('../utils/security/crypto');
var constants = requirejs("constants/constants");

var user = $$.m.ModelBase.extend({

    defaults: function () {
        return {
            _id: null,
            username: "",
            email: "",
            first: "",
            last: "",
            _v: "0.1",

            created: {
                date: "",        //Date created
                strategy: "",    // lo|fb|tw|li|etc.  See $$.constants.user.credential_types
                by: null,        //this is a nullable ID value, if created by an existing user, this will be populated.
                isNew: false     //If this is a brand new user, mark this as true, the application code will modify it later as necessary
            },


            /**
             * @profilePhotos
             *
             * [{
             *  active:true|false,
             *  url:"" //URL
             *  source:"" //  lo|fb|tw|go|li|cc
             * }]
             */
            profilePhotos: [],

            /**
             * [{
             *  accountId:int,
             *  username:string,
             *  password:string
             *  credentials: [
             *      type:int,
             *      socialId:string
             *      username:string
             *      password:string,
             *      accessToken:string
             *  ],
             *  permissions: [ super, admin, member ]
             * }]
             */
            accounts: [],

            /**
             * [{
             *  type:int,
             *  socialId:string
             *  username:string, //Local only
             *  password:string, //Local only
             *  accessToken:string,
             * }]
             */
            credentials: []
        }
    },


    transients: {
        deepCopy: true,
        public: ["credentials", function (json) {
            var self = this;
            if (json.accounts != null) {
                json.accounts.forEach(function (account) {
                    delete account.permissions;
                    delete account.credentials;
                });
            }
        }]
    },


    serializers: {
        db: function (json) {
            json._username = json.username.toLowerCase();
            for (var i = 0; i < json.accounts.length; i++) {
                for (var j = 0; j < json.accounts[i].credentials.length; j++) {
                    if (json.accounts[i].credentials[j].username != null) {
                        json.accounts[i].credentials[j]._username = json.accounts[i].credentials[j].username.toLowerCase();
                    }
                }
            }
        }
    },


    initialize: function (options) {

    },


    //region HELPERS
    fullName: function () {
        if (this.get("first") != null) {
            return this.get("first") + this.get("last") == null ? "" : (" " + this.get("last"));
        } else {
            return this.get("username");
        }
    },
    //endregion


    //region CREDENTIALS
    createOrUpdateLocalCredentials: function (password) {
        var creds = this._getCredentials($$.constants.user.credential_types.LOCAL);
        if (creds == null) {
            return this._createLocalCredentials(this.get("username"), password);
        } else {
            creds.password = password;
            return this._setCredentials(creds, true);
        }
    },


    createOrUpdateSocialCredentials: function(socialType, socialId, accessToken) {
        var creds = this._getCredentials(socialType);
        if (creds == null) {
            return this._createSocialCredentials(socialType, socialId, accessToken);
        } else {
            creds.type = socialType;
            creds.socialId = socialId;
            creds.accessToken = accessToken;
            return this._setCredentials(creds, false);
        }
    },


    _createLocalCredentials: function (username, password) {
        var creds = {
            username: username || this.get("username"),
            password: password,
            type: $$.constants.user.credential_types.LOCAL
        };

        return this._setCredentials(creds, true);
    },


    _createSocialCredentials: function(socialType, socialId, accessToken) {
        var creds = {
            type: socialType,
            socialId: socialId,
            accessToken: accessToken
        };

        return this._setCredentials(creds, false);
    },


    _setCredentials: function (options, encryptPassword) {
        var credentials = this.get("credentials"), creds;
        for (var i = 0; i < credentials.length; i++) {
            if (credentials[i].type == options.type) {
                creds = credentials[i];
                break;
            }
        }

        var isNew = false;
        if (creds == null) {
            isNew = true;
        }

        creds = creds || {};
        creds.type = options.type;
        if (options.username != null) {
            creds.username = options.username;
        }
        if (options.password != null) {
            creds.password = options.password;
        }

        creds.socialId = options.socialId;
        creds.accessToken = options.accessToken;


        if (creds != null && encryptPassword == true && creds.password != null) {
            creds.password = crypto.hash(creds.password);
        }
        if (creds != null && isNew == true) {
            credentials.push(creds);
        }
    },


    _getCredentials: function (type) {
        var credentials = this.get("credentials"), creds;
        for (var i = 0; i < credentials.length; i++) {
            if (credentials[i].type == type) {
                return credentials[i];
            }
        }
        return null;
    },


    _getUserAccountCredentials: function (accountId, type) {
        var userAccount = this.getUserAccount(accountId);
        if (userAccount != null) {
            var credentials = userAccount.credentials;
            for (var i = 0; i < credentials.length; i++) {
                if (credentials[i].type == type) {
                    return credentials[i];
                }
            }
        }
        return null;
    },


    verifyPassword: function (password, type, fn) {
        var credentials = this._getCredentials(type);
        this._verifyPasswordForCredentials(credentials, password, fn);
    },


    verifyPasswordForAccount: function (accountId, password, type, fn) {
        var credentials = this._getUserAccountCredentials(accountId, type);
        return this._verifyPasswordForCredentials(credentials, password, fn);
    },


    _verifyPasswordForCredentials: function (credentials, password, fn) {
        if (credentials === null) {
            return fn("No login credentials found");
        }

        if (credentials.hasOwnProperty("password")) {
            var encryptedPass = credentials.password;
            crypto.verify(password, encryptedPass, function (err, value) {
                if (err) {
                    return fn(err, value);
                } else if (value === false) {
                    return fn(null, false);
                } else {
                    return fn(null, true);
                }
            });
        } else {
            return fn("No password property found to verify password");
        }
    },
    //endregion


    //region User Accounts
    getUserAccount: function (accountId) {
        var accounts = this.get("accounts");
        if (accounts == null) {
            return null;
        }

        for (var i = 0; i < accounts.length; i++) {
            if (accounts[i].accountId == accountId) {
                return accounts[i];
            }
        }
        return null;
    },


    isAdminOfAccount: function (accountId) {
        var account = this.getUserAccount(accountId);
        return (account != null && (account.permissions.indexOf("admin") > -1 || account.permissions.indexOf("super") > -1));
    },


    createUserAccount: function (accountId, username, password, permissions) {
        var userAccount = {
            accountId: accountId,
            username: username,
            credentials: [
                {
                    username: username,
                    password: crypto.hash(password),
                    type: $$.constants.user.credential_types.LOCAL
                }
            ],
            permissions: permissions
        };

        return this._createUserAccount(userAccount, permissions);
    },


    createUserAccountFromSocialProfile: function(accountId, email, socialType, socialId, accessToken, permissions) {
        var userAccount = {
            accountId: accountId,
            username:email,
            credentials: [
                {
                    type:socialType,
                    socialId:socialId,
                    accessToken:accessToken
                },
                {
                    type:$$.constants.user.credential_types.LOCAL,
                    username:email
                }
            ],
            permissions: permissions
        };

        return this._createUserAccount(userAccount, permissions);
    },


    _createUserAccount: function(userAccount, permissions) {
        var accounts = this.get("accounts");
        if (accounts == null) {
            accounts = [];
            this.set({accounts: accounts});
        }

        var accountId = userAccount.accountId;
        var username = userAccount.username;

        //if we have a user account with matching account id, merge it, do not create new
        var oldAccount = this.getUserAccount(accountId);
        if (oldAccount != null) {
            if (oldAccount.username == null || oldAccount.username == username) {
                //this is ok, lets merge them together
                oldAccount.username = username;

                //Look to see if we already have creds of the same type, if so,
                // we merge the new into the old
                var newCredentials = userAccount.credentials;

                for (var i = 0; i < newCredentials.length; i++) {
                    var newCreds = newCredentials[i];

                    var oldCreds = null;
                    oldAccount.credentials.forEach(function(_oldCreds) {
                        if (_oldCreds.type === newCred.type) {
                            oldCreds = _oldCreds;
                        }
                    });

                    if (oldCreds != null) {
                        oldCreds.username = newCredentials.username;
                        if (newCredentials.password != null) {
                            oldCreds.password = crypto.hash(newCreds.password);
                        }
                        oldCreds.socialId = newCreds.socialId;
                        oldCreds.accessToken = newCreds.accessToken;
                    } else {
                        oldAccount.credentials.push(newCreds);
                    }
                }

                //Attempt to merge the permissions
                permissions.forEach(function (permission) {
                    if (oldAccount.permissions.indexOf(permissions) == -1) {
                        oldAccount.permissions.push(push);
                    }
                });
            }
            return oldAccount;
        }
        else {
            accounts.push(userAccount);
            return userAccount;
        }
    },
    //endregion


    //region PASSWORD RECOVERY
    setPasswordRecoverToken: function () {
        var token = $$.u.idutils.generateUniqueAlphaNumeric();
        this.set({passRecover: token, passRecoverExp: new Date().getTime() + $$.u.dateutils.DAY_IN_SEC * 1000});
        return token;
    },


    clearPasswordRecoverToken: function () {
        this.clear("passRecover");
        this.clear("passRecoverExp");
    }
    //endregion

}, {
    db: {
        storage: "mongo",
        table: "users",
        idStrategy: "increment"
    }
});

$$.m.User = user;

module.exports.User = user;
