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

        $scope.socialAccounts = [];
        $scope.trackedAccounts = [];
        $scope.feed = [];

        $scope.getSocialConfig = function() {
            SocialConfigService.getAllSocialConfig(function(config) {
                $scope.initializeSocialConfig(config);
            });
        };

        $scope.initializeSocialConfig = function(config) {

            //TODO: Make $q promises instead of nested functions

            $scope.config = config;

            config.socialAccounts.forEach(function(socialAccount, index) {

                if (socialAccount.type == 'fb') {
                    //get profile data for each account
                    SocialConfigService.getFBProfile(socialAccount.id, function(profile) {
                        socialAccount.profile = profile;
                    });
                    //get any admin pages associated with the account
                    SocialConfigService.getFBPages(socialAccount.id, function(pages) {
                        var tmpPages = [];
                        pages.forEach(function(page, index) {
                            page.parentId = socialAccount.id;
                            config.trackedAccounts.forEach(function(trackedAccount) {
                                if (page.sourceId == trackedAccount.socialId) {
                                    page.tracked = true;
                                }
                            });
                            tmpPages.push(page);
                        });
                        socialAccount.admins = tmpPages;
                        //check to see if the parent are tracked
                        config.trackedAccounts.forEach(function(trackedAccount) {
                            if (socialAccount.socialId == trackedAccount.socialId) {
                                socialAccount.tracked = true;
                            }
                        });
                        //push the combined social account, profile, and admin pages into all social accounts array

                        $scope.socialAccounts.push(socialAccount);
                        $scope.initializeTrackedAccounts(config);
                    });
                }

            });

        };

        $scope.initializeTrackedAccounts = function(config) {
            //check to see if the parent or tracked
            config.trackedAccounts.forEach(function(trackedAccount, index) {
                if (trackedAccount.type == 'fb') {
                    if (trackedAccount.accountType == 'account') {
                        for (var i = 0; i < $scope.socialAccounts.length; i++) {
                            if ($scope.socialAccounts.socialId = trackedAccount.socialId) {
                                trackedAccount.profile = $scope.socialAccounts[0].profile;
                            }
                        }
                    }
                    if (trackedAccount.accountType == 'adminpage') {
                        //get profile data for each account
                        for (var i = 0; i < $scope.socialAccounts.length; i++) {
                            if ($scope.socialAccounts[i].id == trackedAccount.parentSocialAccount) {
                                var admins = $scope.socialAccounts[i].admins;
                                for (var j = 0; j < admins.length; j++) {
                                    if (admins[j].sourceId == trackedAccount.socialId) {
                                        trackedAccount.profile = admins[j];
                                    }
                                }
                            }
                        }
                    }

                    $scope.trackedAccounts.push(trackedAccount);
                }
                SocialConfigService.getFBPosts(trackedAccount.id, function(posts) {
                    posts.forEach(function(post) {
                        post.trackedId = trackedAccount.id;
                        $scope.feed.push(post);
                    });
                });
            });

            $scope.displayFeed = $scope.feed;
        };

        $scope.filterFeed = function(type) {
            console.log('type.id ', type.id);
            var updatedTrackedAccount = _.find($scope.config.trackedAccounts, function(trackedAccount) {
                return trackedAccount.id == type.id;
            });
            if (type.toggle) {
                updatedTrackedAccount.toggle = false;
                var newDisplayFeed = _.filter($scope.displayFeed, function(post) {
                    return post.trackedId != updatedTrackedAccount.id;
                });
                $scope.displayFeed = newDisplayFeed;
            } else {
                updatedTrackedAccount.toggle = true;
                var newDisplayFeed = _.filter($scope.feed, function(post) {
                    return post.trackedId == updatedTrackedAccount.id;
                });
                _.each(newDisplayFeed, function(post) {
                    $scope.displayFeed.push(post);
                });
            }
        };

        /*
         * @addPageFeed
         * add an admin feed to the social account using the parent access token
         */

        $scope.addPageFeed = function(obj, parent) {
            obj.profile = null;
            var newSocialAccount = {};
            if (parent) {
                var socialAccount = _.find($scope.config.socialAccounts, function(socialAccount) {
                    return socialAccount.socialId == obj.id;
                });
                newSocialAccount = angular.copy(socialAccount);
                newSocialAccount.toggle = true;
                newSocialAccount.parentSocialAccount = socialAccount.id;
            } else {
                var trackedAccount;
                for (var i = 0; i < $scope.config.trackedAccounts.length; i++) {
                    if ($scope.config.trackedAccounts[i].parentSocialAccount == obj.parentId) {
                        trackedAccount = angular.copy($scope.config.trackedAccounts[i]);
                        newSocialAccount = trackedAccount;
                        newSocialAccount.name = obj.name;
                        newSocialAccount.socialId = obj.sourceId;
                        newSocialAccount.accountType = 'adminpage';
                        newSocialAccount.socialUrl = 'https://www.facebook.com/app_scoped_user_id/' + obj.sourceId + '/';
                        newSocialAccount.parentSocialAccount = trackedAccount.parentSocialAccount;
                        newSocialAccount.accessToken = obj.page_access_token;
                        newSocialAccount.toggle = true;
                    }
                }
            }
            SocialConfigService.addTrackedAccount(newSocialAccount, function(data) {
                //TODO: Add without refreshing
                $scope.socialAccounts = [];
                $scope.trackedAccounts = [];
                $scope.feed = [];
                $scope.initializeSocialConfig(data);
                toaster.pop('success', 'Feed Added');
            });
        };

        /*
         * @deleteSocialAccountFn
         * delete a social account from the config
         */

        $scope.deleteSocialAccountFn = function(admin) {
            var tracked = null;
            if (admin.parentId) {
                tracked = _.find($scope.config.trackedAccounts, function(obj) {
                    return admin.sourceId == obj.socialId
                });
            } else {
                tracked = _.find($scope.config.trackedAccounts, function(obj) {
                    return admin.socialId == obj.id
                });
            }
            SocialConfigService.deleteTrackedAccount(tracked.id, function(data) {
                //TODO: Delete without refreshing
                $scope.socialAccounts = [];
                $scope.trackedAccounts = [];
                $scope.feed = [];
                $scope.initializeSocialConfig(data);
                toaster.pop('warning', 'Social feed removed.');
            });
        };

        /*
         * @postToSocial
         * post to any of the social account using the social accountId and type
         */

        $scope.postContent = null;

        $scope.postToSocial = function(socialAccountId, post, type) {
            //show spinner
            $scope.postingToSocial = true;
            if (type == 'fb') {
                $scope.handleFBPost(socialAccountId, post);
            }
            if (type == 'tw') {
                $scope.handleTwitterPost(socialAccountId, post);
            }
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
         * @handleTwitterPost
         * handle the twitter post from @postToSocial
         */

        $scope.handleTwitterPost = function(socialAccountId, post) {
            SocialConfigService.postTwitterPost(socialAccountId, post, function(data) {
                $scope.afterPosting();
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
         * @postToChange
         * when selecting what account to post to, change the selected social account
         */

        $scope.postToChange = function(type) {
            var parsed = JSON.parse(type);
            $scope.selectedSocial = parsed;
        };


    }]);
})(angular);
