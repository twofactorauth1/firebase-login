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
    });
});
