'use strict';

app.directive('indigewebTransactionLabel', ['OrderService', function(OrderService) {
    return {
        restrict: 'E',
        template: '{{label}}',
        link: function(scope, element, attrs) {
            scope.label = '';
            scope.hasOrder = false;
            scope.hasDonation = false;

            var updateLogicFn = function(orders) {
                orders.forEach(function(order, index) {
                    order.line_items.forEach(function(item, index) {
                        if (item.type == 'DONATION') {
                            scope.hasDonation = true;
                        } else {
                            scope.hasOrder = true;
                        }
                    });
                });
                if (scope.hasOrder && scope.hasDonation) {
                    scope.label = 'transaction';
                } else if (scope.hasOrder && !scope.hasDonation) {
                    scope.label = 'order';
                } else if (!scope.hasOrder && scope.hasDonation) {
                    scope.label = 'donation';
                }
            };

            OrderService.getOrders(function(orders) {
                updateLogicFn(orders);
            });
        }
    }
}]);
