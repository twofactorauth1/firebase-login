'use strict';

// Declare app level module which depends on filters, and services
// todo: merge with old app as same angular versions used now
angular.module('app.directives', []);
angular.module('app.services', ['ngResource']);
angular.module('app.filters', []);
var app = angular.module('app', ['ngRoute',
    'xeditable',
    'app.modules.video',
    'app.services',
    'app.filters',
    'app.directives', 'revolunet.stepper', 'fiestah.money']);
app.run(function (editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});