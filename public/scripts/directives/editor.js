/*global angular*/
/*jslint unparam:true*/
angular.module('mainApp').directive("elem", function ($timeout) {
	'use strict';
	return {
		replace: true,
		transclude: true,
		scope: {
			ngModel: '=',
			className: '@className'
		},
		template: '<div class="element-wrap fr-view" ng-class="className" id="{{getId()}}">' +
			'<div  ng-class="{{vm.elementClass()}}"  ng-attr-style="{{vm.elementStyleVar}}" class="ssb-text-settings {{vm.showHideClassVar}}" >' +
			'<div ng-if="component.isOverlayActive" class="bg slider-overlay-bg-1" ng-style ="{\'background\': component.overlayBackground, opacity: component.overlayOpacity === 0 ?  component.overlayOpacity : component.overlayOpacity/100  || 0 , \'height\': component.isOverlayActive ? component.gridHeight+\'px\':\'\' }"></div>' +
			'<div class="word-break {{vm.verticalAlignmentVar}}" ng-class ="{ \'abs_overlay\': component.isOverlayActive  }" ng-bind-html="ngModel | unsafe"></div>' +
			'</div>' +
			'</div>',
		link: function (scope, element) {

			scope.component = scope.$parent.component;
			$timeout(function () {
				if (!element.hasClass("ssb-text-o-desktop") && element.children().hasClass("ssb-text-o-desktop")) {
					element.addClass("ssb-text-o-desktop");
					element.parents(".ssb-text-only").addClass("ssb-text-o-desktop");
				}
				if (!element.hasClass("ssb-text-o-moblie") && element.children().hasClass("ssb-text-o-moblie")) {
					element.addClass("ssb-text-o-moblie");
					element.parents(".ssb-text-only").addClass("ssb-text-o-moblie");
				}
			}, 0);
			function updateTextView(text){
				if(window.indigenous.business){
					if (scope.ngModel.indexOf("[BUSINESSLOGO]")> -1 ){
						var logo = window.indigenous.business.logo;
						if(logo){ 
							text=scope.ngModel.replace(/\[BUSINESSLOGO\]/g,'<img class="business-logo" src="'+logo+'">');
						}else{
							text=text.replace(/\[BUSINESSLOGO\]/g,'');
						}
					}
					if(window.indigenous.business.name){ 
						text=text.replace(/\[BUSINESSNAME\]/g,window.indigenous.business.name);
					}else{
						text=text.replace(/\[BUSINESSNAME\]/g,'');
					}
				}else{ 
					text=text.replace(/\[BUSINESSLOGO\]/g,""); 
					text=text.replace(/\[BUSINESSNAME\]/g,'');
				}
				return text;
			}
			scope.getId=function(){
				var parentComponentId =  element.closest('.ssb-component').attr('id'),
					parentSectionId = element.closest('.ssb-section-layout').attr('id'),
				 	elementModelName = element.attr("ng-model").replace('component.', '').replace('vm.', '').replace(/\./g, '/')
				return  ('text-element_' + parentSectionId + "-" + parentComponentId + "-"+elementModelName);
				
			}
			/*
			 * Replace square bracket tokens with valid script tags
			 *
			 * Example string and result:
			 *
			 * String -> '[script]asdfasdfasdf[/script]<div class="something">some content</div>[script src="whatever.js"][/script]'
			 *                  .replace(/\[script /g, '<script ')
			 *                  .replace(/\]\[\/script\]/g, '></script>')
			 *                  .replace(/\[script\]/, '<script>')
			 *                  .replace(/\[\/script\]/, '</script>');
			 *
			 * Result -> "<script>asdfasdfasdf</script><div class="something">some content</div><script src="whatever.js"></script>"
			 */
			if (scope.ngModel && scope.ngModel.indexOf) {
				if (scope.ngModel.indexOf('[script') !== -1) {

					var unescapeMap = {
							"&amp;": "&",
							"&lt;": "<",
							"&gt;": ">",
							'&quot;': '"',
							'&#39;': "'",
							'&#x2F;': "/",
							'&apos;': "'"
						},
						unescapeHTML = function (string) {
							return String(string).replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2f;|&apos;)/g,
								function (s) {
									return unescapeMap[s] || s;
								});
						},
						modelString = scope.ngModel.replace(/\[script /g, '<script ').replace(/\]\[\/script\]/g, '></script>').replace(/\[script\]/, '<script>').replace(/\[\/script\]/, '</script>');

					scope.ngModel = unescapeHTML(modelString);
				} else if (scope.ngModel.indexOf('&lt;!-- more --&gt;') !== -1) {
					scope.ngModel = scope.ngModel.replace(/&lt;!-- more --&gt;/, '');
				} 
				scope.ngModel=updateTextView(scope.ngModel);
			}
		}
	};
});
