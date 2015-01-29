define(['app', 'campaignService', 'userService', 'socialService', 'timeAgoFilter'], function(app) {
    app.register.controller('MarketingCtrl', ['$scope', 'UserService', 'CampaignService', 'SocialService', function($scope, UserService, CampaignService, SocialService) {

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
        $scope.feedTypes = [];

        UserService.getUserSocial(function(social) {
            console.log('social ', social);
            for (var i = 0; i < social.length; i++) {
                if (social[i].type == 'tw') {
                    $scope.feedTypes.push('twitter');
                    SocialService.getUserTweets(social[i].socialId, function(tweets) {
                        for (var i = 0; i < tweets.length; i++) {
                            tweets[i].type = 'twitter';
                            $scope.feed.push(tweets[i]);
                        };
                    });
                }
                if (social[i].type == 'fb') {
                    $scope.feedTypes.push('facebook');
                    console.log('getting facebook posts');
                    SocialService.getFBPosts(social[i].socialId, function(posts) {
                        console.log('fb posts return: ', posts);
                        for (var i = 0; i < posts.length; i++) {
                            posts[i].type = 'facebook';
                            $scope.feed.push(posts[i]);
                        };
                    });
                }
            };
        });



    }]);
});
