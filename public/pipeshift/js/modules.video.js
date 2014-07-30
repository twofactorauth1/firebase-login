(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'angular'
        ], factory);
    } else {
        factory();
    }
}(function () {
        'use strict';

        angular.module('app.modules.video', ['ngSanitize','ui.bootstrap'])
            .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                $routeProvider.when('/video/listeditor', { templateUrl: '/views/video/listeditor.html', controller: 'ListEditorController' });
                $routeProvider.otherwise({ redirectTo: '/video/listeditor' });
                //
                $locationProvider.html5Mode(true);
            }]);

    }
));
