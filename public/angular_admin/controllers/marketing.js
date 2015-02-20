define(['app', 'campaignService', 'userService', 'socialService', 'timeAgoFilter', 'socialConfigService', 'underscore', 'constants', 'moment', 'ngOnboarding', 'isotope'], function(app) {
    app.register.controller('MarketingCtrl', ['$scope', '$location', 'UserService', 'CampaignService', 'SocialService', 'SocialConfigService', '$timeout',function($scope, $location, UserService, CampaignService, SocialService, SocialConfigService, $timeout) {

        $scope.campaigns = [];
        $scope.feeds = [];

        $scope.activeTab = 'social-feed';

        $scope.onboardingSteps = [];
        $scope.showOnboarding = false;
        $scope.stepIndex = 0;

        $scope.beginOnboarding = function(type) {
            if (type == 'create-campaign') {
                $scope.showOnboarding = true;
                $scope.onboardingSteps = [{
                    overlay: true,
                    title: 'Task: Create new campaign',
                    description: "Here you can create a new campaign to gain traction.",
                    position: 'centered',
                    width: 400
                }];
            }
        };

        $scope.finishOnboarding = function() {
            $scope.userPreferences.tasks.create_campaign = true;
            UserService.updateUserPreferences($scope.userPreferences, false, function() {});
        };

        if ($location.$$search.onboarding) {
            $scope.beginOnboarding($location.$$search.onboarding);
        }

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

        $scope.formatDate = function(date) {
            return moment(date).format('MMMM D, YYYY [at] h:mm a');
        };

        UserService.getUserPreferences(function(preferences) {
            $scope.userPreferences = preferences;
            $scope.activeTab = preferences.indi_default_tab;
            if (preferences.welcome_alert) {
                $scope.initialWelcome = preferences.welcome_alert.initial;
            } else {
                //TODO: what makes sense here?
            }

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

        $scope.addPageFeed = function(page) {
            console.log('adding page feed ', page);
        };

        $scope.feed = [];
        $scope.displayedFeed = [];
        var feedTimer;

        //watch the feed and after 2sec of waiting on new items set isotope
        $scope.$watchCollection('feed', function(newFeed, oldFeed) {
            console.log('new feed ', newFeed.length);
            $timeout.cancel(feedTimer);
            feedTimer = $timeout(function() {
                console.log('set isotope ');
                var $container = $('.stream');
                // init
                $container.isotope({
                    // options
                    itemSelector: '.item',
                    layoutMode: 'masonry',
                    getSortData: {
                        date: function ($elem) {
                            return Date.parse($elem.data('date'));
                        }
                    }
                });
            }, 3000);
        });

        $scope.filterFeed = function(type, $event) {
            $event.stopPropagation();
            var $container = $('.stream'),
                $checkboxes = $('.stream-filter input');

            $container.isotope({
                itemSelector: '.item'
            });

            $checkboxes.change(function() {
                var filters = [];
                // get checked checkboxes values
                $checkboxes.filter(':checked').each(function() {
                    filters.push(this.value);
                });
                // ['.red', '.blue'] -> '.red, .blue'
                filters = filters.join(', ');
                $container.isotope({
                    filter: filters
                });
                console.log('filters ', filters);
            });
        };

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

        $scope.postToChange = function(type) {
            var parsed = JSON.parse(type);
            $scope.selectedSocial = parsed;
        };

        $scope.handleTwitterFeeds = function(trackedObjects, id) {
            var trackedTwitterObjects = $scope.getTrackedObjects(trackedObjects, id);
            for (var i = 0; i < trackedTwitterObjects.length; i++) {
                if (trackedTwitterObjects[i].type == 'feed') {
                    SocialConfigService.getTrackedObject(trackedTwitterObjects[i].index, null, function(tweets) {
                        $scope.tweetsLength = tweets.length;
                        for (var i = 0; i < tweets.length; i++) {
                            tweets[i].type = 'twitter';
                            $scope.feed.push(tweets[i]);
                        };
                    });
                }
                if (trackedTwitterObjects[i].type == 'follower') {
                    SocialConfigService.getTrackedObject(trackedTwitterObjects[i].index, null, function(followers) {
                        $scope.followersLength = followers.length;
                        for (var i = 0; i < followers.length; i++) {
                            followers[i].type = 'twitter';
                            $scope.feed.push(followers[i]);
                        };
                    });
                }
            };
        };

        $scope.fbAdminPages = [];
        $scope.feedLengths = [];

        SocialConfigService.getAllSocialConfig(function(config) {
            var socialAccountMap = {};
            for (var i = 0; i < config.socialAccounts.length; i++) {
                socialAccountMap[config.socialAccounts[i].id] = config.socialAccounts[i].type;
            }
            //handle each tracked object
            for (var i = 0; i < config.trackedObjects.length; i++) {
                var obj = config.trackedObjects[i];
                // console.log('handling object:', obj);
                if (obj.type === 'feed') {
                    $scope.feedLengths[obj.socialId] = 0;
                    if (socialAccountMap[obj.socialId] === 'tw') {
                        SocialConfigService.getTrackedObject(i, obj.socialId, function(tweets, socialId) {
                            $scope.feedLengths[socialId] = $scope.feedLengths[socialId] + tweets.length;
                            for (var i = 0; i < tweets.length; i++) {
                                tweets[i].type = 'twitter';
                                tweets[i].socialAccountId = socialId;
                                $scope.feed.push(tweets[i]);
                            };
                        });
                    } else if (socialAccountMap[obj.socialId] === 'fb') {
                        SocialConfigService.getTrackedObject(i, obj.socialId, function(posts, socialId) {
                            $scope.feedLengths[socialId] = $scope.feedLengths[socialId] + posts.length;
                            for (var i = 0; i < posts.length; i++) {
                                posts[i].type = 'facebook';
                                posts[i].socialAccountId = socialId;
                                $scope.fbPostsLength += 1;
                                posts[i].from.profile_pic = 'https://graph.facebook.com/' + posts[i].from.sourceId + '/picture?width=32&height=32';
                                $scope.feed.push(posts[i]);
                            };
                        });
                    }
                } else if (obj.type === 'pages') {
                    console.log('has pages >>>');
                    console.log('obj ', obj);

                    // SocialConfigService.getFBPages(obj.id, function(fbAdminPages) {
                    //     console.log('fbAdminPages ', fbAdminPages);
                    // });

                } else if (obj.type === 'likes') {

                } else if (obj.type === 'user') {

                } else if (obj.type === 'mentions') {

                } else if (obj.type === 'numberTweets') {

                } else if (obj.type === 'numberFollowers') {
                    if (socialAccountMap[obj.socialId] === 'tw') {
                        SocialConfigService.getTrackedObject(i, obj.socialId, function(followers, socialId) {
                            console.log('followers socialId ', socialId);
                            $scope.feedLengths[socialId] = $scope.feedLengths[socialId] + followers.length;
                            for (var i = 0; i < followers.length; i++) {
                                followers[i].type = 'twitter';
                                followers[i].socialId = socialId;
                                followers[i].socialAccountId = socialId;
                                $scope.feed.push(followers[i]);
                            };
                        });
                    }

                } else if (obj.type === 'profile') {
                    if (socialAccountMap[obj.socialId] === 'tw') {
                        SocialConfigService.getTrackedObject(i, obj.socialId, function(profile, socialId) {
                            profile.type = 'twitter';
                            profile.socialId = socialId;
                            $scope.feedTypes.push(profile);
                        });
                    } else if (socialAccountMap[obj.socialId] === 'fb') {
                        SocialConfigService.getTrackedObject(i, obj.socialId, function(profile, socialId) {
                            profile.socialId = socialId;
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

        $scope.handleFBPost = function(socialAccountId, post) {
            SocialConfigService.postFBPost(socialAccountId, post, function(data) {
                console.log('data >> ', data);
                $scope.afterPosting();
            });
        };

        $scope.afterPosting = function() {
            //clear spinner
            $scope.postingToSocial = false;
            //clear form
            $scope.postContent = null;
            document.getElementById('postContent').value = "";
        };

        $scope.postContent = null;

        $scope.postToSocial = function(socialAccountId, post, type) {

            //show spinner
            $scope.postingToSocial = true;
            if (type == 'facebook') {
                $scope.handleFBPost(socialAccountId, post);
            }
        };

    }]);
});
