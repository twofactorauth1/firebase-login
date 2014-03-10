var baseDao = require('./base.dao');
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
        var fields = {_id:1, accountId:1, first:1, last:1, photo:1, photoSquare:1, type:1, siteActivity:1};

        var obj = {query:query, fields:fields};
        this.findManyWithFields(query, fields, fn);
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
            //we have nothing...
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

        this.findMany(query, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            var matched = false;
            value.forEach(function(existing) {
                if (matched !== false) {
                    return;
                }

                //First check to see if we have a last name match
                if (existing.get("_last") == _last) {
                    //we have a matching last name...  do we have a matching first name
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
                    //We only have an email match... what do we want to do?
                }
            });

            if (matched === false) {
                self.saveOrUpdate(contact, fn);
            } else {
                matched.mergeContact(contact);
                self.saveOrUpdate(matched, fn);
            }
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
