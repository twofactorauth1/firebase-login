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
        'modernizr': ['../js/libs/components-modernizr/modernizr.js'],
        'moment': ['../js/libs/moment/min/moment.min.js'],
        'spin': '../js/libs/spin.js/spin.js',

        //*** jQuery Plugins
        'perfect-scrollbar-plugin': ['../js/libs/perfect-scrollbar/js/min/perfect-scrollbar.jquery.min.js', '../js/libs/perfect-scrollbar/css/perfect-scrollbar.min.css'],
        'ladda': ['../js/libs/ladda/dist/ladda.min.js', '../js/libs/ladda/dist/ladda-themeless.min.css'],
        'sweet-alert': ['../js/libs/sweetalert/lib/sweet-alert.min.js', '../js/libs/sweetalert/lib/sweet-alert.css'],
        'chartjs': '../js/libs/chartjs/Chart.min.js',
        'jquery-sparkline': '../js/libs/jquery.sparkline.build/dist/jquery.sparkline.min.js',
        'ckeditor-plugin': '../js/libs/ckeditor/ckeditor.js',
        'jquery-nestable-plugin': ['../js/libs/jquery-nestable/jquery.nestable.js'],
        'touchspin-plugin': ['../js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js', '../js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],

        //*** Controllers
        'dashboardCtrl': 'assets/js/controllers/dashboardCtrl.js',
        'helpTopicsCtrl': 'assets/js/controllers/helpTopicsCtrl.js',
        'gettingStartedCtrl': 'assets/js/controllers/gettingStartedCtrl.js',
        'productsCtrl': 'assets/js/controllers/productsCtrl.js',
        'productsDetailCtrl': 'assets/js/controllers/productsDetailCtrl.js',
        'iconsCtrl': 'assets/js/controllers/iconsCtrl.js',
        'vAccordionCtrl': 'assets/js/controllers/vAccordionCtrl.js',
        'ckeditorCtrl': 'assets/js/controllers/ckeditorCtrl.js',
        'laddaCtrl': 'assets/js/controllers/laddaCtrl.js',

        'cropCtrl': 'assets/js/controllers/cropCtrl.js',
        'asideCtrl': 'assets/js/controllers/asideCtrl.js',
        'toasterCtrl': 'assets/js/controllers/toasterCtrl.js',
        'sweetAlertCtrl': 'assets/js/controllers/sweetAlertCtrl.js',
        'mapsCtrl': 'assets/js/controllers/mapsCtrl.js',
        'chartsCtrl': 'assets/js/controllers/chartsCtrl.js',
        'calendarCtrl': 'assets/js/controllers/calendarCtrl.js',
        'nestableCtrl': 'assets/js/controllers/nestableCtrl.js',
        'validationCtrl': ['assets/js/controllers/validationCtrl.js'],
        'userCtrl': ['assets/js/controllers/userCtrl.js'],
        'selectCtrl': 'assets/js/controllers/selectCtrl.js',
        'wizardCtrl': 'assets/js/controllers/wizardCtrl.js',
        'uploadCtrl': 'assets/js/controllers/uploadCtrl.js',
        'treeCtrl': 'assets/js/controllers/treeCtrl.js',
        'inboxCtrl': 'assets/js/controllers/inboxCtrl.js',
        'xeditableCtrl': 'assets/js/controllers/xeditableCtrl.js',
        'chatCtrl': 'assets/js/controllers/chatCtrl.js',

        //*** Services
        'productService': 'assets/js/services/product.js',

        //*** Filters
        'htmlToPlaintext': 'assets/js/filters/htmlToPlaintext.js'
    },
    //*** angularJS Modules
    modules: [{
        name: 'angularMoment',
        files: ['../js/libs/angular-moment/angular-moment.min.js']
    }, {
        name: 'angularFilter',
        files: ['../js/libs/angular-filter/dist/angular-filter.min.js']
    }, {
        name: 'toaster',
        files: ['../js/libs/AngularJS-Toaster/toaster.js', '../js/libs/AngularJS-Toaster/toaster.css']
    }, {
        name: 'angularBootstrapNavTree',
        files: ['../js/libs/angular-bootstrap-nav-tree/dist/abn_tree_directive.js', '../js/libs/angular-bootstrap-nav-tree/dist/abn_tree.css']
    }, {
        name: 'angular-ladda',
        files: ['../js/libs/angular-ladda/dist/angular-ladda.min.js']
    }, {
        name: 'smart-table',
        files: ['../js/libs/angular-smart-table/dist/smart-table.min.js']
    }, {
        name: 'ui.select',
        files: ['../js/libs/angular-ui-select/dist/select.min.js', '../js/libs/angular-ui-select/dist/select.min.css', '../js/libs/select2/dist/css/select2.min.css', '../js/libs/select2-bootstrap-css/select2-bootstrap.min.css', '../js/libs/selectize/dist/css/selectize.bootstrap3.css']
    }, {
        name: 'ui.mask',
        files: ['../js/libs/angular-ui-utils/mask.min.js']
    }, {
        name: 'ngImgCrop',
        files: ['../js/libs/ngImgCrop/compile/minified/ng-img-crop.js', '../js/libs/ngImgCrop/compile/minified/ng-img-crop.css']
    }, {
        name: 'angularFileUpload',
        files: ['../js/libs/angular-file-upload/angular-file-upload.min.js']
    }, {
        name: 'ngAside',
        files: ['../js/libs/angular-aside/dist/js/angular-aside.min.js', '../js/libs/angular-aside/dist/css/angular-aside.min.css']
    }, {
        name: 'truncate',
        files: ['../js/libs/angular-truncate/src/truncate.js']
    }, {
        name: 'oitozero.ngSweetAlert',
        files: ['../js/libs/angular-sweetalert-promised/SweetAlert.min.js']
    }, {
        name: 'monospaced.elastic',
        files: ['../js/libs/angular-elastic/elastic.js']
    }, {
        name: 'ngMap',
        files: ['../js/libs/ngmap/build/scripts/ng-map.min.js']
    }, {
        name: 'tc.chartjs',
        files: ['../js/libs/tc-angular-chartjs/dist/tc-angular-chartjs.min.js']
    }, {
        name: 'flow',
        files: ['../js/libs/ng-flow/dist/ng-flow-standalone.min.js']
    }, {
        name: 'uiSwitch',
        files: ['../js/libs/angular-ui-switch/angular-ui-switch.min.js', '../js/libs/angular-ui-switch/angular-ui-switch.min.css']
    }, {
        name: 'ckeditor',
        files: ['../js/libs/angular-ckeditor/angular-ckeditor.min.js']
    }, {
        name: 'mwl.calendar',
        files: ['../js/libs/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar.js', '../js/libs/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.js', '../js/libs/angular-bootstrap-calendar/dist/css/angular-bootstrap-calendar.min.css']
    }, {
        name: 'ng-nestable',
        files: ['../js/libs/ng-nestable/src/angular-nestable.js']
    }, {
        name: 'vAccordion',
        files: ['../js/libs/v-accordion/dist/v-accordion.min.js', '../js/libs/v-accordion/dist/v-accordion.min.css']
    }, {
        name: 'xeditable',
        files: ['../js/libs/angular-xeditable/dist/js/xeditable.min.js', '../js/libs/angular-xeditable/dist/css/xeditable.css', 'assets/js/config/config-xeditable.js']
    }, {
        name: 'checklist-model',
        files: ['../js/libs/checklist-model/checklist-model.js']
    }]
});
