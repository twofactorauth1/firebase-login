/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var accountDao = require('../../dao/account.dao');
var contactDao = require('../../dao/contact.dao');
var userDao = require('../../dao/user.dao');
var cmsDao = require('../../cms/dao/cms.dao');
var campaignManager = require('../../campaign/campaign_manager');
var contactActivityManager = require('../../contactactivities/contactactivity_manager.js');
var userManager = require('../../dao/user.manager');
var cookies = require('../../utils/cookieutil');
var Contact = require('../../models/contact');
var organizationDao = require('../../organizations/dao/organization.dao');
var request = require('request');
var fullContactConfig = require('../../configs/fullcontact.config');

var emailMessageManager = require('../../emailmessages/emailMessageManager');
var notificationConfig = require('../../configs/notification.config');
var fs = require('fs');
var geoIPUtil = require('../../utils/geoiputil');
var async = require('async');
var formidable = require('formidable');
var appConfig = require('../../configs/app.config');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "contact",

    dao: contactDao,

    initialize: function () {
        //GET
        app.get(this.url('myip'), this.getMyIp.bind(this));
        app.get(this.url('ipcheck/:ip'), this.compareIPs.bind(this));
        app.get(this.url('activities'), this.isAuthAndSubscribedApi.bind(this), this.findActivities.bind(this));
        app.get(this.url('activities/all'), this.isAuthAndSubscribedApi.bind(this), this.findActivities.bind(this));
        app.get(this.url('activities/read'), this.isAuthAndSubscribedApi.bind(this), this.findReadActivities.bind(this));
        app.get(this.url('activities/unread'), this.isAuthAndSubscribedApi.bind(this), this.findUnreadActivities.bind(this));

        app.get(this.url('shortform'), this.isAuthAndSubscribedApi.bind(this), this.getContactsShortForm.bind(this));
        app.get(this.url('shortform/:letter'), this.isAuthAndSubscribedApi.bind(this), this.getContactsShortForm.bind(this));
        app.get(this.url('search/email/:email'), this.isAuthAndSubscribedApi.bind(this), this.search.bind(this));
        app.get(this.url('search/name/:name'), this.isAuthAndSubscribedApi.bind(this), this.search.bind(this));
        app.get(this.url('search/:term'), this.isAuthAndSubscribedApi.bind(this), this.search.bind(this));
        app.get(this.url('tags'), this.isAuthAndSubscribedApi.bind(this), this.getContactTags.bind(this));
        app.get(this.url('count'), this.isAuthAndSubscribedApi.bind(this), this.getContactCount.bind(this));
        app.get(this.url('tagcounts'), this.isAuthAndSubscribedApi.bind(this), this.getContactTagCounts.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getContactById.bind(this));
        /*
         * Temp remove security for create contact.  Eventually, we will need to move this to a public API.
         */
        //app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createContact.bind(this));
        app.post(this.url(''), this.setup.bind(this), this.createContact.bind(this));
        app.put(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.updateContact.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteContact.bind(this));
        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listContacts.bind(this)); // for all contacts
        app.get(this.url('paged/list'), this.isAuthAndSubscribedApi.bind(this), this.listPagedContacts.bind(this)); // for paged contacts
        app.get(this.url('paged/list/filter'), this.isAuthAndSubscribedApi.bind(this), this.filterContacts.bind(this)); // filter contacts
        app.get(this.url('filter/:letter'), this.isAuthAndSubscribedApi.bind(this), this.getContactsByLetter.bind(this)); // for individual letter

        app.post(this.url(':id/user'), this.isAuthAndSubscribedApi.bind(this), this.createAccountUserFromContact.bind(this));
        //  app.post("/signupnews", this.signUpNews.bind(this));
        //app.post(this.url('signupnews'), this.isAuthApi, this.signUpNews.bind(this));
        app.post(this.url('signupnews'), this.setup.bind(this), this.signUpNews.bind(this));

        app.get(this.url(':accountId/contacts/:letter/:skip', "account"), this.isAuthAndSubscribedApi.bind(this), this.getContactsForAccountByLetter.bind(this));

        app.get(this.url(':accountId/contacts/:letter', "account"), this.isAuthAndSubscribedApi.bind(this), this.getContactsForAccountByLetter.bind(this));

        app.get(this.url(':id/activity'), this.isAuthAndSubscribedApi.bind(this), this.getActivityByContactId.bind(this));
        app.get(this.url(':id/activity/all'), this.isAuthAndSubscribedApi.bind(this), this.getActivityByContactId.bind(this));
        app.get(this.url(':id/activity/read'), this.isAuthAndSubscribedApi.bind(this), this.getReadActivityByContactId.bind(this));
        app.get(this.url(':id/activity/unread'), this.isAuthAndSubscribedApi.bind(this), this.getUnreadActivityByContactId.bind(this));

        app.get(this.url('activity/:id'), this.isAuthAndSubscribedApi.bind(this), this.getActivityById.bind(this));
        app.post(this.url('activity'), this.isAuthAndSubscribedApi.bind(this), this.createActivity.bind(this));
        app.post(this.url('activity/:id/read'), this.isAuthAndSubscribedApi.bind(this), this.markActivityRead.bind(this));
        app.post(this.url('activity/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateActivity.bind(this));
        //searching

        // http://localhost:3000/api/1.0/contact/:id/fullcontact
        app.post(this.url(':id/fullcontact'), this.isAuthAndSubscribedApi.bind(this), this.updateContactByFullContactApi.bind(this));

        //send mail on note creation
        app.post(this.url(':id/contactDetail'), this.isAuthAndSubscribedApi.bind(this), this.addContactNotes.bind(this));

        //duplicate check
        app.get(this.url('duplicates/check'), this.isAuthAndSubscribedApi.bind(this), this.checkForDuplicates.bind(this));
        app.post(this.url('duplicates/merge'), this.isAuthAndSubscribedApi.bind(this), this.mergeDuplicates.bind(this));

        app.post(this.url('importcsv'), this.isAuthApi.bind(this), this.importCsvContacts.bind(this));
        app.get(this.url('export/csv'), this.isAuthApi.bind(this), this.exportCsvContacts.bind(this));
        app.post(this.url('import/csv'), this.secureauth.bind(this, {requiresSub:true, requiresPriv:'MODIFY_CONTACT'}), this.importCSV.bind(this));
        app.post(this.url(':id/photo'), this.secureauth.bind(this, {requiresSub:true, requiresPriv:'MODIFY_CONTACT'}), this.updateContactPhoto.bind(this));
    },

    getMyIp: function(req, resp) {
        var self = this;
        var ip = self.ip(req);
        self.sendResult(resp, ip);
    },

    compareIPs: function(req, resp) {
        var self = this;
        var ip = req.params.ip;
        geoIPUtil.getGeoForIP(ip, function(err, ipinfo){
            geoIPUtil.getMaxMindGeoForIP(ip, function(err, result){
                var obj = {
                    ipinfo: ipinfo,
                    maxmind: result
                };
                self.sendResult(resp, obj);
            });
        });
    },

    //region CONTACT
    getContactById: function(req,resp) {

        var self = this;
        self.log.debug('>> getContactById');
        var contactId = req.params.id;

        if (!contactId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        contactId = parseInt(contactId);
        var accountId = parseInt(self.accountId(req));

        contactDao.getContactById(accountId, contactId, function(err, value) {
            self.log.debug('<< getContactById');
            if(!err && !value) {
                self.wrapError(resp, 404, null, 'Contact not found.', 'Contact not found.');
            } else if (!err && value != null) {

                var contactAccountId = value.get('accountId');
                self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_CONTACT, resp, value.toJSON("public"));
                //resp.send(value.toJSON("public"));
            } else {
                self.wrapError(resp, 401, null, err, value);
            }
        });
    },


    createContact: function (req, resp) {
        var self = this;
        self.log.debug('>> createContact');
        var accountId = parseInt(self.currentAccountId(req));
        if(req.body.created) {
            req.body.created.date = new Date();
        }

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self._saveOrUpdateContact(req, resp, true);
            }
        });

    },

    addContactNotes: function (req, resp) {
        var self = this;
        var note = req.body.emailData.note_value;
        var emailTo = req.body.emailData.sendTo;
        var fromEmail = req.body.emailData.fromEmail;
        var fromName = req.body.emailData.fromName;
        var user_note = req.body.note;
        var accountId = parseInt(self.accountId(req));
        var contactId = req.params.id;
        contactId = parseInt(contactId);
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                contactDao.getContactById(accountId, contactId, function(err, contact) {
                    self.log.debug('<< getContactById');
                    if(!err && !contact) {
                        self.wrapError(resp, 404, null, 'Contact not found.', 'Contact not found.');
                    }else {
                        var _notes = contact.get("notes") || [];
                        _notes.push(user_note);
                        contact.set("notes", _notes);
                        contactDao.saveOrUpdateContact(contact, function (err, value) {
                            if (!err) {
                                self.log.debug('>> saveOrUpdate', value);
                                self.sendResult(resp, value);
                                if(req.body.sendEmailToContact)
                                    self._sendNoteEmail(note, accountId, emailTo, fromEmail, fromName);                            
                            } else {
                                self.wrapError(resp, 500, "There was an error updating contact", err, value);
                            }
                        });
                    }
                });
                
            }
        });
    },

    updateContact: function (req, resp) {
        var self = this;
        self.log.debug('>> updateContact');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self._saveOrUpdateContact(req, resp, false);

            }
        });

    },


    _saveOrUpdateContact: function (req, resp, isNew) {

        var self = this;
        self.log.debug('>> _saveOrUpdateContact');
        var accountId = parseInt(self.accountId(req));

        var contact = new $$.m.Contact(req.body);
        var created = contact.get('created');

        if (created && _.isString(contact.get('created').date)) {
            created.date = moment(created.date).toDate();
        }
        if (isNew === true) {
            contact.set("accountId", accountId);
            if(this.userId(req)) {
                contact.createdBy(this.userId(req), $$.constants.social.types.LOCAL);
            }
        } else {
            var modified = {
                date: new Date(),
                by: self.userId(req)
            };
        }

        contactDao.saveOrUpdateContact(contact, function (err, value) {
            if (!err) {
                self.log.debug('>> saveOrUpdate', value);
                self.sendResult(resp, value);
                if(isNew===true) {
                    self.createUserActivity(req, 'CREATE_CONTACT', null, {id: value.id()}, function(){});
                } else {
                    self.createUserActivity(req, 'UPDATE_CONTACT', null, {id: value.id()}, function(){});
                }
            } else {
                self.wrapError(resp, 500, "There was an error updating contact", err, value);
            }
        });
    },

    importCsvContacts: function (req, resp) {
        var self = this;
        self.log.debug('>> importCsvContacts');
        var accountId = parseInt(self.currentAccountId(req));

        var contact = new $$.m.Contact(req.body);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                self.log.debug('contacts ', contact);
                self.sendResult(resp, {ok:true})
            }
        });

    },

    updateContactPhoto: function (req, resp) {
        var self = this;
        self.log.debug('>> updateContactPhoto');
        var accountId = parseInt(self.currentAccountId(req));

        var url = req.body.url;
        var contactId = req.params.id;
        contactId = parseInt(contactId);
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                contactDao.getContactById(accountId, contactId, function(err, contact) {
                    self.log.debug('<< getContactById');
                    if(!err && !contact) {
                        self.wrapError(resp, 404, null, 'Contact not found.', 'Contact not found.');
                    }else {
                        contact.set("photo", url);
                        contactDao.saveOrUpdateContact(contact, function (err, value) {
                            if (!err) {
                                self.log.debug('>> saveOrUpdate', value);
                                self.sendResult(resp, value);                                
                            } else {
                                self.wrapError(resp, 500, "There was an error updating contact", err, value);
                            }
                        });
                    }
                });
            }
        });

    },

    importCSV: function(req, resp) {
        var self = this;

        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> importCSV');

        var promotionId = req.params.id;
        form.parse(req, function(err, fields, files) {
            if(err) {
                self.wrapError(res, 500, 'fail', 'The upload failed', err);
                self = null;
                return;
            } else {

                var file = files['file'];
                console.log(file);
                /*
                var fileToUpload = {};
                fileToUpload.mimeType = file.type;
                fileToUpload.size = file.size;
                fileToUpload.name = file.name;
                fileToUpload.path = file.path;
                fileToUpload.type = file.type;
                promotionManager.updatePromotionAttachment(fileToUpload, promotionId, accountId, userId, function(err, value, file){
                    self.log.debug('>> updatePromotionAttachment');
                    self.sendResultOrError(res, err, value, 'Could not update promotion attachment');
                });
                */
            }
        });
    },

    exportCsvContacts: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> exportCsvContacts');
        var query = {accountId: accountId};
        var sortBy = req.query.sortBy || null;
        var sortDir = null;
        if(req.query.sortDir) {
            sortDir = parseInt(req.query.sortDir);
        }
        if(req.query.ids) {
            if (_.isArray(req.query.ids)) {
                query['_id'] = {'$in': _.map(req.query.ids, function (x) {return parseInt(x);})};
            } else {
                query['_id'] = parseInt(req.query.ids);
            }
        } else {
            var term = req.query.term;
            var fieldSearch = req.query;
            delete fieldSearch.term;
            delete fieldSearch.skip;
            delete fieldSearch.limit;
            delete fieldSearch.sortBy;
            delete fieldSearch.sortDir;
            if(term){
                term = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var regex = new RegExp('\.*'+term+'\.*', 'i');
                var orQuery = [
                    {_id:parseInt(term)},
                    {first:regex},
                    {middle:regex},
                    {last:regex},
                    {tags:regex},
                    {'details.emails.email':regex},
                    {'details.phones.number':regex},
                    {'details.addresses.address':regex},
                    {'details.addresses.address2':regex},
                    {'details.addresses.city':regex},
                    {'details.addresses.state':regex},
                    {'details.addresses.zip':regex},
                    {'details.addresses.country':regex}
                ];
                query["$or"] = orQuery;
            }
            if(fieldSearch){
                var fieldSearchArr = [];
                for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                    var key = Object.keys(fieldSearch)[i];
                    var value = fieldSearch[key];
                    self.log.debug('value:', value);
                    var obj = {};
                    value = value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    // Filter on email address
                    if(key == 'email'){
                        key = 'details.emails.email'
                    }
                    if(value){
                        if(key == "_id"){
                            obj[key] = parseInt(value);
                        } else if(key === 'tags'){
                            obj[key] = value;
                        } else {
                            obj[key] = new RegExp(value, 'i');
                        }

                        fieldSearchArr.push(obj);
                    }
                }
                if(fieldSearchArr.length){
                    query["$and"] = fieldSearchArr;
                }
            }
        }
        self.log.debug(accountId, userId, 'Using query:', query);
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                contactDao.findAndOrder(query, null, $$.m.Contact, sortBy, sortDir, function(err, contacts){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding contacts:', err);
                        self.wrapError(resp, 500, 'Error finding contacts', err);
                    } else {
                        self._asyncMakeCSV(contacts, function(err, csv){
                            self.log.debug(accountId, userId, '<< exportCsvContacts');
                            resp.set('Content-Type', 'text/csv');
                            resp.set("Content-Disposition",  "attachment;filename=csv.csv");
                            self.sendResult(resp, csv);
                        });
                    }
                });
            }
        });

    },

    _asyncMakeCSV: function(contacts, cb) {
        var headers = ['first', 'middle', 'last', 'email', 'created', 'type', 'tags', 'phone', 'unsubscribed', 'website', 'company', 'address', 'address2', 'city', 'state','zip', 'country', 'notes'];
        var extras = _.pluck(_.pluck(contacts, 'attributes'), 'extra');
        var extraHeaders = [];

        _.each(extras, function (extra) {
            extraHeaders = extraHeaders.concat(_.pluck(extra, 'label'));
        });

        extraHeaders = _.uniq(extraHeaders);

        var csv = headers.concat(extraHeaders).join(',') + '\n';

        async.eachLimit(contacts, 10, function(contact, callback){
            var tags = _.map(contact.get('tags'), function (x) {
                var tag = _.findWhere($$.constants.contact.contact_types.dp, {data: x});
                if (tag) {
                    return tag.label;
                } else {
                    return x;
                }
            });
            var parseString=function (text){
                if(text==undefined)
                    return ',';
                // "" added for number value
                text=""+text;
                if(text.indexOf(',')>-1 ||  /\r|\n/.exec(text))
                    return "\""+text.replace(/\r?\n|\r/g, " ")+"\",";
                else
                    return text+",";
            };
            csv += parseString(contact.get('first'));
            csv += parseString(contact.get('middle'));
            csv += parseString(contact.get('last'));
            csv += parseString(contact.getPrimaryEmail());
            csv += parseString(contact.get('created').date);
            csv += parseString(contact.get('type'));
            csv += parseString(tags.join(' | '));
            csv += parseString(contact.getPrimaryPhone());
            csv += parseString(contact.get('unsubscribed'));
            csv += parseString(contact.get('details').length && contact.get('details')[0].websites && contact.get('details')[0].websites[0] && contact.get('details')[0].websites[0].website ? contact.get('details')[0].websites[0].website  : '');
            csv += parseString(contact.get('details').length && contact.get('details')[0].company ? contact.get('details')[0].company : '');
			//add address to export

			const primaryAddress=contact.getPrimaryAddress();
			const fields = ['address', 'address2', 'city', 'state','zip', 'country'];  fields.forEach(function(field, index) {
				if (primaryAddress && primaryAddress[field]) {
					csv += parseString( primaryAddress[field] );
				}else{
					csv += parseString( '' );
				}
			});

            csv += parseString(contact.getNotes() );

            _.each(extraHeaders, function (header) {
                var extraField = _.findWhere(contact.get('extra'), {label: header});

                if (extraField) {
                    csv += parseString(extraField.value);
                } else {
                    csv += parseString('');
                }
            });
            csv += '\n';
            callback();
        }, function(err){
            cb(err, csv);
        });


    },

    deleteContact: function (req, resp) {

        var self = this;
        var contactId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if (!contactId) {
                    self.wrapError(resp, 400, null, "Invalid paramater for ID");
                }

                contactId = parseInt(contactId);
                contactDao.removeById(contactId, function (err, value) {
                    if (!err && value != null) {
                        self.sendResult(resp, {deleted:true});
                        self.createUserActivity(req, 'DELETE_CONTACT', null, {id: contactId}, function(){});
                    } else {
                        self.wrapError(resp, 401, null, err, value);
                    }
                });
            }
        });
    },

    listContacts: function (req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        self.log.debug('>> listContacts');

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.getContactsAll(accountId, skip, limit, function (err, value) {
                    self.log.debug('<< listContacts');
                    self.sendResultOrError(res, err, value, "Error listing Contacts");
                    self = null;
                });
            }
        });
    },

    listPagedContacts: function (req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        var sortBy = req.query.sortBy || "created.date";
        var sortDir = parseInt(req.query.sortDir) || -1;
        var term = req.query.term;
        self.log.debug('>> listPagedContacts');

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.listContacts(accountId, skip, limit, sortBy, sortDir, term, null, function (err, value) {
                    self.log.debug('<< listPagedContacts');
                    self.sendResultOrError(res, err, value, "Error listing Contacts");
                    self = null;
                });
            }
        });
    },

    filterContacts: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> contactsFilter');
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        var fieldSearch = req.query;
        var term = req.query.term;
        delete fieldSearch.term;
        delete fieldSearch.skip;
        delete fieldSearch.limit;
        delete fieldSearch.sortBy;
        delete fieldSearch.sortDir;
        
        /*
         * Search across the fields
         */

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.listContacts(accountId, skip, limit, sortBy, sortDir, term, fieldSearch, function (err, value) {
                    self.log.debug('<< contactsFilter');
                    self.sendResultOrError(res, err, value, "Error filtering Contacts");
                    self = null;
                });
            }
        });
    },

    getContactTags: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getContactTags');
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                contactDao.getContactTags(accountId, userId, function(err, tagAry){
                    self.log.debug('<< getContactTags');
                    self.sendResultOrError(resp, err, tagAry, 'Error getting contact tags');
                });
            }
        });
    },

    getContactCount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getContactCount');
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                contactDao.getContactCount(accountId, userId, function(err, count){
                    self.log.debug('<< getContactCount');
                    self.sendResultOrError(resp, err, {count:count}, 'Error getting contact count');
                });
            }
        });
    },

    getContactTagCounts: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getContactTagCounts');
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if(req.query.tags) {
                    var tagAry = [];
                    if(_.isArray(req.query.tags)){
                        tagAry = req.query.tags;
                    } else {
                        tagAry = req.query.tags.split(',');
                    }
                    contactDao.getContactTagCountByTag(accountId, userId, tagAry, function(err, count){
                        self.log.debug('<< getContactTagCounts');
                        self.sendResultOrError(resp, err, {count:count}, 'Error getting contact count');
                    });
                } else {
                    contactDao.getContactTagCount(accountId, userId, function(err, count){
                        self.log.debug('<< getContactTagCounts');
                        self.sendResultOrError(resp, err, {count:count}, 'Error getting contact count');
                    });
                }

            }
        });
    },

    getContactsByLetter: function (req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        var letter = req.params.letter;
        self.log.debug('>> getContactsByLetter');

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.getContactsShort(accountId, skip, letter, limit, function (err, value) {
                    self.log.debug('<< getContactsByLetter');
                    self.sendResultOrError(res, err, value, "Error listing contacts by letter [" + letter + "]");
                    self = null;
                });
            }
        });
    },

    search: function(req, resp) {
        var self = this;
        self.log.debug('>> search');
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        var term = null;



        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if(req.params.email) {
                    term = req.params.email;
                    contactDao.findContactsByEmail(accountId, term, function(err, contacts){
                        self.log.debug('<< search');
                        self.sendResultOrError(resp, err, contacts, "Error finding contacts");
                    });
                } else {
                    self.log.debug('<< search');
                    self.sendResult({ok:true});
                }
            }
        });
    },

    getContactsShortForm: function(req, res) {
        var self = this;
        self.log.debug('>> getContactsShortForm');
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 0);
        var letter = req.params.letter || 'all';
        var fields = {_id:1, first:1, last:1, photo:1};
        if(req.query['fields'] !== undefined) {
            if (req.query['fields'] instanceof Array) {
                var fieldsList = req.query['fields'];
            } else {
                var fieldsList = req.query['fields'].split(',');
            }
            fields = {};
            _.each(fieldsList, function(element, index, list){
                fields[element] = 1;
            });
            //fields = _.object(fieldsList, [1]);
            //console.dir(fields);
        }


        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.findContactsShortForm(accountId, letter, skip, limit, fields, function(err, list){
                    self.log.debug('<< getContactsShortForm');
                    self.sendResultOrError(res, err, list, "Error getting contact short form by letter [" + letter + "]");
                    self = null;
                });
            }
        });
    },

    /**
     *
     * @param req
     * @param resp
     */
    createAccountUserFromContact: function(req, resp) {
        var self = this;
        self.log.debug('>> createAccountUserFromContact');
        var accountId = parseInt(self.accountId(req));
        var contactId = parseInt(req.params.id);
        var username = req.body.username;
        var password = req.body.password;
        self.log.debug('Creating user with username [' + username + '] and password [' + password + ']');

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed){
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                contactDao.getById(contactId, $$.m.Contact, function(err, contact){
                    if(err) {
                        self.log.error('Error getting contact : ' + err);
                        return self.wrapError(resp, 500, err, 'Error getting contact');
                    } else if(contact === null) {
                        self.log.debug('Could not find contact');
                        return self.wrapError(resp, 404, null, 'Contact not found');
                    } else {
                        userManager.createAccountUserFromContact(accountId, username, password, contact, req.user, function(err, user){
                            self.log.debug('<< createAccountUserFromContact');
                            var responseObj = null;
                            if(user) {
                                responseObj =  user.toJSON("public", {accountId:self.accountId(req)});
                            }
                            self.createUserActivity(req, 'CREATE_USER', null, {contactId: contactId}, function(){});
                            return self.sendResultOrError(resp, err, responseObj, 'Error creating user');
                        });
                    }
                });
            }
        });

    },


    getContactsForAccountByLetter: function (req, resp) {

        var self = this;
        var accountId = req.params.accountId;
        var letter = req.params.letter;
        var skip = req.params.skip || 0;
        var limit = parseInt(req.query['limit'] || 0);

        if (!accountId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for account id");
        }

        accountId = parseInt(accountId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if (letter == null || letter == "") {
                    letter = "a";
                }

                if (!(letter == "all") && letter.length > 1) {
                    return self.wrapError(resp, 401, null, "Invalid parameter for :letter");
                }

                if (letter == "all") {
                    contactDao.getContactsAll(accountId, skip, limit, function (err, value) {
                        if (!err) {
                            return self.sendResult(resp, value);
                        } else {
                            return self.wrapError(resp, 500, "failed to retrieve contacts by letter", err, value);
                        }
                    });
                } else {
                    contactDao.getContactsShort(accountId, letter, limit, function (err, value) {
                        if (!err) {
                            return self.sendResult(resp, value);
                        } else {
                            return self.wrapError(resp, 500, "failed to retrieve contacts by letter", err, value);
                        }
                    });
                }
            }
        });

    },

    checkForDuplicates: function (req, res) {
        var self = this;
        self.log.debug('>> checkForDuplicates');

        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                contactDao.findDuplicates(accountId, function (err, value) {
                    self.log.debug('<< checkForDuplicates');
                    self.sendResultOrError(res, err, value, "Error checking for duplicate contacts");
                    self = null;
                });
            }
        });

    },

    /**
     *
     * Body of request can be empty or an array of contact IDs to merge.
     */
    mergeDuplicates: function (req, res) {
        var self = this;
        self.log.debug('>> mergeDuplicates');

        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var dupeAry = _.toArray(req.body);

                contactDao.mergeDuplicates(dupeAry, accountId, function (err, value) {
                    self.log.debug('<< mergeDuplicates');
                    self.sendResultOrError(res, err, value, "Error merging duplicate contacts");
                    self.createUserActivity(req, 'MERGE_CONTACTS', null, null, function(){});
                    self = null;
                });
            }
        });


    },
    //endregion CONTACT

    /**
     * No Security needed.
     * @param req
     * @param resp
     */
    signUpNews: function (req, resp) {
        var self = this, contact, accountToken, deferred;
        self.log.debug('>> signUpNews');
        self.log.debug('>> host', req.get("host"));
        //req.get("host")

        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if(err) {
                self.log.error('Error signing up: ' + err);
                req.flash("error", value.toString());
                return self.wrapError(resp, 500, "There was a problem signing up.  Please try again later.", err, value);
            } else {
                console.dir(req.body);
                var account = value;
                //TODO: check if contact exists
                var query = {};
                query.accountId = value.id();
                query['details.emails.email'] = "";
                if(req.body.details[0].emails.length){
                    var emailStr = req.body.details[0].emails[0].email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    query['details.emails.email'] = new RegExp('^'+emailStr+'$', "i");
                }
                var skipWelcomeEmail = req.body.skipWelcomeEmail;
                var fromContactEmail = req.body.fromEmail;
                var campaignId = req.body.campaignId;
                var tagSet = campaignId ? req.body.campaignTags : [];
                if(!tagSet){
                    tagSet = [];
                }
                var emailId = req.body.emailId;
                var sendEmail = req.body.sendEmail;
                var fromContactName = req.body.fromName;
                var activity = req.body.activity;
                var contact_type = req.body.contact_type;
                var uniqueEmail = req.body.uniqueEmail;
                var accountSubdomain = value.get("subdomain");
                console.log('req.body ', req.body);

                if (!contact_type || !contact_type.length) {

                    tagSet.push('ld');
                } else {
                    tagSet = tagSet.concat(contact_type);
                }
                var extra = req.body.extra;
                var passkey = '';
                if(extra) {
                    _.each(extra, function(extraField){
                        if(extraField.name === 'passkey')  {
                            passkey = extraField.value;
                        } else if(extraField.name === 'TesscoAccountID') {
                            passkey = extraField.value;
                        }
                    });
                }
                /*
                 * Do some validation for orgId:5
                 */
                if(account.get('orgId') ===5 && account.get('oem') === false && account.get('passkey') && account.get('passkey') !== passkey) {
                    self.log.warn('Passkey [' + passkey + '] does not match the passkey on account [' + account.get('passkey') + ']');
                    return self.wrapError(resp, 400, 'Passkey mismatch', 'Account ID incorrect. Please try again or contact Tessco to confirm your Account ID.');
                }
                contactDao.findMany(query, $$.m.Contact, function(err, list){
                    if(err) {
                        self.log.error('Error checking for existing contact: ' + err);
                        return self.wrapError(resp, 500, "There was a problem signing up.  Please try again later")
                    }
                    if(list.length > 0 && uniqueEmail) {
                        return self.wrapError(resp, 409, "This user already exists for this account.");
                    }
                    self.log.debug('signing up contact with account: ' + value.get('token'));
                    var emailPreferences = value.get('email_preferences');
                    self.log.debug('emailPreferences: ' + emailPreferences);
                    if(emailPreferences.new_contacts === true && !req.body.activity) {
                        self.log.debug('emailPreferences.new_contacts: ' + emailPreferences.new_contacts);
                        var accountId = value.id();
                        var vars = [];

                        var toAddress = value.get('business').emails[0].email;
                        var toName = '';
                        /*
                         * Asynchronously send to each email in business.emails
                         */
                        var ccAry = [];
                        var business = value.get('business') || {};
                        var emails = business.emails;
                        if(emails.length > 1) {
                            for(var i=1; i<emails.length; i++) {
                                ccAry.push(emails[i].email);
                            }
                        }
                        var fromAddress = null;
                        var fromName = business.name;
                        emailMessageManager.sendNewCustomerEmail(toAddress, toName, fromName, fromAddress, accountId, vars, ccAry, function(err, value){
                            self.log.debug('email sent');
                        });

                    }
                    delete req.body.skipWelcomeEmail;
                    delete req.body.fromEmail;
                    delete req.body.fromName;
                    delete req.body.activity;
                    delete req.body.contact_type;
                    delete req.body.uniqueEmail;

                    var contact = new $$.m.Contact(req.body);
                    contact.set('accountId', value.id());
                    self.log.debug('contact_type ', contact_type);
                    if (!contact_type || !contact_type.length) {
                        contact.set('type', 'ld');
                    } else {
                        contact.set('type', 'ld');
                    }
                    contact.set('tags', _.uniq(tagSet));
                    if(contact.get('fingerprint')) {
                        contact.set('fingerprint', ''+contact.get('fingerprint'));
                    }
                    geoIPUtil.getMaxMindGeoForIP(self.ip(req), function(err, value){
                        self.log.debug('Got the following: ', value);
                        if(!err && value) {
                            /*
                             Assume: {
                             "ip": "8.8.8.8",
                             "city": "Mountain View",
                             "region": "California",
                             "country": "US",
                             "loc": "37.3860,-122.0838",
                             "postal": "94040"
                             }
                             */
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
                            contact.createAddress(null, null, null, null, city, state, zip, country, countryCode, displayName, lat, lon, true, true);
                        }
                        var ip = value ? value.ip : null;
                        contactDao.createSignUpContact(contact, function(err, savedContact){
                            if(err) {
                                self.log.error('Error signing up: ' + err);
                                req.flash("error", 'There was a problem signing up.  Please try again later.');
                                return self.wrapError(resp, 500, "There was a problem signing up.  Please try again later.", err, value);
                            } else {
                                self.log.debug('campaignId: ', campaignId);
                                self.log.debug('emailId: ', emailId);
                                self.log.debug('sendEmail: ', sendEmail);

                                //sendEmail is usually a string, convert to boolean
                                var sendEmailBoolean = (sendEmail && (sendEmail===true || sendEmail.toLowerCase() === 'true'));
                                sendEmail = sendEmailBoolean;

                                /*
                                 * If there is a campaign associated with this signup, update it async.
                                 */
                                if(campaignId && !sendEmail) {
                                    self.log.debug('Updating campaign with id: ' + campaignId);
                                    campaignManager.handleCampaignSignupEvent(query.accountId, campaignId, savedContact.id(), function(err, value){
                                        if(err) {
                                            self.log.error('Error handling campaign signup: ' + err);
                                            return;
                                        } else {
                                            self.log.debug('Handled signup.');
                                            return;
                                        }
                                    });
                                }
                                //TODO: add a param to not send the welcome.
                                //skipWelcomeEmail !== 'true' && skipWelcomeEmail !== true &&
                                if(emailId && sendEmail) {
                                    /*
                                     * Send welcome email.  This is done asynchronously.
                                     *
                                     * Here are the steps... maybe this should go somewhere else?
                                     *
                                     * 1. Get the account from session
                                     * 2. Get Page with page_type:email (if it does not exist, goto: 8)
                                     * 3. Get the HTML from the email component
                                     * 4. Set it as data.content
                                     * 5. Call app.render('email/base_email', data...
                                     * 6. Pass it to emailMessageManager
                                     * 7. RETURN
                                     * 8. Get the default welcome html if no page exists
                                     * 9. Call emailMessageManager
                                     */

                                    accountDao.getAccountByID(query.accountId, function(err, account){
                                        if(err) {
                                            self.log.error('Error getting account: ' + err);
                                            self.log.error('No email will be sent.');
                                        } else {
                                            cmsDao.getEmailById(emailId, function(err, emailPage){
                                                if(err || emailPage === null) {
                                                    self.log.debug('Could not get email page.  Using default.');
                                                    fs.readFile(notificationConfig.THANKS_HTML, 'utf-8', function(err, htmlContent){
                                                        if(err) {
                                                            self.log.error('Error getting welcome email file.  Welcome email not sent for accountId ' + value.id());
                                                        } else {
                                                            self.log.debug('value ', value);
                                                            var contactEmail = savedContact.getEmails()[0];
                                                            var contactName = savedContact.get('first') + ' ' + savedContact.get('last');
                                                            var fromEmail = fromContactEmail || notificationConfig.WELCOME_FROM_EMAIL;
                                                            self.log.debug('sending email to: ', contactEmail);
                                                            self.log.debug('sending email from: ', fromContactEmail);

                                                            var vars = [];

                                                            //skipping welcome email for now
                                                            self.log.warn("No email content.  Skipping");
                                                            /*
                                                             emailMessageManager.sendAccountWelcomeEmail(fromEmail,
                                                                notificationConfig.WELCOME_FROM_NAME, contactEmail.email, contactName, notificationConfig.WELCOME_EMAIL_SUBJECT,
                                                                htmlContent, ip, savedContact.id(), vars, null, function(err, result){});
                                                                */
                                                        }
                                                    });
                                                } else {

                                                    app.render('emails/base_email_v2', emailMessageManager.contentTransformations(emailPage.toJSON()), function(err, html){
                                                        if(err) {
                                                            self.log.error('error rendering html: ' + err);
                                                            self.log.warn('email will not be sent.');
                                                        } else {
                                                            console.log('savedContact ', savedContact);
                                                            var contactEmail = savedContact.getEmails()[0].email;
                                                            var contactName = savedContact.get('first') + ' ' + savedContact.get('last');
                                                            var emailSubject = emailPage.get('subject');
                                                            var fromContactName = emailPage.get('fromName');
                                                            self.log.debug('sending email to: ',contactEmail);


                                                            var fromEmail = emailPage.get('fromEmail') || fromContactEmail || components[0].from_email || notificationConfig.WELCOME_FROM_EMAIL;
                                                            // var fromName = component.fromName || notificationConfig.WELCOME_FROM_NAME;
                                                            // var emailSubject = emailSubject || notificationConfig.WELCOME_EMAIL_SUBJECT;
                                                            var vars = [];

                                                            self.log.debug('notificationConfig.WELCOME_FROM_EMAIL ', notificationConfig.WELCOME_FROM_EMAIL);
                                                            self.log.debug('notificationConfig.WELCOME_FROM_NAME ', notificationConfig.WELCOME_FROM_NAME);
                                                            self.log.debug('contactEmail.email ', contactEmail);
                                                            self.log.debug('contactName ', contactName);
                                                            self.log.debug('emailSubject ', emailSubject);
                                                            self.log.debug('fromContactName ', fromContactName);
                                                            self.log.debug('notificationConfig.WELCOME_EMAIL_SUBJECT ', notificationConfig.WELCOME_EMAIL_SUBJECT);
                                                            //self.log.debug('value.id() ', value.id());
                                                            self.log.debug('savedContact.id() ', savedContact.id());
                                                            self.log.debug('vars ', vars);
                                                            self.log.debug('notificationConfig.WELCOME_FROM_EMAIL ', notificationConfig.WELCOME_FROM_EMAIL);

                                                            try{
                                                                emailMessageManager.sendAccountWelcomeEmail(fromEmail, fromContactName, contactEmail, contactName, emailSubject, html, query.accountId, null, vars, emailPage.get('_id'), savedContact.id(), function(err, result){
                                                                    self.log.debug('result: ', result);
                                                                });
                                                            } catch(exception) {
                                                                self.log.error(exception);
                                                            }

                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    self.log.debug('Skipping email.');
                                }
                                //create contact_form activity
                                if(activity){
                                    var contactActivity = new $$.m.ContactActivity({
                                        accountId: query.accountId,
                                        contactId: savedContact.id(),
                                        activityType: activity.activityType,
                                        note: activity.note,
                                        start:new Date(),
                                        extraFields: activity.contact,
                                        sessionId: activity.sessionId
                                    });
                                    contactActivityManager.createActivity(contactActivity, function(err, value){
                                        if(err) {
                                            self.log.error('Error creating subscribe activity: ' + err);
                                            //if we can't create the activity... that's fine.  We have already created the contact.
                                        }
                                    });
                                }

                                //create contact activity
                                var formSubmissionActivity = new $$.m.ContactActivity({
                                    accountId: query.accountId,
                                    contactId: savedContact.id(),
                                    activityType: $$.m.ContactActivity.types.FORM_SUBMISSION,
                                    start:new Date()
                                });
                                contactActivityManager.createActivity(formSubmissionActivity, function(err, value){
                                    if(err) {
                                        self.log.error('Error creating subscribe activity: ' + err);
                                        //if we can't create the activity... that's fine.  We have already created the contact.
                                    }
                                    self.createUserActivity(req, 'CREATE_CONTACT', null, {id: savedContact.id()}, function(){});
                                    return self.sendResult(resp, savedContact);
                                });

                                if(emailPreferences.new_contacts === true && activity){
                                    var accountEmail = null;

                                    if(account && account.get("business") && account.get("business").emails && account.get("business").emails[0] && account.get("business").emails[0].email) {
                                        self.log.debug('user email: ', account.get("business").emails[0].email);
                                        accountEmail = account.get("business").emails[0].email;
                                        var ccAry = [];
                                        var emails = account.get('business').emails;
                                        if(emails.length > 1) {
                                            for(var i=1; i<emails.length; i++) {
                                                ccAry.push(emails[i].email);
                                            }
                                        }
                                        var fromName = account.get('business').name;
                                        if(account.get("orgId")!==5 || account.get("activated")){
                                            self._sendEmailOnCreateAccount(accountEmail, activity.contact, account.id(), ccAry, tagSet, accountSubdomain, true, fromName, account, savedContact);
                                        }
                                    } else {

                                        if(account.get("orgId")!==5 || account.get("activated")){
                                            var fromName = '';
                                            if(account && account.get('business')) {
                                                fromName = account.get('business').name;
                                            }
                                            userDao.getUserAccount(account.id(), function(err, user){
                                                accountEmail = user.get("email");
                                                self._sendEmailOnCreateAccount(accountEmail, activity.contact, account.id(), null, tagSet, accountSubdomain, false, fromName, account, savedContact);
                                            })
                                        }
                                    }

                                }
                            }
                        });
                    });

                });

            }
        });

    },


    //region CONTACT ACTIVITY
    getActivityByContactId: function (req, resp) {

        var self = this;
        self.log.debug('>> getActivityByContactId');

        var contactId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        if (!contactId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for contact id");
        }
        contactId = parseInt(contactId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var skip, limit;
                if(req.query.skip) {
                    skip = parseInt(req.query.skip);
                }
                if(req.query.limit) {
                    limit = parseInt(req.query.limit);
                }


                contactActivityManager.listActivitiesByContactId(accountId, contactId, skip, limit, null, function(err, value){
                    self.log.debug('<< getActivityByContactId');
                    self.sendResultOrError(resp, err, value, "Error getting activity by contactId.");
                    self = null;
                });
            }
        });

    },

    getReadActivityByContactId: function(req, resp) {
        var self = this;
        self.log.debug('>> getReadActivityByContactId');

        var contactId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        if (!contactId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for contact id");
        }
        contactId = parseInt(contactId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var skip, limit;
                if(req.query.skip) {
                    skip = parseInt(req.query.skip);
                }
                if(req.query.limit) {
                    limit = parseInt(req.query.limit);
                }


                contactActivityManager.listActivitiesByContactId(accountId, contactId, skip, limit, 'true', function(err, value){
                    self.log.debug('<< getReadActivityByContactId');
                    self.sendResultOrError(resp, err, value, "Error getting activity by contactId.");
                    self = null;
                });
            }
        });
    },

    getUnreadActivityByContactId: function(req, resp) {
        var self = this;
        self.log.debug('>> getUnreadActivityByContactId');

        var contactId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        if (!contactId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for contact id");
        }
        contactId = parseInt(contactId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var skip, limit;
                if(req.query.skip) {
                    skip = parseInt(req.query.skip);
                }
                if(req.query.limit) {
                    limit = parseInt(req.query.limit);
                }


                contactActivityManager.listActivitiesByContactId(accountId, contactId, skip, limit, 'false', function(err, value){
                    self.log.debug('<< getUnreadActivityByContactId');
                    self.sendResultOrError(resp, err, value, "Error getting activity by contactId.");
                    self = null;
                });
            }
        });
    },


    getActivityById: function (req, resp) {
        var self = this;
        self.log.debug('>> getActivityById');
        var activityId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if (!activityId) {
                    return self.wrapError(resp, 400, null, "Invalid parameter for activity id");
                }

                contactActivityManager.getActivityById(activityId, function(err, value){
                    self.log.debug('<< getActivityById');
                    self.sendResultOrError(resp, err, value, "Error getting activity by ID.");
                    self = null;
                });
            }
        });

    },


    createActivity: function (req, resp) {
        var self = this;
        self.log.debug('>> createActivity');

        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var contactActivity = new $$.m.ContactActivity(req.body);
                contactActivity.set('accountId', accountId);

                contactActivityManager.createActivity(contactActivity, function(err, value){
                    self.log.debug('<< getActivityById');
                    self.sendResultOrError(resp, err, value, "Error getting activity by ID.");
                    self.createUserActivity(req, 'CREATE_ACTIVITY', null, null, function(){});
                    self = null;
                });
            }
        });

    },

    /**
     * The following query parameters are allowed (but none are required):
     * - contactId
     * - activityType (multiple types can be passed separated by a comma)
     * - note (the search will be a substring match.  No need to pass wildcards)
     * - detail (the search will be a substring match.  No need to pass wildcards)
     * - before (a timestamp for searching.  All results will have a start time <= this parameter)
     * - after (a timestamp for searching.  All results will have a start time >= this parameter)
     * - skip
     * - limit
     * - read (a boolean indicating if the activity has been 'seen')
     *
     */
    findActivities: function(req, res) {
        var self = this;
        self.log.debug('>> findActivities');

        return self._doFindActivities(req, res, null, 'findActivities');

    },

    findReadActivities: function(req, resp) {
        var self = this;
        self.log.debug('>> findReadActivities');

        return self._doFindActivities(req, resp, 'true', 'findReadActivities');
    },

    findUnreadActivities: function(req, resp) {
        var self = this;
        self.log.debug('>> findUnreadActivities');

        return self._doFindActivities(req, resp, 'false', 'findUnreadActivities');
    },

    _doFindActivities: function(req, resp, read, method) {
        var self = this;

        var accountId = parseInt(self.accountId(req));
        self.log.debug('>> accountId', accountId);
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var contactId = req.query['contactId'];
                var activityTypes = req.query['activityType'];
                var activityTypeAry = [];
                if(activityTypes) {
                    if(activityTypes.indexOf(',') != -1) {
                        activityTypeAry = activityTypes.split(',');
                    } else {
                        activityTypeAry.push(activityTypes);
                    }
                }
                var noteText = req.query['note'];
                var detailText = req.query['detail'];
                var beforeTimestamp = req.query['before'];
                var afterTimestamp = req.query['after'];

                var skip, limit;
                if(req.query.skip) {
                    skip = parseInt(req.query.skip);
                }
                if(req.query.limit) {
                    limit = parseInt(req.query.limit);
                }
                var includeDeleted = false;
                if(req.query.includeDeleted && req.query.includeDeleted === 'true') {
                    includeDeleted = true;
                }


                contactActivityManager.findActivities(accountId, contactId, activityTypeAry, noteText, detailText,
                    beforeTimestamp, afterTimestamp, skip, limit, read, includeDeleted, function(err, list){
                        self.log.debug('<< ' + method);
                        self.sendResultOrError(resp, err, list, "Error finding activities");
                        self = null;
                    });
            }
        });
    },

    //Update data from FullContact API
    updateContactByFullContactApi: function (req, resp) {
        var self = this,
            email,
            flag = true,
            contactId;

        self.log.debug('>> updateContactByFullContactApi');

        contactId = parseInt(req.param('id'));
        //Getting Contact Data via ContactId
        if (!contactId) {
            self.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        contactDao.getById(contactId, function (err, value) {
            var flag = true;
            if (!err && value != null && value.attributes.details.length > 0) {

                self.checkPermissionForAccount(req, self.sc.privs.MODIFY_CONTACT, value.get('contactId'), function(err, isAllowed) {
                    if (isAllowed !== true) {
                        return self.send403(resp);
                    } else {
                        value.attributes.details.forEach(function (obj) {
                            if (obj.emails && obj.emails.length) {
                                obj.emails.forEach(function (eml) {
                                    email = eml;
                                })
                            }
                        });

                        //Get EmailId via req.body (Presently it is working only for one record in an array)
                        if (email) {
                            // Hit FullContactAPI
                            // https://api.fullcontact.com/v2/person.json?email=your-email-id&apiKey=your-key

                            request('https://api.fullcontact.com/v2/person.json?email=' + email + '&apiKey=' + fullContactConfig.key, function (error, response, body) {

                                if (!error && response.statusCode == 200) {
                                    body = JSON.parse(body);
                                    body["type"] = "fullcontact";

                                    value.attributes.details.forEach(function (detail) {
                                        if (detail.type == "fullcontact") {
                                            flag = false;
                                            detail = body;
                                        }
                                    });

                                    if (flag) {
                                        value.attributes.details.push(body);
                                    }

                                    //Update the Contact Data into DataBase
                                    contactDao.saveOrUpdate(value, function (err, vl) {
                                        if (!err) {
                                            self.sendResult(resp, vl);
                                        } else {
                                            self.wrapError(resp, 500, "There was an error updating contact", err, vl);
                                        }
                                    });
                                } else {
                                    console.log('FullContact has no data related to this user');
                                    resp.send({status: 'No Data Found with FullContact API'});
                                }
                            });
                        } else {
                            self.log.debug('>> updateContactByFullContactApi: email not found');
                            resp.send({status: 'email not found'});
                        }
                    }
                });
            }
            else {
                self.wrapError(resp, 401, null, err, value);
            }
        });


    },

    updateActivity: function (req, resp) {

    },

    markActivityRead: function(req, resp) {
        var self = this;
        self.log.debug('>> markActivityRead');
        var accountId = parseInt(self.accountId(req));
        var activityId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_CONTACT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                contactActivityManager.markActivityRead(activityId, function(err, value){
                    self.log.debug('<< markActivityRead');
                    self.sendResultOrError(resp, err, value, 'Error marking activity as read.');
                    self.createUserActivity(req, 'MARK_ACTIVITY_READ', null, {activityId: activityId}, function(){});
                    return;
                });
            }
        });

    },
    _sendNoteEmail: function(note, accountId, emailTo, fromEmail, fromName) {
        var self = this;
        var component = {};
        component.note = note;
        app.render('emails/new_user_note', component, function(err, html){
            if(err) {
                self.log.error('error rendering html: ' + err);
                self.log.warn('email will not be sent to ' + emailTo);
            } else {
                self.log.debug('Sending email to: ' + emailTo);

                var emailSubject = notificationConfig.NEW_NOTE_SUBJECT;
                var vars = [];

                emailMessageManager.sendBasicDetailsEmail(fromEmail, fromName, emailTo, null, emailSubject, html, accountId, [], '', null, null, function(err, result){
                    self.log.debug('result: ', result);
                });
            }
        });
    },

   _sendEmailOnCreateAccount: function(accountEmail, fields, accountId, ccAry, tagSet, accountSubdomain, suppressUnsubscribe, fromName, account, savedContact) {
        var self = this;
        var component = {};
        //component.logourl = 'https://s3.amazonaws.com/indigenous-account-websites/acct_6/logo.png';
        var text = [];
         for(var attributename in fields){
            text.push("<b>"+attributename+"</b>: "+fields[attributename]);
        }

        if(tagSet && tagSet.length){
            var tags = _.map(tagSet, function (x) {
            var tag = _.findWhere($$.constants.contact.contact_types.dp, {data: x});
              if (tag) {
                return tag.label;
              } else {
                return x;
              }
            });
            if(tags && tags.length){
                text.push("<b>tags</b>: "+tags.join(", "));
            }
        }
        self.log.debug(fields);
        self.log.debug('accountEmail ', accountEmail);
        component.title = "You have a new contact!";
        component.text = text;
        var orgId = account.get("orgId") || 0;
        var subdomain = account.get("subdomain"); 
        organizationDao.getById(orgId, $$.m.Organization, function(err, organization){
            var environment = appConfig.environment;
            var port = appConfig.port;
            var hostname = 'indigenous.io';
            var protocol = "https://";
            var hostname = organization.get("signupSettings") ? organization.get("signupSettings").suffix || "indigenous.io" : "indigenous.io";
            
            if(environment === appConfig.environments.DEVELOPMENT && appConfig.nonProduction){
                hostname = 'indigenous.local' + ":" + port;
                protocol = "http://";
            }
            else if(environment !== appConfig.environments.DEVELOPMENT && appConfig.nonProduction){
                hostname = 'test.' + hostname;
                protocol = "http://";
            }
            
            var url =  protocol + subdomain + "." + hostname + "/admin/#/contacts/" + savedContact.get("_id");
            component.contactUrl = url;
            app.render('emails/new_customer_created', component, function(err, html){
                if(err) {
                    self.log.error('error rendering html: ' + err);
                    self.log.warn('email will not be sent to account owner.');
                } else {
                    self.log.debug('sending email to: ', accountEmail);

                    var fromEmail = notificationConfig.FROM_EMAIL;
                    if(!fromName) {
                        fromName =  notificationConfig.WELCOME_FROM_NAME;
                    }
                    var emailSubject = notificationConfig.NEW_CUSTOMER_EMAIL_SUBJECT;
                    var vars = [];
                    if(accountSubdomain){
                        emailSubject = emailSubject + " ("+ accountSubdomain +")";
                    }

                    emailMessageManager.sendBasicEmail(fields.email, fromName, accountEmail, null, emailSubject, html, accountId, vars, '', ccAry, null, suppressUnsubscribe, function(err, result){
                        self.log.debug('result: ', result);
                    });
                }
            });

        })
        
    }

    //endregion CONTACT ACTIVITY
});

module.exports = new api();
