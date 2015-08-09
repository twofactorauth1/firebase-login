'use strict';
/**
 * service for orders
 */
(function (angular) {
  app.service('CampaignService', function ($http, orderConstant) {
    var baseUrl = '/api/1.0/campaign/';

    this.getCampaigns = function (fn) {
      var apiUrl = baseUrl;
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        });
    };

    this.getCampaign = function (orderId, fn) {
      var apiUrl = baseUrl + orderId;
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        });
    };

    this.createCampaign = function (order, fn) {
      var apiUrl = baseUrl;
      $http({
          url: apiUrl,
          method: "POST",
          data: order
        })
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (error) {
          console.error('OrderService: createOrder error >>> ', error);
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

  });
})(angular);
