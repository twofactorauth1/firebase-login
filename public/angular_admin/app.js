define(['angularAMD', 'angularUiRouter', 'angularRoute', 'varMainModule', 'resizeHeightDirective', 'angularFileUpload', 'jdfontselect', 'img'], function(angularAMD) {
  var app = angular.module('indigeweb', ['ui.router', 'ngRoute', 'var', 'angularFileUpload', 'jdFontselect']);
  app.constant('jdFontselectConfig', {
    googleApiKey: 'AIzaSyCQyG-ND5NsItTzZ0m_t1CYPLylcw2ZszQ'
  });
  //routes
  app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    $urlRouterProvider.otherwise("/website");

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
      .state('accountChoosePlan', angularAMD.route({
        url: '/account/choose/plan',
        templateUrl: '/angular_admin/views/account_choose_plan.html',
        controller: 'AccountChoosePlanCtrl',
        controllerUrl: '/angular_admin/controllers/account_choose_plan.js'
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
        templateUrl: '/angular_admin/views/customer_edit.html',
        controller: 'CustomerEditCtrl',
        controllerUrl: '/angular_admin/controllers/customer_edit.js'
      }))
      .state('customerDetail', angularAMD.route({
        url: '/customer/:id',
        templateUrl: '/angular_admin/views/customer_detail.html',
        controller: 'CustomerDetailCtrl',
        controllerUrl: '/angular_admin/controllers/customer_detail.js'
      }))
      .state('customerEdit', angularAMD.route({
        url: '/customer/edit/:id',
        templateUrl: '/angular_admin/views/customer_edit.html',
        controller: 'CustomerEditCtrl',
        controllerUrl: '/angular_admin/controllers/customer_edit.js'
      }))
      .state('website', angularAMD.route({
        url: '/website',
        templateUrl: '/angular_admin/views/website.html',
        controller: 'WebsiteCtrl',
        controllerUrl: '/angular_admin/controllers/website.js'
      }));

    // var authInterceptor =
    //   function($q, $window) {
    //     return {
    //       'responseError': function(rejection) { // Handle errors
    //         switch (rejection.status) {
    //           case 401:
    //             $window.location = "/login";
    //             break;
    //           case 403:
    //             $window.location = "/logout";
    //             break;
    //         }
    //         return $q.reject(rejection);
    //       }
    //     };
    //   };
    // $httpProvider.interceptors.push(authInterceptor);
  });

  $('#preloader').fadeOut();

  angularAMD.bootstrap(app);
  return app;
});
