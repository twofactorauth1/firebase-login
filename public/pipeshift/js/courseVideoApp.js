'use strict';

// Declare app level module which depends on filters, and services
angular.module('var.directives', []);
var app = angular.module('courseVideoApp', ['var.directives',
  'app.modules.coursevideo',
  //'app.constants',
  "com.2fdevs.videogular",
  "com.2fdevs.videogular.plugins.controls",
  "com.2fdevs.videogular.plugins.overlayplay",
  "com.2fdevs.videogular.plugins.buffering",
  "info.vietnamcode.nampnq.videogular.plugins.youtube",
  "ipCookie"
]);

app.run(['$rootScope', '$location', 'analyticsService', function($rootScope, $location, analyticsService) {
  var runningInterval;

  analyticsService.sessionStart(function(data) {});

  $rootScope.$on("$routeChangeSuccess", function(scope, next, current) {
    // $rootScope.transitionState = "active";
    analyticsService.pageStart(function() {
      if (!window.isAdmin) {
        analyticsService.pagePing();
        clearInterval(runningInterval);

        var counter = 0;
        //every 15 seconds send page tracking data
        runningInterval = setInterval(function() {
          analyticsService.pagePing();
          counter++;

          if (counter >= (1000 * 60 * 60)) {
            clearInterval(runningInterval);
          }
        }, 15000);
      }
    });
  });
}]);
