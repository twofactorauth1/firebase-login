define(['app'], function (app) {
    app.register.service('SocialService', function ($http) {
        var baseUrl = '/api/1.0/social/';
        this.getUserTweets = function (twitterId, fn) {
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
    });
});