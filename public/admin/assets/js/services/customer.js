'use strict';
/*global app, Keen, $$*/
/*jslint unparam: true*/
(function (angular) {
  app.service('CustomerService', ['$http', '$rootScope', '$cacheFactory', 'ImportContactService', 'contactConstant', 'userConstant', 'formValidations', function ($http, $rootScope, $cacheFactory, ImportContactService, contactConstant, userConstant, formValidations) {
    var baseUrl = '/api/1.0/';

    this.getCache = function () {
      var cache = $cacheFactory.get('CustomerService');
      if (cache) {
        return cache;
      }
      return $cacheFactory('CustomerService');
    };

    this.getCustomers = function (fn) {
      var apiUrl = baseUrl + ['contact'].join('/');
      return $http.get(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };

    this.getCustomersShortForm = function (fields, fn) {
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
        }).success(function (data) {
          cache.put('customers', data);
          fn(data);
        });
      }
    };

    this.getCustomer = function (id, fn) {
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

    this.deleteCustomer = function (id, fn) {
      var customers = this.getCache().get('customers');
      if (customers) {
        customers.forEach(function (value, index) {
          if (value._id === id) {
            customers.splice(index, 1);
          }
        });
        this.getCache().put('customers', customers);
      }

      var apiUrl = baseUrl + ['contact', id].join('/');
      $http.delete(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };

    this.postCustomer = function (cache, customer, fn) {
      var customers = cache.get('customers');

      var apiUrl = baseUrl + ['contact'].join('/');
      $http.post(apiUrl, customer)
        .success(function (data) {
          if (customers) {
            customers.push(data);
            cache.put('customers', customers);
          }
          fn(data);
        });
    };

    this.putCustomer = function (cache, customer, fn) {
      var customers = cache.get('customers');

      var apiUrl = baseUrl + ['contact'].join('/');
      $http.put(apiUrl, customer)
        .success(function (data) {
          if (customers) {
            customers.forEach(function (value, index) {
              if (value._id === customer._id) {
                customers[index] = customer;
              }
            });
            cache.put('customers', customers);
          }
          fn(data);
        });
    };

    this.saveCustomer = function (customer, fn) {
      var apiFn = null;
      if (customer._id) {
        apiFn = this.putCustomer;
      } else {
        apiFn = this.postCustomer;
      }
      apiFn(this.getCache(), customer, fn);
    };

    var customerUploading = 0;
    var customerArr = [];

    this.resetCount = function(){
      customerUploading = 0;
    }

    this.importCsvCustomers = function (customers, fn) {
      var self = this;
      var passedFn;
      if (customers) {
        customerArr = customers;
      }

      if (fn) {
        self.passedFn = fn;
      }

      self.postCustomer(self.getCache(), customerArr[customerUploading], function () {
        if (customerUploading < customerArr.length - 1) {
          $rootScope.$broadcast('importingCustomers', {
            current: customerUploading + 1,
            total: customerArr.length
          });
          customerUploading++;
          self.importCsvCustomers();
        }
        if (customerUploading === customerArr.length - 1) {
          $rootScope.$broadcast('importingCustomers', {
            current: customerUploading + 1,
            total: customerArr.length
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

    this.postFullContact = function (customerId, fn) {
      var apiUrl = baseUrl + ['contact', customerId, 'fullcontact'].join('/');
      $http.post(apiUrl, {
        _id: customerId
      }).success(function (data) {
        fn(data);
      });
    };

    this.contactTags = function (contact) {
      var contactTypes = userConstant.contact_types.dp;
      var tags = [];
      if (contact.tags) {
        _.each(contact.tags, function (tag) {
          var type = _.find(contactTypes, function (type) {
            return type.data === tag;
          });
          if (type) {
            tags.push(type.label);
          }
          else{
            tags.push(tag);
          }
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

    this.checkCustomerBestEmail = function (contact) {
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

    this.getCustomerActivities = function (customerId, fn) {
      var apiUrl = baseUrl + ['contact', customerId, 'activity'].join('/');
      $http.get(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };
    this.getCustomerUnreadActivities = function (customerId, fn) {
      var apiUrl = baseUrl + ['contact', customerId, 'activity', 'unread'].join('/');
      $http.get(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };

    this.getAllCustomerActivities = function (fn) {
      var apiUrl = baseUrl + ['contact', 'activities'].join('/');
      $http.get(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };


    this.getAllCustomerActivitiesWithLimit = function (queryParams, fn) {
      var apiUrl = baseUrl + ['contact', 'activities'].join('/');
      $http({
        url: apiUrl,
        method: 'GET',
        params: queryParams
      }).success(function (data) {
        fn(data);
      });
    };
    this.getAllCustomerUnreadActivities = function (fn) {
      var apiUrl = baseUrl + ['contact', 'activities', 'unread'].join('/');
      $http.get(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };

    this.postCustomerActivity = function (activity, fn) {
      var apiUrl = baseUrl + ['contact', 'activity'].join('/');
      $http.post(apiUrl, activity)
        .success(function (data) {
          fn(data);
        });
    };

    this.getActivityTypes = function (fn) {
      var activityTypes = contactConstant.customer_activity_types.dp;
      fn(activityTypes);
    };


    this.getCustomerTags = function (fn) {
      var customerTags = contactConstant.customer_tags.dp;
      fn(customerTags);
    };


    this.getAllCustomerTags = function (customers, fn) {
      var customerTags = contactConstant.customer_tags.dp;
        var contactTags = [];
        _.each(customers, function (contact) {
          if (contact.tags) {
            _.each(contact.tags, function (tag) {
              var type = _.find(customerTags, function (type) {
                return type.data === tag;
              });
              if (!type) {
                contactTags.push({
                  label : tag,
                  data : tag
                })
              }
            });
          }
        })
      customerTags = _.uniq(customerTags.concat(contactTags), function(c) { return c.label; })
      fn(customerTags);
    };

    this.tagToCustomer = function (value, fn) {
      var regexTag = formValidations.customerTags;
      var isValid = regexTag.test(value);
      if(isValid){
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

    this.createCustomer = function (customer) {
      var apiUrl = baseUrl + ['contact'].join('/');
      return $http.post(apiUrl, customer);
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

    this.exportCsvContacts = function (ids) {
      var params = _.map(ids, function (x) {return ('ids=' + x);});
      var apiUrl = baseUrl + ['contact', 'export', 'csv'].join('/');
      var apiUrl = apiUrl + '?' + params.join('&');
      console.log(apiUrl);
      window.location = apiUrl;
    };

  }]);
}(angular));
