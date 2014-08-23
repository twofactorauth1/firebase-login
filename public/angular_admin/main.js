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
 		'angular': 'libs/angular/angular',
        'angularBootstrap': 'libs/angular-bootstrap/ui-bootstrap-tpls',
        'angularRoute': 'libs/angular-route/angular-route',
        'angularSanitize': 'libs/angular-sanitize/angular-sanitize.min',
        'angularResource': 'libs/angular-resource/angular-resource.min',
        'angularAMD': 'libs/angularAMD/angularAMD.min'
 	},
 	shim: {
 		'angular': {deps: ['jquery']},
 		'angularBootstrap': {deps: ['angular']},
        'angularRoute': {deps: ['angular']},
        'angularSanitize': {deps: ['angular']},
        'angularResource': {deps: ['angular']},
        'angularAMD': {deps: ['angular']}
 	},
 	deps: ['/angular_admin/app.js']
 });