'use strict';

/**
 * to make the cards for Facebook posts on the social feed page.
 */
app.directive('facebookPost', function () {
    return {
        restrict: 'E',
        templateUrl: '/admin/assets/views/social-facebook-post.html',
        replace: true,
        scope: {
            post: '=',
            actionLike: '&',
            actionComment: '&'
        }
    };
});

/**
 * to make the cards for Twitter tweets on the social feed page.
 */
app.directive('twitterFeed', function () {
    return {
        restrict: 'E',
        templateUrl: '/admin/assets/views/social-twitter-feed.html',
        replace: true,
        scope: {
            post: '=',
            actionReply: '&',
            actionFavorite: '&',
            actionRetweet: '&',
            actionDirectMessage: '&'
        }
    };
});

/**
 * to make the cards for Facebook posts on the social feed page.
 */
app.directive('twitterFollower', function () {
    return {
        restrict: 'E',
        templateUrl: '/admin/assets/views/social-twitter-follower.html',
        replace: true,
        scope: {
            post: '=',
            actionTweetAt: '&',
            actionFollowBack: '&',
            actionDirectMessage: '&'
        }
    };
});
