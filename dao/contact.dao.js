/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./base.dao');
var accountDao = require('./account.dao');
var userDao = require('./user.dao');
var contactActivityManager = require('../contactactivities/contactactivity_manager');
requirejs('constants/constants');
require('../models/contact');
var async = require('async');

var dao = {

    options: {
        name: "contact.dao",
        defaultModel: $$.m.Contact
    },

    getContactsShort: function (accountId,skip, letter, limit, fn) {
        var self=this;
        var nextLetter = String.fromCharCode(letter.charCodeAt() + 1);
        var query = {accountId: accountId, _last: { $gte: letter, $lt: nextLetter } };
        //var fields = {_id:1, accountId:1, first:1, last:1, photo:1, photoSquare:1, type:1, siteActivity:1, details:1};
        var fields = null;
        var obj = {query: query, fields: fields};
        //this.findManyWithFields(query, fields, fn);
    //    this.findManyWithLimit(query, limit, $$.m.Contact, fn);

        //TODO: this can be refactored into a parameter to this method.
        accountDao.getAccountByID(accountId, function (err, res) {

            var sort = res.get('settings')

            if (sort)
                sort = sort.sort_type;
            else
                sort = 'last';

            //['sort_type'] || 'last';

            //self.findAllWithFields(query, skip, sort, fields, fn);
            self.findAllWithFieldsAndLimit(query, skip, limit, sort, fields, $$.m.Contact, fn);
        });
    },

    findContactsShortForm: function(accountId, letter, skip, limit, fields, fn) {
        var self=this;
        self.log.debug('>> findContactsShortForm');

        var query = {};
        if(letter !='all') {
            var nextLetter = String.fromCharCode(letter.charCodeAt() + 1);
            query = {accountId: accountId, _last: { $gte: letter, $lt: nextLetter } };
        } else {
            query = {accountId: accountId};
        }

        //var fields = {_id:1, first:1, last:1, photo:1};

        accountDao.getAccountByID(accountId, function (err, res) {

            var sort = res.get('settings')

            if (sort) {
                sort = sort.sort_type;
            } else {
                sort = 'last';
            }

            self.findAllWithFieldsAndLimit(query, skip, limit, sort, fields, $$.m.Contact, fn);
        });
    },

    getContactsAll: function (accountId, skip, limit, fn) {
        //var query = {accountId: accountId, _last: { $gte: "a", $lt: "z" } };
        var self = this;
        self.log.debug('>> getContactsAll');
        var query = {accountId: accountId };
        var fields = null;
        var obj = {query: query, fields: fields};
        accountDao.getAccountByID(accountId, function (err, res) {

            var sort = res.get('settings')

            if (sort)
                sort = sort.sort_type;
            else
                sort = 'last';

            //['sort_type'] || 'last';

            //self.findAllWithFields(query, skip, sort, fields, fn);
            self.findAllWithFieldsAndLimit(query, skip, limit, sort, fields, $$.m.Contact, fn);
        });

    },


    getContactsBySocialIds: function (accountId, socialType, socialIds, fn) {
        var query = { accountId: accountId, "details.type": socialType, "details.socialId": { $in: socialIds} };
        this.findMany(query, fn);
    },


    saveOrMerge: function (contact, fn) {
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
        else if (String.isNullOrEmpty(_last)) {
            query = emailQ;
        } else {
            query = nameQ;
        }

        var dummyFxn = function () {

        };


        this.findMany(query, function (err, value) {
            if (err) {
                return fn(err, value);
            }

            var matched = false;
            var possibleDups = [];
            value.forEach(function (existing) {
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

                    self.saveOrUpdate(contact, function (err, value) {
                        if (err) {
                            return fn(err, value);
                        }

                        possibleDups.forEach(function (dup) {
                            dup.setPossibleDuplicate(value);
                            self.saveOrUpdate(dup, dummyFxn);
                        });

                        return fn(err, value);
                    });
                    return;
                } else {
                    self.saveOrUpdate(contact, fn);
                    return;
                }
            } else {
                self.log.info("Merging contact with id: " + matched.id());
                matched.mergeContact(contact);

                if (possibleDups && possibleDups.length > 0) {
                    possibleDups.forEach(function (dup) {
                        matched.setPossibleDuplicate(dup);
                        dup.setPossibleDuplicate(matched);
                        self.saveOrUpdate(dup, dummyFxn);
                    });
                }
                self.saveOrUpdate(matched, fn);
            }
        });
    },

    getContactByEmail: function (email, fn) {
        if (email == null) {
            return fn(null, null);
        }
        this.findOne({'email': email}, fn);
    },

    getContactByEmailAndUserId: function (email, userId, fn) {
        if (email == null || userId == null) {
            return fn(null, null);
        }
        this.findOne({'email': email, 'created.by': userId}, fn);
    },

    createContactFromEmail: function (email, accountToken, fn) {
        var self = this;
        console.log('Email (createUserFromEmail): ' + JSON.stringify(email));
        if (_.isFunction(accountToken)) {
            fn = accountToken;
            accountToken = null;
        }

        var self = this;
        this.getContactByEmail(email, function (err, value) {

            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "Contact with this username already exists");
            }

            var deferred = $.Deferred();

            accountDao.convertTempAccount(accountToken, function (err, value) {
                if (!err) {
                    deferred.resolve(value);
                } else {
                    deferred.reject();
                    return fn(err, value);
                }
            });

            deferred
                .done(function (account) {
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

                    self.saveOrUpdate(contact, function (err, value) {
                        if (!err) {
                            self.sendResult(err, value);
                        } else {
                            self.wrapError(err, 500, "There was an error updating contact", err, value);

                        }
                    });
                });
        });
    },

    createUserContactFromEmail: function (userId, email, fn) {
        var self = this;
        console.log('Email (createUserFromEmail): ' + JSON.stringify(email));

        var self = this;
        this.getContactByEmailAndUserId(email, userId, function (err, value) {

            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "Account with this email already exists for userId: " + userId);
            }

            userDao.getById(userId, function (err, user) {
                if (err || !user) {
                    return fn(err, "Error finding user");
                } else {

                }
                var userAccounts = user.get('accounts');
                var accountId;

                if (userAccounts != null && userAccounts.length > 0 && userAccounts[0] != null) {
                    accountId = userAccounts[0].accountId;
                } else {
                    return fn(true, "Failed to create contact, no account found");
                }

                var contact = new $$.m.Contact();
                contact.set('email', email);
                contact.set("accountId", accountId);
                contact.createdBy(userId, $$.constants.social.types.LOCAL);

                self.saveOrUpdate(contact, fn);
            });
        });
    },

    createContactFromData: function (data, accountToken, fn) {
        var self = this;
        var email = data.email
        console.log('Email (createUserFromEmail): ' + JSON.stringify(email));
        if (_.isFunction(accountToken)) {
            fn = accountToken;
            accountToken = null;
        }

        var self = this;
        this.getContactByEmail(email, function (err, value) {

            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "An account with this username already exists");
            }

            var deferred = $.Deferred();

            accountDao.convertTempAccount(accountToken, function (err, value) {
                if (!err) {
                    deferred.resolve(value);
                } else {
                    deferred.reject();
                    return fn(err, value);
                }
            });

            deferred
                .done(function (account) {
                    var accountId;

                    if (account != null) {
                        accountId = account.id();
                    }

                    if (accountId == null) {
                        return fn(true, "Failed to create user, no account found");
                    }
                    data.type="potential";
                    data.accountId=accountId;

                    var contact = new $$.m.Contact(data);


                    self.saveOrUpdate(contact, function (err, value) {
                        if (!err) {

                            fn(err, value);
                        } else {

                            fn(err, value);
                        }
                    });
                });
        });
    },

    findDuplicates: function(accountId, fn) {
        var self = this;
        self.log.debug('>> findDuplicates(' + accountId + ')');

        /*
         * Two ways to find duplicates:
         *  - firstName and lastName match
         *  - email match
         */
        var p1 = $.Deferred(), p2 = $.Deferred();
        var duplicates = [];


        //this is what we will actually use for mongo
        var groupCriteria = {_first: '$_first', _last: '$_last'};
        var matchCriteria = {'accountId': accountId };

        self.aggregate(groupCriteria, matchCriteria, $$.m.Contact, function(err, value){
            if(err) {
                p1.reject();
                self.log.error('Error during aggregate on first/last names: ' + err);
            } else {
                //self.log.debug('returning from aggregate on names');
                //console.dir(value);
                duplicates = duplicates.concat(value);
                p1.resolve();
            }
        });


        var aggregateStages = [
            {
                $project: {'details': 1, accountId: 1}
            },
            {
                $match: {'accountId': accountId }
            },
            {
                $unwind: '$details'
            },
            {
                $project: {'emails': '$details.emails' }
            },
            {
                $unwind: '$emails'
            },

            {
                $group: {
                    _id: {'emails': '$emails'},

                    // Count number of matching docs for the group
                    count: { $sum:  1 },

                    // Save the _id for matching docs
                    docs: { $push: "$_id" }
                }
            },
            {
                // Limit results to duplicates (more than 1 match)
                $match: {
                    count: { $gt : 1 }
                }
            }
        ];
        self.aggregateWithCustomStages(aggregateStages, $$.m.Contact, function(err, value){
            if(err) {
                //p2.reject();
                p2.resolve();//for now, skip past this error
                self.log.error('Error during aggregate on email: ' + err);
            } else {
                //self.log.debug('returning from aggregate on email');
                //console.dir(value);
                duplicates = duplicates.concat(value);
                p2.resolve();
            }
        });


        $.when(p1,p2).done(function(){
            //consolidate duplicates
            var dupeMap = [];
            var dupeMapIDs = [];

            /*
             * Iterate through the duplicates.  The 'docs' element on each duplicate is an array of contact IDs that
             * are potentially duplicate.  Check if we have identified *any* of them already by looking at an
             * intersection of the dupeMapIDs array and the docs element.  If none are in the intersection, add them all
             * to dupeMapIDs and push the group of duplicate IDs to the dupeMap.  If at least one is in the
             * intersection, add the other duplicate IDs to the dupeMapIDs and to the grouping in dupeMap.
             */
            _.each(duplicates, function(element, key, list){
                //console.log('iterating over element: ');
                //console.dir(element);
                if(_.intersection(dupeMapIDs, element.docs).length === 0) {
                    //console.log('brand new dupe');
                    //brand new duplicate
                    dupeMapIDs = dupeMapIDs.concat(element.docs);
                    dupeMap.push(element.docs);

                } else {
                    //already found it.  Make sure we know about all the IDs.
                    dupeMapIDs = _.union(dupeMapIDs, element.docs);
                    _.each(dupeMap, function(dupeMapEntry, dupeMapKey, dupeMapList){
                        if(_.intersection(element.docs, dupeMapEntry) !== 0) {
                            dupeMapEntry = _.union(dupeMapEntry, element.docs);
                        }
                    });
                }
            });
            self.log.debug('<< findDuplicates');
            fn(null, dupeMap);
        });
    },

    mergeDuplicates: function(dupeAry, accountId, fn) {
        var self = this;
        self.log.debug('>> mergeDuplicates('+ dupeAry + ',' + accountId + ')');
        console.dir(dupeAry);
        if(!dupeAry || dupeAry.length < 1) {
            self.log.debug('Merging all duplicates');
            self.findDuplicates(accountId, function(err, value){
                if(err) {
                    self.log.error('Exception during findDuplicates: ' + err);
                    fn(err, null);
                    return;
                } else {
                    var mergedContactAry = [];
                    //value is an array of duplicate Arrays.

                    async.eachSeries(value,
                        function(ary, callback){

                            self.mergeDuplicates(ary, accountId, function(err, mergedContact){
                                if(err) {
                                    self.log.error('Exception during mergeDuplicates: ' + err);
                                    fn(err, null);
                                    return;
                                } else {
                                    mergedContactAry.push(mergedContact);
                                    callback();
                                }
                            });
                        },
                        function(err){
                            if(err) {
                                self.log.error('Exception during mergeDuplicates: ' + err);
                                fn(err, null);
                                return;
                            } else {
                                //we're done here
                                self.log.debug('<< mergeDuplicates');
                                fn(null, mergedContactAry);
                            }
                        }
                    );
                }
            });

        } else {
            var mainContactID = dupeAry.shift();
            var mainContact = null;
            self.getById(mainContactID, $$.m.Contact, function(err, value){
                if(err) {
                    self.log.error('Exception during merge Duplicates: ' + err);
                    fn(err, null);
                    return;
                } else {
                    mainContact = value;
                    async.eachSeries(dupeAry,
                        function(item, callback){
                            self._safeMergeByContactAndID(mainContact, item, function(err, value){
                                if(err) {
                                    self.log.error('Exception during merge Duplicates: ' + err);
                                    fn(err, null);
                                    return;
                                } else {
                                    mainContact = value;
                                    callback();
                                }
                            });
                        },
                        function(err){
                            //all done
                            if(err) {
                                self.log.error('Exception during merge Duplicates: ' + err);
                                fn(err, null);
                                return;
                            } else {
                                self.log.debug('<< mergeDuplicates');
                                fn(null, mainContact);
                                return;
                            }
                        }
                    );
                }
            });
        }
    },

    /*
     * This method will merge the data from id2 into id2, w/o overwriting anything in id1.
     */
    _safeMergeByID: function(id1, id2, fn) {
        var self = this;
        self.log.debug('>> _safeMerge(' + id1 + ', ' + id2 + ')');

        self.getById(id1, $$.m.Contact, function(err, value){
            if(err) {
                self.log.error('Exception getting contact by id: ' + err);
                fn(err, null);
            } else {
                self._safeMergeByContactAndID(value, id2, fn);
                return;
            }
        });
    },

    _safeMergeByContactAndID: function(contact1, id2, fn) {
        var self = this;
        self.log.debug('>> _safeMergeByContactAndID(' + contact1 + ', ' + id2 + ')');

        self.getById(id2, $$.m.Contact, function(err, value){
            if(err) {
                self.log.error('Exception getting contact by id: ' + err);
                fn(err, null);
            } else {
                self._safeMergeByContact(contact1, value, fn);
                return;
            }
        });
    },

    _safeMergeByContact: function(contact1, contact2, fn) {
        var self = this;
        self.log.debug('>> _safeMergeByContact');
        var merged =  _.defaults(contact1, contact2);
        //union details, notes, siteActivity
        merged.set('details', _.union(contact1.get('details'), contact2.get('details')));
        merged.set('notes', _.union(contact1.get('notes'), contact2.get('notes')));
        merged.set('siteActivity', _.union(contact1.get('siteActivity'), contact2.get('siteActivity')));
        self.saveOrUpdate(merged, function(err, value){
            if(err) {
                self.log.error("Exception while removing merged contact: " + err);
                fn(err, null);
                return;
            } else {
                //delete contact 2
                self.remove(contact2, function(err, value){
                    if(err) {
                        self.log.error("Exception while removing merged contact: " + err);
                        fn(err, null);
                        return;
                    } else {
                        self.log.debug('<< _safeMergeByContact');
                        fn(null, merged);
                    }
                });
            }
        });
    },

    //Wrapper to create contactActivity
    saveOrUpdate: function(contact, fn) {
        var self = this;
        self.log.debug('>> saveOrUpdate');
        if ((contact.id() === null || contact.id() === 0 || contact.id() == "")) {
            //need to create the contactActivity
            baseDao.saveOrUpdate(contact, function(err, savedContact){
                if(err) {
                    self.log.error('Error creating contact: ' + err);
                    fn(err, null);
                } else {
                    var activity = new $$.m.ContactActivity({
                        accountId: savedContact.get('accountId'),
                        contactId: savedContact.id(),
                        activityType: $$.m.ContactActivity.types.ACCOUNT_CREATED,
                        note: "Contact created.",
                        start:new Date() //datestamp

                    });
                    contactActivityManager.createActivity(activity, function(err, value){
                        if(err) {
                            self.log.error('Error creating contactActivity for new contact with id: ' + savedContact.id());
                        } else {
                            self.log.debug('created contactActivity for new contact with id: ' + savedContact.id());
                        }
                    });
                    self.log.debug('<< saveOrUpdate');
                    fn(null, savedContact);
                }
            });
        } else {
            // just an update
            baseDao.saveOrUpdate(contact, fn);
        }

    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
