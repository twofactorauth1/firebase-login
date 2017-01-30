app.directive('userScripts', [ '$sce',
    function( $sce) {
        return {
            restrict: 'E',
            replace: true,
            template: '<span ng-bind-html="pageScripts"></span>',
            scope: {
                website: '=',
                handle: '=',
                account: '='
            },
            link: function(scope, elem, attr) {
                scope.pageScripts = '';

                var processFn = function() {
                    scope.pageScripts = '';
                    var account = scope.account;
                    var website = scope.website;
                    var handle = scope.handle;
                    console.info('User Script >>>', handle);
                   
                    if (account.showhide.userScripts) {                               
                        if (website && website.resources && website.resources.userScripts && website.resources.toggles && website.resources.toggles.userScripts) {
                            if (angular.isDefined(website.resources.userScripts[scope.handle])) {
                                scope.pageScripts += '\n\n' + website.resources.userScripts[scope.handle].sanitized;
                            }
                            scope.pageScripts = $sce.trustAsHtml(scope.pageScripts);
                        }
                    }
                };
                processFn();
            }
        };
    }
]);
