define(['app', 'campaignService', 'userService', 'isotope', 'socialStreamWall', 'socialStream'], function(app) {
    app.register.controller('MarketingCtrl', ['$scope', 'UserService', 'CampaignService', function($scope, UserService, CampaignService) {

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


        $('#social-stream').dcSocialStream({
            feeds: {
                twitter: {
                    id: '/9927875,#designchemical,designchemical',
                    thumb: true
                },
                rss: {
                    id: 'http://feeds.feedburner.com/DesignChemical,http://feeds.feedburner.com/designmodo'
                },
                stumbleupon: {
                    id: 'remix4'
                },
                facebook: {
                    id: '636552113048686'
                },
                google: {
                    id: '111470071138275408587'
                },
                delicious: {
                    id: 'designchemical'
                },
                vimeo: {
                    id: 'brad'
                },
                youtube: {
                    id: 'FilmTrailerZone'
                },
                pinterest: {
                    id: 'jaffrey,designchemical/design-ideas'
                },
                flickr: {
                    id: ''
                },
                lastfm: {
                    id: 'lastfm'
                },
                dribbble: {
                    id: 'frogandcode'
                },
                deviantart: {
                    id: 'isacg'
                },
                tumblr: {
                    id: 'richters',
                    thumb: 250
                }
            },
            rotate: {
                delay: 0
            },
            twitterId: 'designchemical',
            control: false,
            filter: true,
            wall: true,
            cache: false,
            max: 'limit',
            limit: 10,
            iconPath: 'images/dcsns-dark/',
            imagePath: 'images/dcsns-dark/'
        });


    }]);
});
