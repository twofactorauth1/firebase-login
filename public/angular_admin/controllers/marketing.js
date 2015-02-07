define(['app', 'campaignService', 'userService', 'socialService', 'timeAgoFilter', 'socialConfigService', 'underscore'], function(app) {
    app.register.controller('MarketingCtrl', ['$scope', 'UserService', 'CampaignService', 'SocialService', 'SocialConfigService', function($scope, UserService, CampaignService, SocialService, SocialConfigService) {

        $scope.campaigns = [];
        $scope.feeds = [];

        $scope.activeTab = 'campaigns';

        $scope.campaignSettings = {
            showStatus: true,
            showType: true,
            showConversions: true,
            showContacts: true
        };

        CampaignService.getCampaigns(function(campaigns) {
            console.log('fetched campaigns >>> ', campaigns);
            $scope.campaigns = campaigns;
        });

        $scope.$watch('activeTab', function(newValue, oldValue) {
            if ($scope.userPreferences) {
                $scope.userPreferences.indi_default_tab = newValue;
                $scope.savePreferencesFn();
            }
        });

        UserService.getUserPreferences(function(preferences) {
            $scope.userPreferences = preferences;
            $scope.activeTab = preferences.indi_default_tab;
            $scope.initialWelcome = preferences.welcome_alert.initial;
        });

        $scope.savePreferencesFn = function() {
            UserService.updateUserPreferences($scope.userPreferences, false, function() {})
        };

        $scope.addCampaignFn = function() {
            CampaignService.postCampaign($scope.newCampaign, function(campaign) {
                $scope.campaigns.push(campaign);
                $('#marketing-add-campaign').modal('hide');
            });
        };

        $scope.feed = [];
        $scope.displayedFeed = [];

        $scope.filterFeed = function(type, $event) {
            console.log('filterFeed ', type);
            $event.stopPropagation();
            if (type != 'all') {
                if ($event.currentTarget.checked) {
                    for (var i = 0; i < $scope.feed.length; i++) {
                        if ($scope.feed[i].type == type) {
                            $scope.displayedFeed.push($scope.feed[i]);
                        }
                    }
                    setTimeout(function() { $scope.$apply(); },1);
                } else {
                    for (var i = 0; i < $scope.feed.length; i++) {
                        if ($scope.feed[i].type == type) {
                            var itemToRemove = _.find($scope.displayedFeed, function(value) { return value._id == $scope.feed[i]._id; });
                            $scope.displayedFeed = _.filter($scope.displayedFeed, function(o) { return o._id != itemToRemove._id; });
                        }
                    }
                }
            } else {
                $scope.displayedFeed = $scope.feed;
            }
        };

        // UserService.getUserSocial(function(social) {
        //     console.log('social ', social);
        //     for (var i = 0; i < social.length; i++) {
        //         if (social[i].type == 'tw') {
        //             $scope.feedTypes.push('twitter');
        //             SocialService.getUserTweets(social[i].socialId, function(tweets) {
        //                 for (var i = 0; i < tweets.length; i++) {
        //                     tweets[i].type = 'twitter';
        //                     $scope.feed.push(tweets[i]);
        //                 };
        //             });
        //         }
        //         if (social[i].type == 'fb') {
        //             $scope.feedTypes.push('facebook');
        //             console.log('getting facebook posts');
        //             SocialService.getFBPosts("636552113048686", function(posts) {
        //                 console.log('fb posts return: ', posts);
        //                 for (var i = 0; i < posts.length; i++) {
        //                     posts[i].type = 'facebook';
        //                     $scope.feed.push(posts[i]);
        //                 };
        //             });
        //         }
        //         if (social[i].type == 'go') {
        //             $scope.feedTypes.push('google-plus');
        //             console.log('getting google plus');
        //             SocialService.getGooglePlusPosts(social[i].socialId, function(posts) {
        //                 console.log('google plus posts return: ', posts);
        //                 for (var i = 0; i < posts.length; i++) {
        //                     posts[i].type = 'google-plus';
        //                     $scope.feed.push(posts[i]);
        //                 };
        //             });
        //         }
        //     };
        //     $scope.displayedFeed = $scope.feed;
        // });

        $scope.feedTypes = [];
        $scope.fbPostsLength = 0;

        $scope.getTrackedObjects = function(objects, id) {
            var trackedObjects = [];
            for (var i = 0; i < objects.length; i++) {
                if (objects[i].socialId == id) {
                    trackedObjects.push(objects[i]);
                }
            }

            return trackedObjects;
        };

        $scope.tweetsLength = 0;
        $scope.followersLength = 0;

        $scope.handleTwitterFeeds = function(trackedObjects, id) {
            var trackedTwitterObjects = $scope.getTrackedObjects(trackedObjects, id);
            for (var i = 0; i < trackedTwitterObjects.length; i++) {
                if (trackedTwitterObjects[i].type == 'feed') {
                    SocialService.getTwitterFeed(trackedTwitterObjects[i].socialId, function(tweets) {
                        $scope.tweetsLength = tweets.length;
                        for (var i = 0; i < tweets.length; i++) {
                            tweets[i].type = 'twitter';
                            $scope.feed.push(tweets[i]);
                        };
                    });
                }
                if (trackedTwitterObjects[i].type == 'follower') {
                    SocialService.getTwitterFollowers(trackedTwitterObjects[i].socialId, function(followers) {
                        console.log('followers ', followers);
                        $scope.followersLength = followers.length;
                        for (var i = 0; i < followers.length; i++) {
                            followers[i].type = 'twitter';
                            $scope.feed.push(followers[i]);
                        };
                    });
                }
            };
        };

        SocialConfigService.getAllSocialConfig(function(config){
            for (var i = 0; i < config.socialAccounts.length; i++) {
                var thisSocial = config.socialAccounts[i];
                if (thisSocial.type == 'tw') {
                    SocialService.getTwitterProfile(function(profile) {
                        console.log('Twitter Profile: ', profile);
                        profile.type = 'twitter';
                        $scope.feedTypes.push(profile);
                    });
                    $scope.handleTwitterFeeds(config.trackedObjects, thisSocial.id);
                }
                if (thisSocial.type == 'fb') {
                    SocialService.getFBPosts("636552113048686", function(posts) {
                        for (var i = 0; i < posts.length; i++) {
                            posts[i].type = 'facebook';
                            $scope.fbPostsLength +=1;
                            $scope.feed.push(posts[i]);
                        };
                    });

                    SocialService.getFBProfile(function(profile) {
                        console.log('FB Profile: ', profile);
                        profile.type = 'facebook';
                        $scope.feedTypes.push(profile);
                    });
                }
                if (thisSocial.type == 'go') {
                    $scope.feedTypes.push('google-plus');
                    console.log('getting google plus');
                    SocialService.getGooglePlusPosts(thisSocial.socialId, function(posts) {
                        console.log('google plus posts return: ', posts);
                        for (var i = 0; i < posts.length; i++) {
                            posts[i].type = 'google-plus';
                            $scope.feed.push(posts[i]);
                        };
                    });
                }
            };
            $scope.displayedFeed = $scope.feed;
        });

    }]);
});
