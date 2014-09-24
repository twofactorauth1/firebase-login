define(['app'], function (app) {
    app.register.service('CustomerService', function ($http) {
        var baseUrl = '/api/1.0/';

        this.getCustomers = function (fn) {
            var apiUrl = baseUrl + ['contact'].join('/');
            $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };

        this.getCustomer = function (id, fn) {
            var apiUrl = baseUrl + ['contact', id].join('/');
            $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };

        this.deleteCustomer = function (id, fn) {
            var apiUrl = baseUrl + ['contact', id].join('/');
            $http.delete(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };

        this.postCustomer = function (customer, fn) {
            var apiUrl = baseUrl + ['contact'].join('/');
            $http.post(apiUrl, customer)
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };

        this.putCustomer = function (customer, fn) {
            var apiUrl = baseUrl + ['contact'].join('/');
            $http.put(apiUrl, customer)
            .success(function (data, status, headers, config) {
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
            apiFn(customer, fn);
        };

        this.postTwoNetSubscribe = function (customerId, fn) {
            var apiUrl = baseUrl + ['twonetadapter', 'subscription'].join('/');
            $http.post(apiUrl, {contactId: customerId})
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };

        this.getGeoSearchAddress = function (addressStr, fn) {
            var apiUrl = baseUrl + ['geo', 'search', 'address', addressStr].join('/');
            $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };
    });
});
