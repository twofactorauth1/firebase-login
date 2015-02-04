define(['app'], function (app) {
    app.register.service('SocialService', function ($http) {
        var baseUrl = '/api/1.0/social/';
        this.getTwitterFeed = function (twitterId, fn) {
            var apiUrl = baseUrl + ['twitter', 'tweets', twitterId].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };
        this.getTwitterFollowers = function (twitterId, fn) {
            var apiUrl = baseUrl + ['twitter', 'followers', twitterId].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };
        this.getTwitterUser = function (twitterId, fn) {
            var apiUrl = baseUrl + ['twitter', 'tweets', twitterId].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };
        this.getFBPosts = function (socialId, fn) {
            var apiUrl = baseUrl + ['facebook', 'posts', socialId].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };
        this.getGooglePlusPosts = function (socialId, fn) {
            // var apiUrl = baseUrl + ['facebook', 'posts', socialId].join('/');
            // $http.get(apiUrl)
            //     .success(function (data, status, headers, config) {
            //         fn(data);
            //     });
        };
    });
});