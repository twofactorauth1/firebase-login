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
        'angularBootstrap': 'libs/angular-bootstrap/ui-bootstrap-tpls.min',
        'angularBootstrapSwitch': 'libs/angular-bootstrap-switch/dist/angular-bootstrap-switch',
        'angularRoute': 'libs/angular-route/angular-route',
        'angularSanitize': 'libs/angular-sanitize/angular-sanitize.min',
        'angularResource': 'libs/angular-resource/angular-resource.min',
        'angularUI': 'libs/angular-ui/build/angular-ui.min',
        'angularSortable': 'libs/angular-ui/modules/directives/sortable/sortable',
        'bootstrap': 'libs/bootstrap/dist/js/bootstrap',
        'bootstrapSwitch':'libs/bootstrap-switch/dist/js/bootstrap-switch.min',
        "bootstrap-iconpicker":"libs/bootstrap-icon-picker/bootstrap-iconpicker/js/bootstrap-iconpicker.min",
        'spectrum': 'libs/spectrum/spectrum',
        'colorpicker': 'libs/angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.min',
        'angularAMD': 'libs/angularAMD/angularAMD.min',
        'underscore': 'libs/underscore/underscore',
        'skeuocard': 'libs/skeuocard/javascripts/skeuocard.min',
        'webfontloader': 'libs/jd-fontselect/dist/libs/webfontloader',
        'jdfontselect': 'libs/jd-fontselect/dist/angular-fontselect.min',
        'stripe': 'https://js.stripe.com/v2/?tmp',
        'd3': 'libs/d3/d3',
        'c3': 'libs/c3/c3.min',
        'jqueryGridster': 'libs/gridster/dist/jquery.gridster.min',
        'angularUiRouter': 'libs/angular-ui-router/release/angular-ui-router.min',
        'angularFileUpload': 'libs_misc/angular-file-upload/angular-file-upload',
        "angularStepper": "libs/angular-stepper/src/angular-stepper",
        "angularMoney": "libs/angular-money-directive/angular-money-directive",
        "xEditable": "libs/angular-xeditable/dist/js/xeditable",
        "ngCsv": "libs/ng-csv/build/ng-csv.min",
        "ngFileUpload": "libs/angular-file-upload/angular-file-upload",
        "ngAnimate":"libs/angular-animate/angular-animate.min",
        "toaster": "libs/AngularJS-Toaster/toaster",
        "ngProgress": "libs/ngprogress/build/ngProgress.min",
        "headroom":"libs/headroom.js/dist/headroom.min",
        "ngHeadroom":"libs/headroom.js/dist/angular.headroom.min",
        "bootstrap-confirmation": "libs/bootstrap-confirmation/bootstrap-confirmation",
        "moment": 'libs/moment/min/moment.min',
        'ngInfiniteScroll': 'libs/ngInfiniteScroll/build/ng-infinite-scroll.min',

        //application related
        'storageutils': 'utils/storageutils',
        'namespaces': 'utils/namespaces',
        'adminCommon': '/angular_admin/admin_common',
        'commonutils': 'utils/commonutils',
        'app': '/angular_admin/app',
        'userService': '/angular_admin/services/user',
        'paymentService': '/angular_admin/services/payment',
        'twoNetService': '/angular_admin/services/two_net',
        'assetsService': '/angular_admin/services/assets',
        'skeuocardDirective': '/angular_admin/directives/skeuocard',
        'mediaDirective': '/angular_admin/directives/mediadirective',
        'customerService': '/angular_admin/services/customer',
        'websiteService': '/angular_admin/services/website',
        'postService': '/angular_admin/services/post',
        'productService': '/angular_admin/services/product',
        'dashboardService': '/angular_admin/services/dashboard',
        'chartFacebookService': '/angular_admin/services/chart_facebook',
        'chartStripService': '/angular_admin/services/chart_strip',
        'chartTwoNetService': '/angular_admin/services/chart_two_net',
        'importContactService': '/angular_admin/services/import_contacts',
        'toasterService': '/angular_admin/services/toaster',
        'accountService': '/angular_admin/services/account',
        'stateNavDirective': '/angular_admin/directives/state_nav',
        'hoverClassDirective': '/angular_admin/directives/hover_class',
        'confirmClickDirective': '/angular_admin/directives/confirm_click',
        'resizeHeightDirective': '/angular_admin/directives/resize_height',
        'truncateDirective': '/angular_admin/directives/truncate',
        'adminValidationDirective': '/angular_admin/directives/form_validations',
        "constants": 'constants/constants',
        'formValidationDirective': 'libs/angular-bootstrap-switch/src/directives/bsSwitch',
        'unsafeHtml': '/angular_admin/filters/unsafe-html',
        'iStartsWithFilter' : '/angular_admin/filters/i_starts_with',
        'confirmClick2':'/angular_admin/directives/confirm_click2',
        'img':'/angular_admin/directives/img_adv',
        'timeAgoFilter':'/angular_admin/filters/time_ago',

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
    },
    shim: {
        'jqueryUI': {deps: ['jquery']},
        'adminCommon': {deps: ['jquery', 'storageutils', 'namespaces']},
        'angular': {deps: ['jquery']},
        'angularBootstrap': {deps: ['angular']},
        'angularBootstrapSwitch': {deps: ['angular', 'bootstrapSwitch']},
        'angularRoute': {deps: ['angular']},
        'angularSanitize': {deps: ['angular']},
        'angularResource': {deps: ['angular']},
        'angularUI': {deps: ['angular']},
        'angularSortable': {deps: ['angular']},
        'ngAnimate':{deps: ['angular']},
        'toaster': {deps: ['angular', 'ngAnimate']},
        'angularAMD': {deps: ['angular']},
        'bootstrap': {deps: ['jquery']},
        'underscore': {deps: ['jquery']},
        'spectrum': {deps: ['jquery']},
        'colorpicker': {deps: ['spectrum']},
        'ngHeadroom': {deps: ['headroom']},
        'commonutils': {deps: ['underscore']},
        'jqueryGridster': {deps: ['jquery']},
        'c3': {deps: ['d3']},
        'angularUiRouter': {deps: ['angular']},
        'angularFileUpload': {deps: ['angular']},
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
        'ngProgress': {deps: ['angular']},
        'bootstrap-iconpicker': {deps: ['jquery']},
        'unsafeHtml': {deps: ['angular']},
        "bootstrap-confirmation" : {deps: ['bootstrap']},
        'jdfontselect': {deps: ['angular','webfontloader']},
        'ngInfiniteScroll': {deps: ['angular']}
    },
    deps: ['adminCommon', 'bootstrap', 'app']
});
