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
                        '<script src="https://www.paypalobjects.com/js/external/dg.js" async></script>': ['products', 'ssb-form-donate'],
                        '<script src="https://js.stripe.com/v2/?tmp" async></script>': ['products', 'ssb-form-donate'],
                        '<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDMI1SIOEHJm83bMZ-lWjzZN1nXdk6S0X0" async></script>': ['contact-us']
                    };

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
