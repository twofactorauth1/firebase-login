'use strict';

// Declare app level module which depends on filters, and services
angular.module('var.directives', []);
var app = angular.module('courseApp', [    'var.directives', 'app.modules.course', 'app.constants',
    "ui.bootstrap",
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls",
    "com.2fdevs.videogular.plugins.overlayplay",
    "com.2fdevs.videogular.plugins.buffering",
    "info.vietnamcode.nampnq.videogular.plugins.youtube",
    "angular-carousel"]);
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);
}]);