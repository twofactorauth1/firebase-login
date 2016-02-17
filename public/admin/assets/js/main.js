var app = angular.module('indigenousApp', ['indigenous']);
app.run(['$rootScope', '$state', '$stateParams',
function ($rootScope, $state, $stateParams) {

    // Attach Fastclick for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers
    FastClick.attach(document.body);

    // Set some reference to access them from any scope
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // GLOBAL APP SCOPE
    // set below basic information
    $rootScope.app = {
        name: 'Indigenous', // name of your project
        author: 'Indigenous Software, INC', // author's name or company name
        description: 'An all in one solution for small to medium sized businesses.', // brief description
        version: '1.0', // current version
        year: ((new Date()).getFullYear()), // automatic current year (for copyright information)
        isMobile: (function () {// true if the browser is a mobile device
            var check = false;
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                check = true;
            } else {
                check = false;
            };
            return check;
        })(),
        layout: {
            isNavbarFixed: true, //true if you want to initialize the template with fixed header
            isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
            isSidebarClosed: false, // true if you want to initialize the template with closed sidebar
            isFooterFixed: false, // true if you want to initialize the template with fixed footer
            isMinimalAdminChrome: false, //minimal admin chrome for site builder experience
            theme: 'theme-6', // indicate the theme chosen for your project
            logo: 'assets/images/logo.png', // relative path of the project logo
        }
    };
    $rootScope.user = {
        name: 'Peter',
        job: 'ng-Dev',
        picture: 'app/img/user/02.jpg'
    };
}]);
// translate config
app.config(['$translateProvider',
function ($translateProvider) {

    // prefix and suffix information  is required to specify a pattern
    // You can simply use the static-files loader with this pattern:
    $translateProvider.useStaticFilesLoader({
        prefix: 'assets/i18n/',
        suffix: '.json'
    });

    // Since you've now registered more then one translation table, angular-translate has to know which one to use.
    // This is where preferredLanguage(langKey) comes in.
    $translateProvider.preferredLanguage('en');

    // Store the language in the local storage
    $translateProvider.useLocalStorage();

}]);
// Angular-Loading-Bar
// configuration
app.config(['cfpLoadingBarProvider',
function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;

}]);

/**
 * Handle session timed out
 *
 * - http://www.codelord.net/2014/06/25/generic-error-handling-in-angularjs/
 * - http://stackoverflow.com/a/28583107/77821
 * - http://stackoverflow.com/questions/19711550/angularjs-how-to-prevent-a-request
 * - http://blog.xebia.com/cancelling-http-requests-for-fun-and-profit/
 */
// app.config(['$httpProvider', function ($httpProvider) {

//     $httpProvider.interceptors.push('RequestsErrorHandler');

// }]);

// app.factory('RequestsErrorHandler', ['$q', '$injector', function($q, $injector) {

//     var $modal;
//     var IndiLoginModalService;
//     var modalInstance;

//     function isDashboardAPIRequest(url) {
//         return url.indexOf('/api/2.0/dashboard/workstreams') !== -1 || url.indexOf('/api/2.0/dashboard/analytics') !== -1;
//     }

//     return {

//         request: function(config) {

//             if (isDashboardAPIRequest(config.url)) {

//                 var canceler = $q.defer();

//                 config.timeout = canceler.promise;

//                 if (IndiLoginModalService && angular.isObject(IndiLoginModalService.getModalInstance())) {

//                     // Canceling request
//                     canceler.resolve();

//                 }

//             }

//             return config;
//         },

//         responseError: function(rejection) {

//             if (rejection && rejection.config && rejection.status !== null) {

//                 //unauthorized
//                 if (rejection.status === 401) {

//                     $modal = $modal || $injector.get('$modal');
//                     IndiLoginModalService = IndiLoginModalService || $injector.get('IndiLoginModalService');

//                     if (!angular.isObject(IndiLoginModalService.getModalInstance())) {
//                         modalInstance = $modal.open({
//                             templateUrl: 'indigeneous-admin-login-modal',
//                             keyboard: false,
//                             backdrop: 'static',
//                             size: 'sm'
//                         });

//                         IndiLoginModalService.setModalInstance(modalInstance);

//                         // return promise that we will resolve when authenticated
//                         // return $q.defer().promise;

//                     }

//                     IndiLoginModalService.enqueueFailed401Request(rejection);

//                 }

//             }

//             return $q.reject(rejection);

//         }

//     };
// }])
