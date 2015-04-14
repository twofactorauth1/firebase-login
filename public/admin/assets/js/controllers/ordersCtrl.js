'use strict';
/**
 * controller for orders
 */
(function(angular) {
    app.controller('OrdersCtrl', ["$scope", "toaster", "$modal", "$filter", "OrderService", function($scope, toaster, $modal, $filter, OrderService) {

        OrderService.getOrders(function(orders){
            console.log('orders >>> ', orders);
            $scope.orders = orders;
        });

        $scope.viewSingle = function(order) {
            window.location = '/admin/#/commerce/orders/' + order._id;
        };

    }]);
})(angular);
