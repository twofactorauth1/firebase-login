'use strict';
/** 
 * controllers used for the dashboard
 */
app.controller('DashboardCtrl', ["$scope", "OrderService", function($scope, OrderService) {

    $scope.sales = [600, 923, 482, 1211, 490, 1125, 1487];
    $scope.earnings = [400, 650, 886, 443, 502, 412, 353];
    $scope.orders = [];

    OrderService.getOrders(function(orders) {
        _.each($scope.getDaysThisMonth(), function(day, index) {
            // var tempOrder = {day: new Date(day).getDate(), orders: []};
            // $scope.orders.push(tempOrder);
            _.each(orders, function(order) {
                if (order.created.date) {
                    if ($scope.isSameDateAs(new Date(order.created.date), new Date(day))) {
                        $scope.orders[index] = $scope.orders[index] + 100;
                    } else {
                        $scope.orders[index] = $scope.orders[index] || 0;
                    }
                }
            });
        });
    });

    $scope.isSameDateAs = function(oDate, pDate) {
        return (
            oDate.getFullYear() === pDate.getFullYear() &&
            oDate.getMonth() === pDate.getMonth() &&
            oDate.getDate() === pDate.getDate()
        );
    };

    $scope.getDaysThisMonth = function() {
        var newDate = new Date();
        var numOfDays = newDate.getDate();
        var days = [];

        for (var i = 0; i <= numOfDays; i++) {
            days[i] = new Date(newDate.getFullYear(), newDate.getMonth(), i + 1);
        }

        return days;
    };

}]);
