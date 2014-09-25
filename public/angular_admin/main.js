/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require.config({
    baseUrl: '/js',
    paths: {
        'jquery': 'libs/jquery/dist/jquery',
        'jqueryUI': 'libs/jquery-ui/jquery-ui.min',
        'angular': 'libs/angular/angular',
        'angularBootstrap': 'libs/angular-bootstrap/ui-bootstrap-tpls',
        'angularRoute': 'libs/angular-route/angular-route',
        'angularSanitize': 'libs/angular-sanitize/angular-sanitize.min',
        'angularResource': 'libs/angular-resource/angular-resource.min',
        'angularUI': 'libs/angular-ui/build/angular-ui.min',
        'angularSortable': 'libs/angular-ui/modules/directives/sortable/sortable',
        'angularAMD': 'libs/angularAMD/angularAMD.min',
        'bootstrap': 'libs/bootstrap/dist/js/bootstrap',
        'underscore': 'libs/underscore/underscore',
        'skeuocard': 'libs/skeuocard/javascripts/skeuocard.min',
        'stripe': 'https://js.stripe.com/v2/?tmp',
        'd3': 'libs/d3/d3',
        'c3': 'libs/c3/c3.min',
        'jqueryGridster': 'libs/gridster/dist/jquery.gridster.min',
        'angularUiRouter': 'libs/angular-ui-router/release/angular-ui-router.min',
        "angularStepper": "libs/angular-stepper/src/angular-stepper",
        "angularMoney": "libs/angular-money-directive/angular-money-directive",
        "xEditable": "libs/angular-xeditable/dist/js/xeditable",
        "ngCsv": "libs/ng-csv/build/ng-csv.min",
        "ngFileUpload": "libs/angular-file-upload/angular-file-upload",
		
        //application related
        'storageutils': 'utils/storageutils',
        'namespaces': 'utils/namespaces',
        'adminCommon': '/angular_admin/admin_common',
        'commonutils': 'utils/commonutils',
        'app': '/angular_admin/app',
        'userService': '/angular_admin/services/user',
        'paymentService': '/angular_admin/services/payment',
        'twoNetService': '/angular_admin/services/two_net',
        'customerService': '/angular_admin/services/customer',
        'websiteService': '/angular_admin/services/website',
        'customerHelperService': '/angular_admin/services/customer_helper',
        'skeuocardDirective': '/angular_admin/directives/skeuocard',
        'stateNavDirective': '/angular_admin/directives/state_nav',
        
        //videoautoresponder
        "varMainModule": "/pipeshift/js/varMainModule",
        "varModules": "/pipeshift/js/varModules",
        "removeModalController": "/pipeshift/js/controller/RemoveModalController",
        "securityConfig": "/pipeshift/js/service/securityConfig",
        "securityService": "/pipeshift/js/service/security",
        "htmlify": "/pipeshift/js/modules/video/filter/htmlify",
        "youtubeService": "/pipeshift/js/modules/video/service/youtube",
        "courseService": "/pipeshift/js/modules/video/service/Course",
        "courseVideoService": "/pipeshift/js/modules/video/service/CourseVideo",
        "subscriberService": "/pipeshift/js/modules/video/service/Subscriber",
        "editCourseModalController": "/pipeshift/js/modules/video/controller/EditCourseModalController",
        "timelineItemController": "/pipeshift/js/modules/video/controller/TimelineItemController",
        "searchOptionsModalController": "/pipeshift/js/modules/video/controller/SearchOptionsModalController",
        "videoViewModalController": "/pipeshift/js/modules/video/controller/VideoViewModalController",
        "addCourseModalController": "/pipeshift/js/modules/video/controller/AddCourseModalController",
        "subscribersCvsUploadController": "/pipeshift/js/modules/video/controller/SubscribersCsvUploadController",
        "whenUiScrolledDirective": "/pipeshift/js/modules/video/directive/whenUiScrolled",
        "whenScrolledDirective": "/pipeshift/js/modules/video/directive/whenScrolled",
        "videoDropDirective": "/pipeshift/js/modules/video/directive/videoDrop",
        "videoDraggableDirective": "/pipeshift/js/modules/video/directive/videoDraggable",
        "coursePreviewDirective": "/pipeshift/js/modules/video/directive/coursePreview",
        "videoTitleDirective": "/pipeshift/js/modules/video/directive/videoTitle",
        "videoPreviewDirecrive": "/pipeshift/js/modules/video/directive/videoPreview",
        "videoPlayerDirective": "/pipeshift/js/modules/video/directive/videoPlayer",
        "psEditableDirective": "/pipeshift/js/modules/video/directive/psEditable",
        "stripeButtonDirective": "/pipeshift/js/directive/stripePayButton",
        "constants": 'constants/constants'
    },
    shim: {
        'jqueryUI': {deps: ['jquery']},
        'adminCommon': {deps: ['jquery', 'storageutils', 'namespaces']},
        'angular': {deps: ['jquery']},
        'angularBootstrap': {deps: ['angular']},
        'angularRoute': {deps: ['angular']},
        'angularSanitize': {deps: ['angular']},
        'angularResource': {deps: ['angular']},
        'angularUI': {deps: ['angular']},
        'angularSortable': {deps: ['angular']},
        'angularAMD': {deps: ['angular']},
        'bootstrap': {deps: ['jquery']},
        'underscore': {deps: ['jquery']},
        'commonutils': {deps: ['underscore']},
        'jqueryGridster': {deps: ['jquery']},
        'c3': {deps: ['d3']},
        'angularUiRouter': {deps: ['angular']},
        'xEditable': {deps: ['angular']},
        'ngCsv': {deps: ['angular']},
        'ngFileUpload': {deps: ['angular']},
        'angularStepper': {deps: ['angular']},
        'angularMoney': {deps: ['angular']},
        'youtubeService': {deps: ['angular', 'varModules']},
        'courseService': {deps: ['angular', 'varModules', 'angularResource']},
        'courseVideoService': {deps: ['angular', 'varModules', 'angularResource']},
        'subscriberService': {deps: ['angular', 'varModules', 'angularResource']},
        'whenUiScrolledDirective': {deps: ['angular', 'varModules']},
        'whenScrolledDirective': {deps: ['angular', 'varModules']},
        'videoDropDirective': {deps: ['angular', 'varModules']},
        'videoDraggableDirective': {deps: ['angular', 'varModules']},
        'coursePreviewDirective': {deps: ['angular', 'varModules']},
        'videoTitleDirective': {deps: ['angular', 'varModules']},
        'videoPreviewDirecrive': {deps: ['angular', 'varModules']},
        'videoPlayerDirective': {deps: ['angular', 'varModules']},
        'psEditableDirective': {deps: ['angular', 'varModules']},
        'stripeButtonDirective': {deps: ['angular', 'varModules']},
        'htmlify': {deps: ['angular', 'varModules']},
    },
    deps: ['adminCommon', 'bootstrap', 'app']
});
