var customersManager = {};
customersManager.customersApp = {};

(function () {

    customersManager.customersApp = angular.module('customersApp',
        ['ngRoute', 'ngAnimate', 'routeResolverServices', 'wc.Directives', 'wc.Animations', 'ui.bootstrap']);

    customersManager.customersApp.config(['$routeProvider', function ($routeProvider) {

        $routeProvider
            .when('/customers', {
                controller: 'CustomersController',
                templateUrl: '/javascripts/views/customers/customers.html'
            })
            .when('/customerorders/:customerID', {
                controller: 'CustomerOrdersController',
                templateUrl: '/javascripts/views/customers/customerOrders.html'
            })
            .when('/customeredit/:customerID', {
                controller: 'CustomerEditController',
                templateUrl: '/javascripts/views/customers/customerEdit.html'
            })
            .when('/orders', {
                controller: 'OrdersController',
                templateUrl: '/javascripts/views/orders/orders.html'
            })
            .when('/about', {
                controller: 'AboutController',
                templateUrl: '/javascripts/views/about.html'
            })
            .when('/login', {
                controller: 'LoginController',
                templateUrl: '/javascripts/views/login.html'
            })
            .when('/register', {
                controller: 'RegisterController',
                templateUrl: '/javascripts/views/register.html'
            })
            .when('/logout', {
                controller: 'LogoutController',
                templateUrl: '/javascripts/views/logout.html'
            })
            .otherwise({ redirectTo: '/login' });

    }]);

    //Only needed for Breeze. Maps Q (used by default in Breeze) to Angular's $q to avoid having to call scope.$apply()
    customersManager.customersApp.run(['$q', '$rootScope',
        function ($q, $rootScope) {
            breeze.core.extendQ($rootScope, $q);
        }]);

}());
