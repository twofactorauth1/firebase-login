'use strict';
/**
 * service for orders
 */
(function(angular) {
    app.service('OrderService', function($http) {
        var baseUrl = '/api/1.0/orders/';

        this.getOrders = function(fn) {
            var apiUrl = baseUrl;
            $http.get(apiUrl)
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.getOrder = function(orderId, fn) {
            var apiUrl = baseUrl + orderId;
            $http.get(apiUrl)
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.completeOrder = function(orderId, note, fn) {
            var apiUrl = baseUrl + [orderId, 'complete'].join('/');
            $http({
                    url: apiUrl,
                    method: "POST",
                    data: {
                        note: note
                    }
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                })
                .error(function(error) {
                    console.error('OrderService: completeOrder error >>> ', error);
                });
        };

        this.addOrderNote = function(orderId, note, fn) {
            var apiUrl = baseUrl + [orderId, 'note'].join('/');
            $http({
                    url: apiUrl,
                    method: "POST",
                    data: {
                        note: note
                    }
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                })
                .error(function(error) {
                    console.error('OrderService: addOrderNote error >>> ', error);
                });
        };

    });
})(angular);
