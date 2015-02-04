define(['app'], function (app) {
    app.register.service('SocialConfigService', function ($http) {
        var baseUrl = '/api/1.0/';
        this.getAllSocialConfig = function (fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig'].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };
    });
});