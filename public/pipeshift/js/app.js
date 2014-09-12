'use strict';

// Declare app level module which depends on filters, and services
angular.module('app.directives', []);
angular.module('app.services', ['ngResource']);
angular.module('app.filters', []);
angular.module('app.modules.home', []);
angular.module('app.modules.profile', []);
angular.module('app.modules.video', ['ngSanitize', 'ui.bootstrap']);
var app = angular.module('app', ['ngRoute',
    'ngResource',
    'app.modules.home',
    'app.modules.profile',
    'app.modules.video',
    'app.security',
    'app.services',
    'app.directives',
    'app.filters',
    'app.constants',
    'ui.bootstrap',
    'xeditable',
    'ngCsv',
    'revolunet.stepper', 'fiestah.money']);

app.run(['$rootScope', '$location', 'security', 'editableOptions', function ($rootScope, $location, security, editableOptions) {
    // Get the current user when the application starts
    // (in case they are still logged in from a previous session)
    security.requestCurrentUser();
    //
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
}]);