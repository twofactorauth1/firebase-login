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
                strategy: "",    // lo|fb|tw|li|etc.  See $$.constants.social.types
                by: null,        //this is a nullable ID value, if created by an existing user, this will be populated.
                isNew: false     //If this is a brand new user, mark this as true, the application code will modify it later as necessary
            },


            /**
             * @profilePhotos
             *
             * [{
             *  default:true|false,
             *  url:"" //URL
             *  type:"" //  lo|fb|tw|go|li|cc
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
             *      username:string     //Local only
             *      password:string,    //Local only
             *  ],
             *  permissions: [ super, admin, member ]
             * }]
             */
            accounts: [],

            /**
             * [{
             *  type:int,
             *  username:string,
             *  password:string,    //Local only
             *  socialId:string,    //social only
             *  accessToken:string, //social only
             *  socialUrl:string    //social only
             *  scope:string
             * }]
             */
            credentials: []
        }
    },


    transients: {
        deepCopy: true,
        public: [function (json, options) {
            var self = this;
            if (json.credentials != null) {
                json.credentials.forEach(function(creds) {
                    delete creds.password;
                    delete creds.accessToken;
                });
            }

            if (json.accounts != null) {

                if (options && options.accountId) {
                    //Remove all but this account
                    var account = _.findWhere(json.accounts, {accountId:options.accountId});
                    json.accounts = account != null ? [account] : [];
                }

                json.accounts.forEach(function (account) {
                    delete account.permissions;

                    if (account.credentials != null) {
                        account.credentials.forEach(function(creds) {
                            delete creds.password;
                            delete creds.accessToken;
                        });
                    }
                });
            }
        }]
    },


    serializers: {
        db: function (json) {
            if (json.username != null) {
                json._username = json.username.toLowerCase();
            }

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
        var username = this.get("username");
        if (username == null) {
            return;
        }

        var creds = this.getCredentials($$.constants.user.credential_types.LOCAL);
        if (creds == null) {
            creds = {
                username: username,
                password: password,
                type: $$.constants.user.credential_types.LOCAL
            };
        } else {
            creds.password = password;
        }
        return this._setCredentials(creds, true);
    },


    createOrUpdateSocialCredentials: function(socialType, socialId, accessToken, username, socialUrl, scope) {
        var creds = this.getCredentials(socialType);
        if (creds == null) {
            creds = {};
        }
        creds.type = socialType;
        creds.socialId = socialId;
        creds.accessToken = accessToken;
        creds.username = username;
        creds.socialUrl = socialUrl;
        creds.scope = scope;
        return this._setCredentials(creds, false);
    },


    getCredentials: function (type) {
        var credentials = this.get("credentials"), creds;
        for (var i = 0; i < credentials.length; i++) {
            if (credentials[i].type == type) {
                return credentials[i];
            }
        }
        return null;
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
        if (options.socialUrl != null) {
            creds.socialUrl = options.socialUrl;
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


    verifyPassword: function (password, type, fn) {
        var credentials = this.getCredentials(type);
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
        if (_.isArray(password)) {
            permissions = password;
            password = null;
        }

        var userAccount = {
            accountId: accountId,
            username: username,
            credentials: [
                {
                    username: username,
                    password: password == null ? null : crypto.hash(password),
                    type: $$.constants.user.credential_types.LOCAL
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


    createOrUpdateUserAccountCredentials: function(accountId, type, username, password, socialId, accessToken) {
        var userAccount = this.getUserAccount(accountId);

        if (userAccount != null) {
            var creds = null;
            var credentials = userAccount.credentials;
            for (var i = 0; i < credentials.length; i++) {
                if (credentials[i].type == type) {
                    creds = credentials[i];
                    break;
                }
            }

            if (creds == null) {
                creds = {
                    type: type
                };
                credentials.push(creds);
            }

            if (username) creds.username = username;
            if (password) creds.password = crypto.hash(password);
            if (socialId) creds.socialId = socialId;
            if (accessToken) creds.accessToken = accessToken;
        }
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
    //endregion


    //region PHOTO
    addOrUpdatePhoto: function(socialType, url, isDefault) {
        var photos = this.get("photos");
        if (photos == null) {
            photos = [];
            this.set({photos:photos});
        }

        var photo = this.getPhoto(socialType);

        if (photo != null) {
            photo.url = url;
            photo.default = isDefault;
        } else {
            photo = {
                type: socialType,
                url: url,
                default: isDefault
            }
        }

        this.setPhoto(photo);
    },


    getDefaultPhoto: function() {
        var photos = this.get("photos");
        if (photos == null || photos.length == 0) {
            return null;
        }

        if (photos.length == 1) {
            return photos[0];
        }

        var defaultPhoto = _.findWhere(photos, {default:true});
        return defaultPhoto || photos[0];
    },


    getPhoto: function(socialType) {
        var photos = this.get("photos");
        if (photos == null || photos.length == 0) {
            return null;
        }

        return _.findWhere(photos, {type:socialType}) || null;
    },


    setPhoto: function(photo) {
        var photos = this.get("photos");
        if (photos == null) {
            photos = [];
            this.set({photos:photos});
        }

        var photoSet = false;
        for(var i = 0; i < photos.length; i++) {
            if (photos[i].type == photo.type) {
                photos[i] = photo;
                photoSet = true;
            } else if(photo.default == true) {
                photos[i].default = false;
            }
        }

        if (photoSet == false) {
            photos.push(photo);
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
