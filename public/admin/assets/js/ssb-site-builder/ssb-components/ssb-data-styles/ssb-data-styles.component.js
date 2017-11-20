/*global app, angular, $ ,document,window */
/*jslint unparam:true*/
/* eslint-disable no-console*/
(function () {
	"use strict";
	app.directive('ssbDataStyles', ssbDataStyles);

	ssbDataStyles.$inject = ['$timeout', '$location', '$compile', 'SsbPageSectionService'];
	/* @ngInject */
	function ssbDataStyles($timeout, $location, $compile, SsbPageSectionService) {
		return {
			restrict: 'A',
			link: function (scope) {

				enabledynamicStyles();

				function enabledynamicStyles() {

					angular.element(document).ready(function () {

						var unbindWatcher = scope.$watch(function () {
							return angular.element('.ssb-theme-btn').length;
						}, function (newValue, oldValue) {
							if (newValue) {
								unbindWatcher();
								$timeout(function () {
									var elements = angular.element('.ssb-theme-btn'),
										anchorElements = angular.element('a[href]');
									elements.each(function () {
										var element = $(this),
											data = {
												hover: {
													bg: {
														color: null
													}
												},
												pressed: {
													bg: {
														color: null
													}
												}
											},
											originalData = {
												bg: {
													color: element.css('background-color')
												},
												txtcolor: element.css('color')
											},
											ssbHoverStyle = element.attr('data-ssb-hover-style'),
											ssbActiveStyle = element.attr('data-ssb-active-style');



										if (ssbHoverStyle) {
											var hoverStyleEl = $('<div style="' + ssbHoverStyle + '"></div>'),
												hoverStyle = hoverStyleEl.get(0).style,
												hoverbgcolor = hoverStyle.backgroundColor,
												hovertxtcolor = hoverStyle.color;

											data.hover.bg.color = hoverbgcolor;
											data.hover.txtcolor = hovertxtcolor;
										}

										if (ssbActiveStyle) {
											var activeStyleEl = $('<div style="' + ssbActiveStyle + '"></div>'),
												activeStyle = activeStyleEl.get(0).style,
												activebgcolor = activeStyle.backgroundColor,
												activetxtcolor = activeStyle.color;

											data.pressed.bg.color = activebgcolor;
											data.pressed.txtcolor = activetxtcolor;
										}

										// bind hover and active events to button
										if (ssbHoverStyle || ssbActiveStyle) {

											element.hover(function () {
												this.style.setProperty('background-color', data.hover.bg.color, 'important');
												this.style.setProperty('color', data.hover.txtcolor, 'important');

											}, function () {
												this.style.setProperty('background-color', originalData.bg.color, 'important');
												this.style.setProperty('color', originalData.txtcolor, 'important');
											});

											element.on("mousedown touchstart", function () {
												this.style.setProperty('background-color', data.pressed.bg.color, 'important');
												this.style.setProperty('color', data.pressed.txtcolor, 'important');
											});

										}

									});
									anchorElements.each(function () {
										var element = $(this);
										if (element.attr("href") && element.attr("target") === undefined && element.attr("href").indexOf("/blog") > -1 && element.attr("href").indexOf($location.host()) > -1) {
											element.attr("target", "_self");
										}
										// Temporary fix - Emika/ECWID integration. Force reload of shop page for plugin
										if (element.attr("href") && $location.$$host === "emikagifts.indigenous.io" && (element.attr("href") === "/shop" || element.attr("href").match("emikagifts.indigenous.io/shop"))) {
											element.attr("target", "_self");
										}
										if (element.attr("href") && $location.$$host === "emikagifts.com" && (element.attr("href") === "/shop" || element.attr("href").match("emikagifts.com/shop"))) {
											element.attr("target", "_self");
										}
										if (element.attr("href") && element.attr("href").indexOf("#") >= 0 && element.attr("href").length > 1) {
											var addSmoothScroll = element.attr("href").indexOf("#") === 0;
											if (!addSmoothScroll) {
												addSmoothScroll =
													element.attr("href").indexOf(window.location.href) > -1;
											}
											if (addSmoothScroll) {
												element.attr("du-smooth-scroll", '');
												scope.$watchCollection(function () {
													return SsbPageSectionService.offset;
												}, function (offset) {
													if(offset && offset > 0){
														element.attr("offset", offset);
														compileElement(element);
													}
												});
												compileElement(element);
											}
										}
									});

								}, 1500);
							}
						});
					});
				}

				function compileElement(element){
					if (element.hasClass("ssb-theme-btn")) {
						var elementBg = element.css("background-color"),
							elementTxtcolor = element.css("color"),
							elementBorder = element.css("border"),
							elementPadding = element.css("padding"),
							elementMargin = element.css("margin")
						$compile(element)(scope);
						// Need to rest the text and background color
						$timeout(function () {
							element.css("background-color", elementBg);
							element.css("color", elementTxtcolor);
							element.css("border", elementBorder);
							element.css("padding", elementPadding);
							element.css("margin", elementMargin);
						}, 0);
					} else {
						$compile(element)(scope);
					}
				}

			}
		};

	}
}());
