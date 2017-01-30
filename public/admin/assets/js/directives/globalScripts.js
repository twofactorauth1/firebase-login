app.directive('globalScripts', [ '$sce',
    function( $sce) {
        return {
            restrict: 'E',
            replace: true,
            template: '<span ng-bind-html="globalScripts"></span>',
            scope: {
                website: '=',
                account: '='
            },
            link: function(scope, elem, attr) {
                scope.globalScripts = '';

                var processFn = function() {
                    scope.globalScripts = '';
                    var account = scope.account;
                    var website = scope.website;
                   
                    if (account.showhide.userScripts) {                               
                        if (website && website.resources && website.resources.userScripts && website.resources.toggles && website.resources.toggles.userScripts) {
                            if (angular.isDefined(website.resources.userScripts.global)) {
                                scope.globalScripts += '\n\n' + website.resources.userScripts.global.sanitized;
                            }
                            scope.globalScripts = $sce.trustAsHtml(scope.globalScripts);
                        }
                    }
                };
                processFn();
            }
        };
    }
]);
