'use strict';
/**
 * controller for products
 */
(function(angular) {
    app.controller('SocialFeedCtrl', ["$scope", "$q", "toaster", "$modal", "$filter", "$location", "WebsiteService", "UserService", "SocialConfigService", function($scope, $q, toaster, $modal, $filter, $location, WebsiteService, UserService, SocialConfigService) {

        $scope.openModal = function(modal) {
            $scope.modalInstance = $modal.open({
                templateUrl: modal,
                scope: $scope
            });
        };

        $scope.closeModal = function() {
            $scope.modalInstance.close();
        };

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

        };

        $scope.feed = [];
        $scope.displayedFeed = [];

        $scope.itemsDisplayedInList = 20;
        $scope.socialScrollFn = function() {
            if ($scope.itemsDisplayedInList < $scope.feed.length) {
                $scope.$apply(function() {
                    var beforeInList = $scope.itemsDisplayedInList;
                    $scope.itemsDisplayedInList = $scope.itemsDisplayedInList + 20;
                    var anotherFifty = $scope.feed.slice(beforeInList, $scope.itemsDisplayedInList);
                    for (var i = 0; i < anotherFifty.length; i++) {
                        $scope.displayedFeed.push(anotherFifty[i]);
                    };
                });
            }
        };

        $scope.saveScrollFn = function() {
            console.log('saveScrollFn >>>');
        };

        /*
         * @finishOnboarding
         * finish the onboarding process by updating the user preferences
         */

        $scope.finishOnboarding = function() {
            // $scope.userPreferences.tasks.create_campaign = true;
            // UserService.updateUserPreferences($scope.userPreferences, false, function() {});
        };

        /*
         * @$location.$$search.onboarding
         * determine if onboarding params are in the url
         */

        if ($location.$$search.onboarding) {
            $scope.beginOnboarding($location.$$search.onboarding);
        }


        /*
         * @getUserPreferences
         * get the user preferences to apply to marketing and to modify and send back
         */

        UserService.getUserPreferences(function(preferences) {
            // $scope.userPreferences = preferences;
            // if ($scope.userPreferences.tasks) {
            //   if ($scope.showOnboarding = false && $scope.userPreferences.tasks.create_campaign == undefined || $scope.userPreferences.tasks.create_campaign == false) {
            //     $scope.finishOnboarding();
            //   }
            // }
            // $scope.activeTab = preferences.indi_default_tab;
            // if (preferences.welcome_alert) {
            //   $scope.initialWelcome = preferences.welcome_alert.initial;
            // } else {
            //   //TODO: what makes sense here?
            // }

        });

        /*
         * @savePreferencesFn
         * save the user preferences for marketing tab and onboarding
         */

        $scope.savePreferencesFn = function() {
            UserService.updateUserPreferences($scope.userPreferences, false, function() {})
        };

        /*
         * @getAllSocialConfig
         * get the social config for this account and pull the social feeds/info
         */

        $scope.config = {};
        $scope.fbAdminPages = [];
        $scope.feedLengths = {};
        $scope.feeds = [];
        $scope.feedTypes = [];
        $scope.filters = [];
        $scope.filtersValues = [".posts-", ".link-", ".status-", ".video-", ".photo-", ".tweet-", ".follower-"];
        $scope.fbPostsLength = 0;
        $scope.fbProfiles = [];
        $scope.feedList = [];

        $scope.typeLogic = {
            feed: {
                tw: function(tweets, socialId) {
                    $scope.feedLengths[socialId] = tweets.length;
                    for (var i = 0; i < tweets.length; i++) {
                        tweets[i].type = 'tw';
                        tweets[i].socialAccountId = socialId;
                        $scope.feed.push(tweets[i]);
                    };
                },
                fb: function(posts, socialId) {
                    $scope.feedLengths[socialId] = posts.length;
                    for (var i = 0; i < posts.length; i++) {
                        posts[i].type = 'fb';
                        posts[i].socialAccountId = socialId;
                        $scope.fbPostsLength += 1;
                        posts[i].from.profile_pic = 'https://graph.facebook.com/' + posts[i].from.sourceId + '/picture?width=32&height=32';
                        $scope.feed.push(posts[i]);
                    };
                }
            },
            pages: {
                fb: {
                    account: function(fbAdminPages, socialId) {
                        for (var k = 0; k < fbAdminPages.length; k++) {
                            fbAdminPages[k].socialId = socialId;
                            $scope.fbAdminPages.push(fbAdminPages[k]);
                        };
                    }
                }
            },
            numberFollowers: {
                tw: function(followers, socialId) {
                    $scope.feedLengths[socialId] = followers.length;
                    for (var i = 0; i < followers.length; i++) {
                        followers[i].type = 'tw';
                        followers[i].socialId = socialId;
                        followers[i].socialAccountId = socialId;
                        $scope.feed.push(followers[i]);
                    };
                }
            },
            profile: {
                tw: function(profile, socialId) {
                    profile.type = 'tw';
                    profile.socialId = socialId;
                    profile.open = true;
                    $scope.feedTypes.push(profile);
                    var toggle = false;
                    $scope.config.trackedAccounts.forEach(function(value, index) {
                        if (value.id == socialId) {
                            toggle = value.toggle;
                        }
                    });
                    $scope.filtersValues.forEach(function(value, index) {
                        if (toggle) {
                            $scope.filters.push(value + socialId);
                        }
                    });
                },
                fb: function(profile, socialId) {
                    profile.socialId = socialId;
                    profile.type = 'fb';
                    profile.open = true;
                    $scope.fbProfiles.push(profile);
                    $scope.feedTypes.push(profile);
                    var toggle = false;
                    $scope.config.trackedAccounts.forEach(function(value, index) {
                        if (value.id == socialId) {
                            toggle = value.toggle;
                        }
                    });
                    $scope.filtersValues.forEach(function(value, index) {
                        if (toggle) {
                            $scope.filters.push(value + socialId);
                        }
                    });
                }
            },
            go: function(posts) {
                for (var i = 0; i < posts.length; i++) {
                    posts[i].type = 'go';
                    $scope.feed.push(posts[i]);
                };
            }
        };

        SocialConfigService.getAllSocialConfig(function(config) {
            $scope.config = config;
            var trackedAccountMap = {};
            var socialPromises = [];
            var promiseProcessor = [];
            var promiseSocialId = [];
            $scope.feedTree = [];

            config.trackedAccounts.forEach(function(value, index) {
                trackedAccountMap[value.id] = value;
            });

            config.trackedObjects.forEach(function(value, index) {
                if (trackedAccountMap[value.socialId] == undefined) {
                    console.warn(value.socialId, 'Account is not tracked or toggled.');
                    return;
                }

                $scope.feedLengths[value.socialId] = 0;

                if (value.type == 'feed') {
                    socialPromises.push(SocialConfigService.getTrackedObjectPromise(index, value.socialId));
                    promiseProcessor.push([value.type, trackedAccountMap[value.socialId].type]);
                    promiseSocialId.push(value.socialId);
                }

                if (value.type === 'pages') {
                    if (trackedAccountMap[value.socialId].type === 'fb') {
                        var accounts = config.trackedAccounts;
                        var matchingAccount = '';
                        for (var l = 0; l < accounts.length; l++) {
                            if (accounts[l].id == value.socialId) {
                                matchingAccount = accounts[l];
                            }
                        }
                        if (matchingAccount.accountType == 'account') {
                            socialPromises.push(SocialConfigService.getFBPagesPromise(value.socialId));
                        }
                        if (matchingAccount.accountType == 'adminpage') {
                            socialPromises.push(SocialConfigService.getFBPagesPromise(value.socialId));
                        }
                        promiseProcessor.push([value.type, trackedAccountMap[value.socialId].type, matchingAccount.accountType]);
                    }
                    promiseSocialId.push(value.socialId);
                }

                if (value.type == 'numberFollowers') {
                    socialPromises.push(SocialConfigService.getTrackedObjectPromise(index, value.socialId));
                    promiseProcessor.push([value.type, trackedAccountMap[value.socialId].type]);
                    promiseSocialId.push(value.socialId);
                }

                if (value.type === 'profile') {
                    socialPromises.push(SocialConfigService.getTrackedObjectPromise(index, value.socialId));
                    promiseProcessor.push([value.type, trackedAccountMap[value.socialId].type]);
                    promiseSocialId.push(value.socialId);
                }

            });

            $q.all(socialPromises)
                .then(function(data) {
                    data.forEach(function(value, index) {
                        var logicFn = null;
                        if (promiseProcessor[index].length == 3) {
                            var logicFn = $scope.typeLogic[promiseProcessor[index][0]][
                                promiseProcessor[index][1]
                            ][
                                promiseProcessor[index][2]
                            ];
                        }
                        if (promiseProcessor[index].length == 2) {
                            var logicFn = $scope.typeLogic[promiseProcessor[index][0]][
                                promiseProcessor[index][1]
                            ];
                        }

                        if (promiseProcessor[index].length == 1) {
                            var logicFn = $scope.typeLogic[promiseProcessor[index][0]];
                        }

                        if (logicFn) {
                            logicFn(value.data, promiseSocialId[index]);
                        } else {
                            console.warn('Logic not found');
                            console.warn(value.data, promiseSocialId[index]);
                        }

                        var filters = $scope.filters.join(',');
                        if (filters == '') {
                            filters = 'hidden';
                        }

                        setTimeout(function() {
                            // $('.stream').isotope({
                            //     itemSelector: '.item',
                            //     filter: filters
                            // });
                        }, 500);
                    });

                    //order feed by date
                    //push first 50 into display

                    var firstFifty = $scope.feed.slice(1, $scope.itemsDisplayedInList);

                    $scope.displayedFeed = firstFifty;
                    $scope.feedTypes.forEach(function(profile, index) {
                        profile.admins = [];
                        $scope.fbAdminPages.forEach(function(admin, index) {
                            if (admin.socialId == profile.socialId) {
                                profile.admins.push(admin);
                            }
                        });
                        $scope.feedTree.push(profile);
                    });

                    $scope.addCommentAdminPage = $scope.fbAdminPages[0];
                    $scope.isLoaded = true;
                });
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
            if (type == 'twitter') {
                $scope.handleTwitterPost(socialAccountId, post);
            }
        };

        $scope.fbAdminPagesforLikes = [];

        $scope.tempPost2Like = function(post) {
            $scope.tempPost = post;
        };

        $scope.showPostModal = function(post) {
            $scope.tempPost = post;
            $scope.tempFBAdminPages = $scope.fbProfiles.concat($scope.fbAdminPages);
            for (var i = 0; i < $scope.tempFBAdminPages.length; i++) {
                $scope.tempFBAdminPages[i].liked = $scope.checkLikeExistFn($scope.tempFBAdminPages[i]);
            };
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
         * @handleFBPost
         * handle the facebook post from @postToSocial
         */

        $scope.handleTwitterPost = function(socialAccountId, post) {
            SocialConfigService.postTwitterPost(socialAccountId, post, function(data) {
                $scope.afterPosting();
            });
        };

        /*
         * @likeFBPost
         * like a post on facebook
         */

        $scope.likeFBPost = function(page, $event) {
            // console.log('page', page);
            // var value = $event.target.attributes.class.value;
            // var tempClass = value.replace('fa-thumbs-up', 'fa-spinner fa-spin');
            // $event.target.setAttribute('class', tempClass);
            var trackedAccount = _.find($scope.config.trackedAccounts, function(tracked) {
                return tracked.socialId == page.socialId;
            });
            SocialConfigService.likeFBPost(trackedAccount.id, $scope.tempPost.sourceId, function(postReturn) {
                // var newTempClass = value + ' liked';
                // $event.target.setAttribute('class', newTempClass);
                if ($scope.tempPost.likes) {
                    $scope.tempPost.likes.push({
                        sourceId: page.sourceId,
                        name: page.name
                    });
                } else {
                    $scope.tempPost.likes = [{
                        sourceId: page.sourceId,
                        name: page.name
                    }];
                }
                $scope.tempFBAdminPages = $scope.fbProfiles.concat($scope.fbAdminPages);
                for (var i = 0; i < $scope.tempFBAdminPages.length; i++) {
                    $scope.tempFBAdminPages[i].liked = $scope.checkLikeExistFn($scope.tempFBAdminPages[i]);
                };
                ToasterService.show('success', 'liked post');
            });
        };

        /*
         * @removelikeFBPost
         * remove a like post on facebook
         */

        $scope.removeLikeFBPost = function(page, $event) {
            var trackedAccount = _.find($scope.config.trackedAccounts, function(tracked) {
                return tracked.socialId == page.socialId;
            });
            SocialConfigService.unlikeFBPost(trackedAccount.id, $scope.tempPost.sourceId, function(postReturn) {
                $scope.tempPost.likes.forEach(function(value, index) {
                    if (value.sourceId == page.sourceId) {
                        $scope.tempPost.likes.splice(index, 1);
                    }
                });
                $scope.tempFBAdminPages = $scope.fbProfiles.concat($scope.fbAdminPages);
                for (var i = 0; i < $scope.tempFBAdminPages.length; i++) {
                    $scope.tempFBAdminPages[i].liked = $scope.checkLikeExistFn($scope.tempFBAdminPages[i]);
                };
                ToasterService.show('warning', 'unliked post.');
            });
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
         * @checkAccountExistFn
         * check to see if at account exists in the config
         */


        $scope.checkAccountExistFn = function(id) {
            console.log(id);
            var status = false;
            $scope.config.trackedAccounts.forEach(function(value, index) {
                if (value.parentSocialAccount == id || value.socialId == id) {
                    status = true;
                }
            });
            return status;
        };


        $scope.checkLikeExistFn = function(adminPage) {
            var status = false;
            if ($scope.tempPost == undefined) {
                return status;
            }
            if ($scope.tempPost.likes == undefined) {
                return status;
            }
            $scope.tempPost.likes.forEach(function(like, index) {
                if (adminPage.sourceId == like.sourceId) {
                    status = true;
                }
            });

            return status;
        };

        /*
         * @addPageFeed
         * add an admin feed to the social account using the parent access token
         */

        $scope.addPageFeed = function(obj, parent) {
            var newSocialAccount = {};
            if (parent) {
                var socialAccount = _.find($scope.config.socialAccounts, function(socialAccount) {
                    return socialAccount.socialId == obj.id;
                });
                newSocialAccount = socialAccount;
                newSocialAccount.toggle = true;
                newSocialAccount.parentSocialAccount = socialAccount.id;
            } else {
                var trackedAccount = _.find($scope.config.trackedAccounts, function(trackedAccount) {
                    return trackedAccount.id == obj.socialId;
                });
                newSocialAccount = trackedAccount;
                newSocialAccount.name = obj.name;
                newSocialAccount.socialId = obj.sourceId;
                newSocialAccount.accountType = 'adminpage';
                newSocialAccount.socialUrl = 'https://www.facebook.com/app_scoped_user_id/' + obj.sourceId + '/';
                newSocialAccount.parentSocialAccount = trackedAccount.parentSocialAccount;
                newSocialAccount.accessToken = obj.page_access_token;
                newSocialAccount.toggle = true;
            }
            SocialConfigService.addTrackedAccount(newSocialAccount, function(data) {
                $scope.config = data;
                $scope.config.trackedObjects.forEach(function(value, index) {
                    if (value.socialId == page.sourceId) {
                        SocialConfigService.getTrackedObject(index, value.socialId, function(tracked) {
                            if (page.type == 'facebook') {
                                $scope.typeLogic.feed.fb(tracked, value.socialId);
                            }

                            if (page.type == 'twitter') {
                                $scope.typeLogic.feed.tw(tracked, value.socialId);
                            }
                        });
                    }
                });
                $scope.filterFeedActualFn(page);
                ToasterService.show('success', 'Feed Added');
            });
        };

        /*
         * @deleteSocialAccountFn
         * delete a social account from the config
         */

        $scope.deleteSocialAccountFn = function(admin) {
            var tracked = null;
            if (admin.type == 'adminpage') {
                tracked = _.find($scope.config.trackedAccounts, function(obj) {
                    return admin.id == obj.parentSocialAccount
                });
            } else {
                tracked = _.find($scope.config.trackedAccounts, function(obj) {
                    return admin.socialId == obj.id
                });
            }
            SocialConfigService.deleteTrackedAccount(tracked.id, function(data) {
                $scope.config = data;
                var index = null;
                $scope.fbAdminPages.forEach(function(value, index) {
                    if (value.socialId == admin.socialId) {
                        $scope.fbAdminPages.splice(index, 1);
                    }
                });
                $scope.feedTypes.forEach(function(value, index) {
                    if (value.id === admin.id || value.id === admin.sourceId) {
                        $scope.feedTypes.splice(index, 1);
                    }
                });
                $scope.filterFeedActualFn(admin);
                ToasterService.show('warning', 'Social feed removed.');
            });
        };
        /*
         * @watchCollection - feed
         * watch the feed and after 2sec of waiting on new items set isotope
         */

        var feedTimer;

        // $scope.$watchCollection('feed', function(newFeed, oldFeed) {
        //   $timeout.cancel(feedTimer);
        //   feedTimer = $timeout(function() {
        //     var $container = $('.stream');
        //     // init
        //     $container.isotope({
        //       // options
        //       itemSelector: '.item',
        //       layoutMode: 'masonry',
        //       getSortData: {
        //         date: function($elem) {
        //           return Date.parse($elem.data('date'));
        //         }
        //       }
        //     });
        //   }, 4000);
        // });

        /*
         * @addCommentFn
         * add a comment via api and visibily
         */

        $scope.visibleComments = [];

        $scope.addFbCommentFn = function(comment) {
            SocialConfigService.addFacebookPostComment($scope.addCommentAdminPage.socialId, $scope.addCommentPage.sourceId, comment, function(comment) {
                var retComment = {
                    socialId: comment,
                    picture: $scope.addCommentAdminPage.picture.data.url,
                    created: new Date(),
                    name: $scope.addCommentAdminPage.name,
                    comment: $scope.addComment
                };
                $scope.feed.push(retComment);
                $scope.visibleComments.push(retComment);
                ToasterService.show('success', 'Comment added', 'Comment added to the facebook post.');
            });
        };

        $scope.setAddCommentAdminPageFn = function(twitterCommentProfile) {
            twitterCommentProfile = _.find($scope.feedTypes, function(type) {
                return type.socialId == twitterCommentProfile
            });
            $scope.addCommentAdminPage = twitterCommentProfile;
        };

        $scope.addTwCommentFn = function(comment) {
            SocialConfigService.addTwitterPostComment($scope.addCommentAdminPage.socialId, $scope.addCommentPage.sourceId, $scope.addCommentAdminPage.name, comment, function(comment) {
                ToasterService.show('success', 'Comment added', 'Comment added to the twitter post.');
            });
        };

        /*
         * @updateComments
         * update the visible comments to display in the comment modal
         */

        $scope.updateComments = function(page) {
            $scope.addCommentPage = page;
            console.log('comments ', page.comments);
            $scope.visibleComments = page.comments;
        };

        /*
         * @filterFeed
         * filter the feed when the checkboxes are check on the left panel
         */

        $scope.checkTrackedToggleFn = function(id) {
            var status = false;

            $scope.config.trackedAccounts.forEach(function(value, index) {
                if (value.id == id && value.toggle == true) {
                    status = true;
                }
            });

            return status;
        };

        $scope.filterFeedActualFn = function(type, filterValue) {
            var value = filterValue || [];

            if (value.length == 0) {
                $scope.filtersValues.forEach(function(filterType, index) {
                    value.push(filterType + type.id);
                });
            }

            var isChecked = false;

            $scope.config.trackedAccounts.forEach(function(account, index) {
                if (account.socialId == type.socialId) {
                    if (account.toggle) {
                        $scope.config.trackedAccounts[index].toggle = false;
                        isChecked = false;
                    } else {
                        $scope.config.trackedAccounts[index].toggle = true;
                        isChecked = true;
                    }
                    SocialConfigService.updateTrackedAccount($scope.config.trackedAccounts[index], function(data) {
                        $scope.config = data;
                    });
                }
            });

            // $('.stream').isotope({
            //     itemSelector: '.item'
            // });

            if (Array.isArray(value)) {
                var split = value;
            } else {
                var split = value.split(',');
            }

            split.forEach(function(v, i) {
                v = v.trim();

                if (isChecked) {
                    if ($scope.filters.indexOf(v) == -1) {
                        $scope.filters.push(v);
                    }
                } else {
                    if ($scope.filters.indexOf(v) > -1) {
                        $scope.filters.splice($scope.filters.indexOf(v), 1);
                    }
                }
            });

            var filters = $scope.filters.join(',');

            if (!filters) {
                //can be anything, just not any of the current filters
                filters = 'no-accounts'
            }
            // $('.stream').isotope({
            //     filter: filters
            // });
        };

        $scope.filterFeed = function(type, $event) {
            $event.stopPropagation();
            $event.preventDefault();

            var value = $($event.target).attr('data-value');
            $scope.filterFeedActualFn(type, value);
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

        $scope.updateFeedListFn = function() {
            if ($scope.config.socialAccounts && $scope.config.trackedAccounts && $scope.feedTypes.length) {
                $scope.config.trackedAccounts.forEach(function(trackedAccount, trackedIndex) {
                    var feed = _.find($scope.feedList, function(feed) {
                        return feed.socialId == trackedAccount.socialId;
                    });
                    if (feed) {
                        return;
                    }
                    var insertDict = trackedAccount;
                    if (trackedAccount.type == 'adminpage') {
                        var socialPage = _.find($scope.fbAdminPages, function(page) {
                            return page.sourceId == trackedAccount.socialId;
                        });
                        var socialAccount = _.find($scope.config.socialAccounts, function(account) {
                            return account.id == trackedAccount.parentSocialAccount;
                        });
                        var socialProfile = _.find($scope.feedTypes, function(profile) {
                            return profile.id == socialAccount.socialId;
                        });
                        if (socialPage) {
                            insertDict.name = socialPage.name;
                        }
                        if (socialProfile) {
                            insertDict.type = socialProfile.type;
                            if (socialProfile.picture) {
                                insertDict.image = socialProfile.picture.data.url;
                            } else {
                                insertDict.image = socialProfile.profile_image_url;
                            }
                        }
                    } else {
                        var socialAccount = _.find($scope.config.socialAccounts, function(account) {
                            return account.id == trackedAccount.parentSocialAccount;
                        });
                        var socialProfile = _.find($scope.feedTypes, function(profile) {
                            return profile.id == socialAccount.socialId;
                        });
                        console.log(socialProfile);
                        if (socialProfile) {
                            insertDict.type = socialProfile.type;
                            if (socialProfile.picture) {
                                insertDict.image = socialProfile.picture.data.url;
                            } else {
                                insertDict.image = socialProfile.profile_image_url;
                            }
                            insertDict.name = socialProfile.name;
                        }
                    }
                    $scope.feedList.push(insertDict);
                });
                console.log('feedList >>>', $scope.feedList);
            } else {
                console.error('No profile found', $scope.feedTypes);
            }
        };

        $scope.$watch('config.trackedAccounts', function(newValue, oldValue) {
            $scope.updateFeedListFn();
        }, true);

        $scope.$watch('feedTypes', function(newValue, oldValue) {
            $scope.updateFeedListFn();
        }, true);

    }]);
})(angular);
