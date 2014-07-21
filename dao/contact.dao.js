/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./base.dao');
var accountDao = require('./account.dao');
requirejs('constants/constants');
require('../models/contact');

var dao = {

    options: {
        name:"contact.dao",
        defaultModel: $$.m.Contact
    },

    getContactsShort: function(accountId, letter, fn) {
        var nextLetter = String.fromCharCode(letter.charCodeAt() + 1);
        var query = {accountId: accountId, _last: { $gte: letter, $lt: nextLetter } };
        //var fields = {_id:1, accountId:1, first:1, last:1, photo:1, photoSquare:1, type:1, siteActivity:1, details:1};
        var fields = null;
        var obj = {query:query, fields:fields};
        this.findManyWithFields(query, fields, fn);
    },

    getContactsAll: function(accountId,skip, fn) {
        //var query = {accountId: accountId, _last: { $gte: "a", $lt: "z" } };
       var self=this;
        var query = {accountId: accountId };
        var fields = null;
        var obj = {query:query, fields:fields};
        accountDao.getAccountByID(accountId,function(err,res){

            var sort=res.get('settings')

            if(sort)
                sort=sort.sort_type;
            else
                sort='last';

                //['sort_type'] || 'last';

            self.findAllWithFields(query,skip,sort, fields, fn);
        })

    },



    getContactsBySocialIds: function(accountId, socialType, socialIds, fn) {
        var query = { accountId: accountId, "details.type":socialType, "details.socialId": { $in: socialIds} };
        this.findMany(query, fn);
    },


    saveOrMerge: function(contact, fn) {
        var self = this;
        var emails = contact.getEmails();

        var first = contact.get("first");
        var _last = contact.get("last");

        first = first != null ? first.toLowerCase() : "";
        _last = _last != null ? _last.toLowerCase() : "";

        var _first;
        if (first.length > 5) {
            _first = first.substr(0, 5);
        } else {
            _first = first;
        }

        //Find anything matching one of the emails, or the last name and the start of the first name
        var query;
        var emailQ = { "details.emails": { $in: emails } };
        var nameQ = { _last: _last };
        if (!String.isNullOrEmpty(_first)) {
            nameQ._first = { $regex: new RegExp('^' + _first, "i") };
        }

        if (String.isNullOrEmpty(_last) && emails.length == 0) {
            //Just save, nothing to test against.
            return self.saveOrUpdate(contact, fn);
        }
        else if (!String.isNullOrEmpty(_last) && emails.length > 0) {
            query = {
                $or: [
                    emailQ,
                    nameQ
                ]
            };
        }
        else if(String.isNullOrEmpty(_last)) {
            query = emailQ;
        } else {
            query = nameQ;
        }

        var dummyFxn = function() {

        };


        this.findMany(query, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            var matched = false;
            var possibleDups = [];
            value.forEach(function(existing) {
                if (matched !== false) {
                    //We have already matched, so this immediately becomes a possible duplicate
                    possibleDups.push(existing);
                    return;
                }

                //First check to see if we have a last name match
                if (existing.get("_last") == _last) {
                    //we have a matching last name...  do we have a matching email
                    if (emails.length > 0 && _.intersection(existing.getEmails(), emails).length > 0) {
                        matched = existing;
                    }

                    else if (!String.isNullOrEmpty(first) && existing.get("_first") == first) {
                        //we have matching first and last, try to confirm by finding one more piece of common data
                        var phones1 = contact.getPhones(), phones2 = existing.getPhones();
                        if (phones1.length > 0 && phones2.length > 0 && _.intersection(phones1, phones2).length > 0) {
                            matched = existing;
                        }

                        var zips1 = contact.getZipCodes(), zips2 = existing.getZipCodes();
                        if (zips1.length > 0 && zips2.length > 0 && _.intersection(zips1, zips2).length > 0) {
                            matched = existing;
                        }
                    }
                } else if (emails.length > 0 && _.intersection(existing.getEmails(), emails).length > 0) {
                    //We only have an email match... what do we want to do? -- not quite enough to go on?
                }

                if (matched === false) {
                    possibleDups.push(existing);
                }
            });

            if (matched === false) {
                if (possibleDups && possibleDups.length > 0) {
                    contact.setPossibleDuplicate(possibleDups);

                    self.saveOrUpdate(contact, function(err, value) {
                        if (err) {
                            return fn(err, value);
                        }

                        possibleDups.forEach(function(dup) {
                            dup.setPossibleDuplicate(value);
                            self.saveOrUpdate(dup, dummyFxn);
                        });

                        return fn(err, value);
                    }) ;
                    return;
                } else {
                    self.saveOrUpdate(contact, fn);
                    return;
                }
            } else {
                self.log.info("Merging contact with id: " + matched.id());
                matched.mergeContact(contact);

                if (possibleDups && possibleDups.length > 0) {
                    possibleDups.forEach(function(dup) {
                        matched.setPossibleDuplicate(dup);
                        dup.setPossibleDuplicate(matched);
                        self.saveOrUpdate(dup, dummyFxn);
                    });
                }
                self.saveOrUpdate(matched, fn);
            }
        });
    },

    getContactByEmail: function(email, fn) {
        if (email == null) {
            return fn(null, null);
        }
        this.findOne( {'email':email}, fn);
    },

    createContactFromEmail: function(email, accountToken, fn) {
       var self=this;
        console.log('Email (createUserFromEmail): '+JSON.stringify(email));
        if (_.isFunction(accountToken)) {
            fn = accountToken;
            accountToken = null;
        }

        var self = this;
        this.getContactByEmail(email, function(err, value) {

            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "An account with this username already exists");
            }

            var deferred = $.Deferred();

            accountDao.convertTempAccount(accountToken, function(err, value) {
                if (!err) {
                    deferred.resolve(value);
                } else {
                    deferred.reject();
                    return fn(err, value);
                }
            });

            deferred
                .done(function(account) {
                    var accountId;

                    if (account != null) {
                        accountId = account.id();
                    }

                    if (accountId == null) {
                        return fn(true, "Failed to create user, no account found");
                    }

                    var contact = new $$.m.Contact(req.body);


                    if (isNew === true) {
                        contact.set("accountId", this.accountId(req));
                        contact.createdBy(this.userId(), $$.constants.social.types.LOCAL);
                    }

                   self.saveOrUpdate(contact, function(err, value) {
                        if (!err) {
                            self.sendResult(err, value);
                         } else {
                            self.wrapError(err, 500, "There was an error updating contact", err, value);

                        }
                    });
                });
        });
    },
    createContactFromData: function(data, accountToken, fn) {
        var self=this;
        var email=data.email
        console.log('Email (createUserFromEmail): '+JSON.stringify(email));
        if (_.isFunction(accountToken)) {
            fn = accountToken;
            accountToken = null;
        }

        var self = this;
        this.getContactByEmail(email, function(err, value) {

            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "An account with this username already exists");
            }

            var deferred = $.Deferred();

            accountDao.convertTempAccount(accountToken, function(err, value) {
                if (!err) {
                    deferred.resolve(value);
                } else {
                    deferred.reject();
                    return fn(err, value);
                }
            });

            deferred
                .done(function(account) {
                    var accountId;

                    if (account != null) {
                        accountId = account.id();
                    }

                    if (accountId == null) {
                        return fn(true, "Failed to create user, no account found");
                    }
                    data.type="potential";
                    var contact = new $$.m.Contact(data);



                    self.saveOrUpdate(contact, function(err, value) {
                        if (!err) {

                            fn(err, value);
                        } else {

                            fn(err, value);
                        }
                    });
                });
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
