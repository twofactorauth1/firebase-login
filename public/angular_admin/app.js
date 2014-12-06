define(['angularAMD', 'angularUiRouter', 'angularRoute', 'varMainModule', 'resizeHeightDirective', 'angularFileUpload', 'jdfontselect', 'img', 'moment', 'ngTagsInput'], function(angularAMD) {
  var app = angular.module('indigeweb', ['ui.router', 'ngRoute', 'var', 'angularFileUpload', 'jdFontselect', 'ngTagsInput']);
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
        .state('dashboardNetRevenue', angularAMD.route({
          url: '/dashboard/net-revenue',
          templateUrl: '/angular_admin/views/dashboard/net-revenue.html',
          controller: 'NetRevenueCtrl',
          controllerUrl: '/angular_admin/controllers/dashboard/net_revenue.js'
        }))
        .state('dashboardMonthlyRecurringRevenue', angularAMD.route({
          url: '/dashboard/monthly-recurring-revenue',
          templateUrl: '/angular_admin/views/dashboard/monthly-recurring-revenue.html',
          controller: 'MonthlyRecurringRevenueCtrl',
          controllerUrl: '/angular_admin/controllers/dashboard/monthly-recurring-revenue.js'
        }))
        .state('dashboardOtherRevenue', angularAMD.route({
          url: '/dashboard/other-revenue',
          templateUrl: '/angular_admin/views/dashboard/other-revenue.html',
          controller: 'OtherRevenueCtrl',
          controllerUrl: '/angular_admin/controllers/dashboard/other_revenue.js'
        }))
        .state('singlePageAnalytics', angularAMD.route({
          url: '/dashboard/single-page/:pageId',
          templateUrl: '/angular_admin/views/dashboard/single-page-analytics.html',
          controller: 'SinglePageAnalyticsCtrl',
          controllerUrl: '/angular_admin/controllers/dashboard/single_page_analytics.js'
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
        .state('websiteManage', angularAMD.route({
          url: '/website',
          templateUrl: '/angular_admin/views/website-manage.html',
          controller: 'WebsiteManageCtrl',
          controllerUrl: '/angular_admin/controllers/website_manage.js'
        }))
        .state('website', angularAMD.route({
          url: '/website-editor',
          templateUrl: '/angular_admin/views/website.html',
          controller: 'WebsiteCtrl',
          controllerUrl: '/angular_admin/controllers/website.js'
        }));

      var authInterceptor =
        function($q, $window) {
          return {
            'responseError': function(rejection) { // Handle errors
              switch (rejection.status) {
                case 401:
                  $window.location = "/login";
                  break;
              }
              return $q.reject(rejection);
            }
          };
        };
      $httpProvider.interceptors.push(authInterceptor);
    })
    .run(['$rootScope', function($rootScope) {
      var p = $('.nav.nav-pills.nav-stacked.nav-bracket')
        , includeList = ['account', 'commerce', 'customer', 'website', 'marketing', 'dashboard'];

      $rootScope.$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams) {
          var excludeList = ['accountEdit', 'accountChoosePlan', 'commerceEdit', 'customerAdd', 'customerEdit', 'customerDetail'];
          if (excludeList.indexOf(fromState.name) == -1) {
            $rootScope.lastState = {
              state: fromState.name,
              params: fromParams
            };
          }

          // update active tab
          if (includeList.indexOf(toState.name) >= 0) {
            p = p || $('.nav.nav-pills.nav-stacked.nav-bracket');

            $('[href="#/' + toState.name + '"]', p).parent().addClass('active')
            $('[href="#/' + fromState.name + '"]', p).parent().removeClass('active')
          }
        });
    }]);

  $('#preloader').fadeOut();

  angularAMD.bootstrap(app);
  return app;
});
