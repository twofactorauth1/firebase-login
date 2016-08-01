'use strict';

/**
 * Config for the router
 */
app.config(['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'JS_REQUIRES',
function ($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, jsRequires) {

    app.controller = $controllerProvider.register;
    app.directive = $compileProvider.directive;
    app.filter = $filterProvider.register;
    app.factory = $provide.factory;
    app.service = $provide.service;
    app.constant = $provide.constant;
    app.value = $provide.value;

    // LAZY MODULES

    $ocLazyLoadProvider.config({
        debug: false,
        events: true,
        modules: jsRequires.modules
    });

    // APPLICATION ROUTES
    // -----------------------------------
    // For any unmatched url, redirect to /app/dashboard
    $urlRouterProvider.otherwise("/dashboard");
    //
    //lower casing all urls
    $urlRouterProvider.rule(function ($injector, $location) {
        var path = $location.path(), normalized = path.toLowerCase();
        if (path != normalized) {
            $location.replace().path(normalized);
        }
    });
    // Set up the states
    $stateProvider.state('app', {
        url: "",
        templateUrl: "/admin/assets/views/app.html",
        resolve: loadSequence('modernizr', 'underscore', 'moment', 'angularMoment', 'uiSwitch', 'perfect-scrollbar-plugin', 'toaster', 'ngAside', 'chartjs', 'tc.chartjs', 'oitozero.ngSweetAlert', 'chatCtrl', 'smart-table', 'touchspin-plugin', 'slugifier', 'commonService', 'timeAgoFilter','angularFileUpload', 'ngTextTruncate', 'infinite-scroll', 'ui.select', 'blueimp', 'ngTagsInput', 'titleCase', 'bootstrap-confirmation', 'ladda', 'angular-ladda', 'uuid', 'formatText', 'asideCtrl', 'settingsCtrl', 'assetsService', 'mediaModalCtrl', 'xeditable', 'angular-percentage-filter', 'angular-clipboard', 'google-fonts', 'dashboardService', 'videogular', 'indi-login-modal', 'productTableFilter'),
        abstract: true
    }).state('app.dashboard', {
        url: "/_dashboard",
        templateUrl: "/admin/assets/views/dashboard.html",
        title: 'Dashboard',
        resolve: loadSequence('dashboardCtrl', 'orderService', 'contactService', 'jquery-sparkline', 'chartAnalyticsService', 'userService', 'chartCommerceService' , 'offset')
    }).state('app.website', {
        url: '/website',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Website'
    }).state('app.website.ssbSiteBuilder', {
        url: '/site-builder',
        template: '<div ui-view class=""></div>',
        title: 'Simple Site Builder'
    }).state('app.website.ssbSiteBuilder.pages', {
        url: '/pages/',
        template: "<ssb-site-templates></ssb-site-templates>",
        title: 'Choose a site template',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('simpleSiteBuilderService')
    }).state('app.website.ssbSiteBuilder.editor', {
        url: '/pages/:pageId',
        template: '<ssb-site-builder class="ssb-site-builder"></ssb-site-builder>',
        title: 'Simple Site Builder Page Editor',
        resolve: angular.extend({
            init: ['$stateParams', 'SimpleSiteBuilderService', function($stateParams, SimpleSiteBuilderService) {
                return SimpleSiteBuilderService.getPage($stateParams.pageId);
            }]
        }, loadSequence('froala-wysiwyg-editor', 'froala-wysiwyg-editor-plugins', 'custom-froala-wysiwyg-editor', 'editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'ssbComponentSettingsModalCtrl', 'googlePlaces', 'ngMap', 'angularCircularNavigation', 'campaignService', 'angular-resizable', 'wu.masonry', 'cleanType', 'filterPages', 'deep-diff', 'sortListPages'))
    }).state('app.website.analytics', {
        url: '/site-analytics',
        templateUrl: "/admin/assets/views/site-analytics.html",
        title: 'Site Analytics',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('siteAnalyticsCtrl', 'highcharts', 'highmaps', 'secTotime', 'dateRangePicker', 'keenService', 'chartAnalyticsService')
    }).state('app.website.pages', {
        url: '/pages',
        templateUrl: "/admin/assets/views/pages.html",
        title: 'Pages',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('pagesCtrl', 'userService')
    }).state('app.website.templates', {
        url: '/templates',
        templateUrl: "/admin/assets/views/templates.html",
        title: 'Templates',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('templatesCtrl', 'userService')
    }).state('app.website.posts', {
        url: '/posts',
        templateUrl: "/admin/assets/views/posts.html",
        title: 'Posts',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('postsCtrl', 'userService', 'htmlToPlaintext')
    }).state('app.website.singlepage', {
        url: '/pages/:id',
        templateUrl: "/admin/assets/views/editor.html",
        title: 'Page Single',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'googlePlaces', 'ngMap', 'angularCircularNavigation', 'campaignService', 'angular-resizable', 'wu.masonry')
    }).state('app.website.singlepost', {
        url: '/posts/:id',
        templateUrl: "/admin/assets/views/editor.html",
        title: 'Post Single',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'googlePlaces','ngMap', 'angularCircularNavigation', 'campaignService', 'angular-resizable', 'wu.masonry')
    }).state('app.website.singletemplate', {
        url: '/templates/:id',
        templateUrl: "/admin/assets/views/editor.html",
        title: 'Template Single',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum',  'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'templateSettingsModalCtrl', 'googlePlaces', 'ngMap', 'angularCircularNavigation', 'campaignService', 'angular-resizable', 'wu.masonry')
    }).state('app.editor', {
        url: '/editor',
        templateUrl: "/admin/assets/views/editor.html",
        title: 'Editor',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'templateSettingsModalCtrl', 'angularCircularNavigation', 'campaignService', 'angular-resizable', 'wu.masonry')
    }).state('app.contacts', {
        url: '/contacts',
        templateUrl: "/admin/assets/views/contacts.html",
        title: 'Contacts',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('contactsCtrl', 'ImportContactService', "socialConfigService", 'contactService', 'papaParse', 'string_score', 'importContactModalCtrl')
    }).state('app.singleContact', {
        url: '/contacts/:contactId',
        templateUrl: "/admin/assets/views/contact-detail.html",
        title: 'Single Contact',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('contactDetailCtrl', 'contactService', 'ngMap', 'keenService', 'offset','assetsService', 'toasterService', 'orderService')
    }).state('app.commerce', {
        url: '/commerce',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Commerce'
    }).state('app.commerce.products', {
        url: '/products',
        templateUrl: "/admin/assets/views/products.html",
        title: 'Products',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('productsCtrl', 'productService', 'accountService', 'ipCookie')
    }).state('app.commerce.productsingle', {
        url: '/products/:productId',
        templateUrl: "/admin/assets/views/product-detail.html",
        title: 'Products',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('productsDetailCtrl', 'productService', 'dateRangePicker', 'ngCurrency', 'bootstrap-icon-picker', 'campaignService', 'editorCtrl', 'ckeditor', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'toTrusted', 'propsFilter', 'angularCircularNavigation', 'string_score', 'htmlToPlaintext', 'spectrum')
    }).state('app.commerce.orders', {
        url: '/orders',
        templateUrl: "/admin/assets/views/orders.html",
        title: 'Orders',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('ordersCtrl', 'orderService', 'contactService', 'dateRangePicker')
    }).state('app.commerce.orderdetail', {
        url: '/orders/:orderId',
        templateUrl: "/admin/assets/views/order-detail.html",
        title: 'Order Detail',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('orderDetailCtrl', 'orderService', 'contactService', 'userService')
    }).state('app.commerce.orderdetailedit', {
        url: '/orders/:orderId/edit',
        templateUrl: "/admin/assets/views/order-detail-edit.html",
        title: 'Order Detail Edit',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('orderDetailEditCtrl', 'orderService', 'contactService', 'userService')
    }).state('app.marketing', {
        url: '/marketing',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Marketing',
    }).state('app.marketing.socialfeed', {
        url: '/social-feed',
        templateUrl: "/admin/assets/views/social-feed.html",
        title: 'Social Feed',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('socialFeedCtrl', 'socialConfigService', 'wu.masonry','orderByArrayLength')
    }).state('app.emails', {
        url: '/emails',
        templateUrl: "/admin/assets/views/emails.html",
        title: 'Emails',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('emailsCtrl', 'chartEmailService')
    }).state('app.emailEditor', {
        url: '/emails/editor/:id',
        template: '<indi-email-builder class="ssb-site-builder"></indi-email-builder>',
        title: 'Email Editor',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('froala-wysiwyg-editor', 'froala-wysiwyg-editor-plugins', 'custom-froala-wysiwyg-editor', 'spectrum', 'angular-slider', 'deep-diff', 'sortListPages')
    }).state('app.emailCampaign', {
        url: '/emails/campaigns/:id',
        template: "<indi-email-campaign></indi-email-campaign>",
        title: 'Email Campaign',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('froala-wysiwyg-editor', 'froala-wysiwyg-editor-plugins', 'custom-froala-wysiwyg-editor', 'propsFilter')
    }).state('app.marketing.campaigns', {
        url: '/campaigns',
        templateUrl: "/admin/assets/views/campaigns.html",
        title: 'Campaigns',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('campaignsCtrl', 'campaignService')
    }).state('app.marketing.createcampaign', {
        url: '/campaigns/create-campaign',
        templateUrl: "/admin/assets/views/create-campaign.html",
        title: 'Create Campaign',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('createCampaignCtrl', 'campaignService', 'editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'googlePlaces', 'ngMap', 'angularCircularNavigation', 'string_score', 'angular-bootstrap-datetimepicker', 'propsFilter')
    }).state('app.campaignDetail', {
        url: '/marketing/campaigns/:campaignId',
        templateUrl: "/admin/assets/views/create-campaign.html",
        title: 'Campaign Detail',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('createCampaignCtrl', 'campaignService', 'editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'googlePlaces', 'ngMap', 'angularCircularNavigation', 'string_score', 'angular-bootstrap-datetimepicker', 'propsFilter')
    }).state('app.account', {
        url: '/account',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Account',
    }).state('app.account.profilebusiness', {
        url: '/profile-business',
        templateUrl: "/admin/assets/views/profile-business.html",
        title: 'Profile Business',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('profileBusinessCtrl', 'toasterService', 'assetsService')
    }).state('app.account.profilepersonal', {
        url: '/profile-personal',
        templateUrl: "/admin/assets/views/profile-personal.html",
        title: 'Profile Personal',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('profilePersonalCtrl', 'toasterService', 'assetsService', 'offset')
    }).state('app.account.billing', {
        url: '/billing',
        templateUrl: "/admin/assets/views/billing.html",
        title: 'Billing',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('billingCtrl', 'productService', 'stripe', 'paymentService', 'userService', 'toasterService', 'ipCookie', 'skeuocard')
    }).state('app.account.integrations', {
        url: '/integrations',
        templateUrl: "/admin/assets/views/integrations.html",
        title: 'Integrations',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('integrationsCtrl', 'socialConfigService', 'ipCookie', 'accountService')
    }).state('app.support', {
        url: '/support',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Support'
    }).state('app.support.helptopics', {
        url: '/help-topics',
        templateUrl: "/admin/assets/views/help-topics.html",
        title: 'Help Topics',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('helpTopicsCtrl', 'toTrusted', 'ckeditor', 'jsVideoUrlParser')
    }).state('app.support.oldhelptopics', {
        url: '/old-help-topics',
        templateUrl: "/admin/assets/views/old-help-topics.html",
        title: 'Old Help Topics',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('oldHelpTopicsCtrl')
    }).state('app.support.managetopics', {
        url: '/manage-topics',
        templateUrl: "/admin/assets/views/manage-topics.html",
        title: 'Manage Topics',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('manageTopicsCtrl', 'userService')
    }).state('app.support.singletopic', {
        url: '/manage-topics/:id',
        templateUrl: "/admin/assets/views/editor.html",
        title: 'Topic Single',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'templateSettingsModalCtrl', 'googlePlaces', 'ngMap', 'campaignService', 'angularCircularNavigation')
    }).state('app.onboarding', {
        url: '/onboarding',
        templateUrl: "/admin/assets/views/onboarding.html",
        title: 'Onboarding',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('onboardingCtrl')
    }).state('app.dohy', {
        url: '/dashboard',
        templateUrl: "/admin/assets/js/dashboard/dohy.html",
        title: 'Dashboard',
        icon: 'ti-layout-media-left-alt',
        resolve: loadSequence('DOHYCtrl', 'dashboardService', 'DashboardWorkstreamTileComponentController', 'DashboardAnalyticTileComponentController', 'jsVideoUrlParser', 'highcharts')
    })

    // Login routes
    // .state('logout', {
    //     url: '/logout',
    //     template: '<div ui-view class="fade-in-right-big smooth"></div>',
    //     abstract: true
    // })
    .state('login', {
        url: '/login',
        template: '<div ui-view class="fade-in-right-big smooth"></div>',
        abstract: true
    }).state('login.signin', {
        url: '/signin',
        templateUrl: "/admin/assets/views/login_login.html"
    }).state('login.forgot', {
        url: '/forgot',
        templateUrl: "/admin/assets/views/login_forgot.html"
    }).state('login.registration', {
        url: '/registration',
        templateUrl: "/admin/assets/views/login_registration.html"
    }).state('login.lockscreen', {
        url: '/lock',
        templateUrl: "/admin/assets/views/login_lock_screen.html"
    });

    // Generates a resolve object previously configured in constant.JS_REQUIRES (config.constant.js)
    function loadSequence() {
        var _args = arguments;
        return {
            deps: ['$ocLazyLoad', '$q',
            function ($ocLazyLoad, $q) {
                var promise = $q.when(1);
                for (var i = 0, len = _args.length; i < len; i++) {
                    promise = promiseThen(_args[i]);
                }
                return promise;

                function promiseThen(_arg) {
                    if (typeof _arg == 'function')
                        return promise.then(_arg);
                    else
                        return promise.then(function () {
                            var nowLoad = requiredData(_arg);
                            if (!nowLoad)
                                return $.error('Route resolve: Bad resource name [' + _arg + ']');
                            return $ocLazyLoad.load(nowLoad);
                        });
                }

                function requiredData(name) {
                    if (jsRequires.modules)
                        for (var m in jsRequires.modules)
                            if (jsRequires.modules[m].name && jsRequires.modules[m].name === name)
                                return jsRequires.modules[m];
                    return jsRequires.scripts && jsRequires.scripts[name];
                }
            }]
        };
    }
}]);
