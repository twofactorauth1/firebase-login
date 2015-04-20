'use strict';
/**
 * controller for orders
 */
(function(angular) {
    app.controller('OrdersCtrl', ["$scope", "toaster", "$modal", "$filter", "OrderService", function($scope, toaster, $modal, $filter, OrderService) {

        OrderService.getOrders(function(orders){
            console.log('orders >>> ', orders);
            _.each(orders, function(order) {
            	if (order.line_items) {
	            	order.line_items = order.line_items.length;
	            } else {
	            	order.line_items = 0;
	            }
            });
            $scope.orders = orders;
        });

        $scope.viewSingle = function(order) {
            window.location = '/admin/#/commerce/orders/' + order._id;
        };

    }]);
})(angular);
