/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

require('./base.model.js');
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
            gender: null, //m|f
            birthday: "",
            _v: "0.1",

            created: {
                by: null,        //this is a nullable ID value, if created by an existing user, this will be populated.
                date: "",        //Date created
                strategy: "",    // lo|fb|tw|li|etc.  See $$.constants.social.types
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
             *  credentials: [{
             *      type:int,
             *      username:string     //Local only
             *      password:string,    //Local only
             *  }],
             *
             *  permissions: [ super, admin, member ],
             *
             *  emailSources: [{
             *      _id:"",
             *      type: ""  e.g. $$.constants.email_sources.CONTEXTIO
             *      providerId: null,
             *      label: null,
             *      primaryEmail: "",
             *
             *      mailboxes: [{
             *          _id:"",
             *          email: "",
             *          label: null,
             *          emailType: null  //e.g. "gmail", "outlook", "yahoo", etc.
             *          emailServer: ""
             *          port: int,
             *      }]
             *  ]},
             *
             *  baggage: {}
             * }]
             */
            accounts: [],

            /**
             * [{
             *  type:int,
             *  username:string,
             *  password:string,     //Local only
             *  socialId:string,     //social only
             *  accessToken:string,  //social only
             *  refreshToken:string, //social only
             *  socialUrl:string,     //social only
             *  scope:string,
             *  baggage: {}
             * }]
             */
            credentials: [],


            /**
             * [{
             *   _id:"",
             *   socialId:"",  //The social Id from where these details came
             *   type:int,     //The social network from where this information originated, or local
             *   username,     //The username from the social network
             *   websites:[]
             *
             *   phones: [{
             *       _id:"",
             *       type: string "m|w|h|o" //mobile, work, home, other
             *       number: string,
             *       default: false
             *   }],
             *
             *   addresses: [{
             *       _id:""
             *       type: string "w|h|o"
             *       address:string
             *       address2:string
             *       city:string
             *       state:string
             *       zip:string
             *       country:string,
             *       countryCode:string
             *       displayName:string,
             *       lat:"",
             *       lon:"",
             *       defaultShipping: false
             *       defaultBilling: false
             *   }],
             *
             *   numFriends: null,
             *   numFollowers: null,
             *   numFavorites: null,
             *
             *   //These are IM accounts we retrieved from the given social networks records
             *   imAccounts: [{
             *      _id:"",
             *      type:"",                //the communication type (e.g. AOL, Skype, etc)
             *      username:"",            the im account name
             *   }]
             *
             *   //These are social accounts we retrieved from the given social networks records
             *   socialNetworks: [{
             *      _id:"",
             *      type: the social network type (e.g.
             *      socialId: "", //the social networks internal id
             *      username: "", the social networks username
             *   }]
             * }]
             */
            details: []
        };
    },


    transients: {
        deepCopy: true,
        public: [function (json, options) {
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


    //region Profile
    updateProfileInformation: function(email, firstName, lastName, gender, birthday, overwrite) {
        var obj = {
            email:email,
            first:firstName,
            last:lastName,
            gender:gender,
            birthday:birthday
        };

        for (var key in obj) {
            if (!String.isNullOrEmpty(obj[key]) && (overwrite || String.isNullOrEmpty(this.get(key)))) {
                this.set(key, obj[key]);
            }
        }
    },
    //endregion


    //region DETAILS
    getDetails: function(type) {
        var details = this.get("details");
        if (details == null) {
            details = [];
            this.set({details:details});
        }

        return _.find(details, function(_detail) { return _detail.type === type; });
    },


    getOrCreateDetails: function(type) {
        var detail = this.getDetails(type);

        if (detail == null) {
            detail = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                type: type,
                emails:[],
                photo:"",
                phones: [],
                addresses: []
            };

            this.get("details").push(detail);
        }

        return detail;
    },


    updateWebsites: function(type, websites) {
        var details = this.getOrCreateDetails(type);

        if (websites != null) {
            details.websites = details.websites || [];
            if (_.isString(websites)) {
                if (details.websites.indexOf(websites) == -1) {
                    details.websites.push(websites);
                }
            } else {
                for (var i = 0; i < websites.length; i++) {
                    if (details.websites.indexOf(websites[i]) == -1) { details.websites.push(websites[i]); }
                }
            }
        }
    },


    createOrUpdatePhone: function(type, phoneType, phoneNumber, isDefault) {
        var details = this.getOrCreateDetails(type);

        details.phones = details.phones || [];
        var phones = details.phones;

        if (isDefault === true) {
            phones.forEach(function(phone) {
                phone.default = false;
            });
        }

        var phone = _.findWhere(phones, {type:phoneType, number:phoneNumber});
        if (phone == null) {
            phone = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                type: phoneType,
                number: phoneNumber,
                default: isDefault
            };
            phones.push(phone);
        } else {
            phone.default = isDefault;
        }
    },


    createOrUpdateAddress: function(type, addressType, address, address2, city, state, zip, country, countryCode, displayName, lat, lon, defaultShipping, defaultBilling) {
        var existing
            , details = this.getOrCreateDetails(type);

        details.addresses = details.addresses || [];

        //first check displayName, as that may be all we have
        existing = _.findWhere(details.addresses, {displayName: displayName });

        if (existing != null || !String.isNullOrEmpty(address)) {
            if (existing == null) {
                existing = _.findWhere(details.addresses, { address: address });
            }

            if (existing != null) {
                //We already have it, lets try to merge in remainder of details only if current address is empty
                existing.type = existing.type || "o";
                existing.address2 = String.isNullOrEmpty(existing.address2) ? address2 : existing.address2;
                existing.city = String.isNullOrEmpty(existing.city) ? city : existing.city;
                existing.state = String.isNullOrEmpty(existing.state) ? state : existing.state;
                existing.country = String.isNullOrEmpty(existing.country) ? country : existing.country;
                existing.countryCode = String.isNullOrEmpty(existing.countryCode) ? countryCode : existing.countryCode;
                existing.displayName = String.isNullOrEmpty(existing.displayName) ? displayName : existing.displayName;
                existing.lat = String.isNullOrEmpty(existing.lat) ? lat : existing.lat;
                existing.lon = String.isNullOrEmpty(existing.lon) ? lat : existing.lon;
            }
        }

        if (existing == null) {
            existing = _.findWhere(details.addresses, { zip: zip, type: type });

            //We have matched on zip code, if we have no existing address, lets try to fill it in.
            if (existing != null && String.isNullOrEmpty(existing.address)) {
                existing.type = existing.type || "o";
                existing.address = address;
                existing.address2 = String.isNullOrEmpty(address2) ? existing.address2 : address2;
                existing.city = String.isNullOrEmpty(city) ? existing.city : city;
                existing.state = String.isNullOrEmpty(state) ? existing.state : state;
                existing.country = String.isNullOrEmpty(country) ? existing.country : country;
                existing.countryCode = String.isNullOrEmpty(countryCode) ? existing.countryCode : countryCode;
                existing.displayName = String.isNullOrEmpty(displayName) ? existing.displayName : displayName;
                existing.lat = String.isNullOrEmpty(lat) ? existing.lat : lat;
                existing.lon = String.isNullOrEmpty(lon) ? existing.lat : lon;
                if (defaultShipping) { existing.defaultShipping = true; }
                if (defaultBilling) { existing.defaultBilling = true; }
            }
        }

        if (existing == null) {
            //we haven't found a matching address, lets add it
            var addressObj = {};
            addressObj.type = addressType || "o";
            addressObj.address = address;
            addressObj.address2 = address2;
            addressObj.city = city;
            addressObj.state = state;
            addressObj.country = country;
            addressObj.countryCode = countryCode;
            addressObj.displayName = displayName;
            addressObj.lat = lat;
            addressObj.lon = lon;
            addressObj.defaultShipping = defaultShipping;
            addressObj.defaultBilling = defaultBilling;

            details.addresses.push(addressObj);
        }
    },


    updateSocialInfo: function(type, username, numFriends, numFollowers, numFavorites) {
        var details = this.getOrCreateDetails(type);

        if (username != null) {
            details.username = username;
        }

        if (numFriends != null) {
            details.numFriends = numFriends;
        }

        if (numFollowers != null) {
            details.numFollowers = numFollowers;
        }

        if (numFavorites != null) {
            details.numFavorites = numFavorites;
        }
    },


    createOrUpdateImAccount: function(type, imAccountType, username) {
        var details = this.getOrCreateDetails(type);

        details.imAccounts = details.imAccounts || [];

        var imAccount = _.findWhere(details.imAccounts, {type: imAccountType});
        if (imAccount == null) {
            imAccount = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                type: imAccountType,
                username: username
            };

            details.imAccounts.push(imAccount);
        } else {
            if (!String.isNullOrEmpty(username)) {
                imAccount.username = username;
            }
        }
    },


    createOrUpdateSocialNetwork: function(type, socialNetworkType, socialId, username) {
        var details = this.getOrCreateDetails(type);

        details.socialNetworks = details.socialNetworks || [];

        var network = _.findWhere(details.socialNetworks, {type: socialNetworkType});
        if (network == null) {
            network = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                type: socialNetworkType,
                socialId: socialId,
                username: username
            };

            details.socialNetworks.push(network);
        } else {
            if (!String.isNullOrEmpty(socialId)) {
                network.socialId = socialId;
            }

            if (!String.isNullOrEmpty(username)) {
                network.username = username;
            }
        }
    },
    //endregion


    //region PHOTO
    addOrUpdatePhoto: function(socialType, url, isDefault) {
        var photos = this.get("profilePhotos");
        if (photos == null) {
            photos = [];
            this.set({profilePhotos:photos});
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
            };
        }

        this.setPhoto(photo);
    },


    getPhoto: function(socialType) {
        var photos = this.get("profilePhotos");
        if (photos == null || photos.length === 0) {
            return null;
        }

        return _.findWhere(photos, {type:socialType}) || null;
    },


    getDefaultPhoto: function() {
        var photos = this.get("profilePhotos");
        if (photos == null || photos.length === 0) {
            return null;
        }

        if (photos.length == 1) {
            return photos[0];
        }

        var defaultPhoto = _.findWhere(photos, {default:true});
        return defaultPhoto || photos[0];
    },


    setPhoto: function(photo) {
        var photos = this.get("profilePhotos");
        if (photos == null) {
            photos = [];
            this.set({photos:photos});
        }

        var photoSet = false;
        for(var i = 0; i < photos.length; i++) {
            if (photos[i].type == photo.type) {
                photos[i] = photo;
                photoSet = true;
            } else if(photo.default === true) {
                photos[i].default = false;
            }
        }

        if (photoSet === false) {
            photos.push(photo);
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


    createOrUpdateSocialCredentials: function(socialType, socialId, accessToken, refreshToken, expires, username, socialUrl, scope) {
        var creds = this.getCredentials(socialType);
        if (creds == null) {
            creds = {};
        }
        creds.type = socialType;
        creds.socialId = socialId;
        creds.accessToken = accessToken;
        if (socialType == $$.constants.social.types.TWITTER) {
            creds.accessTokenSecret = refreshToken;
        } else {
            creds.refreshToken = refreshToken;
        }
        if (expires != null && expires > 0) {
            creds.expires = new Date().getTime() + (expires*1000);
        }
        creds.username = username;
        creds.socialUrl = socialUrl;
        creds.scope = scope;
        return this._setCredentials(creds, false);
    },


    getCredentials: function (type) {
        var credentials = this.get("credentials");
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
        if (options.refreshToken != null) {
            creds.refreshToken = options.refreshToken;
        }

        if (options.expires != null && options.expires > 0) {
            creds.expires = options.expires;
        }

        if (creds != null && encryptPassword === true && creds.password != null) {
            creds.password = this._encryptPassword(creds.password);
        }

        //Ensure any rogue options make it in
        for (var key in options) {
            if (creds.hasOwnProperty(key) === false) {
                creds[key] = options[key];
            }
        }

        if (creds != null && isNew === true) {
            credentials.push(creds);
        }
    },


    verifyPassword: function (password, type, fn) {
        var credentials = this.getCredentials(type);
        this._verifyPasswordForCredentials(credentials, password, fn);
    },


    verifyPasswordForAccount: function (accountId, password, type, fn) {
        var credentials = this.getUserAccountCredentials(accountId, type);
        return this._verifyPasswordForCredentials(credentials, password, fn);
    },


    _verifyPasswordForCredentials: function (credentials, password, fn) {
        if (credentials === null) {
            return fn("No login credentials found");
        }

        if (credentials.hasOwnProperty("password")) {
            var encryptedPass = credentials.password;

            this._verifyPassword(password, encryptedPass, function(err, value) {
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
    getPermissionsForAccount: function(accountId) {
        var userAccount = this.getUserAccount(accountId);
        if (userAccount == null) {
            return [];
        }

        return userAccount.permissions || [];
    },


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


    getAllAccountIds: function() {
        var accounts = this.get("accounts");
        if (accounts == null) {
            return [];
        }

        return _.pluck(accounts, "accountId");
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
                    password: password == null ? null : this._encryptPassword(password),
                    type: $$.constants.user.credential_types.LOCAL
                }
            ],
            permissions: permissions
        };

        return this._createUserAccount(userAccount, permissions);
    },


    _createUserAccount: function(userAccount, permissions) {
        var self = this;
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
                var newCredentials = userAccount.credentials,
                    newCreds,
                    oldCreds;

                var fxn = function(_oldCreds) {
                    if (_oldCreds.type === newCreds.type) {
                        oldCreds = _oldCreds;
                    }
                };

                for (var i = 0; i < newCredentials.length; i++) {
                    newCreds = newCredentials[i];
                    oldCreds = null;
                    oldAccount.credentials.forEach(fxn);

                    if (oldCreds != null) {
                        oldCreds.username = newCredentials.username;
                        if (newCredentials.password != null) {
                            oldCreds.password = self._encryptPassword(newCreds.password);
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
                        oldAccount.permissions.push(permission);
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

            if (username) { creds.username = username; }
            if (password) { creds.password = this._encryptPassword(password); }
            if (socialId) { creds.socialId = socialId; }
            if (accessToken) { creds.accessToken = accessToken; }
        }
    },


    getUserAccountBaggage: function(accountId, key) {
        var userAccount = this.getUserAccount(accountId);

        userAccount.baggage = userAccount.baggage || {};

        if (key != null) {
            if (userAccount.baggage[key] == null) {
                userAccount.baggage[key] = {};
            }
            return userAccount.baggage[key];
        }
        return userAccount.baggage;
    },


    getUserAccountCredentials: function (accountId, type) {
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


    //region EMAIL SOURCES
    /**
     * Retrieve Email Source By Id
     *
     * @param id
     * @returns EmailSource object, or null
     */
    getEmailSource: function(id) {
        var emailSources = this.getAllEmailSources();
        return _.findWhere(emailSources, { _id: id });
    },


    /**
     * @param accountId - optional paramater
     *
     * @returns Array of EmailSource objects.
     */
    getAllEmailSources: function(accountId) {
        var emailSources = [];

        var userAccounts = [];
        if (accountId != null) {
            var userAccount = this.getUserAccount(accountId);
            if (userAccount != null) {
                userAccounts.push(userAccount);
            }
        } else {
            userAccounts = this.get("accounts");
        }

        if (userAccounts === null || userAccounts.length === 0) {
            return null;
        }
        for (var i = 0, l = userAccounts.length; i < l; i++) {
            if (userAccounts[i].emailSources != null && userAccounts[i].emailSources.length > 0) {
                emailSources = emailSources.concat(userAccounts[i].emailSources);
            }
        }
        return emailSources;
    },


    getEmailSourceByType: function(accountId, type) {
        var emailSources = this.getAllEmailSources;
        var userAccount = this.getUserAccount(accountId);
        if (userAccount === null || userAccount.emailSources === null || userAccount.emailSources.length === 0) {
            return null;
        }

        return _.findWhere(userAccount.emailSources, {type:type});
    },


    createOrUpdateEmailSource: function(accountId, type, providerId, label, primaryEmail) {
        var userAccount = this.getUserAccount(accountId);
        if (userAccount == null) {
            throw Error("User account does not exist with AccountID: " + accountId + " for user: " + this.id());
        }

        var emailSources = userAccount.emailSources;
        if (emailSources == null) {
            emailSources = [];
            userAccount.emailSources = emailSources;
        }

        var emailSource = _.findWhere(emailSources, {type:type});
        if (emailSource == null) {
            emailSource = {
                _id: $$.u.idutils.generateUniqueAlphaNumeric(),
                accountId: accountId,
                type: type,
                providerId: providerId,
                label: label,
                primaryEmail: primaryEmail
            };

            emailSources.push(emailSource);
        } else {
            if (!String.isNullOrEmpty(providerId)) { emailSource.providerId = providerId; }
            if (!String.isNullOrEmpty(label)) { emailSource.labeel = label; }
            if (!String.isNullOrEmpty(primaryEmail)) { emailSource.primaryEmail = primaryEmail; }
        }

        return emailSource;
    },


    createOrUpdateMailboxForSource: function(sourceId, email, emailType, label, emailServer, port) {
        var emailSource = this.getEmailSource(sourceId);
        if (emailSource == null) {
            return null;
        }

        var mailboxes = emailSource.mailboxes;
        if (mailboxes == null) {
            mailboxes = [];
            emailSource.mailboxes = mailboxes;
        }

        var mailbox = _.findWhere(mailboxes, {email:email});

        if (mailbox == null) {
            mailbox = {
                _id: $$.u.idutils.generateUniqueAlphaNumeric(),
                email:email
            };
            mailboxes.push(mailbox);
        }

        if (!String.isNullOrEmpty(label)) { mailbox.label = label; }
        if (!String.isNullOrEmpty(emailType)) { mailbox.emailType = emailType; }
        if (!String.isNullOrEmpty(emailServer)) { mailbox.emailServer = emailServer; }
        if (port != null && port > 0) { mailbox.port = port; }

        return mailbox;
    },


    removeEmailSource: function(id) {
        var userAccounts = this.get("accounts");
        if (userAccounts === null || userAccounts.length === 0) {
            return null;
        }

        for (var i = 0, l = userAccounts.length; i < l; i++) {
            if (userAccounts[i].emailSources != null && userAccounts[i].emailSources.length > 0) {
                var emailSource = _.findWhere(userAccounts[i].emailSources, {_id:id});
                if (emailSource != null) {
                    userAccounts[i].emailSources = _.without(userAccounts[i].emailSources, emailSource);
                    return;
                }
            }
        }
    },


    removeMailboxForSource: function(id, email) {
        var emailSource = this.getEmailSource(id);

        if (emailSource === null || emailSource.mailboxes === null || emailSource.mailboxes.length === 0) {
            return;
        }

        var mailbox = _.findWhere(emailSource.mailboxes, {email: email});
        if (mailbox != null) {
            emailSource.mailboxes = _.without(emailSource.mailboxes, [mailbox]);
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
    },
    //endregion


    //region TOKEN AUTHENTICATION
    setAuthToken: function (expirationSeconds) {
        if (expirationSeconds == null) {
            expirationSeconds = 120;
        }
        var token = $$.u.idutils.generateUniqueAlphaNumeric();
        this.set({authToken: token, authTokenExp: new Date().getTime() + expirationSeconds * 1000});
        return token;
    },


    clearAuthToken: function () {
        this.clear("authToken");
        this.clear("authTokenExp");
    },
    //endregion


    //region Encryption
    _encryptPassword: function(password) {
        //TODO: Use Salt and BCrypt or similar
        return crypto.hash(password);
    },


    _verifyPassword: function(password, encryptedPassword, fn) {
        crypto.verify(password, encryptedPassword, fn);
    }
    //endregion
}, {
    db: {
        storage: "mongo",
        table: "users",
        idStrategy: "increment",
        cache: true
    }
});

$$.m.User = user;

module.exports.User = user;
