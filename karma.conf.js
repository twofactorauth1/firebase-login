// Karma configuration
// Generated on Sun Aug 09 2015 00:26:10 GMT-0700 (Pacific Daylight Time)

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      // add dependencies here
      'public/js/libs/angular/angular.js',
      'public/js/libs/angular-mocks/angular-mocks.js',
      'public/js/libs/moment/moment.js',
      

      // add mocks after real angular dependencies
      // TODO: shouldn't jquery be before angular?
      'public/js/libs/fastclick/lib/fastclick.js',
      'public/js/libs/jquery/dist/jquery.min.js',
      'public/js/libs/angular-route/angular-route.min.js',
      'public/js/libs/angular-resource/angular-resource.js',
      'public/js/libs/angular-cookies/angular-cookies.min.js',
      'public/js/libs/angular-sanitize/angular-sanitize.js',
      'public/js/libs/angular-animate/angular-animate.js',
      'public/js/libs/angular-touch/angular-touch.js',
      'public/js/libs/angular-route/angular-route.js',
      'public/js/libs/ngstorage/ngStorage.min.js',
      'public/js/libs/angular-ui-router/release/angular-ui-router.min.js',
      'public/js/libs_misc/ng-joyride/ng-joyride.js',
      'public/js/libs/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'public/js/libs/angular-filter/dist/angular-filter.min.js',
      'public/js/libs/oclazyload/dist/ocLazyLoad.min.js',
      'public/js/libs/angular-card/src/card.js',
      'public/js/libs/angular-loading-bar/build/loading-bar.min.js',
      'public/js/libs/angular-breadcrumb/dist/angular-breadcrumb.min.js',
      'public/js/libs/angular-scroll/angular-scroll.min.js',
      'public/js/libs/angular-translate/angular-translate.min.js',
      'public/js/libs/angular-translate-loader-url/angular-translate-loader-url.min.js',
      'public/js/libs/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
      'public/js/libs/angular-translate-storage-local/angular-translate-storage-local.min.js',
      'public/js/libs/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
      'public/js/libs/allmighty-autocomplete/script/autocomplete.js',
      'public/admin/assets/js/directives/angularparallax.js',
      'public/js/libs/angular-google-places-autocomplete/dist/autocomplete.min.js',
      'public/js/libs/Sortable/Sortable.min.js',
      'public/js/libs/Sortable/ng-sortable.js',
      'public/js/libs/AngularJS-Toaster/toaster.min.js',
      'public/js/libs/angular-sweetalert-promised/SweetAlert.min.js',
      'public/js/libs/sweetalert/lib/sweet-alert.min.js',
      'public/js/libs/underscore/underscore.js',
      'node_modules/stripe-debug/stripe-debug.js',
      'public/js/libs/angular-cookie/angular-cookie.min.js',


      'public/js/scripts/config.js',
      'public/admin/assets/js/config.constant.js',

      'public/admin/assets/js/app.js',
      'public/admin/assets/js/main.js',
      'public/admin/assets/js/controllers/toasterCtrl.js',
      'public/admin/assets/js/controllers/sweetAlertCtrl.js',
      'public/admin/assets/js/services/toaster.js',

      'public/admin/assets/js/services/product.js',
      'public/admin/assets/js/services/payment.js',
      'public/admin/assets/js/services/user.js',
      'public/admin/assets/js/services/order.js',
      'public/admin/assets/js/services/customer.js',
      'public/admin/assets/js/services/import_contacts.js',

      // add module here
      // 'public/admin/assets/js/**/*.js',
      'public/admin/assets/js/controllers/gettingStartedCtrl.js',
      'public/admin/assets/js/controllers/orderDetailCtrl.js',
      'public/admin/assets/js/controllers/billingCtrl.js',

      // add test files here
      // 'public_tests/admin/customers/customerservice_spec.js',
      'public_tests/admin/billing/billingctrl_spec.js',
      'public_tests/admin/support/gettingStartedCtrl_spec.js',
      'public_tests/admin/orders/orderDetailCtrl_spec.js'
    ],


    // list of files to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
