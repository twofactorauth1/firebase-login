define(['angularAMD', 'angularUiRouter', 'angularRoute', 'varMainModule'], function (angularAMD) {
    var app = angular.module('indigeweb', ['ui.router', 'ngRoute', 'var']);

    //routes
    app.config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/dashboard");

        $stateProvider
            .state('dashboard', angularAMD.route({
                url: '/dashboard',
                templateUrl: '/angular_admin/views/dashboard.html',
                controller: 'DashboardCtrl',
                controllerUrl: '/angular_admin/controllers/dashboard.js'
            }))
            .state('account', angularAMD.route({
                url: '/account',
                templateUrl: '/angular_admin/views/account.html',
                controller: 'AccountCtrl',
                controllerUrl: '/angular_admin/controllers/account.js'
            }))
            .state('accountEdit', angularAMD.route({
                url: '/account/edit',
                templateUrl: '/angular_admin/views/account_edit.html',
                controller: 'AccountEditCtrl',
                controllerUrl: '/angular_admin/controllers/account_edit.js'
            }))
            .state('marketing', angularAMD.route({
                url: '/marketing',
                templateUrl: '/pipeshift/views/video/listeditor.html',
                controller: 'ListEditorController',
                controllerUrl: '/pipeshift/js/modules/video/controller/ListEditorController.js'
            }))
            .state('commerce', angularAMD.route({
                url: '/commerce',
                templateUrl: '/angular_admin/views/commerce.html',
                controller: 'CommerceCtrl',
                controllerUrl: '/angular_admin/controllers/commerce.js'
            }))
            .state('commerceEdit', angularAMD.route({
                url: '/commerce/edit/:id',
                templateUrl: '/angular_admin/views/commerce_edit.html',
                controller: 'CommerceEditCtrl',
                controllerUrl: '/angular_admin/controllers/commerce_edit.js'
            }))
            .state('customer', angularAMD.route({
                url: '/customer',
                templateUrl: '/angular_admin/views/customer.html',
                controller: 'CustomerCtrl',
                controllerUrl: '/angular_admin/controllers/customer.js'
            }))
            .state('customerAdd', angularAMD.route({
                url: '/customer/add',
                templateUrl: '/angular_admin/views/customerAdd.html',
                controller: 'CustomerAddCtrl',
                controllerUrl: '/angular_admin/controllers/customerAdd.js'
            }))
            .state('customerDetail', angularAMD.route({
                url: '/customer/:id',
                templateUrl: '/angular_admin/views/customerDetail.html',
                controller: 'CustomerDetailCtrl',
                controllerUrl: '/angular_admin/controllers/customerDetail.js'
            }))
            .state('customerEdit', angularAMD.route({
                url: '/customer/edit/:id',
                templateUrl: '/angular_admin/views/customerEdit.html',
                controller: 'CustomerEditCtrl',
                controllerUrl: '/angular_admin/controllers/customerEdit.js'
            }))
            .state('website', angularAMD.route({
                url: '/website',
                templateUrl: '/angular_admin/views/website.html',
                controller: 'WebsiteCtrl',
                controllerUrl: '/angular_admin/controllers/website.js'
            }));
    });

    $('#preloader').fadeOut();
    angularAMD.bootstrap(app);
    return app;
});
