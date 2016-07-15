angular.module('mainApp')
    .directive('userScripts', ['accountService', 'websiteService', '$routeParams', '$sce', '$location',
        function(accountService, websiteService, $routeParams, $sce, $location) {
            return {
                restrict: 'E',
                replace: true,
                template: '<span ng-bind-html="scripts"></span>',
                link: function(scope, elem, attr) {
                    scope.scripts = '';

                    var processFn = function() {
                        scope.scripts = '';
                        var handle = $location.path().indexOf('/blog') > -1 ? 'blog' : $routeParams.name;
                        console.info('User Script >>>', handle);

                        accountService(function(err, account) {
                            if (account.showhide.userScripts) {
                                websiteService(function(err, website) {
                                    if (website.resources && website.resources.userScripts && website.resources.toggles && website.resources.toggles.userScripts) {
                                        if (angular.isDefined(website.resources.userScripts[handle])) {
                                            scope.scripts += '\n\n' + website.resources.userScripts[handle].sanitized;
                                        }
                                        scope.scripts = $sce.trustAsHtml(scope.scripts);
                                    }
                                });
                            }
                        });
                    };

                    scope.$on('$routeChangeSuccess', function(ev, curr, prev) {
                        processFn();
                    });

                    // processFn();
                }
            };
        }
    ]);
