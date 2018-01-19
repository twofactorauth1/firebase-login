var app = angular.module('indigenousApp', ['indigenous']);
app.run(['$rootScope', '$state', '$stateParams', '$injector', '$window', 'ENV',
function ($rootScope, $state, $stateParams, $injector, $window, ENV) {

    var $modal;
    var modalInstance;
    var IndiLoginModalService;

    // Attach Fastclick for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers
    FastClick.attach(document.body);
    /*
     * Setup some org specific settings
     */
    $rootScope.orgId = $window.indigenous.orgId;
    ENV.stripeKey = ENV.stripeKey[$rootScope.orgId];

    // Set some reference to access them from any scope
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // GLOBAL APP SCOPE
    // set below basic information
    $rootScope.app = {
        name: 'NewPlatform Portal', // name of your project
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
            }
            return check;
        })(),
        layout: {
            isNavbarFixed: true, //true if you want to initialize the template with fixed header
            isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
            isSidebarClosed: false, // true if you want to initialize the template with closed sidebar
            isFooterFixed: false, // true if you want to initialize the template with fixed footer
            isMinimalAdminChrome: false, //minimal admin chrome for site builder experience
            theme: 'theme-6', // indicate the theme chosen for your project
            logo: '//s3.amazonaws.com/indigenous-digital-assets/test_account_3043/trustx_wide_logo_1516290322170.png', // relative path of the project logo
            logo2: '//s3.amazonaws.com/indigenous-digital-assets/test_account_3043/trustx_wide_logo_1516290322170.png', // relative path of the project logo
            isAnalyticsDashboardMode: false // relative path of the project logo

}
    };
    $rootScope.user = {
        name: 'Peter',
        job: 'ng-Dev',
        picture: 'app/img/user/02.jpg'
    };

    $rootScope.$on('event:auth-loginRequired', function(data) {

        /**
         * List of ignored API requests
         *  - /api/1.0/social/socialconfig/*
         *      - Reason: 401's on expired auth
         */

        $modal = $modal || $injector.get('$modal');
        IndiLoginModalService = IndiLoginModalService || $injector.get('IndiLoginModalService');

        if (!angular.isObject(IndiLoginModalService.getModalInstance())) {

            modalInstance = $modal.open({
                templateUrl: 'indigeneous-admin-login-modal',
                keyboard: true,
                backdrop: 'static',
                size: 'sm'
            });

            IndiLoginModalService.setModalInstance(modalInstance);

        }

    });


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
