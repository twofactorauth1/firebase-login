'use strict';

define(['angularAMD', 'angularSanitize', 'angularResource', 'angularBootstrap', 'securityService',
    'xEditable', 'ngCsv', 'ngFileUpload', 'angularStepper', 'angularMoney', 'youtubeService', 'courseService',
    'courseVideoService', 'subscriberService', 'whenUiScrolledDirective', 'whenScrolledDirective',
    'videoDropDirective', 'emailDropDirective', 'videoDraggableDirective', 'coursePreviewDirective', 'videoTitleDirective',
    'videoPreviewDirecrive', 'videoPlayerDirective', 'psEditableDirective', 'stripeButtonDirective', 'resizeDirective', 'htmlify'], function (angularAMD) {
// Declare app level module which depends on filters, and services
    var app = angular.module('var', [
        'ngSanitize', 'ui.bootstrap',
        'ngResource',
        'var.security',
        'var.services',
        'var.directives',
        'var.filters',
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
});
