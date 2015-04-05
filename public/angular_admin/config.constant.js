'use strict';

/**
 * Config constant
 */
app.constant('APP_MEDIAQUERY', {
    'desktopXL': 1200,
    'desktop': 992,
    'tablet': 768,
    'mobile': 480
});
app.constant('JS_REQUIRES', {
    //*** Scripts
    scripts: {
        //*** Javascript Plugins
        'modernizr': ['js/libs/components-modernizr/modernizr.js'],
        'moment': ['js/libs/moment/min/moment.min.js'],
        'spin': 'js/libs/spin.js/spin.js',

        //*** jQuery Plugins
        'perfect-scrollbar-plugin': ['js/libs/perfect-scrollbar/js/min/perfect-scrollbar.jquery.min.js', 'js/libs/perfect-scrollbar/css/perfect-scrollbar.min.css'],
        'ladda': ['js/libs/ladda/dist/ladda.min.js', 'js/libs/ladda/dist/ladda-themeless.min.css'],
        'sweet-alert': ['js/libs/sweetalert/lib/sweet-alert.min.js', 'js/libs/sweetalert/lib/sweet-alert.css'],
        'chartjs': 'js/libs/chartjs/Chart.min.js',
        'jquery-sparkline': 'js/libs/jquery.sparkline.build/dist/jquery.sparkline.min.js',
        'ckeditor-plugin': 'js/libs/ckeditor/ckeditor.js',
        'jquery-nestable-plugin': ['js/libs/jquery-nestable/jquery.nestable.js'],
        'touchspin-plugin': ['js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js', 'js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],

        //*** Controllers
        'dashboardCtrl': 'angular_admin/controllers/dashboardCtrl.js',
        'helpTopicsCtrl': 'angular_admin/controllers/helpTopicsCtrl.js',
        'gettingStartedCtrl': 'angular_admin/controllers/gettingStartedCtrl.js',
        'iconsCtrl': 'angular_admin/controllers/iconsCtrl.js',
        'vAccordionCtrl': 'angular_admin/controllers/vAccordionCtrl.js',
        'ckeditorCtrl': 'angular_admin/controllers/ckeditorCtrl.js',
        'laddaCtrl': 'angular_admin/controllers/laddaCtrl.js',
        'ngTableCtrl': 'angular_admin/controllers/ngTableCtrl.js',
        'cropCtrl': 'angular_admin/controllers/cropCtrl.js',
        'asideCtrl': 'angular_admin/controllers/asideCtrl.js',
        'toasterCtrl': 'angular_admin/controllers/toasterCtrl.js',
        'sweetAlertCtrl': 'angular_admin/controllers/sweetAlertCtrl.js',
        'mapsCtrl': 'angular_admin/controllers/mapsCtrl.js',
        'chartsCtrl': 'angular_admin/controllers/chartsCtrl.js',
        'calendarCtrl': 'angular_admin/controllers/calendarCtrl.js',
        'nestableCtrl': 'angular_admin/controllers/nestableCtrl.js',
        'validationCtrl': ['angular_admin/controllers/validationCtrl.js'],
        'userCtrl': ['angular_admin/controllers/userCtrl.js'],
        'selectCtrl': 'angular_admin/controllers/selectCtrl.js',
        'wizardCtrl': 'angular_admin/controllers/wizardCtrl.js',
        'uploadCtrl': 'angular_admin/controllers/uploadCtrl.js',
        'treeCtrl': 'angular_admin/controllers/treeCtrl.js',
        'inboxCtrl': 'angular_admin/controllers/inboxCtrl.js',
        'xeditableCtrl': 'angular_admin/controllers/xeditableCtrl.js',
        'chatCtrl': 'angular_admin/controllers/chatCtrl.js',
        
        //*** Filters
        'htmlToPlaintext': 'angular_admin/filters/htmlToPlaintext.js'
    },
    //*** angularJS Modules
    modules: [{
        name: 'angularMoment',
        files: ['js/libs/angular-moment/angular-moment.min.js']
    }, {
        name: 'angularFilter',
        files: ['js/libs/angular-filter/dist/angular-filter.min.js']
    }, {
        name: 'toaster',
        files: ['js/libs/AngularJS-Toaster/toaster.js', 'js/libs/AngularJS-Toaster/toaster.css']
    }, {
        name: 'angularBootstrapNavTree',
        files: ['js/libs/angular-bootstrap-nav-tree/dist/abn_tree_directive.js', 'js/libs/angular-bootstrap-nav-tree/dist/abn_tree.css']
    }, {
        name: 'angular-ladda',
        files: ['js/libs/angular-ladda/dist/angular-ladda.min.js']
    }, {
        name: 'ngTable',
        files: ['js/libs/ng-table/dist/ng-table.min.js', 'js/libs/ng-table/dist/ng-table.min.css']
    }, {
        name: 'ui.select',
        files: ['js/libs/angular-ui-select/dist/select.min.js', 'js/libs/angular-ui-select/dist/select.min.css', 'js/libs/select2/dist/css/select2.min.css', 'js/libs/select2-bootstrap-css/select2-bootstrap.min.css', 'js/libs/selectize/dist/css/selectize.bootstrap3.css']
    }, {
        name: 'ui.mask',
        files: ['js/libs/angular-ui-utils/mask.min.js']
    }, {
        name: 'ngImgCrop',
        files: ['js/libs/ngImgCrop/compile/minified/ng-img-crop.js', 'js/libs/ngImgCrop/compile/minified/ng-img-crop.css']
    }, {
        name: 'angularFileUpload',
        files: ['js/libs/angular-file-upload/angular-file-upload.min.js']
    }, {
        name: 'ngAside',
        files: ['js/libs/angular-aside/dist/js/angular-aside.min.js', 'js/libs/angular-aside/dist/css/angular-aside.min.css']
    }, {
        name: 'truncate',
        files: ['js/libs/angular-truncate/src/truncate.js']
    }, {
        name: 'oitozero.ngSweetAlert',
        files: ['js/libs/angular-sweetalert-promised/SweetAlert.min.js']
    }, {
        name: 'monospaced.elastic',
        files: ['js/libs/angular-elastic/elastic.js']
    }, {
        name: 'ngMap',
        files: ['js/libs/ngmap/build/scripts/ng-map.min.js']
    }, {
        name: 'tc.chartjs',
        files: ['js/libs/tc-angular-chartjs/dist/tc-angular-chartjs.min.js']
    }, {
        name: 'flow',
        files: ['js/libs/ng-flow/dist/ng-flow-standalone.min.js']
    }, {
        name: 'uiSwitch',
        files: ['js/libs/angular-ui-switch/angular-ui-switch.min.js', 'js/libs/angular-ui-switch/angular-ui-switch.min.css']
    }, {
        name: 'ckeditor',
        files: ['js/libs/angular-ckeditor/angular-ckeditor.min.js']
    }, {
        name: 'mwl.calendar',
        files: ['js/libs/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar.js', 'js/libs/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.js', 'js/libs/angular-bootstrap-calendar/dist/css/angular-bootstrap-calendar.min.css']
    }, {
        name: 'ng-nestable',
        files: ['js/libs/ng-nestable/src/angular-nestable.js']
    }, {
        name: 'vAccordion',
        files: ['js/libs/v-accordion/dist/v-accordion.min.js', 'js/libs/v-accordion/dist/v-accordion.min.css']
    }, {
        name: 'xeditable',
        files: ['js/libs/angular-xeditable/dist/js/xeditable.min.js', 'js/libs/angular-xeditable/dist/css/xeditable.css', 'angular_admin/config/config-xeditable.js']
    }, {
        name: 'checklist-model',
        files: ['js/libs/checklist-model/checklist-model.js']
    }]
});
