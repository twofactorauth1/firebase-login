angular.module('mainApp')
    .directive('userScripts', ['accountService', 'websiteService', '$routeParams', '$sce', '$location',
        function(accountService, websiteService, $routeParams, $sce, $location) {
            return {
                restrict: 'E',
                replace: true,
                template: '<span ng-bind-html="userScripts"></span>',
                link: function(scope, elem, attr) {
                    scope.userScripts = '';

                    var processFn = function() {
                        scope.userScripts = '';

                        var handle = $location.path().indexOf('/blog') > -1 ? 'blog' : $routeParams.name;
                        // Cases to handle blog and blog-list pages script
                        if($location.$$path.indexOf("/blog/") > -1){
                            handle = 'blog-post'
                        }
                        else if($location.$$path.indexOf("/author/") > -1 || $location.$$path.indexOf("/tag/") > -1){
                            handle = 'blog'
                        }
                        console.info('User Script >>>', handle);

                        accountService(function(err, account) {
                            if (account.showhide.userScripts) {
                                websiteService(function(err, website) {
                                    if (website.resources && website.resources.userScripts && website.resources.toggles && website.resources.toggles.userScripts) {
                                        if (angular.isDefined(website.resources.userScripts[handle])) {
                                            scope.userScripts += '\n\n' + website.resources.userScripts[handle].sanitized;
                                        }
                                        scope.userScripts = $sce.trustAsHtml(scope.userScripts);
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
