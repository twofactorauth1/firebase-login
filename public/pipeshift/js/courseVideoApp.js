'use strict';

// Declare app level module which depends on filters, and services
angular.module('app.directives', []);
var app = angular.module('courseVideoApp', ['app.directives',
    'app.modules.coursevideo',
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls",
    "com.2fdevs.videogular.plugins.overlayplay",
    "com.2fdevs.videogular.plugins.buffering",
    "info.vietnamcode.nampnq.videogular.plugins.youtube"]);