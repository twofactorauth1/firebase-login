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
    $urlRouterProvider.otherwise("/app/dashboard");
    //
    // Set up the states
    $stateProvider.state('app', {
        url: "/app",
        templateUrl: "assets/views/app.html",
        resolve: loadSequence('modernizr', 'moment', 'angularMoment', 'uiSwitch', 'perfect-scrollbar-plugin', 'toaster', 'ngAside', 'vAccordion', 'sweet-alert', 'chartjs', 'tc.chartjs', 'oitozero.ngSweetAlert', 'chatCtrl'),
        abstract: true
    }).state('app.dashboard', {
        url: "/dashboard",
        templateUrl: "assets/views/dashboard.html",
        resolve: loadSequence('jquery-sparkline', 'dashboardCtrl'),
        title: 'Dashboard',
        ncyBreadcrumb: {
            label: 'Dashboard'
        }
    }).state('app.website', {
        url: '/website',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Website',
        ncyBreadcrumb: {
            label: 'Website'
        }
    }).state('app.website.pages', {
        url: '/pages',
        templateUrl: "assets/views/pages.html",
        title: 'Pages',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Pages'
        }
    }).state('app.website.posts', {
        url: '/posts',
        templateUrl: "assets/views/posts.html",
        title: 'Posts',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Posts'
        }
    }).state('app.customers', {
        url: '/customers',
        templateUrl: "assets/views/customers.html",
        title: 'Customers',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Customers'
        }
    }).state('app.commerce', {
        url: '/commerce',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Commerce',
        ncyBreadcrumb: {
            label: 'Commerce'
        }
    }).state('app.commerce.products', {
        url: '/products',
        templateUrl: "assets/views/products.html",
        title: 'Products',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Products'
        }
    }).state('app.commerce.productsingle', {
        url: '/products/:id',
        templateUrl: "assets/views/product-single.html",
        title: 'Products',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Single Product'
        }
    }).state('app.commerce.orders', {
        url: '/orders',
        templateUrl: "assets/views/orders.html",
        title: 'Orders',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Orders'
        }
    }).state('app.marketing', {
        url: '/marketing',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Marketing',
        ncyBreadcrumb: {
            label: 'Marketing'
        }
    }).state('app.marketing.socialfeed', {
        url: '/social-feed',
        templateUrl: "assets/views/social-feed.html",
        title: 'Social Feed',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Social Feed'
        }
    }).state('app.marketing.campaigns', {
        url: '/campaigns',
        templateUrl: "assets/views/campaigns.html",
        title: 'Campaigns',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Campaigns'
        }
    }).state('app.account', {
        url: '/account',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Account',
        ncyBreadcrumb: {
            label: 'Account'
        }
    }).state('app.account.profile', {
        url: '/profile',
        templateUrl: "assets/views/profile.html",
        title: 'Profile',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Profile'
        }
    }).state('app.account.billing', {
        url: '/billing',
        templateUrl: "assets/views/billing.html",
        title: 'Billing',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Billing'
        }
    }).state('app.account.integrations', {
        url: '/integrations',
        templateUrl: "assets/views/integrations.html",
        title: 'Integrations',
        icon: 'ti-layout-media-left-alt',
        ncyBreadcrumb: {
            label: 'Integrations'
        }
    }).state('app.support', {
        url: '/support',
        template: '<div ui-view class="fade-in-up"></div>',
        title: 'Support',
        ncyBreadcrumb: {
            label: 'Support'
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
			function ($ocLL, $q) {
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
			                return $ocLL.load(nowLoad);
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