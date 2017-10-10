/*global angular */
angular.module('mainApp')
	.directive('customFonts',
        function () {
			'use strict';
			return {
				restrict: 'E',
				replace: true,
				template: '<style ng-repeat="font in customFonts"> ' +					
						'@font-face { ' +
							'font-family:{{font.family}}; ' +
							'src: url(https:{{font.url}}); ' +
						'} ' +
					'</style>',
				link: function (scope) {
					if (window.indigenous && window.indigenous.precache && window.indigenous.precache.siteData && window.indigenous.precache.siteData.customFonts) {
						var _fonts = window.indigenous.precache.siteData.customFonts;
						_.each(_fonts, function(font){
	            			font.family = font.filename.substring(0, font.filename.indexOf('.')).replace(/ /g, "_");
	        			})
	        			scope.customFonts = _fonts;
					}
				}
			};
        }
    );
