define(['app', 'constants', 'importContactService'], function(app) {
  app.register.service('CustomerService', ['$http', '$cacheFactory', 'ImportContactService', function($http, $cacheFactory, ImportContactService) {
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

    this.contactLabel = function(contact) {
      var contactTypes = $$.constants.contact.contact_types.dp;
      var type = _.find(contactTypes, function(type) {
        return type.data === contact.type;
      });
      return type == null ? "" : type.label;
    };

    this.checkBestEmail = function(contact) {
      if (contact.details && contact.details.length > 0) {
        //see if we have a google contact, that's the best source of email
        var details = _.findWhere(contact.details, {
          type: $$.constants.social.types.GOOGLE
        });
        if (details && details.emails.length > 0) {
          contact.email = details.emails[0].email;
          return true;
        }
        var details = contact.details[0];
        if (details && details.emails.length > 0) {
          contact.email = details.emails[0].email;
          return true;
        }
        return false;
      }
    };

    this.checkFacebookId = function(contact) {
      if (contact.details && contact.details.length > 0) {
        var details = _.findWhere(contact.details, {
          type: $$.constants.social.types.FACEBOOK
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
          type: $$.constants.social.types.TWITTER
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
          type: $$.constants.social.types.LINKEDIN
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
          return true;
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

    this.getAllCustomerActivities = function(fn) {
      var apiUrl = baseUrl + ['contact', 'activities'].join('/');
      $http.get(apiUrl)
        .success(function(data, status, headers, config) {
          fn(data);
        });
    };

    this.getActivityTypes = function(fn) {
      var activityTypes = $$.constants.contact.customer_activity_types.dp;
      fn(activityTypes);
    };



    //region IMPORT

    this.importFacebookFriends = function(fn) {
      ImportContactService.importContacts($$.constants.social.types.FACEBOOK, fn, function(data, success) {
        fn(data, success);
      });
    };


    this.importLinkedInConnections = function(fn) {
      ImportContactService.importContacts($$.constants.social.types.LINKEDIN, fn, function(data, success) {
        fn(data, success);
      });
    };


    this.importGmailContacts = function(fn) {
      ImportContactService.importContacts($$.constants.social.types.GOOGLE, fn, function(data, success) {
        fn(data, success);
      });
    };


  }]);
});
