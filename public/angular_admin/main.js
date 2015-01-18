/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require.config({
    baseUrl: '/js',
    waitSeconds: 0,
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
        'count-to': 'libs/angular-count-to/src/count-to',
        'bootstrap': 'libs/bootstrap/dist/js/bootstrap',
        'bootstrapSwitch':'libs/bootstrap-switch/dist/js/bootstrap-switch.min',
        "bootstrap-iconpicker":"libs/bootstrap-icon-picker/bootstrap-iconpicker/js/bootstrap-iconpicker.min",
        "bootstrap-iconpicker-font-awesome":"libs/bootstrap-icon-picker/bootstrap-iconpicker/js/iconset/iconset-fontawesome-4.2.0.min",
        'spectrum': 'libs/spectrum/spectrum',
        'colorpicker': 'libs/angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.min',
        'angularAMD': 'libs/angularAMD/angularAMD.min',
        'ngload': 'libs/angularAMD/ngload.min',
        'underscore': 'libs/underscore/underscore',
        'skeuocard': 'libs/skeuocard/lib/js/card',
        'webfontloader': 'libs/jd-fontselect/dist/libs/webfontloader',
        'jdfontselect': 'libs/jd-fontselect/dist/angular-fontselect.min',
        'stripe': 'https://js.stripe.com/v2/?tmp',
        'd3': 'libs/d3/d3.min',
        'c3': 'libs/c3/c3.min',
        'daterangepicker': 'libs/bootstrap-daterangepicker/daterangepicker',
        'angular-daterangepicker': 'libs_misc/angular-daterangepicker/angular-daterangepicker',
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
        'highcharts-standalone': 'libs/highcharts/adapters/standalone-framework',
        'highcharts': 'libs/highcharts/highcharts-all',
        'highcharts-ng': 'libs/highcharts-ng/dist/highcharts-ng.min',
        'highcharts-funnel': 'libs/highcharts/modules/funnel',
        'highmaps-us': 'libs_misc/highmaps/us-all',
        'highmaps-data': 'libs/highmaps/modules/map',
        'ngTagsInput': 'libs/ng-tags-input/ng-tags-input.min',
        'combinatorics': 'libs/js-combinatorics/combinatorics',
        'leaflet': 'libs/leaflet/dist/leaflet',
        'leaflet-directive': 'libs/angular-leaflet-directive/dist/angular-leaflet-directive.min',
        'truncate': 'libs/angular-truncate/src/truncate',
        'ngOnboarding': 'libs/ngOnboarding/dist/ng-onboarding.min',
        'heatmapjs': 'libs_misc/heatmap.js-2.0/build/heatmap',
        'fingerprint': 'libs/fingerprint/fingerprint',
        'jPushMenu' : 'libs/jPushMenu/js/jPushMenu',
        'ngSweetAlert' : 'libs/angular-sweetalert/SweetAlert',
        'sweetAlert': 'libs/sweetalert/lib/sweet-alert.min',
        'spin': 'libs/spin.js/spin',
        'angularSpinner': 'libs/angular-spinner/angular-spinner',
        'powertour':'libs_misc/powertour/js/powertour.2.1.4.min',
        'blockUI':'libs/angular-block-ui/dist/angular-block-ui.min',

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
        'geocodeService': '/angular_admin/services/geocode',
        'skeuocardDirective': '/angular_admin/directives/skeuocard',
        'mediaDirective': '/angular_admin/directives/mediadirective',
        'indi-datatable': '/angular_admin/directives/datatable',
        'customerService': '/angular_admin/services/customer',
        'websiteService': '/angular_admin/services/website',
        'postService': '/angular_admin/services/post',
        'productService': '/angular_admin/services/product',
        'navigationService': '/angular_admin/services/navigationService',
        'dashboardService': '/angular_admin/services/dashboard',
        'chartFacebookService': '/angular_admin/services/chart_facebook',
        'chartStripService': '/angular_admin/services/chart_strip',
        'chartTwoNetService': '/angular_admin/services/chart_two_net',
        'chartAnalyticsService': '/angular_admin/services/chart_analytics',
        'chartCommerceService': '/angular_admin/services/chart_commerce',
        'chartMarketingService': '/angular_admin/services/chart_marketing',
        'importContactService': '/angular_admin/services/import_contacts',
        'toasterService': '/angular_admin/services/toaster',
        'accountService': '/angular_admin/services/account',
        'keenService': '/angular_admin/services/keen',
        'courseServiceAdmin': '/angular_admin/services/course',
        'stateNavDirective': '/angular_admin/directives/state_nav',
        'hoverClassDirective': '/angular_admin/directives/hover_class',
        'confirmClickDirective': '/angular_admin/directives/confirm_click',
        'resizeHeightDirective': '/angular_admin/directives/resize_height',
        'scrollerDirective': '/angular_admin/directives/scroller',
        'truncateDirective': '/angular_admin/directives/truncate',
        'adminValidationDirective': '/angular_admin/directives/form_validations',
        "constants": 'constants/constants',
        'formValidationDirective': 'libs/angular-bootstrap-switch/src/directives/bsSwitch',
        'unsafeHtml': '/angular_admin/filters/unsafe-html',
        'html2plain': '/angular_admin/filters/html2plain',
        'iStartsWithFilter' : '/angular_admin/filters/i_starts_with',
        'reverse':'/angular_admin/filters/reverse',
        'confirmClick2':'/angular_admin/directives/confirm_click2',
        'img':'/angular_admin/directives/img_adv',
        'timeAgoFilter':'/angular_admin/filters/time_ago',
        'formatCurrency':'/angular_admin/filters/currency',
        'secTotime': '/angular_admin/filters/sec2time',
        'formatPercentage': '/angular_admin/filters/formatPercentage',
        'formatText': '/angular_admin/filters/format_text',
        'draggableModalDirective': '/angular_admin/directives/draggable_modal',
        'activityDirective': '/angular_admin/directives/activity',
        'offsetFilter': '/angular_admin/filters/offset',
        'checkImageDirective': '/angular_admin/directives/check_image',
        'analyticService': '/angular_admin/services/analytic',
        'angularCookie': 'libs/angular-cookie/angular-cookie.min',
        'purl': 'libs/purl/purl',
        'uaParser': 'libs/ua-parser-js/dist/ua-parser.min',

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
        "timelineEmailItemController": "/pipeshift/js/modules/video/controller/TimelineEmailItemController",
        "searchOptionsModalController": "/pipeshift/js/modules/video/controller/SearchOptionsModalController",
        "videoViewModalController": "/pipeshift/js/modules/video/controller/VideoViewModalController",
        "addCourseModalController": "/pipeshift/js/modules/video/controller/AddCourseModalController",
        "subscribersCvsUploadController": "/pipeshift/js/modules/video/controller/SubscribersCsvUploadController",
        "whenUiScrolledDirective": "/pipeshift/js/modules/video/directive/whenUiScrolled",
        "whenScrolledDirective": "/pipeshift/js/modules/video/directive/whenScrolled",
        "videoDropDirective": "/pipeshift/js/modules/video/directive/videoDrop",
        "emailDropDirective": "/pipeshift/js/modules/video/directive/emailDrop",
        "videoDraggableDirective": "/pipeshift/js/modules/video/directive/videoDraggable",
        "coursePreviewDirective": "/pipeshift/js/modules/video/directive/coursePreview",
        "resizeDirective": "/pipeshift/js/modules/video/directive/resize",
        "videoTitleDirective": "/pipeshift/js/modules/video/directive/videoTitle",
        "videoPreviewDirecrive": "/pipeshift/js/modules/video/directive/videoPreview",
        "videoPlayerDirective": "/pipeshift/js/modules/video/directive/videoPlayer",
        "psEditableDirective": "/pipeshift/js/modules/video/directive/psEditable",
        "stripeButtonDirective": "/pipeshift/js/directive/stripePayButton",
        'datepicker': 'libs/bootstrap-datepicker/js/bootstrap-datepicker',
        'angularConfig' : 'scripts/config',
        'angularSlugifier': 'libs/angular-slugify/angular-slugify'
    },
    shim: {
        'jqueryUI': {deps: ['jquery']},
        'adminCommon': {deps: ['jquery', 'storageutils', 'namespaces']},
        'angular': {deps: ['jquery'],'exports' : 'angular'},
        'angularBootstrap': {deps: ['angular']},
        'angularBootstrapSwitch': {deps: ['angular', 'bootstrapSwitch']},
        'angularRoute': {deps: ['angular']},
        'angularSanitize': {deps: ['angular']},
        'angularResource': {deps: ['angular']},
        'moment': {deps: ['jquery']},
        'daterangepicker': {deps: ['jquery', 'moment']},
        'angular-daterangepicker': {deps: ['angular', 'daterangepicker']},
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
        'highcharts': {deps: ['jquery']},
        'powertour': {deps: ['jquery']},
        'highcharts-funnel': {deps: ['highcharts']},
        'highmaps-us': {deps: ['highcharts']},
        'highmaps-data': {deps: ['highcharts']},
        'angularFileUpload': {deps: ['angular']},
        'leaflet-directive': {deps: ['leaflet', 'angular']},
        'xEditable': {deps: ['angular']},
        'ngCsv': {deps: ['angular']},
        'ngFileUpload': {deps: ['angular']},
        'angularStepper': {deps: ['angular']},
        'angularMoney': {deps: ['angular']},
        'ngSweetAlert': {deps: ['sweetAlert']},
        'youtubeService': {deps: ['angular', 'varModules']},
        'courseService': {deps: ['angular', 'varModules', 'angularResource']},
        'courseVideoService': {deps: ['angular', 'varModules', 'angularResource']},
        'subscriberService': {deps: ['angular', 'varModules', 'angularResource']},
        'whenUiScrolledDirective': {deps: ['angular', 'varModules']},
        'whenScrolledDirective': {deps: ['angular', 'varModules']},
        'videoDropDirective': {deps: ['angular', 'varModules']},
        'emailDropDirective': {deps: ['angular', 'varModules']},
        'videoDraggableDirective': {deps: ['angular', 'varModules']},
        'coursePreviewDirective': {deps: ['angular', 'varModules']},
        'videoTitleDirective': {deps: ['angular', 'varModules']},
        'videoPreviewDirecrive': {deps: ['angular', 'varModules']},
        'videoPlayerDirective': {deps: ['angular', 'varModules']},
        'psEditableDirective': {deps: ['angular', 'varModules']},
        'stripeButtonDirective': {deps: ['angular', 'varModules']},
        'resizeDirective': {deps: ['angular', 'varModules']},
        'htmlify': {deps: ['angular', 'varModules']},
        'ngProgress': {deps: ['angular']},
        'bootstrap-iconpicker': {deps: ['jquery']},
        'unsafeHtml': {deps: ['angular']},
        "bootstrap-confirmation" : {deps: ['bootstrap']},
        'jdfontselect': {deps: ['angular','webfontloader']},
        'ngInfiniteScroll': {deps: ['angular']},
        'timeAgoFilter': {deps: ['moment']},
        'ngTagsInput': ['angular'],
        'angularConfig': {deps: ['angular']},
        'ngload': ['angularAMD'],
        'jPushMenu' : {deps: ['jquery']},
        'angularSlugifier': ['angular'],
        'blockUI': ['angular']
    },
    deps: ['adminCommon', 'bootstrap', 'app']
});
