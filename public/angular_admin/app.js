define(['angularAMD', 'angularRoute'], function (angularAMD) {
    var app = angular.module('indigeweb', ['ngRoute']);

    //routes
    app.config(function ($routeProvider) {
    	$routeProvider
    	.when('/dashboard', angularAMD.route({
    		templateUrl: '/angular_admin/views/dashboard.html',
    		controller: 'DashboardCtrl',
    		controllerUrl: '/angular_admin/controllers/dashboard.js'
    	}))
    	.when('/account', angularAMD.route({
    		templateUrl: '/angular_admin/views/account.html',
    		controller: 'AccountCtrl',
    		controllerUrl: '/angular_admin/controllers/account.js'
    	}))
    	.when('/account/edit', angularAMD.route({
    		templateUrl: '/angular_admin/views/account_edit.html',
    		controller: 'AccountEditCtrl',
    		controllerUrl: '/angular_admin/controllers/account_edit.js'
    	}))
    	.when('/commerce', angularAMD.route({
    		templateUrl: '/angular_admin/views/commerce.html',
    		controller: 'CommerceCtrl',
    		controllerUrl: '/angular_admin/controllers/commerce.js'
    	}))
    	.when('/commerce/edit/:id', angularAMD.route({
    		templateUrl: '/angular_admin/views/commerce_edit.html',
    		controller: 'CommerceEditCtrl',
    		controllerUrl: '/angular_admin/controllers/commerce_edit.js'
    	}))
    	.otherwise({redirectTo:'/dashboard'});
    });

	$('#preloader').fadeOut();
    return angularAMD.bootstrap(app);
});
