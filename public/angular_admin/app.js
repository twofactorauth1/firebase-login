define(['angularAMD', 'angularRoute'], function (angularAMD) {
    var app = angular.module('indigeweb', ['ngRoute']);
    
    //routes
    app.config(function ($routeProvider) {
    	$routeProvider.when('/account', angularAMD.route({
    		templateUrl: '/angular_admin/views/account.html',
    		controller: 'AccountCtrl',
    		controllerUrl: '/angular_admin/controllers/account.js'
    	}))
    	.otherwise({redirectTo:'/account'});
    });
    
    return angularAMD.bootstrap(app);
});