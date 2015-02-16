define(['app'], function (app) {
    app.register.service('SocialService', function ($http) {
        var baseUrl = '/api/1.0/social/';

        //Twitter
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

        this.getTwitterProfile = function (fn) {
            var apiUrl = baseUrl + ['twitter', 'profile'].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };

        //Facebook
        this.getFBPosts = function (socialId, fn) {
            var apiUrl = baseUrl + ['facebook', 'posts', socialId].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };

        this.getFBPages = function (fn) {
            var apiUrl = baseUrl + ['facebook', 'pages'].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };

        this.getFBPageInfo = function (pageId, fn) {
            var apiUrl = baseUrl + ['facebook', 'page', pageId].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };

        this.getFBPageProfilePic = function (pageId, fn) {
            var apiUrl = baseUrl + ['facebook', 'pagepic', pageId].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };

        this.getFBProfile = function (fn) {
            var apiUrl = baseUrl + ['facebook', 'profile'].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };

        //Google Plus
        this.getGooglePlusPosts = function (socialId, fn) {
            // var apiUrl = baseUrl + ['facebook', 'posts', socialId].join('/');
            // $http.get(apiUrl)
            //     .success(function (data, status, headers, config) {
            //         fn(data);
            //     });
        };

        this.getFBPageSocialConfig = function(socialId, fn) {
          var apiUrl = baseUrl + ['socialconfig', 'facebook', socialId, 'pages'].join('/');
          $http.get(apiUrl)
          .success(function(data, status, headers, config) {
            fn(data);
          });
        };
    });
});
