angular.module('mainApp')
    .directive('externalScripts', ['$sce',
        function ($sce) {
            return {
                restrict: 'E',
                replace: true,
                template: '<span ng-bind-html="externalScripts"></span>',
                link: function (scope, elem, attr) {
                    scope.externalScripts = '';

                    var scriptLookup = {
                        'products': '<script src="https://www.paypalobjects.com/js/external/dg.js" async></script>',
                        'ssb-form-donate': '<script src="https://www.paypalobjects.com/js/external/dg.js" async></script>'
                    }

                    scope.$on('external.scripts.page.data', function (event, args) {
                        scope.externalScripts = '';
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
                            scope.externalScripts += '\n\n' + s;
                        });

                        console.info('external scripts', scope.externalScripts);

                        scope.externalScripts = $sce.trustAsHtml(scope.externalScripts);
                    });
                }
            };
        }
    ]);
