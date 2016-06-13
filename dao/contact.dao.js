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
var analyticsManager = require('../analytics/analytics_manager');
requirejs('constants/constants');
require('../models/contact');
var async = require('async');
var appConfig = require('../configs/app.config');
var geoIPUtil = require('../utils/geoiputil');

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
            self.log.debug('>> query ', query);
            self.log.debug('>> skip ', skip);
            self.log.debug('>> limit ', limit);
            self.log.debug('>> sort ', sort);
            self.log.debug('>> fields ', fields);

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

    findContactsByEmail: function(accountId, email, fn) {
        var self = this;
        var query = {
            'details.emails.email': email,
            accountId: accountId
        };
        self.findMany(query, $$.m.Contact, fn);
    },

    /**
     * @deprecated
     * This method does not work
     */
    getContactByEmail: function (email, fn) {
        if (email == null) {
            return fn(null, null);
        }
        this.findOne({'email': email}, fn);
    },

    getContactByEmailAndAccount: function(email, accountId, fn) {
        this.findOne({'details.emails.email':email, 'accountId':accountId}, fn);
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

    createContactLeadFromEmail: function(email, accountId, fn) {
        var self = this;
        self.log.debug('>> createContactLeadFromEmail');
        var contact = new $$.m.Contact();
        contact.set('email', email);
        contact.set('accountId', accountId);
        contact.set('type', $$.m.Contact.types.LEAD);

        self.saveOrUpdateContact(contact, function(err, value){
            self.log.debug('<< createContactLeadFromEmail');
            fn(err, value);
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

    createCustomerContact: function(user, accountId, fingerprint, ip, fn) {
        var self = this;
        self.log.debug('>> createCustomerContact');

        self.getContactByEmailAndAccount(user.get('email'), accountId, function(err, existingContact){
            if (err) {
                self.log.error('Error searching for contact by email: ' + err);
                return fn(err, null);
            }

            var p1 = $.Deferred();
            if (existingContact != null) {
                self.log.info('Attempted to create a new customer for an existing contact');
                var oldType = existingContact.get('type');
                existingContact.set('type', 'cu');//set type to customer
                existingContact.set('tags', ['cu']);
                existingContact.set('fingerprint', fingerprint);
                self.saveOrUpdate(existingContact, function(err, savedContact){
                    if(err) {
                        self.log.error('Error saving contact: ' + err);
                        p1.reject(err);
                    } else {
                        self.log.debug('Updated existing contact');
                        p1.resolve(existingContact);
                    }
                });
            } else {
                //TODO: new contact
                var newContact = new $$.m.Contact({
                    accountId: accountId,           //int
                    first:user.get('first'),             //string,
                    last:user.get('last'),              //string,
                    type:"cu",              //contact_types,
                    fingerprint:fingerprint,
                    tags: ['cu']

                });

                newContact.createOrUpdateDetails('emails', null, null, null, null, null, user.get('email'), null);
                if(ip) {
                    geoIPUtil.getGeoForIP(ip, function(err, value){
                        if(value) {
                            var city = value['city'] || '';
                            var state = value['region'] || '';
                            var zip = value['postal'] || '';
                            var country = value['country'] || '';
                            var countryCode = value['country'] || '';
                            var displayName = 'GEOIP';
                            var lat = '';
                            var lon = '';
                            if(value.loc) {
                                lat = value['loc'].split(',')[0];
                                lon = value['loc'].split(',')[1];
                            }
                            self.log.debug('creating address from ' + city + ', ' + state + ', ' + zip + ', ' + country);
                            newContact.createAddress(null, null, null, null, city, state, zip, country, countryCode, displayName, lat, lon, true, true);
                        }
                        self.saveOrUpdate(newContact, function(err, savedContact){
                            if(err) {
                                self.log.error('Error saving contact: ' + err);
                                p1.reject(err);
                            } else {
                                self.log.debug('created new contact');
                                p1.resolve(savedContact);
                            }
                        });
                    });
                } else {
                    self.saveOrUpdate(newContact, function(err, savedContact){
                        if(err) {
                            self.log.error('Error saving contact: ' + err);
                            p1.reject(err);
                        } else {
                            self.log.debug('created new contact');
                            p1.resolve(savedContact);
                        }
                    });
                }

            }
            $.when(p1).fail(function(err){
                return fn(err, null);
            });
            $.when(p1).done(function(savedContact){
                //create activity for subscription purchased
                /*
                 * If this is the main account, we are already creating this activity
                 */
                if(accountId === appConfig.mainAccountID) {
                    self.log.debug('<< createCustomerContact');
                    return fn(null, savedContact);
                } else {
                    var activity = new $$.m.ContactActivity({
                        accountId: savedContact.get('accountId'),
                        contactId: savedContact.id(),
                        activityType: $$.m.ContactActivity.types.SUBSCRIBE,
                        note: "Subscription purchased.",
                        start:new Date() //datestamp

                    });

                    contactActivityManager.createActivity(activity, function(err, value){
                        if(err) {
                            self.log.error('Error creating contactActivity for contact with id: ' + savedContact.id());
                            return fn(err, savedContact);
                        } else {
                            self.log.debug('<< createCustomerContact');
                            return fn(null, savedContact);
                        }
                    });
                }
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
            } else if(value === null){
                return fn(null, contact1);
            } else {
                self._safeMergeByContact(contact1, value, fn);
                return;
            }
        });
    },

    _safeMergeByContact: function(contact1, contact2, fn) {
        var self = this;
        self.log.debug('>> _safeMergeByContact');
        if(!contact2) {
            return fn(null, contact1);
        }
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
    saveOrUpdateContact: function(contact, fn) {
        var self = this;
        self.log.debug('>> saveOrUpdateContact');
        if ((contact.id() === null || contact.id() === 0 || contact.id() == "")) {
            /*
             * Look for the contact by accountId and email.  If found, do a merge.  If not, we're cool.
             */
            var accountId = contact.get('accountId');
            var primaryEmail = contact.getPrimaryEmail();
            self.getContactByEmailAndAccount(primaryEmail, accountId, function(err, existingContact){
                if(err) {
                    self.log.error('Error checking for existing contact: ', err);
                    fn(err, null);
                } else if(existingContact === null || !primaryEmail) {
                    //need to create the contactActivity
                    self.saveOrUpdate(contact, function(err, savedContact){
                        if(err) {
                            self.log.error('Error creating contact: ' + err);
                            fn(err, null);
                        } else {
                            var activity = new $$.m.ContactActivity({
                                accountId: savedContact.get('accountId'),
                                contactId: savedContact.id(),
                                activityType: $$.m.ContactActivity.types.CONTACT_CREATED,
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
                            self._createHistoricActivities(savedContact.get('accountId'), savedContact.id(), savedContact.get('fingerprint'), function(err, val){
                                if(err) {
                                    self.log.error('Error creating historic activities for new contact: ' + err);
                                } else {
                                    self.log.debug('Successfully created historic activities for new contact');
                                }
                            });
                            self.log.debug('<< saveOrUpdateContact');
                            fn(null, savedContact);
                        }
                    });
                } else {
                    //this contact already exists.  Let's merge in new data.
                    var existingId = existingContact.id();
                    self.log.warn('Merging contact with id: ' + existingId);
                    contact.set('created', existingContact.get('created'));
                    self.log.warn('Here is what we have:', contact);
                    var merged =  _.extend(existingContact, contact);
                    merged.set('_id', existingId);
                    self.log.warn('Here is what we have now:', merged);
                    //union details, notes, siteActivity
                    merged.set('details', _.union(existingContact.get('details'), contact.get('details')));
                    merged.set('notes', _.union(existingContact.get('notes'), contact.get('notes')));
                    merged.set('siteActivity', _.union(existingContact.get('siteActivity'), contact.get('siteActivity')));
                    return self.saveOrUpdate(merged, fn);
                }
            });



        } else {
            // just an update
            self.saveOrUpdate(contact, fn);
        }

    },

    createSignUpContact: function(contact, fn) {
        var self = this;
        self.log.debug('>> saveOrUpdateContact');
        self.saveOrUpdate(contact, function(err, savedContact){
            if(err) {
                self.log.error('Error creating contact: ' + err);
                fn(err, null);
            } else {
                var activity = new $$.m.ContactActivity({
                    accountId: savedContact.get('accountId'),
                    contactId: savedContact.id(),
                    activityType: $$.m.ContactActivity.types.CONTACT_CREATED,
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
                self._createHistoricActivities(savedContact.get('accountId'), savedContact.id(), savedContact.get('fingerprint'), function(err, val){
                    if(err) {
                        self.log.error('Error creating historic activities for new contact: ' + err);
                    } else {
                        self.log.debug('Successfully created historic activities for new contact');
                    }
                });
                self.log.debug('<< saveOrUpdateContact');
                fn(null, savedContact);
            }
        });

    },

    _createHistoricActivities: function(accountId, contactId, fingerprint, fn) {
        //create PAGE_VIEW activities
        var self = this;
        self.log.debug('>> _createHistoricActivities');

        analyticsManager.findSessionEventsByFingerprint(fingerprint, accountId, function(err, list){
            if(err) {
                self.log.error('Error finding session events: ' + err);
                return fn(err, null);
            }

            async.each(list, function(sessionEvent, cb){
                var activity = new $$.m.ContactActivity({
                    accountId: accountId,
                    contactId: contactId,
                    activityType: $$.m.ContactActivity.types.PAGE_VIEW,
                    start: sessionEvent.get('session_start')
                });
                contactActivityManager.createActivity(activity, function(err, val){
                    if(err) {
                        self.log.error('Error creating activity: ' + err);
                        cb(err);
                    } else {
                        cb();
                    }
                });

            }, function(err){
                fn(err, null);
            });

        });
    },


    getContactById: function (accountId, contactId, fn) {
        this.findOne({'accountId': accountId, "_id": contactId}, fn);
    },


};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
