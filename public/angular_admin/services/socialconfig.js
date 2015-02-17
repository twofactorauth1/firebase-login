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

        this.getTrackedObject = function(id, fn) {
            console.log('id >>> ', id);
            var apiUrl = baseUrl + ['social', 'socialconfig', 'tracked', id].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    console.log('getTrackedObject >>> ', data);
                    fn(data);
                });
        };

        this.postFBPost = function(socialAccountId, post, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'post'].join('/');
            $http.post(apiUrl, {
                post: post
            }).success(function (data, status, headers, config) {
                fn(data);
            });

        };

        this.deleteSocialConfigEntry = function(id, fn) {
          var apiUrl = baseUrl + ['social', 'socialconfig', 'socialaccount', id].join('/');
          $http.delete(apiUrl)
          .success(function(data, status, headers, config) {
            fn(data);
          });
        };
    });

    //Twitter
    this.getTwitterFeed = function (socialAccountId, fn) {
        var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'feed'].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };

    this.getTwitterFollowers = function (socialAccountId, fn) {
        var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'followers'].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };

    this.getTwitterProfile = function (socialAccountId, fn) {
        var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'profile'].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };

    this.postTwitterPost = function(socialAccountId, post, fn) {
        var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'post'].join('/');
        $http.post(apiUrl, {
            post: post
            }).success(function (data, status, headers, config) {
                fn(data);
            });
    };

    //Facebook
    this.getFBPosts = function (socialAccountId, fn) {
        var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'posts'].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };

    this.getFBPages = function (socialAccountId, fn) {
        var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'pages'].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };

    this.getFBPageInfo = function (socialAccountId, pageId, fn) {
        var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'page', pageId].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };

    this.getFBProfile = function (socialAccountId, fn) {
        var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'profile'].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };
});