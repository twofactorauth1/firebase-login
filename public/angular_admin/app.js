define(['angularAMD', 'angularRoute'], function (angularAMD) {
    var app = angular.module('indigeweb', ['ngRoute']);
    
    //routes
    app.config(function ($routeProvider) {
    	$routeProvider.when('/account', angularAMD.route({
    		templateUrl: '/angular_admin/views/account.html',
    		controller: 'AccountCtrl',
    		controllerUrl: '/angular_admin/controllers/account.js'
    	}))
    	.when('/account/edit', angularAMD.route({
    		templateUrl: '/angular_admin/views/account_edit.html',
    		controller: 'AccountEditCtrl',
    		controllerUrl: '/angular_admin/controllers/account_edit.js'
    	}))
    	.otherwise({redirectTo:'/account'});
    });
    
	$('#preloader').fadeOut();
    return angularAMD.bootstrap(app);
});