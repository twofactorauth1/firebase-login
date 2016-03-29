'use strict';
/**
 * service for social config
 */
(function(angular) {
    app.service('SocialConfigService', ['$http', '$log', function($http, $log) {
        var baseUrl = '/api/1.0/';
        this.getAllSocialConfig = function(fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig'].join('/');
            $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.getTrackedObject = function(id, socialId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'tracked', id].join('/');
            $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true })
                .success(function(data, status, headers, config) {
                    fn(data, socialId);
                });
        };

        this.getTrackedObjectPromise = function(id, socialId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'tracked', id].join('/');
            return $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true });
        };

        this.postFBPost = function(socialAccountId, post, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'post'].join('/');
            $http.post(apiUrl, {
                post: post
            }).success(function(data, status, headers, config) {
                fn(data);
            }).error(function(data, status, headers, config) {
                console.log('data error ', data);
                //{code: 506, status: "Error creating post", message: "Duplicate status message", detail: ""}
                if (data.code == 506) {
                  fn({error: data.message});
                }
            });

        };

        this.likeFBPost = function(socialAccountId, postId, fn) {
            //facebook/:socialAccountId/post/:postId/like
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'post', postId, 'like'].join('/');
          $http.post(apiUrl).success(function(data, status, headers, config) {
            fn(data);
          });

        };

        this.unlikeFBPost = function(socialAccountId, postId, fn) {
            //facebook/:socialAccountId/post/:postId/like
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'post', postId, 'like'].join('/');
            $http.delete(apiUrl).success(function(data, status, headers, config) {
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


        this.getFBPages = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'pages'].join('/');
            $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.getFBPagesPromise = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'pages'].join('/');
            return $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true });
        };

        this.getFBPageInfo = function(socialAccountId, pageId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'page', pageId].join('/');
            $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.postSocialAccount = function(socialAccount, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'socialaccount'].join('/');
            $http({
                    url: apiUrl,
                    method: "POST",
                    data: socialAccount
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                })
                .error(function(err) {
                    console.log('END:postSocialAccount with ERROR');
                    fn(err);
                });

        };

        //Twitter
        this.getTwitterFeed = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'feed'].join('/');
            $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.getTwitterFollowers = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'followers'].join('/');
            $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.getTwitterProfile = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'profile'].join('/');
            $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.postTwitterPost = function(socialAccountId, post, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'post'].join('/');
            $http.post(apiUrl, {
                post: post
            }).success(function(data, status, headers, config) {
                fn(data);
            });
        };

        this.addTwitterPostReply = function(socialAccountId, postId, comment, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'post', postId, 'reply'].join('/');
            $http.post(apiUrl, {
                post: comment
            }).success(function(data, status, headers, config) {
                    fn(data);
            });
        };

        this.addTwitterPostRetweet = function(socialAccountId, postId, username, comment, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'post', postId, 'retweet'].join('/');
            $http.post(apiUrl, {
                post: '@' + username + ' ' + comment
            }).success(function(data, status, headers, config) {
                fn(data);
            });
        };

        this.addTwitterDirectMessage = function(socialAccountId, username, msg, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'name', username, 'dm'].join('/');
            $http.post(apiUrl, {
                msg: msg
            }).success(function(data, status, headers, config) {
                fn(data);
            });
        };

        this.favTwitterPost = function(socialAccountId, postId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'post', postId, 'favorite'].join('/');
            $http.post(apiUrl, {
            }).success(function(data, status, headers, config) {
                fn(data);
            });
        };

        this.unfavTwitterPost = function(socialAccountId, postId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'post', postId, 'favorite'].join('/');
            $http.delete(apiUrl, {
            }).success(function(data, status, headers, config) {
                fn(data);
            });
        };

        this.followTwitterUser = function(socialAccountId, twitterFollowerId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'follow', twitterFollowerId, 'follow'].join('/');

            $log.debug('xxx followTwitterUser');
            $http.post(apiUrl, {
            }).success(function(data, status, headers, config) {
                fn(data);
            });
        };

        this.unfollowTwitterUser = function(socialAccountId, twitterFollowerId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'follow', twitterFollowerId, 'unfollow'].join('/');
            $http.delete(apiUrl, {
            }).success(function(data, status, headers, config) {
                fn(data);
            });
        };

        //Facebook
        this.getFBPosts = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'posts'].join('/');
            $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.getFBProfile = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'profile'].join('/');
            $http({ method: 'GET', url: apiUrl, ignoreAuthModule: true })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.importLinkedinContact = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'linkedin', socialAccountId, 'importcontacts'].join('/');
            $http({
                    url: apiUrl,
                    method: 'GET'
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.importGoogleContact = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'google', socialAccountId, 'importcontacts'].join('/');
            $http({
                    url: apiUrl,
                    method: 'GET'
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.importGoogleContactsForGroup = function(socialAccountId, groupId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'google', socialAccountId, 'importcontacts'].join('/');
            if(groupId !== 'All') {
                apiUrl += "?groupId=" + groupId;
            }
            $http({
                url: apiUrl,
                method: 'GET'
            })
            .success(function(data, status, headers, config) {
                fn(data);
            });
        };

        this.getGoogleGroups = function(socialAccountId, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'google', socialAccountId, 'groups'].join('/');
            $http({
                    url: apiUrl,
                    method: 'GET'
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.addFacebookPostComment = function(socialAccountId, postId, comment, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'facebook', socialAccountId, 'post', postId, 'comment'].join('/');
            $http.post(apiUrl, {
                    comment: comment
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.addTwitterReply = function(socialAccountId, postId, username, comment, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'post', postId, 'reply'].join('/');
            $http.post(apiUrl, {
                    post: '@' + username + ' ' + comment
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.addTwitterPostRetweet = function(socialAccountId, postId, username, comment, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'twitter', socialAccountId, 'post', postId, 'retweet'].join('/');
            $http.post(apiUrl, {
                post: '@' + username + ' ' + comment
            })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.addTrackedAccount = function(account, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'trackedAccounts'].join('/');
            $http.post(apiUrl, {
                    trackedAccount: account
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.updateTrackedAccount = function(account, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'trackedAccount', account.id].join('/');
            $http.post(apiUrl, {
                    trackedAccount: account
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.deleteTrackedAccount = function(id, fn) {
            var apiUrl = baseUrl + ['social', 'socialconfig', 'trackedAccount', id].join('/');
            console.log('api URL ', apiUrl);
            $http.delete(apiUrl)
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };
    }])
})(angular);
