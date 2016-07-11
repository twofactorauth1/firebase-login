
angular.module('mainApp')
  .directive('userScripts', ['accountService', 'websiteService', '$routeParams', '$sce',
    function (accountService, websiteService, $routeParams, $sce) {
      return {
        restrict: 'E',
        replace: true,
        template: '<span ng-bind-html="scripts"></span>',
        link: function (scope, elem, attr) {
          scope.scripts = '';
          scope.$on('$routeChangeSuccess', function (ev, curr, prev) {
            scope.scripts = '';
            accountService(function (err, account) {
              if (account.showhide.userScripts) {
                websiteService(function (err, website) {
                  if (angular.isDefined(website.resources.userScripts.global)) {
                    scope.scripts += website.resources.userScripts.global.sanitized;
                  }

                  if (angular.isDefined(website.resources.userScripts[$routeParams.name])) {
                    scope.scripts += '\n\n' + website.resources.userScripts[$routeParams.name].sanitized;
                  }

                  scope.scripts = $sce.trustAsHtml(scope.scripts);
                });
              }
            });
          });
        }
      };
    }
  ]);
