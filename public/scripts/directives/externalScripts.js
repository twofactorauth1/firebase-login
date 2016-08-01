angular.module('mainApp')
    .directive('externalScripts', ['$sce', 'externalScriptLookup',
        function ($sce, externalScriptLookup) {
            return {
                restrict: 'E',
                replace: true,
                template: '<span ng-bind-html="externalScripts"></span>',
                link: function (scope, elem, attr) {
                    scope.externalScripts = '';

                    var scriptLookup = externalScriptLookup;

                    scope.$on('external.scripts.page.data', function (event, args) {
                        scope.externalScripts = '';
                        var page = args.page;
                        var componentTypes = _.uniq(_.pluck(_.flatten(_.pluck(page.sections, 'components')), 'type'));
                        var scriptList = [];

                        componentTypes.forEach(function (c, i) {
                            for (var k in scriptLookup) {
                                if (scriptLookup[k].indexOf(c) > -1) {
                                    scriptList.push(k);
                                }
                            }
                        });

                        scriptList = _.uniq(scriptList);

                        scriptList.forEach(function (s, i) {
                            scope.externalScripts += '\n\n' + s;
                        });

                        console.info('external scripts', scope.externalScripts);

                        scope.externalScripts = $sce.trustAsHtml(scope.externalScripts);
                    });
                }
            };
        }
    ]);
