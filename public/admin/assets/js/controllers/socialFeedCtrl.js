'use strict';
/**
 * controller for social feed
 */
(function(angular) {
    app.controller('SocialFeedCtrl', ["$scope", "$q", "toaster", "$modal", "$filter", "$location", "WebsiteService", "UserService", "SocialConfigService", function($scope, $q, toaster, $modal, $filter, $location, WebsiteService, UserService, SocialConfigService) {

        /*
         * @openModal
         * -
         */

        $scope.openModal = function(modal) {
            $scope.modalInstance = $modal.open({
                templateUrl: modal,
                scope: $scope
            });
        };

        /*
         * @closeModal
         * -
         */

        $scope.closeModal = function() {
            $scope.modalInstance.close();
        };

        /*
         * @getSocialConfig
         * -
         */

        $scope.getSocialConfig = function() {
            SocialConfigService.getAllSocialConfig(function(config) {
                $scope.initializeSocialConfig(config);
            });
        };

        /*
         * @initializeSocialConfig
         * -
         */

        $scope.trackedAccounts = [];
        $scope.feed = [];
        $scope.feedLengths = {};

        $scope.initializeSocialConfig = function(config) {

            $scope.config = config;

            _.each(config.trackedAccounts, function(trackedAccount) {
                if (trackedAccount.type == 'fb') {
                    if (trackedAccount.accountType == 'account') {
                        SocialConfigService.getFBProfile(trackedAccount.id, function(profile) {
                            trackedAccount.profile = profile;
                        });
                    }
                    if (trackedAccount.accountType == 'adminpage') {
                        SocialConfigService.getFBPageInfo(trackedAccount.id, trackedAccount.socialId, function(profile) {
                            trackedAccount.profile = profile;
                        });
                    }
                    trackedAccount.checked = true;
                    $scope.trackedAccounts.push(trackedAccount);

                    if (trackedAccount.toggle) {
                        SocialConfigService.getFBPosts(trackedAccount.id, function(posts) {
                            $scope.feedLengths[trackedAccount.id] = posts.length;
                            _.each(posts, function(post) {
                                post.trackedId = trackedAccount.id;
                                post.from.profile_pic = 'https://graph.facebook.com/' + post.from.sourceId + '/picture?width=32&height=32';
                                $scope.feed.push(post);
                            });
                        });

                        setTimeout(function() {
                            $scope.isLoaded = true;
                        }, 1500);
                        $scope.displayFeed = $scope.feed;
                    }
                }
            });

        };

        /*
         * @filterFeed
         * -
         */

        $scope.filterFeed = function(type) {
            var updatedTrackedAccount = _.find($scope.trackedAccounts, function(trackedAccount) {
                return trackedAccount.id == type.id;
            });
            if (!type.checked) {
                var newDisplayFeed = _.filter($scope.displayFeed, function(post) {
                    return post.trackedId != updatedTrackedAccount.id;
                });
                $scope.displayFeed = newDisplayFeed;
            } else {
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

        $scope.addPageFeed = function(obj) {
            var trackedAccount = _.find($scope.config.trackedAccounts, function(trackedAccount) {
                return trackedAccount.id == obj.id;
            });
            trackedAccount.toggle = true;
            SocialConfigService.updateTrackedAccount(trackedAccount, function(data) {
                trackedAccount.checked = true;
                if (trackedAccount.type == 'fb') {
                    SocialConfigService.getFBPosts(trackedAccount.id, function(posts) {
                        $scope.feedLengths[trackedAccount.id] = posts.length;
                        _.each(posts, function(post) {
                            post.trackedId = trackedAccount.id;
                            $scope.feed.push(post);
                            $scope.displayFeed.push(post);
                        });
                    });
                }
                toaster.pop('success', 'Feed Added');
            });
        };

        /*
         * @removePageFeed
         * delete a social account from the config
         */

        $scope.removePageFeed = function(admin) {
            var trackedAccount = _.find($scope.config.trackedAccounts, function(trackedAccount) {
                return trackedAccount.id == admin.id;
            });
            trackedAccount.toggle = false;
            SocialConfigService.updateTrackedAccount(trackedAccount, function(data) {
                var newFeed = _.filter($scope.feed, function(obj) {
                    return obj.trackedId != trackedAccount.id;
                });
                $scope.feed = newFeed;
                $scope.displayFeed = newFeed;
                toaster.pop('warning', 'Social feed removed.');
            });
        };

        /*
         * @postToSocial
         * post to any of the social account using the social accountId and type
         */

        $scope.postContent = null;

        $scope.postToSocial = function(socialAccountId, post, type) {
            console.log('postContent >>> ', $scope.postContent);
            if (!$scope.postContent) {
                console.log('post content is empty');
                $scope.noContent = true;
                $scope.noPostTo = true;
                return false;
            }
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
         * @postContentChange
         * -
         */

        $scope.postContentChange = function() {
            if ($scope.postContent) {
                $scope.noContent = false;
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
            $scope.noPostTo = false;
            $scope.selectedSocial = parsed;
        };

        /*
         * @showLikeModal
         * -
         */

        $scope.showLikeModal = function(post) {
            $scope.tempPost = post;
            $scope.openModal('like-unlike-modal');
            $scope.tempTrackedAccounts = angular.copy($scope.trackedAccounts);
            _.each($scope.tempTrackedAccounts, function(tempAccount, index) {
                $scope.tempTrackedAccounts[index].liked = $scope.checkLikeExistFn(tempAccount);
            });
        };

        /*
         * @showCommentModal
         * -
         */

        $scope.showCommentModal = function(post) {
            $scope.tempPost = post;
            $scope.openModal('facebook-comments-modal');
        };

        /*
         * @checkLikeExistFn
         * -
         */

        $scope.checkLikeExistFn = function(account) {
            var status = false;
            if ($scope.tempPost == undefined) {
                return status;
            }
            if ($scope.tempPost.likes == undefined) {
                return status;
            }

            $scope.tempPost.likes.forEach(function(like, index) {
                console.log(account.socialId, like.sourceId);
                if (account.socialId == like.sourceId) {
                    status = true;
                }
            });

            return status;
        };

        /*
         * @likeFBPost
         * like a post on facebook
         */

        $scope.likeFBPost = function(page) {
            var trackedAccount = _.find($scope.config.trackedAccounts, function(tracked) {
                return tracked.id == page.id;
            });
            SocialConfigService.likeFBPost(trackedAccount.id, $scope.tempPost.sourceId, function(postReturn) {
                console.log('postReturn ', postReturn);

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
                $scope.tempTrackedAccounts = angular.copy($scope.trackedAccounts);
                _.each($scope.tempTrackedAccounts, function(tempAccount, index) {
                    $scope.tempTrackedAccounts[index].liked = $scope.checkLikeExistFn(tempAccount);
                });
                toaster.pop('success', 'liked post');
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
                $scope.tempSocialAccounts = angular.copy($scope.socialAccounts);
                for (var i = 0; i < $scope.tempSocialAccounts.length; i++) {
                    $scope.tempSocialAccounts[i].liked = $scope.checkLikeExistFn($scope.tempSocialAccounts[i], 'account');
                    var admins = $scope.tempSocialAccounts[i].admins;
                    for (var j = 0; j < admins.length; j++) {
                        admins[j].liked = $scope.checkLikeExistFn(admins[j], 'admin');
                    };
                };
                toaster.pop('warning', 'unliked post.');
            });
        };


    }]);
})(angular);
