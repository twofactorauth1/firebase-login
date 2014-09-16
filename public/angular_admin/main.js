/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require.config({
    baseUrl: '/js',
    paths: {
        'jquery': 'libs_misc/jquery/dist/jquery',
        'jqueryUI': 'libs/jquery-ui/jquery-ui.min',
        'angular': 'libs/angular/angular',
        'angularBootstrap': 'libs/angular-bootstrap/ui-bootstrap-tpls',
        'angularRoute': 'libs/angular-route/angular-route',
        'angularSanitize': 'libs/angular-sanitize/angular-sanitize.min',
        'angularResource': 'libs/angular-resource/angular-resource.min',
        'angularAMD': 'libs/angularAMD/angularAMD.min',
        'bootstrap': 'libs/bootstrap/dist/js/bootstrap',
        'underscore': 'libs/underscore/underscore',
        'skeuocard': 'libs/skeuocard/javascripts/skeuocard.min',
        'stripe': 'https://js.stripe.com/v2/?tmp',
        'd3': 'libs/d3/d3',
        'c3': 'libs/c3/c3.min',
        'jqueryGridster': 'libs/gridster/dist/jquery.gridster.min',
        'angularUiRouter': 'libs/angular-ui-router/release/angular-ui-router.min',
        
        //application related
        'storageutils': 'utils/storageutils',
        'namespaces': 'utils/namespaces',
        'adminCommon': '/angular_admin/admin_common',
        'commonutils': 'utils/commonutils',
        'app': '/angular_admin/app',
        'userService': '/angular_admin/services/user',
        'paymentService': '/angular_admin/services/payment',
        'twoNetService': '/angular_admin/services/two_net',
        'skeuocardDirective': '/angular_admin/directives/skeuocard',
    },
    shim: {
        'jqueryUI': {deps: ['jquery']},
        'adminCommon': {deps: ['jquery', 'storageutils', 'namespaces']},
        'angular': {deps: ['jquery']},
        'angularBootstrap': {deps: ['angular']},
        'angularRoute': {deps: ['angular']},
        'angularSanitize': {deps: ['angular']},
        'angularResource': {deps: ['angular']},
        'angularAMD': {deps: ['angular']},
        'bootstrap': {deps: ['jquery']},
        'underscore': {deps: ['jquery']},
        'commonutils': {deps: ['underscore']},
        'jqueryGridster': {deps: ['jquery']},
        'c3': {deps: ['d3']},
        'angularUiRouter': {deps: ['angular']}
    },
    deps: ['adminCommon', 'bootstrap', 'app']
});
