'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('SocialFeedCtrl', ["$scope", "$log", "$q", "toaster", "$modal", "$filter", "$location", "WebsiteService", "UserService", "SocialConfigService", function ($scope, $log, $q, toaster, $modal, $filter, $location, WebsiteService, UserService, SocialConfigService) {

    /*
     * initialize all state in the controller, like a constructor.
     */

    $scope.init = function() {
      $scope.followModalCheckmarks = {};
      $scope.trackedAccounts = [];
      $scope.feed = [];
      $scope.feedLengths = {};
      $scope.orderByAttribute = '';
    };

    // execute the 'constructor'
    $scope.init();

    /*
     * @openModal
     * -
     */

    $scope.openModal = function (modal) {
      $scope.modalInstance = $modal.open({
        templateUrl: modal,
        keyboard: false,
        backdrop: 'static',
        scope: $scope
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    /*
     * @getSocialConfig
     * -
     */

    $scope.getSocialConfig = function () {
      SocialConfigService.getAllSocialConfig(function (config) {
        $scope.initializeSocialConfig(config);
      });
    };

    /*
     * @productionReadyAccount, checks to see if the account type is suitable for display
     */
    $scope.productionReadyAccount = function(acc) {
      return (acc.type === 'tw') || (acc.type === 'fb');
    };

    /*
     * @initializeSocialConfig
     * -
     */


    $scope.initializeSocialConfig = function (config) {

      $scope.config = config;

      _.each(config.trackedAccounts, function (trackedAccount) {

        //get profile/page info
        if (trackedAccount.accountType === 'account') {
          if (trackedAccount.type === 'fb') {
            SocialConfigService.getFBProfile(trackedAccount.id, function (profile) {
              trackedAccount.profile = profile;
            });

          }
        }
        if (trackedAccount.accountType === 'adminpage') {
          if (trackedAccount.type === 'fb') {
            SocialConfigService.getFBPageInfo(trackedAccount.id, trackedAccount.socialId, function (profile) {
              trackedAccount.profile = profile;
            });
          }
        }

        //toggle checked and push to trackedAccount
        trackedAccount.checked = true;
        $scope.trackedAccounts.push(trackedAccount);

        //get feed items
        if (trackedAccount.toggle) {
          if (trackedAccount.type === 'tw') {

            // get feed
            SocialConfigService.getTwitterFeed(trackedAccount.id, function (posts) {
              $scope.feedLengths[trackedAccount.id] = posts.length;
              //$log.debug('number of twitter posts: ' + posts.length);
              _.each(posts, function (post) {
                post.trackedId = trackedAccount.id;
                $scope.feed.push(post);
                //$log.debug(post);
              });
            });

            // get followers
            SocialConfigService.getTwitterFollowers(trackedAccount.id, function (posts) {
              // TODO: what does feedLengths need to be?
              $scope.feedLengths[trackedAccount.id] = posts.length;
              //$log.debug('number of twitter follower posts: ' + posts.length);
              _.each(posts, function (post) {
                post.trackedId = trackedAccount.id;
                $scope.feed.push(post);
                //$log.debug(post);
              });
            });
          }
          if (trackedAccount.type === 'fb') {
            SocialConfigService.getFBPosts(trackedAccount.id, function (posts) {
              $scope.feedLengths[trackedAccount.id] = posts.length;
              _.each(posts, function (post) {
                post.trackedId = trackedAccount.id;
                post.from.profile_pic = 'https://graph.facebook.com/' + post.from.sourceId + '/picture?width=32&height=32';
                $scope.feed.push(post);
              });
            });
          }
        }
      });
      //wait a few seconds to ensure everything is loaded
      setTimeout(function () {
        $scope.$apply(function(){
          $scope.isLoaded = true;
        });        
      }, 1500);
      //push the feed into the display
      $scope.displayFeed = $scope.feed;
    };

    /*
     * @filterFeed
     * -
     */

    $scope.filterFeed = function (type) {
      var updatedTrackedAccount = _.find($scope.trackedAccounts, function (trackedAccount) {
        return trackedAccount.id === type.id;
      });
      var newDisplayFeed = '';
      if (!type.checked) {
        newDisplayFeed = _.filter($scope.displayFeed, function (post) {
          return post.trackedId !== updatedTrackedAccount.id;
        });
        $scope.displayFeed = newDisplayFeed;
      } else {
        newDisplayFeed = _.filter($scope.feed, function (post) {
          return post.trackedId === updatedTrackedAccount.id;
        });
        _.each(newDisplayFeed, function (post) {
          $scope.displayFeed.push(post);
        });
      }
    };

    /*
     * @addPageFeed
     * add an admin feed to the social account using the parent access token
     */

    $scope.addPageFeed = function (obj) {
      var trackedAccount = _.find($scope.config.trackedAccounts, function (trackedAccount) {
        return trackedAccount.id === obj.id;
      });
      trackedAccount.toggle = true;
      SocialConfigService.updateTrackedAccount(trackedAccount, function (data) {
        trackedAccount.checked = true;
        if (trackedAccount.type === 'fb') {
          SocialConfigService.getFBPosts(trackedAccount.id, function (posts) {
            $scope.feedLengths[trackedAccount.id] = posts.length;
            _.each(posts, function (post) {
              post.trackedId = trackedAccount.id;
              $scope.feed.push(post);
              $scope.displayFeed.push(post);
            });
          });
        }
        $scope.minRequirements = true;
        toaster.pop('success', 'Feed Added');
      });
    };

    /*
     * @removePageFeed
     * delete a social account from the config
     */

    $scope.removePageFeed = function (admin) {
      var trackedAccount = _.find($scope.config.trackedAccounts, function (trackedAccount) {
        return trackedAccount.id === admin.id;
      });
      trackedAccount.toggle = false;
      SocialConfigService.updateTrackedAccount(trackedAccount, function (data) {
        var newFeed = _.filter($scope.displayFeed, function (obj) {
          return obj.trackedId !== trackedAccount.id;
        });
        $scope.displayFeed = newFeed;
        toaster.pop('warning', 'Social feed removed.');
      });
    };

    /*
     * @postToSocial
     * post to any of the social account using the social accountId and type
     */

    $scope.postContent = null;

    $scope.postToSocial = function (socialAccountId, post, type) {
      console.log('postTo >>> ', $scope.postTo);
      if (!$scope.postContent) {
        console.log('post content is empty');
        $scope.noContent = true;
        return false;
      }
      if (!$scope.selectedSocial) {
        console.log('post content is empty');
        $scope.noPostTo = true;
        return false;
      }

      //show spinner
      $scope.postingToSocial = true;
      if (type === 'fb') {
        $scope.handleFBPost(socialAccountId, post);
      }
      if (type === 'tw') {
        $scope.handleTwitterPost(socialAccountId, post);
      }
    };

    /*
     * @postContentChange
     * -
     */

    $scope.postContentChange = function () {
      if ($scope.postContent) {
        $scope.noContent = false;
      }
    };

    /*
     * @handleFBPost
     * handle the facebook post from @postToSocial
     */

    $scope.handleFBPost = function (socialAccountId, post) {
      SocialConfigService.postFBPost(socialAccountId, post, function (data) {
        console.log('post return data ', data);
        if (data.error) {
          $scope.postingToSocial = false;
          $scope.duplicatePostError = true;
          return false;
        }
        SocialConfigService.getFBPosts(socialAccountId, function (posts) {
          var matchingPost = _.findWhere(posts, {
            sourceId: data
          });
          if(matchingPost){
            $scope.displayFeed.push(matchingPost);
            $scope.feedLengths[socialAccountId] = posts.length;
          }
          $scope.afterPosting();
         })
      });
    };

    /*
     * @handleTwitterPost
     * handle the twitter post from @postToSocial
     */

    $scope.handleTwitterPost = function (socialAccountId, post) {
      SocialConfigService.postTwitterPost(socialAccountId, post, function (data) {
         SocialConfigService.getTwitterFeed(socialAccountId, function (posts) {
          var matchingPost = _.findWhere(posts, {
            sourceId: data.id_str
          });
          if(matchingPost){
              $scope.displayFeed.push(matchingPost);
              $scope.feedLengths[socialAccountId] = posts.length;
            }
          $scope.afterPosting();
         })         
      });
    };

    /*
     * @afterPosting
     * after posting, clear the form and spinner
     */

    $scope.afterPosting = function () {
      //clear duplicate post error
      $scope.duplicatePostError = false;
      //clear spinner
      $scope.postingToSocial = false;
      //clear form
      $scope.postContent = null;

    };

    /*
     * @postToChange
     * when selecting what account to post to, change the selected social account
     */

    $scope.addCommentAdminPage = null;

    $scope.postToChange = function (type) {
      console.log('type ', type);
      $scope.noPostTo = false;
      $scope.selectedSocial = type;
      $scope.addCommentAdminPage = type;
    };

    /*
     * @showLikeModal
     * -
     */

    $scope.showLikeModal = function (post) {
      $scope.tempPost = post;
      $scope.openModal('like-unlike-modal');
      $scope.tempTrackedAccounts = angular.copy($scope.trackedAccounts);
      _.each($scope.tempTrackedAccounts, function (tempAccount, index) {
        $scope.tempTrackedAccounts[index].liked = $scope.checkLikeExistFn(tempAccount);
      });
    };

    /*
     * @showFavModal
     * -
     */

    $scope.showFavModal = function (post) {
      $log.debug('--showFavModal');
      $scope.tempPost = post;
      $scope.openModal('fav-unfav-modal');
      $scope.tempTrackedAccounts = angular.copy($scope.trackedAccounts);

      //$log.debug($scope.tempTrackedAccounts);
      _.each($scope.tempTrackedAccounts, function (tempAccount, index) {
        //$log.debug('account: ' + JSON.stringify(tempAccount));
        $scope.tempTrackedAccounts[index].favorited = $scope.checkFavExistFn(tempAccount);
      });
    };

    /*
     * @showFavModal
     * -
     */

    $scope.showFollowModal = function (post) {
      $log.debug('--showFollowModal');
      $scope.tempPost = post;

      //$scope.followModalCheckmarks.length = 0; //= [];

      $scope.openModal('follow-modal');

      $scope.tempTrackedAccounts = angular.copy($scope.trackedAccounts);

      //$log.debug($scope.tempTrackedAccounts);
      _.each($scope.tempTrackedAccounts, function (tempAccount, index) {
        //$log.debug('account: ' + JSON.stringify(tempAccount));
        //$scope.tempTrackedAccounts[index].favorited = $scope.checkFavExistFn(tempAccount);
        //$scope.followModalCheckmarks.push(false); // TODO: call API
        $scope.followModalCheckmarks[tempAccount.socialId] = false; // TODO: call API
        });
    };

    /*
     * @showRetweetModal
     * -
     */

    $scope.showTweetModal = function (post) {
      _.each(post.comments, function (comment) {
        //comment.picture = 'https://graph.facebook.com/' + comment.sourceId + '/picture?width=32&height=32';
      });
      $scope.tempPost = post;
      $scope.tempTrackedAccounts = angular.copy($scope.trackedAccounts);
      //$scope.visibleComments = post.comments;

      // set the intitial value of the textarea because
      // "reply" means their handle is supposed to come before the message
      $scope.addComment = '@' + $scope.tempPost.from.name + ' ';

      //$scope.updateComments(post, 'tw');

      $scope.openModal('twitter-comments-modal');
    };

    /*
     * @showCommentModal
     * -
     */

    $scope.showCommentModal = function (post) {
      _.each(post.comments, function (comment) {
        comment.picture = 'https://graph.facebook.com/' + comment.sourceId + '/picture?width=32&height=32';
      });
      $scope.tempPost = post;
      $scope.visibleComments = post.comments;
      $scope.updateComments(post, 'fb');
      $scope.openModal('facebook-comments-modal');
    };

    /*
     * @addCommentFn
     * -
     */

    $scope.visibleComments = [];

    $scope.addCommentinModal = '';

    $scope.addCommentFn = function () {
      if ($scope.commentType === 'fb') {
        SocialConfigService.addFacebookPostComment($scope.selectedSocial.parentSocialAccount, $scope.addCommentPage.sourceId, $scope.addCommentinModal, function (comment) {
          var tempDate = new Date();
          tempDate.setHours(tempDate.getHours() + 7);
          $scope.visibleComments.unshift({
            picture: $scope.selectedSocial.profile.picture.data.url,
            created: $filter('date')(tempDate, 'yyyy-MM-ddTHH:mm:ss') + '+0000',
            name: $scope.selectedSocial.profile.name,
            comment: $scope.addCommentinModal
          });
          $scope.addCommentinModal = '';
          toaster.pop('success', 'Comment added', 'Comment added to the facebook post.');
        });
      } else if ($scope.commentType === 'tw') {
        SocialConfigService.addTwitterReply($scope.selectedSocial.socialId, $scope.addCommentPage.sourceId, $scope.selectedSocial.screen_name, $scope.addCommentinModal, function (comment) {
          $scope.visibleComments.unshift({
            picture: $scope.selectedSocial.profile_image_url,
            created: new Date(),
            name: $scope.selectedSocial.name,
            comment: $scope.addCommentinModal
          });
          $scope.addCommentinModal = '';
          toaster.pop('success', 'Comment added', 'Comment added to the twitter post.');
        });
      } else {
        toaster.pop('error', 'Type miss match', 'Post type and admin type does not match.');
      }
    };

    /*
     * @updateComments
     * update the visible comments to display in the comment modal
     */

    $scope.updateComments = function (page, type) {
      console.log(page);
      $scope.commentType = type;
      if (type === 'tw') {
        $scope.commentUsers = $scope.twAdminPages;
      }
      if (type === 'fb') {
        $scope.commentUsers = $scope.fbAdminPages;
      }
      $scope.addCommentPage = page;
      console.log('comments ', page.comments);
      if (page.comments) {
        $scope.visibleComments = page.comments;
      } else {
        $scope.visibleComments = [];
      }
    };

    /*
     * @checkLikeExistFn
     * -
     */

    $scope.checkLikeExistFn = function (account) {
      var status = false;
      if ($scope.tempPost === undefined) {
        return status;
      }
      if ($scope.tempPost.likes === undefined) {
        return status;
      }

      $scope.tempPost.likes.forEach(function (like, index) {
        //$log.debug(account.socialId, like.sourceId);
        if (account.socialId === like.sourceId) {
          status = true;
        }
      });

      return status;
    };

    /*
     * @checkFavExistFn
     * -
     */

    $scope.checkFavExistFn = function (account) {
      var status = false;
      if ($scope.tempPost === undefined) {
        return status;
      }
      if ($scope.tempPost.favorites === undefined) {
        return status;
      }

      $log.debug('--checking favorites');
      $scope.tempPost.favorites.forEach(function (like, index) {
        $log.debug(account.socialId, like.sourceId);
        if (account.socialId === like.sourceId) {
          status = true;
        }
      });
      $log.debug('--done checking favorites');

      return status;
    };

    /*
     * @likeFBPost
     * like a post on facebook
     */

    $scope.likeFBPost = function (page) {
      console.log('likeFBPost >>> ', page);
      var trackedAccount = _.find($scope.config.trackedAccounts, function (tracked) {
        return tracked.id === page.id;
      });
      console.log('trackedAccount >>> ', trackedAccount);
      console.log('$scope.tempPost.sourceId >>> ', $scope.tempPost.sourceId);
      SocialConfigService.likeFBPost(trackedAccount.id, $scope.tempPost.sourceId, function (postReturn) {
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
        _.each($scope.tempTrackedAccounts, function (tempAccount, index) {
          $scope.tempTrackedAccounts[index].liked = $scope.checkLikeExistFn(tempAccount);
        });
        toaster.pop('success', 'liked post');
      });
    };

    /*
     * @removelikeFBPost
     * remove a like post on facebook
     */

    $scope.removeLikeFBPost = function (page, $event) {
      var trackedAccount = _.find($scope.config.trackedAccounts, function (tracked) {
        return tracked.socialId === page.socialId;
      });
      SocialConfigService.unlikeFBPost(trackedAccount.id, $scope.tempPost.sourceId, function (postReturn) {
        $scope.tempPost.likes.forEach(function (value, index) {
          if (value.sourceId === page.sourceId) {
            $scope.tempPost.likes.splice(index, 1);
          }
        });
        $scope.tempSocialAccounts = angular.copy($scope.socialAccounts);
        _.each($scope.tempSocialAccounts, function (tempAccount) {
          tempAccount.liked = $scope.checkLikeExistFn(tempAccount, 'account');
          _.each(tempAccount.admins, function (admin) {
            admin.liked = $scope.checkLikeExistFn(admin, 'admin');
          });
        });
        toaster.pop('warning', 'unliked post.');
      });
    };


    /*
     * @addTwitterPostFavorites
     * add a favorite on twitter post
     */

    $scope.addTwitterPostFavorites = function (page, $event) {
      $log.debug('addTwitterPostFavorites >>>');
      var trackedAccount = _.find($scope.config.trackedAccounts, function (tracked) {
        return tracked.socialId === page.socialId;
      });
      SocialConfigService.favTwitterPost(trackedAccount.id, $scope.tempPost.sourceId, function (postReturn) {
        //$log.debug('postReturn: ' + JSON.stringify(postReturn));
        //$scope.tempPost.favorited.forEach(function(value, index) {
        //    if (value.sourceId == page.sourceId) {
        //        $scope.tempPost.likes.splice(index, 1);
        //    }
        //});
        //$scope.tempSocialAccounts = angular.copy($scope.socialAccounts);
        //for (var i = 0; i < $scope.tempSocialAccounts.length; i++) {
        //    $scope.tempSocialAccounts[i].favorited = $scope.checkFavExistFn($scope.tempSocialAccounts[i], 'account');
        //    var admins = $scope.tempSocialAccounts[i].admins;
        //    for (var j = 0; j < admins.length; j++) {
        //        admins[j].liked = $scope.checkFavExistFn(admins[j], 'admin');
        //    }
        //}
        toaster.pop('warning', 'favorited post.');
      });
    };

    /*
     * @deleteTwitterPostFavorites
     * remove a favorite on twitter post
     */

    $scope.deleteTwitterPostFavorites = function (page, $event) {
      $log.debug('deleteTwitterPostFavorites >>>');
      var trackedAccount = _.find($scope.config.trackedAccounts, function (tracked) {
        return tracked.socialId === page.socialId;
      });
      SocialConfigService.unfavoriteTwitterPost(trackedAccount.id, $scope.tempPost.sourceId, function (postReturn) {
        //$log.debug('postReturn: ' + JSON.stringify(postReturn));
        //$scope.tempPost.favorited.forEach(function(value, index) {
        //    if (value.sourceId == page.sourceId) {
        //        $scope.tempPost.likes.splice(index, 1);
        //    }
        //});
        //$scope.tempSocialAccounts = angular.copy($scope.socialAccounts);
        //for (var i = 0; i < $scope.tempSocialAccounts.length; i++) {
        //    $scope.tempSocialAccounts[i].favorited = $scope.checkFavExistFn($scope.tempSocialAccounts[i], 'account');
        //    var admins = $scope.tempSocialAccounts[i].admins;
        //    for (var j = 0; j < admins.length; j++) {
        //        admins[j].liked = $scope.checkFavExistFn(admins[j], 'admin');
        //    }
        //}
        toaster.pop('warning', 'unfavorited post.');
      });
    };

    /*
     * updates the checkmarks used on the follow modal
     *
     * follower: the twitter ID that we want to follow/unfollow
     * id_str:
     */
    $scope.followTwitterCheck = function(follower, postReturn, account) {
      //account.following.push(follower.twitterId);
      if(follower === postReturn.id_str) {
        //var index = $scope.followModalCheckmarks.indexOf(account);
        //$log.debug('followTwitterCheck, search index=' + index.toString());
        $log.debug('followTwitterCheck, postReturn.following=' + postReturn.following.toString());

        //!postReturn.following
        if(postReturn.friendly) {
          //$scope.followModalCheckmarks[follower] = true;
          //$scope.followModalCheckmarks.push(account);

          $scope.followModalCheckmarks[account.socialId] = true;
        }
        else {
          // TODO: is postReturn.following useful here?
          //$log.warn('need to remove follower?');
          //delete $scope.followModalCheckmarks[follower];

          //if(index > -1) {
          //  $scope.followModalCheckmarks.splice(index,1);
          //}
          $scope.followModalCheckmarks[account.socialId] = false;
        }
      }
      //else {
      //  $log.debug('not following');
      //  $log.warn('not a follower?');
      //  //delete $scope.followModalCheckmarks[follower];
      //  if(index > -1) {
      //    $scope.followModalCheckmarks.splice(index,1);
      //  }
      //}
    };

    /*
     * followTwitterUser(account, follower)
     */
    $scope.followTwitterUser = function(account, follower) {
      $log.debug('---followTwitterUser, sourceID=', follower, account.id);
      SocialConfigService.followTwitterUser(account.id, follower, function(postReturn) {
        $log.debug('returned from followTwitterUser(' + JSON.stringify(postReturn) + ')');
        $scope.followTwitterCheck(follower, postReturn, account);
      });
    };

    /*
     * unfollowTwitterUser(account, follower)
     */
    $scope.unfollowTwitterUser = function(account, follower) {
      $log.debug('---unfollowTwitterUser, sourceID=' + follower);
      SocialConfigService.unfollowTwitterUser(account.id, follower, function(postReturn) {
        $log.debug('returned from unfollowTwitterUser(' + JSON.stringify(postReturn) + ')');
        $scope.followTwitterCheck(follower, postReturn, account);
      });
    };

    $scope.orderbyFilter = [{
      label: "Most liked",
      data: "likes"
    }, {
      label: "Most commented",
      data: "comments"
    }];

    $scope.sortFeed = function (type) {
      $scope.orderByAttribute = type.data;
      setTimeout(function () {
        $('#mcontainer').masonry();
      }, 1000);
    };

    
    angular.element(".sidebar-toggler").click(function(){
      if($scope && $scope.$state && $scope.$state.current && $scope.$state.current.name === "app.marketing.socialfeed"){
        setTimeout(function () {
          if($('#mcontainer'))
            $('#mcontainer').masonry();
        }, 1000);
      }        
    })

  }]);
}(angular));
