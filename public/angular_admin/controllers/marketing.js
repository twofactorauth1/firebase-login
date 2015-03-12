define(['app', 'campaignService', 'userService', 'socialService', 'timeAgoFilter', 'socialConfigService', 'underscore', 'constants', 'moment', 'ngOnboarding', 'isotope'], function(app) {
    app.register.controller('MarketingCtrl', ['$scope', '$location', 'UserService', 'CampaignService', 'SocialService', 'SocialConfigService', '$timeout', function($scope, $location, UserService, CampaignService, SocialService, SocialConfigService, $timeout) {

        /*
         * @beginOnboarding
         * begin the onboarding process if this is the users first time
         */



        $scope.showOnboarding = false;
        $scope.stepIndex = 0;
        $scope.onboardingSteps = [{
            overlay: false
        }]
        $scope.beginOnboarding = function(type) {
            if (type == 'create-campaign') {

                $scope.onboardingSteps = [{
                    overlay: true,
                    title: 'Task: Create new campaign',
                    description: "Here you can create a new campaign to gain traction.",
                    position: 'centered',
                    width: 400
                }];
            }
        };

        /*
         * @finishOnboarding
         * finish the onboarding process by updating the user preferences
         */

        $scope.finishOnboarding = function() {
            $scope.userPreferences.tasks.create_campaign = true;
            UserService.updateUserPreferences($scope.userPreferences, false, function() {});
        };

        /*
         * @$location.$$search.onboarding
         * determine if onboarding params are in the url
         */

        if ($location.$$search.onboarding) {
            $scope.beginOnboarding($location.$$search.onboarding);

        }

        /*
         * @watch - activeTab
         * update the tab which is currently acitive in marketing
         */

        $scope.activeTab = 'social-feed';

        $scope.$watch('activeTab', function(newValue, oldValue) {
            if ($scope.userPreferences) {
                $scope.userPreferences.indi_default_tab = newValue;
                $scope.savePreferencesFn();
            }
        });

        /*
         * @getUserPreferences
         * get the user preferences to apply to marketing and to modify and send back
         */

        UserService.getUserPreferences(function(preferences) {
            $scope.userPreferences = preferences;
            if ($scope.userPreferences.tasks) {
                if ($scope.showOnboarding = false && $scope.userPreferences.tasks.create_campaign == undefined || $scope.userPreferences.tasks.create_campaign == false) {
                    $scope.finishOnboarding();
                }
            }
            $scope.activeTab = preferences.indi_default_tab;
            if (preferences.welcome_alert) {
                $scope.initialWelcome = preferences.welcome_alert.initial;
            } else {
                //TODO: what makes sense here?
            }

        });

        /*
         * @savePreferencesFn
         * save the user preferences for marketing tab and onboarding
         */

        $scope.savePreferencesFn = function() {
            UserService.updateUserPreferences($scope.userPreferences, false, function() {})
        };

        /*
         * @campaignSettings
         * default campaign settings to display
         */

        $scope.campaignSettings = {
            showStatus: true,
            showType: true,
            showConversions: true,
            showContacts: true
        };

        /*
         * @getCampaigns
         * get the list of campaings to display in the campaign manager
         */

        $scope.campaigns = [];

        CampaignService.getCampaigns(function(campaigns) {
            $scope.campaigns = campaigns;
        });

        /*
         * @addCampaignFn
         * add a new campaign to the campaign list from the new campaign modal
         */

        $scope.addCampaignFn = function() {
            CampaignService.postCampaign($scope.newCampaign, function(campaign) {
                $scope.campaigns.push(campaign);
                $('#marketing-add-campaign').modal('hide');
            });
        };

        /*
         * @getAllSocialConfig
         * get the social config for this account and pull the social feeds/info
         */

        $scope.fbAdminPages = [];
        $scope.feedLengths = [];
        $scope.feeds = [];
        $scope.feedTypes = [];
        $scope.fbPostsLength = 0;

        SocialConfigService.getAllSocialConfig(function(config) {
            $scope.config = config;
            var socialAccountMap = {};
            for (var i = 0; i < config.socialAccounts.length; i++) {
                socialAccountMap[config.socialAccounts[i].id] = config.socialAccounts[i].type;
            }
            //handle each tracked object
            for (var i = 0; i < config.trackedObjects.length; i++) {
                var obj = config.trackedObjects[i];
                if (obj.type === 'feed') {
                    $scope.feedLengths[obj.socialId] = 0;
                    if (socialAccountMap[obj.socialId] === 'tw') {
                        SocialConfigService.getTrackedObject(i, obj.socialId, function(tweets, socialId) {
                            if ($location.$$search.onboarding) {
                                $scope.showOnboarding = true;
                            }
                            $scope.feedLengths[socialId] = $scope.feedLengths[socialId] + tweets.length;
                            for (var i = 0; i < tweets.length; i++) {
                                tweets[i].type = 'twitter';
                                tweets[i].socialAccountId = socialId;
                                $scope.feed.push(tweets[i]);
                            };
                        });
                    } else if (socialAccountMap[obj.socialId] === 'fb') {
                        SocialConfigService.getTrackedObject(i, obj.socialId, function(posts, socialId) {
                            if ($location.$$search.onboarding) {
                                $scope.showOnboarding = true;
                            }
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

                    if (socialAccountMap[obj.socialId] === 'fb') {
                        var accounts = config.socialAccounts;
                        var matchingAccount = '';
                        for (var l = 0; l < accounts.length; l++) {
                            if (accounts[l].id == obj.socialId) {
                                matchingAccount = accounts[l];
                            }
                        }
                        if (matchingAccount.accountType == 'account') {
                            SocialConfigService.getFBPages(obj.socialId, function(fbAdminPages) {
                                for (var k = 0; k < fbAdminPages.length; k++) {
                                    fbAdminPages[k].socialId = obj.socialId;
                                    $scope.fbAdminPages.push(fbAdminPages[k]);
                                };
                            });
                        }
                    }

                } else if (obj.type === 'likes') {

                } else if (obj.type === 'user') {

                } else if (obj.type === 'mentions') {

                } else if (obj.type === 'numberTweets') {

                } else if (obj.type === 'numberFollowers') {
                    if (socialAccountMap[obj.socialId] === 'tw') {
                        SocialConfigService.getTrackedObject(i, obj.socialId, function(followers, socialId) {
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
                            profile.open = false;
                            $scope.feedTypes.push(profile);
                        });
                    } else if (socialAccountMap[obj.socialId] === 'fb') {
                        SocialConfigService.getTrackedObject(i, obj.socialId, function(profile, socialId) {
                            profile.socialId = socialId;
                            profile.type = 'facebook';
                            profile.open = false;
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

        /*
         * @getTrackedObjects
         * retrieve all the tracked objects info based on @getAllSocialConfig
         */

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

        /*
         * @postToSocial
         * post to any of the social account using the social accountId and type
         */

        $scope.postContent = null;

        $scope.postToSocial = function(socialAccountId, post, type) {

            //show spinner
            $scope.postingToSocial = true;
            if (type == 'facebook') {
                $scope.handleFBPost(socialAccountId, post);
            }
        };

        $scope.fbAdminPagesforLikes = [];

        $scope.tempPost2Like = function(post) {
            //set array of pages 
            for (var i = 0; i < $scope.fbAdminPages.length; i++) {
                $scope.fbAdminPagesforLikes.push($scope.fbAdminPages[i]);
                var matched;
                _.find(post.likes, function(likeItem, index) {
                    if (likeItem.sourceId == type.id) {
                        feedIndex = index;
                        return true;
                    };
                });
                if (matched) {
                    $scope.fbAdminPagesforLikes[i].liked = true;
                } else {
                    $scope.fbAdminPagesforLikes[i].liked = false;
                }
            };
            $scope.tempPost = post;
        };

        /*
         * @handleFBPost
         * handle the facebook post from @postToSocial
         */

        $scope.handleFBPost = function(socialAccountId, post) {
            SocialConfigService.postFBPost(socialAccountId, post, function(data) {
                $scope.afterPosting();
            });
        };

        /*
         * @likeFBPost
         * like a post on facebook
         */

        $scope.likeFBPost = function(page, $event) {
            var value = $event.target.attributes.class.value;
            var tempClass = value.replace('fa-thumbs-up', 'fa-spinner fa-spin');
            $event.target.setAttribute('class', tempClass);
            SocialConfigService.likeFBPost(page.socialId, $scope.tempPost.sourceId, function(postReturn) {
                var newTempClass = value + ' liked';
                $event.target.setAttribute('class', newTempClass);
            });
        };

        /*
         * @removelikeFBPost
         * remove a like post on facebook
         */

        $scope.removeLikeFBPost = function(post) {
            console.log('remove like ', post);
        };

        /*
         * @afterPosting
         * after posting, clear the form and spinner
         */

        $scope.afterPosting = function() {
            //clear spinner
            $scope.postingToSocial = false;
            //clear form
            $scope.postContent = null;
            document.getElementById('postContent').value = "";
        };

        /*
         * @addPageFeed
         * add an admin feed to the social account using the parent access token
         */

        $scope.addPageFeed = function(page) {
            var config = $scope.config.socialAccounts;
            var newSocialAccount;
            for (var i = 0; i < config.length; i++) {
                if (config[i].id == page.socialId) {
                    newSocialAccount = config[i];
                    newSocialAccount.socialId = page.sourceId;
                    newSocialAccount.accountType = 'adminpage';
                    newSocialAccount.socialUrl = 'https://www.facebook.com/app_scoped_user_id/' + page.sourceId + '/';
                }
            }
            SocialConfigService.postSocialAccount(newSocialAccount, function(data) {
                console.log('return ', data);
            });
        };

        /*
         * @watchCollection - feed
         * watch the feed and after 2sec of waiting on new items set isotope
         */

        $scope.feed = [];
        $scope.displayedFeed = [];
        var feedTimer;

        $scope.$watchCollection('feed', function(newFeed, oldFeed) {
            $timeout.cancel(feedTimer);
            feedTimer = $timeout(function() {
                var $container = $('.stream');
                // init
                $container.isotope({
                    // options
                    itemSelector: '.item',
                    layoutMode: 'masonry',
                    getSortData: {
                        date: function($elem) {
                            return Date.parse($elem.data('date'));
                        }
                    }
                });
            }, 4000);
        });

        /*
         * @updateComments
         * update the visible comments to display in the comment modal
         */

        $scope.visibleComments = [];

        $scope.updateComments = function(comments) {
            console.log('comments ', comments);
            $scope.visibleComments = comments;
        };

        /*
         * @filterFeed
         * filter the feed when the checkboxes are check on the left panel
         */

        $scope.filters = [];

        $scope.filterFeed = function(type, $event) {
            console.log('$scope.filters ', $scope.filters);
            $event.stopPropagation();
            $event.preventDefault();

            var value = $event.target.attributes['data-value'].value;
            console.log('value ', value);

            var feedIndex;
            _.find($scope.feedTypes, function(feedItem, index) {
                if (feedItem.id == type.id) {
                    feedIndex = index;
                    return true;
                };
            });

            if ($scope.feedTypes[feedIndex].open == false) {
                $scope.feedTypes[feedIndex].open = true;
            } else {
                $scope.feedTypes[feedIndex].open = false;
            }

            $('.stream').isotope({
                itemSelector: '.item'
            });

            var split = value.split(',');
            for (var i = 0; i < split.length; i++) {
                var singleSplit = split[i].replace(/\s/g, '');
                console.log('finding ... ', singleSplit);
                console.log('in ... ', $scope.filters);
                console.log('index of ... ', $scope.filters.indexOf(singleSplit));
                if ($scope.filters.indexOf(singleSplit) > -1) {
                    $scope.filters.splice($scope.filters.indexOf(singleSplit), 1);
                } else {
                    $scope.filters.push(singleSplit);
                }
            };

            var filtersArr = [];

            console.log('$scope.filters >>> ', $scope.filters);


            // ['.red', '.blue'] -> '.red, .blue'
            var filters = $scope.filters.join(',');
            console.log('stream filters');
            $('.stream').isotope({
                filter: filters
            });
        };

        /*
         * @postToChange
         * when selecting what account to post to, change the selected social account
         */

        $scope.postToChange = function(type) {
            var parsed = JSON.parse(type);
            $scope.selectedSocial = parsed;
        };

        /*
         * @handleTwitterFeeds
         * get the twitter feeds pulled from @getAllSocialConfig
         */

        $scope.tweetsLength = 0;
        $scope.followersLength = 0;

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

        /*
         * @formatDate
         * format the date for various posts
         */

        $scope.formatDate = function(date) {
            return moment(date).format('MMMM D, YYYY [at] h:mm a');
        };

    }]);
});
