define(['angularAMD', 'angularUiRouter', 'angularRoute', 'varMainModule','whenUiScrolledDirective','whenScrolledDirective', 'videoDropDirective', 'videoDraggableDirective', 'coursePreviewDirective', 'videoTitleDirective', 'videoPreviewDirecrive', 'videoPlayerDirective', 'psEditableDirective', 'stripeButtonDirective'], function (angularAMD) {
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
            }));
    });

    $('#preloader').fadeOut();
    angularAMD.bootstrap(app);
    return app;
});
