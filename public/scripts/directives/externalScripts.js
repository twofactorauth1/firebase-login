/*global angular */
angular.module('mainApp')
	.directive('externalScripts', ['$sce', 'externalScriptLookup',
        function ($sce, externalScriptLookup) {
			'use strict';
			return {
				restrict: 'E',
				replace: true,
				template: '<span ng-bind-html="externalScripts"></span>',
				link: function (scope) {
					scope.externalScripts = '';
					var scriptList = [],
						scriptLookup = externalScriptLookup;

					scope.$on('external.scripts.page.data', function (event, args) {
						var page = args.page;
						if (page) {
							_.uniq(_.pluck(_.flatten(_.pluck(page.sections, 'components')), 'type')).forEach(function (c) {
								for (var k in scriptLookup) {
									if ((scriptLookup[k].indexOf(c) > -1) && (scriptList.indexOf(k) === -1)) {
										scriptList.push(k);
										scope.externalScripts += '\n\n' + k;
										scope.externalScripts = $sce.trustAsHtml(scope.externalScripts);
									}
								}
							});
						}
					});
				}
			};
        }
    ]);
