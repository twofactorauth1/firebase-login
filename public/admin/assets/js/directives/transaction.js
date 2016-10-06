'use strict';

app.directive('indigewebTransactionLabel', ['OrderService', "DashboardService", "$rootScope", function(OrderService, DashboardService, $rootScope) {
    return {
        restrict: 'E',
        template: '{{label}}',
        link: function(scope, element, attrs) {
            //scope.label = 'order';
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

                if (attrs.plural) {
                    scope.label = scope.label + 's';
                }

                if (attrs.lower) {
                    scope.label = scope.label.toLowerCase();
                }

                if (attrs.upper) {
                    scope.label = scope.label.toUpperCase();
                }

                if (attrs.capitalize) {
                    scope.label = scope.label.charAt(0).toUpperCase() + scope.label.slice(1);
                }
            };

            OrderService.getOrders(function(orders) {
                updateLogicFn(orders);
            });

            $rootScope
                .$on('$locationChangeSuccess',
                    function () {
                        var loaded = false;
                        scope.$watch(function() { return DashboardService.state.analytics && DashboardService.state.analytics.revenue && DashboardService.state.analytics.revenue.YTDTotalOrders }, function(state, oldState) {
                            if(state && state !== oldState && !loaded){
                                loaded = true;
                                OrderService.getOrders(function(orders) {
                                    updateLogicFn(orders);
                                });
                            }
                        }) 
                    })
            
        }
    }
}]);
