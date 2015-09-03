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
    // Set up the states
    $stateProvider.state('app', {
        url: "",
        templateUrl: "assets/views/app.html",
        resolve: loadSequence('modernizr', 'underscore', 'moment', 'angularMoment', 'uiSwitch', 'perfect-scrollbar-plugin', 'toaster', 'ngAside', 'vAccordion', 'chartjs', 'tc.chartjs', 'oitozero.ngSweetAlert', 'chatCtrl', 'smart-table', 'touchspin-plugin', 'slugifier', 'commonService', 'timeAgoFilter','angularFileUpload', 'ngTextTruncate', 'infinite-scroll', 'ui.select', 'blueimp', 'ngTagsInput', 'titleCase', 'bootstrap-confirmation', 'ladda', 'angular-ladda', 'uuid', 'formatText', 'asideCtrl', 'settingsCtrl', 'assetsService', 'mediaModalCtrl', 'xeditable', 'angular-percentage-filter'),
        abstract: true
    }).state('app.dashboard', {
        url: "/dashboard",
        templateUrl: "assets/views/dashboard.html",
        title: 'Dashboard',
        ncyBreadcrumb: {
            label: 'Dashboard'
        },
         resolve: loadSequence('dashboardCtrl', 'orderService', 'customerService', 'jquery-sparkline', 'chartAnalyticsService', 'userService', 'chartCommerceService')
    }).state('app.website', {
        url: '/website',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Website',
        ncyBreadcrumb: {
            label: 'Website',
            skip: true
        }
    }).state('app.website.analytics', {
        url: '/site-analytics',
        templateUrl: "assets/views/site-analytics.html",
        title: 'Site Analytics',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Site Analytics'
        },
        resolve: loadSequence('siteAnalyticsCtrl', 'highcharts', 'highmaps', 'secTotime', 'dateRangePicker', 'keenService', 'chartAnalyticsService')
    }).state('app.website.pages', {
        url: '/pages',
        templateUrl: "assets/views/pages.html",
        title: 'Pages',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Pages'
        },
        resolve: loadSequence('pagesCtrl', 'userService')
    }).state('app.website.templates', {
        url: '/templates',
        templateUrl: "assets/views/templates.html",
        title: 'Templates',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Templates'
        },
        resolve: loadSequence('templatesCtrl', 'userService')
    }).state('app.website.posts', {
        url: '/posts',
        templateUrl: "assets/views/posts.html",
        title: 'Posts',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Posts'
        },
        resolve: loadSequence('postsCtrl', 'userService', 'htmlToPlaintext')
    }).state('app.website.singlepage', {
        url: '/pages/:id',
        templateUrl: "assets/views/editor.html",
        title: 'Page Single',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: '{{breadcrumbTitle}}',
            parent: 'app.website.pages'
        },
        onExit: function($rootScope) {
         $rootScope.breadcrumbTitle = undefined;
        },
        resolve: loadSequence('editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'ui.sortable', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'googlePlaces', 'ngMap', 'angularCircularNavigation', 'campaignService')
    }).state('app.website.singlepost', {
        url: '/posts/:id',
        templateUrl: "assets/views/editor.html",
        title: 'Post Single',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: '{{breadcrumbTitle}}',
            parent: 'app.website.posts'
        },
        onExit: function($rootScope) {
         $rootScope.breadcrumbTitle = undefined;
        },
        resolve: loadSequence('editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'ui.sortable', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'googlePlaces','ngMap', 'angularCircularNavigation', 'campaignService')
    }).state('app.website.singletemplate', {
        url: '/templates/:id',
        templateUrl: "assets/views/editor.html",
        title: 'Template Single',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: '{{breadcrumbTitle}}',
            parent: 'app.website.templates'
        },
        onExit: function($rootScope) {
         $rootScope.breadcrumbTitle = undefined;
        },
        resolve: loadSequence('editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'ui.sortable', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'templateSettingsModalCtrl', 'googlePlaces', 'ngMap', 'angularCircularNavigation', 'campaignService')
    }).state('app.editor', {
        url: '/editor',
        templateUrl: "assets/views/editor.html",
        title: 'Editor',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Editor'
        },
        resolve: loadSequence('editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'ui.sortable', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'templateSettingsModalCtrl', 'angularCircularNavigation', 'campaignService')
    }).state('app.customers', {
        url: '/customers',
        templateUrl: "assets/views/customers.html",
        title: 'Customers',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Customers'
        },
        resolve: loadSequence('customersCtrl', 'ImportContactService', "socialConfigService", 'customerService', 'papaParse', 'string_score', 'importCustomerModalCtrl')
    }).state('app.singleCustomer', {
        url: '/customers/:contactId',
        templateUrl: "assets/views/customer-detail.html",
        title: 'Single Customer',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: '{{ fullName }}',
            parent: 'app.customers'
        },
        resolve: loadSequence('customerDetailCtrl', 'customerService', 'ngMap', 'keenService', 'offset','assetsService', 'toasterService', 'orderService')
    }).state('app.commerce', {
        url: '/commerce',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Commerce',
        ncyBreadcrumb: {
            label: 'Commerce',
            skip: true
        }
    }).state('app.commerce.products', {
        url: '/products',
        templateUrl: "assets/views/products.html",
        title: 'Products',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Products'
        },
        resolve: loadSequence('productsCtrl', 'productService', 'accountService', 'ipCookie')
    }).state('app.commerce.productsingle', {
        url: '/products/:productId',
        templateUrl: "assets/views/product-detail.html",
        title: 'Products',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Single Product',
            parent: 'app.commerce.products'
        },
        resolve: loadSequence('productsDetailCtrl', 'productService', 'assetsService', 'dateRangePicker', 'ngCurrency', 'bootstrap-icon-picker')
    }).state('app.commerce.orders', {
        url: '/orders',
        templateUrl: "assets/views/orders.html",
        title: 'Orders',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Orders'
        },
        resolve: loadSequence('ordersCtrl', 'orderService', 'customerService', 'dateRangePicker')
    }).state('app.commerce.orderdetail', {
        url: '/orders/:orderId',
        templateUrl: "assets/views/order-detail.html",
        title: 'Order Detail',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Single Order',
            parent: 'app.commerce.orders'
        },
        resolve: loadSequence('orderDetailCtrl', 'orderService', 'customerService', 'userService')
    }).state('app.marketing', {
        url: '/marketing',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Marketing',
        ncyBreadcrumb: {
            label: 'Marketing',
            skip: true
        }
    }).state('app.marketing.socialfeed', {
        url: '/social-feed',
        templateUrl: "assets/views/social-feed.html",
        title: 'Social Feed',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Social Feed'
        },
        resolve: loadSequence('socialFeedCtrl', 'socialConfigService', 'wu.masonry','orderByArrayLength')
    }).state('app.emails', {
        url: '/emails',
        templateUrl: "assets/views/emails.html",
        title: 'Emails',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Emails'
        },
        resolve: loadSequence('emailsCtrl', 'chartEmailService')
    }).state('app.marketing.campaigns', {
        url: '/campaigns',
        templateUrl: "assets/views/campaigns.html",
        title: 'Campaigns',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Campaigns'
        },
        resolve: loadSequence('campaignsCtrl', 'campaignService')
    }).state('app.marketing.createcampaign', {
        url: '/campaigns/create-campaign',
        templateUrl: "assets/views/create-campaign.html",
        title: 'Create Campaign',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Create Campaign',
            parent: 'app.marketing.campaigns'
        },
        resolve: loadSequence('createCampaignCtrl', 'campaignService', 'editorCtrl', 'userService', 'htmlToPlaintext', 'spectrum', 'ui.sortable', 'angular-slider', 'assetsService', 'toasterService', 'geocodeService', 'productService', 'paymentService', 'accountService', 'toTrusted', 'generateURLforLinks', 'truncate', 'ckeditor', 'ngSticky', 'slick', 'offset', 'jqcloud', 'jsVideoUrlParser', 'selectedTags', 'addComponentModalCtrl', 'componentSettingsModalCtrl', 'googlePlaces', 'ngMap', 'angularCircularNavigation', 'string_score', 'angular-bootstrap-datetimepicker')
    }).state('app.account', {
        url: '/account',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Account',
        ncyBreadcrumb: {
            label: 'Account',
            skip: true
        }
    }).state('app.account.profilebusiness', {
        url: '/profile-business',
        templateUrl: "assets/views/profile-business.html",
        title: 'Profile Business',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Business Profile'
        },
        resolve: loadSequence('profileBusinessCtrl', 'toasterService', 'assetsService')
    }).state('app.account.profilepersonal', {
        url: '/profile-personal',
        templateUrl: "assets/views/profile-personal.html",
        title: 'Profile Personal',
        icon: 'ti-layout-media-left-alt', 
        ncyBreadcrumb: {
            label: 'Personal Profile'
        },
        resolve: loadSequence('profilePersonalCtrl', 'toasterService', 'assetsService', 'offset')
    }).state('app.account.billing', {
        url: '/billing',
        templateUrl: "assets/views/billing.html",
        title: 'Billing',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Billing'
        },
        resolve: loadSequence('billingCtrl', 'productService', 'stripe', 'paymentService', 'userService', 'toasterService', 'ipCookie', 'skeuocard')
    }).state('app.account.integrations', {
        url: '/integrations',
        templateUrl: "assets/views/integrations.html",
        title: 'Integrations',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Integrations'
        },
        resolve: loadSequence('integrationsCtrl', 'socialConfigService', 'ipCookie', 'accountService')
    }).state('app.support', {
        url: '/support',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Support',
        ncyBreadcrumb: {
            label: 'Support',
            skip: true
        }
    }).state('app.support.gettingstarted', {
        url: '/getting-started',
        templateUrl: "assets/views/getting-started.html",
        title: 'Getting Started',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Getting Started'
        },
        resolve: loadSequence('gettingStartedCtrl')
    }).state('app.support.helptopics', {
        url: '/help-topics',
        templateUrl: "assets/views/help-topics.html",
        title: 'Help Topics',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Help Topics'
        },
        resolve: loadSequence('helpTopicsCtrl')
    })

    // Login routes
    .state('logout', {
        url: '/logout',
        template: '<div ui-view class="fade-in-right-big smooth"></div>',
        abstract: true
    })
    .state('login', {
        url: '/login',
        template: '<div ui-view class="fade-in-right-big smooth"></div>',
        abstract: true
    }).state('login.signin', {
        url: '/signin',
        templateUrl: "assets/views/login_login.html"
    }).state('login.forgot', {
        url: '/forgot',
        templateUrl: "assets/views/login_forgot.html"
    }).state('login.registration', {
        url: '/registration',
        templateUrl: "assets/views/login_registration.html"
    }).state('login.lockscreen', {
        url: '/lock',
        templateUrl: "assets/views/login_lock_screen.html"
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