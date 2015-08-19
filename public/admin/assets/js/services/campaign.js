'use strict';
/**
 * service for orders
 */
(function (angular) {
  app.service('CampaignService', function ($http, orderConstant, $cacheFactory) {
    var baseUrl = '/api/1.0/campaign/';

    var campaigncache = $cacheFactory('campaigns');

    this.getCampaigns = function (fn) {
      var data = campaigncache.get('campaigns');
      if (data) {
        if (fn) {
          fn(data);
        }
      } else {
        var apiUrl = baseUrl;
        $http.get(apiUrl)
          .success(function (data, status, headers, config) {
            campaigncache.put('campaigns', data);
            fn(data);
          });
      }
    };

    this.getCampaign = function (orderId, fn) {
      var apiUrl = baseUrl + orderId;
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        });
    };

    this.createCampaign = function (campaign, fn) {
      var _campaigns = campaigncache.get('campaigns');
      var apiUrl = baseUrl + ['campaign'].join('/');
      $http({
          url: apiUrl,
          method: "POST",
          data: campaign
        })
        .success(function (data, status, headers, config) {        
          if (_campaigns) {
            _campaigns.push(data);
            campaigncache.put('campaigns', _campaigns);
          }
          fn(data);
        })
        .error(function (error) {
          console.error('CampaignService: createCampaign error >>> ', error);
        });
    };

    this.updateCampaign = function (order, fn) {
      var apiUrl = baseUrl + [order._id, 'update'].join('/');
      $http({
          url: apiUrl,
          method: "POST",
          data: {
            order: order
          }
        })
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (error) {
          console.error('OrderService: updateOrder error >>> ', error);
        });
    };

    this.bulkAddContactsToCampaign = function (contactsArr, campaignId, fn) {
      var apiUrl = baseUrl + ['campaign', campaignId, 'contacts'].join('/');
      $http({
          url: apiUrl,
          method: "POST",
          data: contactsArr
        })
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (error) {
          console.error('CampaignService: bulkAddContactsToCampaign error >>> ', error);
        });
    };

    this.checkCampaignNameExists = function (_name, fn) {
      var self = this;
      self.getCampaigns(function(campaigns) {
        console.log('campaigns ', campaigns);
        var _matchingCampaign = _.find(campaigns, function(campaign) {
          return campaign.name === _name;
        });
        if (_matchingCampaign) {
          fn(true);
        } else {
          fn(false);
        }
      });
    };

    this.checkDuplicateCampaign = function (_name) {
      var self = this;
      self.getCampaigns(function(campaigns) {
        console.log('campaigns ', campaigns);
        var _matchingCampaign = _.find(campaigns, function(campaign) {
          return campaign.name === _name;
        });
        if (_matchingCampaign) {
          return true;
        } else {
          return false;
        }
      });
    };

  });
})(angular);
