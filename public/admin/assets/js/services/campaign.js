/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('CampaignService', function ($http, $cacheFactory, $q) {
    var baseUrl = '/api/1.0/campaigns/';

    var campaigncache = $cacheFactory('campaigns');

    this.getCampaigns = function (fn) {
      // var data = campaigncache.get('campaigns');
      // if (data) {
      //   if (fn) {
      //     fn(data);
      //   }
      // } else {
        var apiUrl = baseUrl;
        $http.get(apiUrl)
          .success(function (data) {
            campaigncache.put('campaigns', data);
            fn(data);
          });
      // }
    };

    this.getCampaign = function (id, fn) {
      var apiUrl = baseUrl + id;
      var deferred = $q.defer();
      
      $http.get(apiUrl)
        .success(function (data) {
          if (fn) {
            console.log('resolve >>> ');
            deferred.resolve(fn(data));
          }
        })
        .error(function (err) {
          console.warn('END:Campaign Service with ERROR');
          fn(err, null);
        });

      return deferred.promise;
    };

    this.createCampaign = function (campaign, fn) {
      var _campaigns = campaigncache.get('campaigns');
      var apiUrl = baseUrl;
      $http({
        url: apiUrl,
        method: "POST",
        data: campaign
      }).success(function (data) {
        if (_campaigns) {
          _campaigns.push(data);
          campaigncache.put('campaigns', _campaigns);
        }
        fn(data);
      }).error(function (error) {
        console.error('CampaignService: createCampaign error >>> ', error);
      });
    };

    this.updateCampaign = function (campaign, fn) {
      var apiUrl = baseUrl + campaign._id;
      $http({
        url: apiUrl,
        method: "POST",
        data: campaign
      }).success(function (data) {
        fn(data);
      }).error(function (error) {
        console.error('CampaignService: updateCampaign error >>> ', error);
      });
    };

    this.cancelCampaignForContact = function (campaign, contactId, fn) {
      var apiUrl = baseUrl + [campaign._id, 'contact', contactId].join('/');
      $http({
        url: apiUrl,
        method: "DELETE",
        data: campaign
      }).success(function (data) {
        fn(data);
      }).error(function (error) {
        if (error) {
          console.error('CampaignService: cancelCampaignForContact error >>> ', error);
        }
      });
    };

    this.duplicateCampaign = function(campaignId, campaign, fn) {
        var apiUrl = baseUrl + [campaignId, 'duplicate'].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: campaign
        }).success(function (data) {
            fn(data);
        }).error(function (error) {
            if (error) {
              console.error('CampaignService: duplicateCampaign error >>> ', error);
            }
        });
    };

    this.bulkAddContactsToCampaign = function (contactsArr, campaignId, fn) {
      var apiUrl = baseUrl + [campaignId, 'contacts'].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: contactsArr
      }).success(function (data) {
        fn(data);
      }).error(function (error) {
        console.error('CampaignService: bulkAddContactsToCampaign error >>> ', error);
      });
    };

    this.checkCampaignNameExists = function (_name, fn) {
      var self = this;
      self.getCampaigns(function (campaigns) {
        console.log('campaigns ', campaigns);
        var _matchingCampaign = _.find(campaigns, function (campaign) {
          return angular.lowercase(campaign.name) === angular.lowercase(_name);
        });
        if (_matchingCampaign) {
          fn(true);
        } else {
          fn(false);
        }
      });
    };

    this.getCampaignContacts = function (campaignId, fn) {
      var apiUrl = baseUrl + [campaignId, 'contacts'].join('/');
      var deferred = $q.defer();
      
      $http.get(apiUrl)
        .success(function (data) {
          if (fn) {
            console.log('resolve >>> ');
            deferred.resolve(fn(data));
          }
        })
        .error(function (err) {
          console.warn('END:Campaign Service with ERROR');
          fn(err, null);
        });

      return deferred.promise;
    };

  });
}(angular));
