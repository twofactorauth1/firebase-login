define(['app', 'campaignService', 'userService', 'socialService', 'timeAgoFilter', 'socialConfigService', 'underscore', 'constants'], function(app) {
    app.register.controller('MarketingCtrl', ['$scope', 'UserService', 'CampaignService', 'SocialService', 'SocialConfigService', function($scope, UserService, CampaignService, SocialService, SocialConfigService) {

        $scope.campaigns = [];
        $scope.feeds = [];

        $scope.activeTab = 'social-feed';

        $scope.campaignSettings = {
            showStatus: true,
            showType: true,
            showConversions: true,
            showContacts: true
        };

        CampaignService.getCampaigns(function(campaigns) {
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
                    objects.index = i;
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
                    SocialConfigService.getTrackedObject(trackedTwitterObjects[i].index, function(tweets){
                        $scope.tweetsLength = tweets.length;
                        for (var i = 0; i < tweets.length; i++) {
                            tweets[i].type = 'twitter';
                            $scope.feed.push(tweets[i]);
                        };
                    });
                }
                if (trackedTwitterObjects[i].type == 'follower') {
                    SocialConfigService.getTrackedObject(trackedTwitterObjects[i].index, function(followers){
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
            var socialAccountMap = {};
            for (var i=0; i<config.socialAccounts.length; i++) {
                socialAccountMap[config.socialAccounts[i].id] = config.socialAccounts[i].type;
            }
            //console.log('the map:');
            //console.dir(socialAccountMap);
            //handle each tracked object
            for (var i=0; i<config.trackedObjects.length; i++) {
                var obj = config.trackedObjects[i];
                // console.log('handling object:', obj);
                if(obj.type === 'feed') {
                    if(socialAccountMap[obj.socialId] === 'tw') {
                        SocialConfigService.getTrackedObject(i, function(tweets){
                            $scope.tweetsLength = tweets.length;
                            for (var i = 0; i < tweets.length; i++) {
                                tweets[i].type = 'twitter';
                                $scope.feed.push(tweets[i]);
                            };
                        });
                    } else if(socialAccountMap[obj.socialId] === 'fb') {
                        SocialConfigService.getTrackedObject(i, function(posts){
                            for (var i = 0; i < posts.length; i++) {
                                posts[i].type = 'facebook';
                                $scope.fbPostsLength +=1;
                                $scope.feed.push(posts[i]);
                            };
                        });
                    }
                } else if(obj.type === 'pages') {
                    console.log('has pages >>>');
                    console.log('obj ', obj);

                } else if(obj.type === 'likes') {

                } else if(obj.type === 'user') {

                } else if(obj.type === 'mentions') {

                } else if(obj.type === 'numberTweets') {

                } else if(obj.type === 'numberFollowers') {
                    if(socialAccountMap[obj.socialId] === 'tw') {
                        SocialConfigService.getTrackedObject(i, function(followers){
                            $scope.followersLength = followers.length;
                            for (var i = 0; i < followers.length; i++) {
                                followers[i].type = 'twitter';
                                $scope.feed.push(followers[i]);
                            };
                        });
                    }
                } else if(obj.type === 'profile') {
                    if(socialAccountMap[obj.socialId] === 'tw') {
                        SocialConfigService.getTrackedObject(i, function(profile){
                            profile.type = 'twitter';
                            console.log('profile ', profile);
                            $scope.feedTypes.push(profile);
                        });
                    } else if(socialAccountMap[obj.socialId] === 'fb') {
                        SocialConfigService.getTrackedObject(i, function(profile){
                            profile.type = 'facebook';
                            $scope.feedTypes.push(profile);
                        });

                    }
                }
            }
            $scope.displayedFeed = $scope.feed;


            /*
             * Social config does not yet have google plus posts.  Next TODO.
             */
            for (var i = 0; i < config.socialAccounts.length; i++) {
                var thisSocial = config.socialAccounts[i];

                if (thisSocial.type == 'go') {
                    $scope.feedTypes.push('google-plus');
                    SocialService.getGooglePlusPosts(thisSocial.socialId, function(posts) {
                        for (var i = 0; i < posts.length; i++) {
                            posts[i].type = 'google-plus';
                            $scope.feed.push(posts[i]);
                        };
                    });
                }
            };
            $scope.displayedFeed = $scope.feed;
        });

        SocialConfigService.getAllSocialConfig(function(data) {
          data.socialAccounts.forEach(function(value, index) {
            if (value.type == $$.constants.user.credential_types.FACEBOOK) {
              SocialService.getFBPageSocialConfig(value.id, function(pages) {
                console.log('pages ', pages);
                $scope.fbAdminPages = [];
                for (var i = 0; i < pages.length; i++) {
                    var sourceId = pages[i].sourceId;
                    SocialService.getFBPageInfo(sourceId, function(pageInfo){
                        SocialService.getFBPageProfilePic(sourceId, function(pagePic){
                            pageInfo.profilePic = pagePic;
                            $scope.fbAdminPages.push(pageInfo);
                        });
                    });
                };
              });
            }
          });
        });

    }]);
});
