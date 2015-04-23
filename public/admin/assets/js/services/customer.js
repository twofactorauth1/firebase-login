'use strict';
/**
 * service for customer
 */
(function(angular) {
    app.service('CustomerService', ['$http', '$cacheFactory', 'ImportContactService', 'contactConstant', 'userConstant',
        function($http, $cacheFactory, ImportContactService, contactConstant, userConstant) {
            var baseUrl = '/api/1.0/';

            this.getCache = function() {
                var cache = $cacheFactory.get('CustomerService');
                if (cache) {
                    return cache;
                } else {
                    return $cacheFactory('CustomerService');
                }
            };

            this.getCustomers = function(fn) {
                var apiUrl = baseUrl + ['contact'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.getCustomersShortForm = function(fields, fn) {
                var apiUrl = baseUrl + ['contact', 'shortform'].join('/');
                var data = this.getCache().get('customers');
                var cache = this.getCache();

                if (data) {
                    console.info('Customers call hit cache');
                    fn(data);
                } else {
                    $http({
                            url: apiUrl,
                            method: 'GET',
                            params: {
                                fields: fields
                            }
                        })
                        .success(function(data, status, headers, config) {
                            cache.put('customers', data);
                            fn(data);
                        });
                }
            };

            this.getCustomer = function(id, fn) {
                var apiUrl = baseUrl + ['contact', id].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.deleteCustomer = function(id, fn) {
                var customers = this.getCache().get('customers');
                if (customers) {
                    customers.forEach(function(value, index) {
                        if (value._id == id) {
                            customers.splice(index, 1);
                        }
                    });
                    this.getCache().put('customers', customers);
                }

                var apiUrl = baseUrl + ['contact', id].join('/');
                $http.delete(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.postCustomer = function(cache, customer, fn) {
                var customers = cache.get('customers');

                var apiUrl = baseUrl + ['contact'].join('/');
                $http.post(apiUrl, customer)
                    .success(function(data, status, headers, config) {
                        if (customers) {
                            customers.push(data);
                            cache.put('customers', customers);
                        }
                        fn(data);
                    });
            };

            this.putCustomer = function(cache, customer, fn) {
                var customers = cache.get('customers');

                var apiUrl = baseUrl + ['contact'].join('/');
                $http.put(apiUrl, customer)
                    .success(function(data, status, headers, config) {
                        if (customers) {
                            customers.forEach(function(value, index) {
                                if (value._id == customer._id) {
                                    customers[index] = customer;
                                }
                            });
                            cache.put('customers', customers);
                        }
                        fn(data);
                    });
            };

            this.saveCustomer = function(customer, fn) {
                var apiFn = null;
                if (customer._id) {
                    apiFn = this.putCustomer;
                } else {
                    apiFn = this.postCustomer;
                }
                apiFn(this.getCache(), customer, fn);
            };

            this.postTwoNetSubscribe = function(customerId, fn) {
                var apiUrl = baseUrl + ['twonetadapter', 'subscription'].join('/');
                $http.post(apiUrl, {
                        contactId: customerId
                    })
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.getGeoSearchAddress = function(addressStr, fn) {
                var apiUrl = baseUrl + ['geo', 'search', 'address', addressStr].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.postFullContact = function(customerId, fn) {
                var apiUrl = baseUrl + ['contact', customerId, 'fullcontact'].join('/');
                $http.post(apiUrl, {
                        _id: customerId
                    })
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.contactTags = function(contact) {
                var contactTypes = userConstant.contact_types.dp;
                var tags = [];
                if (contact.tags) {
                    _.each(contact.tags, function(tag) {
                        var type = _.find(contactTypes, function(type) {
                            return type.data === tag;
                        });
                        tags.push(type.label);
                    });
                }

                return tags.join(', ');
            };

            this.checkBestEmail = function(contact) {
                if (contact.details && contact.details.length > 0) {
                    //see if we have a google contact, that's the best source of email
                    var details = _.findWhere(contact.details, {
                        type: userConstant.social_types.GOOGLE
                    });
                    if (details && details.emails.length > 0) {
                        contact.email = details.emails[0].email;
                        return contact.email;
                    }
                    var details = contact.details[0];
                    if (details && details.emails && details.emails.length > 0) {
                        contact.email = details.emails[0].email;
                        return contact.email;
                    }
                    return false;
                }
            };

            this.checkFacebookId = function(contact) {
                if (contact.details && contact.details.length > 0) {
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

            this.checkTwitterId = function(contact) {
                if (contact.details && contact.details.length > 0) {
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

            this.checkLinkedInId = function(contact) {
                if (contact.details && contact.details.length > 0) {
                    var details = _.findWhere(contact.details, {
                        type: userConstant.social_types.LINKEDIN
                    });
                    if (details) {
                        if (details.websites !== null && details.websites.length > 0) {
                            var _value = _.find(details.websites, function(num) {
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


            this.checkAddress = function(contact) {
                var _address = null;
                if (contact.details && contact.details.length > 0) {
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

            this.getCustomerActivities = function(customerId, fn) {
                var apiUrl = baseUrl + ['contact', customerId, 'activity'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };
            this.getCustomerUnreadActivities = function(customerId, fn) {
                var apiUrl = baseUrl + ['contact', customerId, 'activity', 'unread'].join('/');
                   $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.getAllCustomerActivities = function(fn) {
                var apiUrl = baseUrl + ['contact', 'activities'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };


            this.getAllCustomerActivitiesWithLimit = function(queryParams, fn) {
                var apiUrl = baseUrl + ['contact', 'activities'].join('/');
                $http({
                        url: apiUrl,
                        method: 'GET',
                        params: queryParams
                    })
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };
            this.getAllCustomerUnreadActivities = function(fn) {
                var apiUrl = baseUrl + ['contact', 'activities', 'unread'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.postCustomerActivity = function(activity, fn) {
                var apiUrl = baseUrl + ['contact', 'activity'].join('/');
                $http.post(apiUrl, activity)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.getActivityTypes = function(fn) {
                var activityTypes = contactConstant.customer_activity_types.dp;
                fn(activityTypes);
            };



            //region IMPORT

            this.importFacebookFriends = function(fn) {
                ImportContactService.importContacts(userConstant.social_types.FACEBOOK, fn, function(data, success) {
                    fn(data, success);
                });
            };


            this.importLinkedInConnections = function(fn) {
                ImportContactService.importContacts(userConstant.social_types.LINKEDIN, fn, function(data, success) {
                    fn(data, success);
                });
            };


            this.importGmailContacts = function(fn) {
                ImportContactService.importContacts(userConstant.social_types.GOOGLE, fn, function(data, success) {
                    fn(data, success);
                });
            };


        }
    ]);
})(angular);