'use strict';
/*global app, $$*/
/*jslint unparam: true*/
(function (angular) {
    app.service('ContactService', ['$http', '$rootScope', '$cacheFactory', 'ImportContactService', 'contactConstant', 'userConstant', 'formValidations', '$q', function ($http, $rootScope, $cacheFactory, ImportContactService, contactConstant, userConstant, formValidations, $q) {
        var baseUrl = '/api/1.0/';

        this.getCache = function () {
            var cache = $cacheFactory.get('ContactService');
            if (cache) {
                return cache;
            }
            return $cacheFactory('ContactService');
        };

        this.getContacts = function (fn) {
            var apiUrl = baseUrl + ['contact'].join('/');
            return $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        };

        this.getContactsCount = function (fn) {
            var apiUrl = baseUrl + ['contact', 'count'].join('/');
            return $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        };

        this.getPagedContacts = function (pagingParams, isFieldSearchEnabled, fn) {
            var urlParts = ['contact', 'paged', 'list'];
            var _method = "GET";
            var _qString = "?limit=" + pagingParams.limit + "&skip=" + pagingParams.skip;
            if (pagingParams.sortBy) {
                _qString += "&sortBy=" + pagingParams.sortBy + "&sortDir=" + pagingParams.sortDir;
            }
            if (pagingParams.globalSearch) {
                _qString += "&term=" + encodeURIComponent(pagingParams.globalSearch);
            }
            if (isFieldSearchEnabled) {
                _method = "GET";
                urlParts.push('filter');
                _.each(pagingParams.fieldSearch, function (value, key) {
                    if(value != null){
                        _qString += '&' + key + '=' + encodeURIComponent(value);
                    }
                });
            }
            var apiUrl = baseUrl + urlParts.join('/') + _qString;
            return $http({
                url: apiUrl,
                method: _method,
                data: angular.toJson(pagingParams.fieldSearch)
            })
                .success(function (data) {
                    fn(data);
                });
        };

        this.getTotalContacts = function (fn) {
            var apiUrl = baseUrl + ['contact', 'count'].join('/');
            var _method = 'GET';
            return $http({
                url: apiUrl,
                method: _method
            }).success(function (data) {
                fn(data)
            });
        };

        this.getContactsShortForm = function (fields, fn) {
            var apiUrl = baseUrl + ['contact', 'shortform'].join('/');
            var data = this.getCache().get('contacts');
            var cache = this.getCache();

            if (data) {
                console.info('Contacts call hit cache');
                fn(data);
            } else {
                $http({
                    url: apiUrl,
                    method: 'GET',
                    params: {
                        fields: fields
                    }
                }).success(function (data) {
                    cache.put('contacts', data);
                    fn(data);
                });
            }
        };

        this.getContact = function (id, fn) {
            var apiUrl = baseUrl + ['contact', id].join('/');
            $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                })
                .error(function (err) {
                    console.warn('Error while fetching data', err);
                    fn(null, err);
                });
        };

        this.deleteContact = function (id, fn) {
            var contacts = this.getCache().get('contacts');
            if (contacts) {
                contacts.forEach(function (value, index) {
                    if (value._id === id) {
                        contacts.splice(index, 1);
                    }
                });
                this.getCache().put('contacts', contacts);
            }

            var apiUrl = baseUrl + ['contact', id].join('/');
            $http.delete(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        };

        this.deleteContactPromise = function (id) {
            var contacts = this.getCache().get('contacts');
            if (contacts) {
                contacts.forEach(function (value, index) {
                    if (value._id === id) {
                        contacts.splice(index, 1);
                    }
                });
                this.getCache().put('contacts', contacts);
            }

            var apiUrl = baseUrl + ['contact', id].join('/');
            return $http.delete(apiUrl);
        };

        this.postContact = function (cache, contact, fn) {
            var contacts = cache.get('contacts');

            var apiUrl = baseUrl + ['contact'].join('/');
            $http.post(apiUrl, contact)
                .success(function (data) {
                    if (contacts) {
                        contacts.push(data);
                        cache.put('contacts', contacts);
                    }
                    fn(data);
                });
        };


        this.updateContactPhoto = function (contactId, url, fn) {
            var contacts = this.getCache().get('contacts');

            var apiUrl = baseUrl + ['contact', contactId, 'photo'].join('/');
            $http.post(apiUrl, {url: url})
                .success(function (data) {
                    if (contacts) {
                        contacts.forEach(function (value, index) {
                            if (value._id === contactId) {
                                contacts[index] = data;
                            }
                        });
                        cache.put('contacts', contacts);
                    }
                    fn(data);
                });
        };


        this.putContact = function (cache, contact, fn) {
            var contacts = cache.get('contacts');

            var apiUrl = baseUrl + ['contact'].join('/');
            $http.put(apiUrl, contact)
                .success(function (data) {
                    if (contacts) {
                        contacts.forEach(function (value, index) {
                            if (value._id === contact._id) {
                                contacts[index] = contact;
                            }
                        });
                        cache.put('contacts', contacts);
                    }
                    fn(data);
                });
        };

        this.putContactPromise = function (contact) {
            var self = this;
            var cache = self.getCache();
            var deferred = $q.defer();
            var contacts = cache.get('contacts');
            var apiUrl = baseUrl + ['contact'].join('/');

            $http.put(apiUrl, contact)
                .success(function (data) {
                    if (contacts) {
                        contacts.forEach(function (value, index) {
                            if (value._id === contact._id) {
                                contacts[index] = contact;
                            }
                        });
                        cache.put('contacts', contacts);
                    }
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.saveContact = function (contact, fn) {
            var apiFn = null;
            if (contact._id) {
                apiFn = this.putContact;
            } else {
                apiFn = this.postContact;
            }
            apiFn(this.getCache(), contact, fn);
        };

        this.addContactNote = function (contact, contactId, fn) {
            var apiUrl = baseUrl +'contact/'+ contactId + '/contactDetail';
            $http.post(apiUrl, contact).success(function (data) {
                fn(data);
            });
        };

        var contactUploading = 0;
        var contactArr = [];

        this.resetCount = function () {
            contactUploading = 0;
        };

        this.importCsvContacts = function (contacts, fn) {
            var self = this;
            var passedFn;
            if (contacts) {
				contactArr =(function filter(obj) {
					 _.each(obj, function(value,key){
						if (value === "" || value === null){
							delete obj[key];
						} else if (Object.prototype.toString.call(value) === '[object Object]') {
							filter(value);
						} else if (angular.isArray(value)) {
							_.each(value, function (v,k) { filter(v); });
						}
					});
				})(contacts);
                contactArr = contacts;
            }

            if (fn) {
                self.passedFn = fn;
            }

            self.postContact(self.getCache(), contactArr[contactUploading], function () {
                if (contactUploading < contactArr.length - 1) {
                    $rootScope.$broadcast('importingContacts', {
                        current: contactUploading + 1,
                        total: contactArr.length
                    });
                    contactUploading++;
                    self.importCsvContacts();
                }
                if (contactUploading === contactArr.length - 1) {
                    $rootScope.$broadcast('importingContacts', {
                        current: contactUploading + 1,
                        total: contactArr.length
                    });
                }
            });
        };

        this.getGeoSearchAddress = function (addressStr, fn) {
            var apiUrl = baseUrl + ['geo', 'search', 'address', addressStr].join('/');
            $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        };

        this.postFullContact = function (contactId, fn) {
            var apiUrl = baseUrl + ['contact', contactId, 'fullcontact'].join('/');
            $http.post(apiUrl, {
                _id: contactId
            }).success(function (data) {
                fn(data);
            });
        };

        this.contactTags = function (contact) {
            var contactTags = contactConstant.contact_tags.dp;
            contactTags = contactTags.concat(userConstant.contact_types.dp);
            var tags = [];

            if (contact.tags) {
                tags = _.map(contact.tags, function (tag) {
                    var type = _.findWhere(contactTags, {data: tag});
                    return type ? type.label : tag;
                });
            }
            return tags.join(', ');
        };

        this.checkBestEmail = function (contact) {
            if (contact && contact.details && contact.details.length > 0) {
                //see if we have a google contact, that's the best source of email
                var details = _.findWhere(contact.details, {
                    type: userConstant.social_types.GOOGLE
                });
                if (details && details.emails.length > 0 && details.emails[0].email) {
                    contact.email = details.emails[0].email;
                    return contact.email;
                }
                var singleDetail = contact.details[0];
                if (singleDetail && singleDetail.emails && singleDetail.emails.length > 0 && singleDetail.emails[0].email) {
                    contact.email = singleDetail.emails[0].email;
                    return contact.email;
                }
                return false;
            }
        };

        this.checkContactBestEmail = function (contact) {
            if (contact && contact.details && contact.details.length > 0) {
                //see if we have a google contact, that's the best source of email
                var details = _.findWhere(contact.details, {
                    type: userConstant.social_types.GOOGLE
                });
                if (details && details.emails.length > 0 && details.emails[0].email) {
                    //contact.email = details.emails[0].email;
                    return details.emails[0].email;
                }
                var singleDetail = contact.details[0];
                if (singleDetail && singleDetail.emails && singleDetail.emails.length > 0 && singleDetail.emails[0].email) {
                    //contact.email = singleDetail.emails[0].email;
                    return singleDetail.emails[0].email;
                }
                return false;
            }
        };

        this.checkFacebookId = function (contact) {
            if (contact && contact.details && contact.details.length > 0) {
                var details = _.findWhere(contact.details, {
                    type: userConstant.social_types.FACEBOOK
                });
                if (details && details !== null) {
                    contact.facebookId = details.socialId;
                    return true;
                }
                return false;
            }
        };

        this.checkTwitterId = function (contact) {
            if (contact && contact.details && contact.details.length > 0) {
                var details = _.findWhere(contact.details, {
                    type: userConstant.social_types.TWITTER
                });
                if (details) {
                    contact.twitterId = details.socialId;
                    return true;
                }
                return false;
            }
        };

        this.checkLinkedInId = function (contact) {
            if (contact && contact.details && contact.details.length > 0) {
                var details = _.findWhere(contact.details, {
                    type: userConstant.social_types.LINKEDIN
                });
                if (details) {
                    if (details.websites !== null && details.websites.length > 0) {
                        var _value = _.find(details.websites, function (num) {
                            return num !== null;
                        });
                        if (_value) {
                            contact.linkedInUrl = _value;
                            return true;
                        }
                    }
                    contact.linkedInId = details.socialId;
                    return true;
                }
                return false;
            }
        };

        this.checkGoogleId = function (contact) {
            if (contact.details && contact.details.length > 0) {
                var details = _.findWhere(contact.details, {
                    type: userConstant.social_types.GOOGLE
                });
                if (details) {
                    if (details.websites && details.websites.length > 0) {
                        var _value = _.find(details.websites, function (num) {
                            return num !== null;
                        });
                        if (_value) {
                            contact.googleUrl = _value;
                            return true;
                        }
                    }
                    contact.googleId = details.socialId;
                    return true;
                }
                return false;
            }
        };


        this.checkAddress = function (contact) {
            var _address = null;
            if (contact && contact.details && contact.details.length > 0) {
                if (contact.details && contact.details[0].addresses && contact.details[0].addresses.length > 0) {
                    _address = contact.details[0].addresses[0];
                    var address_str = "";
                    if (_address.lat && _address.lat !== '' && _address.lon !== '') {
                        address_str = _address.lat.concat(",", _address.lon);
                    }
                    contact.address = encodeURIComponent(address_str);
                    return contact.address;
                }
            }
            return false;
        };

        this.getContactActivities = function (contactId, fn) {
            var apiUrl = baseUrl + ['contact', contactId, 'activity'].join('/');
            $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        };
        this.getContactUnreadActivities = function (contactId, fn) {
            var apiUrl = baseUrl + ['contact', contactId, 'activity', 'unread'].join('/');
            $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        };

        this.getAllContactActivities = function (fn) {
            var apiUrl = baseUrl + ['contact', 'activities'].join('/');
            $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        };


        this.getAllContactActivitiesWithLimit = function (queryParams, fn) {
            var apiUrl = baseUrl + ['contact', 'activities'].join('/');
            $http({
                url: apiUrl,
                method: 'GET',
                params: queryParams
            }).success(function (data) {
                fn(data);
            });
        };
        this.getAllContactUnreadActivities = function (fn) {
            var apiUrl = baseUrl + ['contact', 'activities', 'unread'].join('/');
            $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        };

        this.postContactActivity = function (activity, fn) {
            var apiUrl = baseUrl + ['contact', 'activity'].join('/');
            $http.post(apiUrl, activity)
                .success(function (data) {
                    fn(data);
                });
        };

        this.getActivityTypes = function (fn) {
            var activityTypes = contactConstant.contact_activity_types.dp;
            fn(activityTypes);
        };


        this.getContactTags = function (fn) {
            var contactTags = contactConstant.contact_tags.dp;
            fn(contactTags);
        };

        this.getTagFromLabel = function(label) {
            var tag = label;
            var contactTags = contactConstant.contact_tags.dp;
            if(label === 'No Tag'){
                tag = "NOTAG"
            }
            else{
                _.each(contactTags, function(contactTag){
                    if(contactTag.label === label) {
                        tag = contactTag.data;
                    }
                });
            }
            return tag;
        };

        this.getAllContactTags = function (contacts, fn) {
            var contactTags = contactConstant.contact_tags.dp;
            var extraContactTags = [];
            _.each(contacts, function (contact) {
                if (contact.tags) {
                    _.each(contact.tags, function (tag) {
                        var type = _.find(contactTags, function (type) {
                            return type.data === tag;
                        });
                        if (!type) {
                            extraContactTags.push({
                                label: tag.replace(/^\s+|\s+$|\s+(?=\s)/g, ""),
                                data: tag.replace(/^\s+|\s+$|\s+(?=\s)/g, ""),

                            })
                        }
                    });
                }
            });
            contactTags = _.uniq(contactTags.concat(extraContactTags), function (c) {
                return c.label;
            });
            fn(contactTags);
        };

        this.tagToContact = function (value, fn) {
            var regexTag = formValidations.contactTags;
            var isValid = regexTag.test(value);
            if (isValid) {
                var item = {
                    label: value,
                    data: value
                };
            }
            return item;
        };


        //region IMPORT

        this.importFacebookFriends = function (fn) {
            ImportContactService.importContacts(userConstant.social_types.FACEBOOK, fn, function (data, success) {
                fn(data, success);
            });
        };


        this.importLinkedInConnections = function (fn) {
            ImportContactService.importContacts(userConstant.social_types.LINKEDIN, fn, function (data, success) {
                fn(data, success);
            });
        };


        this.importGmailContacts = function (fn) {
            ImportContactService.importContacts(userConstant.social_types.GOOGLE, fn, function (data, success) {
                fn(data, success);
            });
        };

        this.createContact = function (contact) {
            var apiUrl = baseUrl + ['contact'].join('/');
            return $http.post(apiUrl, contact);
        };

        this.checkDuplicateEmail = function (email, check, fn) {
            if (check && email) {
                var apiUrl = baseUrl + ['contact', 'search', 'email', email].join('/');
                $http.get(apiUrl)
                    .success(function (data) {
                        fn(data);
                    });
            } else {
                fn(null);
            }
        };

        this.exportCsvContacts = function (ids, pagingParams) {
            var apiUrl = baseUrl + ['contact', 'export', 'csv'].join('/');
            if (ids) {
                var params = _.map(ids, function (x) {
                    return ('ids=' + x);
                });
                apiUrl = apiUrl + '?' + params.join('&');
            }else{
                var _qString = "skip=0" ;
                if (pagingParams.sortBy) {
                    _qString += "&sortBy=" + pagingParams.sortBy + "&sortDir=" + pagingParams.sortDir;
                }
                if (pagingParams.globalSearch) {
                    _qString += "&term=" + encodeURIComponent(pagingParams.globalSearch);
                }
                if (pagingParams.fieldSearch) {
                    _.each(pagingParams.fieldSearch, function (value, key) {
                        if(value != null){
                            _qString += '&' + key + '=' + encodeURIComponent(value);
                        }
                    });
                }
                apiUrl = apiUrl + '?'  +_qString;
            }
            window.location = apiUrl;
        };

        this.listAllContactTags = function (fn) {
            var apiUrl = baseUrl + ['contact', 'tags'].join('/');
            $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        };

        this.getContactTagCounts = function(fn){
            var apiUrl = baseUrl + ['contact', 'tagcounts'].join('/');
            $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        }

        this.getContactNotes = function(id, fn){
            var apiUrl = baseUrl + ['contact', id, 'notes'].join('/');
            $http.get(apiUrl)
                .success(function (data) {
                    fn(data);
                });
        }

        this.fomatContactTags = function (tags, fn) {
            var contactTags = contactConstant.contact_tags.dp;
            var extraContactTags = [];
            _.each(tags, function (tag) {
                var type = _.find(contactTags, function (type) {
                    return type.data === tag;
                });
                if (!type) {
                    extraContactTags.push({
                        label: tag.replace(/^\s+|\s+$|\s+(?=\s)/g, ""),
                        data: tag.replace(/^\s+|\s+$|\s+(?=\s)/g, ""),

                    })
                }
            });
            contactTags = _.uniq(contactTags.concat(extraContactTags), function (c) {
                return c.label;
            });
            fn(contactTags);
        };

    }]);
}(angular));
