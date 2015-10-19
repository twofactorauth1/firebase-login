'use strict';
/**
 * service for orders
 */
(function (angular) {
  app.service('OrderService', function ($http, orderConstant) {
    var baseUrl = '/api/1.0/orders/';

    this.getOrders = function (fn) {
      var apiUrl = baseUrl;
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        });
    };

    this.getCustomerOrders = function (customerId, fn) {
      var apiUrl = baseUrl + ['customer', customerId].join('/');
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        });
    };

    this.getOrder = function (orderId, fn) {
      var apiUrl = baseUrl + orderId;
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        });
    };

    this.createOrder = function (order, fn) {
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

    this.updateOrder = function (order, fn) {
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

    this.refundOrder = function (orderId, reasonData, fn) {
      var apiUrl = baseUrl + [orderId, 'refund'].join('/');
      console.log('apiUrl ', apiUrl);
      $http({
          url: apiUrl,
          method: "POST",
          data: reasonData
        })
        .success(function (data, status, headers, config) {
          fn(data, null);
        })
        .error(function (error) {
          console.error('OrderService: refundOrder error >>> ', error);
          fn(null, error);
        });
    };

    this.completeOrder = function (orderId, note, fn) {
      var apiUrl = baseUrl + [orderId, 'complete'].join('/');
      $http({
          url: apiUrl,
          method: "POST",
          data: {
            note: note
          }
        })
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (error) {
          console.error('OrderService: completeOrder error >>> ', error);
        });
    };

    this.addOrderNote = function (orderId, note, fn) {
      var apiUrl = baseUrl + [orderId, 'note'].join('/');
      $http({
          url: apiUrl,
          method: "POST",
          data: {
            note: note
          }
        })
        .success(function (data, status, headers, config) {
          fn(data);
        })
        .error(function (error) {
          console.error('OrderService: addOrderNote error >>> ', error);
        });
    };

    this.exportToCSV = function () {
      var apiUrl = baseUrl + ['order', 'export'].join('/');
      $http({
          url: apiUrl,
          method: "POST"
        })
    };

    this.formatOrderStatus = function (_status) {
      var orderStatuses = orderConstant.order_status.dp;
      if (_status) {
        var _formatted = _.find(orderStatuses, function (status) {
            return status.data === _status;
          });
        return _formatted.label;
      }
    };

  });
})(angular);
