'use strict';
/** 
 * controllers used for the dashboard
 */
app.controller('DashboardCtrl', ["$scope", "OrderService", "CustomerService", function($scope, OrderService, CustomerService) {

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

    OrderService.getOrders(function(orders) {
        $scope.orders = orders;
        $scope.ordersThisMonth = [];
        var tempData = [];
        _.each($scope.getDaysThisMonth(), function(day, index) {
            var thisDaysOrders = 0;
            _.each(orders, function(order) {
                if (order.created.date) {
                    if ($scope.isSameDateAs(new Date(order.created.date), new Date(day))) {
                        $scope.ordersThisMonth.push(order);
                        thisDaysOrders = thisDaysOrders + 1;
                    }
                }
            });

            tempData.push(thisDaysOrders);
        });
        $scope.analyticsOrders = tempData;
    });

    $scope.getCompletedOrders = function() {
        var completedOrders = [];
        _.each($scope.ordersThisMonth, function(order) {
            if (order.status == 'completed') {
                completedOrders.push(order);
            }
        });

        return completedOrders.length;
    };

    $scope.lastCustomerDate = function() {
        return $scope.customersThisMonth[$scope.customersThisMonth.length-1].created.date
    };

    CustomerService.getCustomers(function(customers) {
        $scope.customers = customers;
        $scope.customersThisMonth = [];
        var tempData = [];
        _.each($scope.getDaysThisMonth(), function(day, index) {
            var thisDaysCustomers = 0;
            _.each(customers, function(customer) {
                console.log('customer.created.date ', customer.created.date);
                if (customer.created.date) {
                    if ($scope.isSameDateAs(new Date(customer.created.date), new Date(day))) {
                        $scope.customersThisMonth.push(customer);
                        thisDaysCustomers = thisDaysCustomers + 1;
                    }
                }
            });

            tempData.push(thisDaysCustomers);
        });
        $scope.analyticsCustomers = tempData;
    });

    $scope.getCustomerLeads = function() {
        var customerLeads = [];
        _.each($scope.customersThisMonth, function(customer) {
            if (customer.tags && customer.tags.length > 0) {
                if (customer.tags.indexOf('ld')) {
                    customerLeads.push(customer);
                }
            }
        });

        return customerLeads.length;
    };

    $scope.lastOrderDate = function() {
        return $scope.ordersThisMonth[$scope.ordersThisMonth.length-1].created.date
    };

}]);
