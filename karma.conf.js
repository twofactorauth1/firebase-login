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

      // add mocks after real angular dependencies
      'public/js/libs/angular-mocks/angular-mocks.js',

      'public/js/libs/angular-route/angular-route.min.js',

      // add module here
      'public/admin/assets/js/main.js',
      'public/admin/assets/js/controllers/billingCtrl.js',

      // {
      //   pattern: 'public/admin/assets/js/**/*.js',
      //   included: false
      // },

      // add test files here
      // 'public_tests/admin/customers/customerservice_spec.js',
      'public_tests/admin/billing/billingctrl_spec.js'
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


