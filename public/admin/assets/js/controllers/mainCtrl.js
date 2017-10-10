'use strict';
/**
 * Indigenous Main Controller
 */
app.controller('AppCtrl', ['$rootScope', '$scope', '$state', '$translate', '$window', '$document', '$timeout', '$modal', 'cfpLoadingBar', 'UserService', 'AccountService', 'accountConstant',
  function ($rootScope, $scope, $state, $translate, $window, $document, $timeout, $modal, cfpLoadingBar, UserService, AccountService, accountConstant) {

    AccountService.getAccount(function (account) {
      $scope.account = account;

      $rootScope.account = account;
      AccountService.setMainAccount($scope.account);
        if(account.showhide.dohy && $state.current.name ==='app.dashboard') {
            console.log('Going to Dohy');
            $state.go('app.dohy');
        }
      if (account.locked_sub && !$state.includes('app.account.billing')) {
        $state.go('app.account.billing');
      }

      if (account.firstLogin) {
	    //$state.go('app.support.gettingstarted');
        account.firstLogin = false;
        AccountService.updateAccount(account, function () {
          console.log('account updated');
        });
      }

    });

    var fullWidthPages = ['app.onboarding'];

    $rootScope.$on('$stateChangeSuccess', function(e, current, pre) {
      if (fullWidthPages.indexOf($state.current.name) > -1) {
        $scope.hideSidebar = true;
      } else {
        $scope.hideSidebar = false;
      }

    });

    // Loading bar transition
    // -----------------------------------
    var $win = $($window);

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      //start loading bar on stateChangeStart
      $rootScope.app.layout.isMinimalAdminChrome =  false;
      $rootScope.app.layout.isAnalyticsDashboardMode =  false;
      if ($scope.account && $scope.account.locked_sub && $state.includes('app.account.billing')) {
        cfpLoadingBar.complete();
      } else {
        cfpLoadingBar.start();
      }

    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      //stop loading bar on stateChangeSuccess
      event.targetScope.$watch("$viewContentLoaded", function () {

        cfpLoadingBar.complete();
      });

      // scroll top the page on change state

      $document.scrollTo(0, 0);

      if (angular.element('.email-reader').length) {
        angular.element('.email-reader').animate({
          scrollTop: 0
        }, 0);
      }

      // Save the route title
      $rootScope.currTitle = $state.current.title;
    });

    // State not found
    $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
      //$rootScope.loading = false;
      console.log(unfoundState.to);
      // "lazy.state"
      console.log(unfoundState.toParams);
      // {a:1, b:2}
      console.log(unfoundState.options);
      // {inherit:false} + default options
    });

    $rootScope.pageTitle = function () {
      return $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
    };

    // save settings to local storage
    // if (angular.isDefined($localStorage.layout)) {
    //   $scope.app.layout = $localStorage.layout;

    // } else {
    //   $localStorage.layout = $scope.app.layout;
    // }
    // $scope.$watch('app.layout', function () {
    //   // save to local storage
    //   $localStorage.layout = $scope.app.layout;
    // }, true);

    //global function to scroll page up
    $scope.toTheTop = function () {

      $document.scrollTopAnimated(0, 600);

    };

    // angular translate
    // ----------------------

    $scope.language = {
      // Handles language dropdown
      listIsOpen: false,
      // list of available languages
      available: {
        'en': 'English',
        'it_IT': 'Italiano',
        'de_DE': 'Deutsch'
      },
      // display always the current ui language
      init: function () {
        var proposedLanguage = $translate.proposedLanguage() || $translate.use();
        var preferredLanguage = $translate.preferredLanguage();
        // we know we have set a preferred one in app.config
        $scope.language.selected = $scope.language.available[(proposedLanguage || preferredLanguage)];
      },
      set: function (localeId, ev) {
        $translate.use(localeId);
        $scope.language.selected = $scope.language.available[localeId];
        $scope.language.listIsOpen = !$scope.language.listIsOpen;
      }
    };

    $scope.language.init();

    // Function that find the exact height and width of the viewport in a cross-browser way
    var viewport = function () {
      var e = window,
        a = 'inner';
      if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
      }
      return {
        width: e[a + 'Width'],
        height: e[a + 'Height']
      };
    };
    // function that adds information in a scope of the height and width of the page
    $scope.getWindowDimensions = function () {
      return {
        'h': viewport().height,
        'w': viewport().width
      };
    };
    // Detect when window is resized and set some variables
    $scope.$watch($scope.getWindowDimensions, function (newValue, oldValue) {
      $scope.windowHeight = newValue.h;
      $scope.windowWidth = newValue.w;
      if (newValue.w >= 992) {
        $scope.isLargeDevice = true;
      } else {
        $scope.isLargeDevice = false;
      }
      if (newValue.w < 992) {
        $scope.isSmallDevice = true;
      } else {
        $scope.isSmallDevice = false;
      }
      if (newValue.w <= 768) {
        $scope.isMobileDevice = true;
      } else {
        $scope.isMobileDevice = false;
      }
    }, true);
    // Apply on resize
    $win.on('resize', function () {
      //$scope.$apply();
    });

    

    // Top Bar User
    // -----------------------------------
    UserService.getUser(function (user) {
      $scope.currentUser = user;
    });

    $scope.openTopBarMediaModal = function () {
        if($state.current.name === 'app.website.ssbSiteBuilder.editor' || $state.current.name === "app.emailEditor"){
            clickandInsertImageButton();
            return;
        }
      $scope.modalInstance = $modal.open({
        templateUrl: 'media-modal',
        controller: 'MediaModalCtrl',
        size: 'lg',
        keyboard: true,
        backdrop: 'static',
        resolve: {
          showInsert: function () {

          },
          insertMedia: function () {

          },
          isSingleSelect: function () {
              return true;
          }
        }
      });
    };

  }
]);
