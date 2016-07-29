angular.module('mainApp')
    .directive('externalScripts', ['accountService', 'websiteService', '$routeParams', '$sce', '$location',
        function (accountService, websiteService, $routeParams, $sce, $location) {
            return {
                restrict: 'E',
                replace: true,
                template: '<span ng-bind-html="scripts"></span>',
                link: function (scope, elem, attr) {
                    scope.scripts = '';

                    var scriptLookup = {
                        'products': '<script src="https://www.paypalobjects.com/js/external/dg.js" async></script>',
                        'ssb-form-donate': '<script src="https://www.paypalobjects.com/js/external/dg.js" async></script>'
                    }

                    scope.$on('external.scripts.page.data', function (event, args) {
                        scope.scripts = '';
                        var page = args.page;
                        var componentTypes = _.uniq(_.pluck(_.flatten(_.pluck(page.sections, 'components')), 'type'));
                        var scriptList = [];

                        componentTypes.forEach(function (c, i) {
                            if (scriptLookup[c]) {
                                scriptList.push(scriptLookup[c]);
                            }
                        });

                        scriptList = _.uniq(scriptList);

                        scriptList.forEach(function(s, i) {
                            scope.scripts += '\n\n' + s;
                        });

                        console.info('external scripts', scope.scripts);

                        scope.scripts = $sce.trustAsHtml(scope.scripts);
                    });
                }
            };
        }
    ]);
