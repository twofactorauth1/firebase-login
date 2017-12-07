/*global app ,angular ,console, window,angular,YT, $, _ */
/* eslint-disable no-console */
(function () {
	//'use strict';
	app.controller('SiteBuilderPageSectionTemplateController', ssbPageSectionTemplateController);

	ssbPageSectionTemplateController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$sce', '$timeout', '$window', '$location', 'SsbPageSectionService'];
	/* @ngInject */
	function ssbPageSectionTemplateController($scope, $attrs, $filter, $transclude, $sce, $timeout, $window, $location, SsbPageSectionService) {

		console.info('page-section-template directive init...');

		var vm = this;

		vm.init = init;
		vm.sectionClass = sectionClass;		
		vm.sectionStyle = sectionStyle;
		vm.componentClass = componentClass;
		vm.setupVideoBackground = setupVideoBackground;
		vm.playerObject = {};
		vm.player = {};
		vm.setFixedPosition = setFixedPosition; 

		$scope.$watch('vm.section.bg.video.id', function (_id) {
			if (_id && vm.section.bg.video.show) {
				$timeout(function () {
					vm.setupVideoBackground();
				}, 1000);
			}
		});

		function sectionClass(section) {
			var classString = ' '; //col-xs-12 was messing up legacy

			if (section) {				
				if (section.bg && section.bg.video && section.bg.video.show && section.bg.video.urlProcessed) {
					if (!angular.equals(vm.playerObject, {})) {
						classString += ' ssb-page-section-layout-video-bg';
					}
				}				
				setUpFroalaVideoSize(section);
				resizeSliderImagesToFullHeight(section);
			}
			return classString;
		}

		function screenLayout(){
			var _layout = 3;
			var windowWidth = angular.element($window).width();
			if(windowWidth < 768){
				_layout = 0
			}
			else if(windowWidth >= 768 && windowWidth < 992){
				_layout = 1;
			}
			else if(windowWidth >= 992 && windowWidth < 1200){
				_layout = 2;
			}
			else if(windowWidth >= 1200){
				_layout = 3;
			}
			return _layout;
    	}

		function sectionStyle (section) {
			var styleString = ' ';
			// Styles basis of screens sizes
			var _layout = screenLayout();
			var _style = "";
			switch (_layout) {
	            case 0:
	                if (section && section.spacing) {
						if (section.spacing.ptxs || section.spacing.ptsm || section.spacing.ptmd || section.spacing.pt) {
							_style = (section.spacing.ptxs || section.spacing.ptsm || section.spacing.ptmd || section.spacing.pt);
							styleString += 'padding-top: ' +applyStyle( _style )+ ';';
						}

						if (section.spacing.pbxs || section.spacing.pbsm || section.spacing.pbmd || section.spacing.pb) {
							_style = (section.spacing.pbxs || section.spacing.pbsm || section.spacing.pbmd || section.spacing.pb);
							styleString += 'padding-bottom: ' + applyStyle(_style) + ';';
						}

						if (section.spacing.plxs || section.spacing.plsm || section.spacing.plmd || section.spacing.pl) {
							_style = (section.spacing.plxs || section.spacing.plsm || section.spacing.plmd || section.spacing.pl);
							styleString += 'padding-left: ' + applyStyle(_style)  + ';';
						} 
						if (section.spacing.prxs || section.spacing.prsm || section.spacing.prmd || section.spacing.pr) {
							_style = (section.spacing.prxs || section.spacing.prsm || section.spacing.prmd || section.spacing.pr);
							styleString += 'padding-right: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.mtxs || section.spacing.mtsm || section.spacing.mtmd || section.spacing.mt) {
							_style = (section.spacing.mtxs || section.spacing.mtsm || section.spacing.mtmd || section.spacing.mt);
							styleString += 'margin-top: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.mbxs || section.spacing.mbsm || section.spacing.mbmd || section.spacing.mb) {
							_style = (section.spacing.mbxs || section.spacing.mbsm || section.spacing.mbmd || section.spacing.mb);
							styleString += 'margin-bottom: ' + applyStyle(_style)  + ';';
						}


						if (section.spacing.mlxs || section.spacing.mlsm || section.spacing.mlmd || section.spacing.ml) {
							var _ml = section.spacing.mlxs || section.spacing.mlsm || section.spacing.mlmd || section.spacing.ml;
							if(_ml.indexOf('%') > 0){
								_style = "";
							}
							else{
								_style = "px";
							}
							styleString += _ml == 'auto' ? 'margin-left: ' + _ml + ';float: none;' : 'margin-left: ' + _ml + _style + ';';
						}

						if (section.spacing.mrxs || section.spacing.mrsm || section.spacing.mrmd || section.spacing.mr) {
							var _mr = section.spacing.mrxs || section.spacing.mrsm || section.spacing.mrmd || section.spacing.mr;
							if(_mr.indexOf('%') > 0){
								_style = "";
							}
							else{
								_style = "px";
							}
							styleString += (_mr == 'auto') ? 'margin-right: ' + _mr + ';float: none;' : 'margin-right: ' + _mr + _style + ';';
						}

						if (section.spacing.mwxs || section.spacing.mwsm || section.spacing.mwmd || section.spacing.mw) {
							var _mw = section.spacing.mwxs || section.spacing.mwsm || section.spacing.mwmd || section.spacing.mw;
                                _mw = _mw.toString();
                            if(_mw == '100%' || _mw == 'auto') {
                              styleString +=   'max-width: ' + _mw + ';' ;
                            }
                            else{
                                if(_mw && _mw !== "" && _mw.indexOf("%") === -1){
                                   var isPx = "";
                                   (_mw.toLowerCase().indexOf('px') === -1) ? isPx="px" : isPx = "";
                                   styleString +=  'max-width: ' + _mw + isPx +';margin-left:auto!important;margin-right:auto!important;';
                                }
                                else
                                {
                                   styleString +=  'max-width: ' + _mw + ';margin-left:auto!important;margin-right:auto!important;';
                                }

                           }

							// styleString += (_mw == '100%') ?
							// 	'max-width: ' + _mw + ';' :
							// 	'max-width: ' + _mw + 'px;margin-left:auto!important;margin-right:auto!important;';
						}

						if (section.spacing.lineHeight) {
							styleString += 'line-height: ' + section.spacing.lineHeight;
						}

					}
	                break;
	            case 1:
	                if (section && section.spacing) {
						if (section.spacing.ptsm || section.spacing.ptmd || section.spacing.pt) {
							_style = (section.spacing.ptsm || section.spacing.ptmd || section.spacing.pt);
							 styleString += 'padding-top: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.pbsm || section.spacing.pbmd || section.spacing.pb) {
							_style = (section.spacing.pbsm || section.spacing.pbmd || section.spacing.pb);
							styleString += 'padding-bottom: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.plsm || section.spacing.plmd || section.spacing.pl) {
							_style = (section.spacing.plsm || section.spacing.plmd || section.spacing.pl);
							styleString += 'padding-left: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.prsm || section.spacing.prmd || section.spacing.pr) {
							_style = (section.spacing.prsm || section.spacing.prmd || section.spacing.pr); 
							styleString += 'padding-right: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.mtsm || section.spacing.mtmd || section.spacing.mt) {
							_style = (section.spacing.mtsm || section.spacing.mtmd || section.spacing.mt); 
							styleString += 'margin-top: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.mbsm || section.spacing.mbmd || section.spacing.mb) {
							_style = (section.spacing.mbsm || section.spacing.mbmd || section.spacing.mb);
							styleString += 'margin-bottom: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.mlsm || section.spacing.mlmd || section.spacing.ml) {
							var _ml = section.spacing.mlsm || section.spacing.mlmd || section.spacing.ml;
							if(_ml.indexOf('%') > 0){
								_style = "";
							}
							else{
								_style = "px";
							}
							styleString += _ml == 'auto' ? 'margin-left: ' + _ml + ';float: none;' : 'margin-left: ' + _ml + _style + ';';
						}

						if (section.spacing.mrsm || section.spacing.mrmd || section.spacing.mr) {
							var _mr = section.spacing.mrsm || section.spacing.mrmd || section.spacing.mr;
							if(_mr.indexOf('%') > 0){
								_style = "";
							}
							else{
								_style = "px";
							}
							styleString += (_mr == 'auto') ? 'margin-right: ' + _mr + ';float: none;' : 'margin-right: ' + _mr + _style + ';';
						}

						if (section.spacing.mwsm || section.spacing.mwmd || section.spacing.mw) {
							var _mw = section.spacing.mwsm || section.spacing.mwmd || section.spacing.mw;
                                _mw = _mw.toString();
                            if(_mw == '100%' || _mw == 'auto') {
                              styleString +=   'max-width: ' + _mw + ';' ;
                            }
                            else{
                                if(_mw && _mw !== "" && _mw.indexOf("%") === -1){
                                   var isPx = "";
                                   (_mw.toLowerCase().indexOf('px') === -1) ? isPx="px" : isPx = "";
                                   styleString +=  'max-width: ' + _mw + isPx +';margin-left:auto!important;margin-right:auto!important;';
                                }
                                else
                                {
                                   styleString +=  'max-width: ' + _mw + ';margin-left:auto!important;margin-right:auto!important;';
                                }

                           }

							// styleString += (_mw == '100%') ?
							// 	'max-width: ' + _mw + ';' :
							// 	'max-width: ' + _mw + 'px;margin-left:auto!important;margin-right:auto!important;';
						}

						if (section.spacing.lineHeight) {
							styleString += 'line-height: ' + section.spacing.lineHeight;
						}

					}
	                break;
	            case 2:
	                if (section && section.spacing) {
						if (section.spacing.ptmd || section.spacing.pt) {
							_style = (section.spacing.ptmd || section.spacing.pt); 
							styleString += 'padding-top: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.pbmd || section.spacing.pb) {
							_style = (section.spacing.pbmd || section.spacing.pb);
							styleString += 'padding-bottom: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.plmd || section.spacing.pl) {
							_style = (section.spacing.plmd || section.spacing.pl);
							styleString += 'padding-left: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.prmd || section.spacing.pr) {
							_style = (section.spacing.prmd || section.spacing.pr);
							styleString += 'padding-right: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.mtmd || section.spacing.mt) {
							_style = (section.spacing.mtmd || section.spacing.mt);
							styleString += 'margin-top: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.mbmd || section.spacing.mb) {
							_style = (section.spacing.mbmd || section.spacing.mb); 
								styleString += 'margin-bottom: ' + applyStyle(_style)  + ';';
						}

						if (section.spacing.mlmd || section.spacing.ml) {
							var _ml = section.spacing.mlmd || section.spacing.ml;
							if(_ml.indexOf('%') > 0){
								_style = "";
							}
							else{
								_style = "px";
							}
							styleString += _ml == 'auto' ? 'margin-left: ' + _ml + ';float: none;' : 'margin-left: ' + _ml + _style + ';';
						}

						if (section.spacing.mrmd || section.spacing.mr) {
							var _mr = section.spacing.mrmd || section.spacing.mr;
							if(_mr.indexOf('%') > 0){
								_style = "";
							}
							else{
								_style = "px";
							}
							styleString += (_mr == 'auto') ? 'margin-right: ' + _mr + ';float: none;' : 'margin-right: ' + _mr + _style + ';';
						}

						if (section.spacing.mwmd || section.spacing.mw) {
							var _mw = section.spacing.mwmd || section.spacing.mw;
							styleString += (_mw == '100%') ?
								'max-width: ' + _mw + ';' :
								'max-width: ' + _mw + 'px;margin-left:auto!important;margin-right:auto!important;';
						}

						if (section.spacing.lineHeight) {
							styleString += 'line-height: ' + section.spacing.lineHeight;
						}

					}
	                break;
	            default:
	            	if (section && section.spacing) {
						if (section.spacing.pt) {
							styleString +=  'padding-top: ' + applyStyle(section.spacing.pt) + ';';
						}

						if (section.spacing.pb) {
							styleString +=  'padding-bottom: ' + applyStyle(section.spacing.pb) + ';';
						}

						if (section.spacing.pl) {
							styleString +=  'padding-left: ' + applyStyle(section.spacing.pl) + ';';
						}

						if (section.spacing.pr) {
							styleString +=  'padding-right: ' + applyStyle(section.spacing.pr)+ ';' ;
						}

						if (section.spacing.mt) {
							styleString += 'margin-top: ' + applyStyle(section.spacing.mt) + ';';
						}

						if (section.spacing.mb) {
							styleString +=  'margin-bottom: ' + applyStyle(section.spacing.mb)+ ';' ;
						}

						if (section.spacing.ml) { 
							styleString += 'margin-left: ' +applyStyle(section.spacing.ml)  + ';float: none;' ;
						}

						if (section.spacing.mr) { 
							styleString += 'margin-right: ' + applyStyle(section.spacing.mr) + ';float: none;' ;
						}

						if (section.spacing.mw) {
                            section.spacing.mw = section.spacing.mw.toString();
							if(section.spacing.mw == '100%' || section.spacing.mw == 'auto') {
                              styleString +=   'max-width: ' + section.spacing.mw + ';' ;
                            }
                            else{
                                if(section.spacing.mw && section.spacing.mw !== "" && section.spacing.mw.indexOf("%") === -1){
                                   var isPx = "";
                                   (section.spacing.mw.toLowerCase().indexOf('px') === -1) ? isPx="px" : isPx = "";
                                   styleString +=  'max-width: ' + section.spacing.mw + isPx +';margin-left:auto!important;margin-right:auto!important;';
                                }
                                else
                                {
                                   styleString +=  'max-width: ' + section.spacing.mw + ';margin-left:auto!important;margin-right:auto!important;';
                                }

                           }

						}

						if (section.spacing.lineHeight) {
							styleString += 'line-height: ' + section.spacing.lineHeight;
						}

					}
        	}
			return styleString;
		}

		function applyStyle(value){
			value=""+value;
			value=value.toLowerCase(); 
			 if(!( value==='auto' || value.indexOf("%") > -1 || value.indexOf("px")>-1)){ 
				value +="px";
			}
			return value;
		}

		function resizeSliderImagesToFullHeight(section) {
			if (section) {
				var sectionElement = angular.element("#section_" + section._id);
				if (sectionElement.hasClass("ssb-page-section-layout-nav-hero-v2") || sectionElement.hasClass("ssb-page-section-layout-nav-hero-v3") || sectionElement.hasClass("ssb-page-section-layout-nav-hero-v4")) {
					var sectionElementTextHeight = 120,
						innerSectionHeaderElement = sectionElement.find(".navigation-header"),
						innerSectionTextElement;
					if (innerSectionHeaderElement.length) {
						sectionElementTextHeight += innerSectionHeaderElement.height();
					}
					innerSectionTextElement = sectionElement.find(".ssb-nav-hero-text");
					if (innerSectionHeaderElement.length) {
						sectionElementTextHeight += innerSectionTextElement.height();
					}
					if (sectionElement.hasClass("ssb-page-section-layout-nav-hero-v3")) {
						var innerSectionText2Element = sectionElement.find(".ssb-nav-hero-text-full-wdith");
						if (innerSectionText2Element.length) {
							sectionElementTextHeight += innerSectionText2Element.height();
						}
					}
					sectionElement.find(".single-testimonial .component-slider-image img").css("min-height", sectionElementTextHeight);
					var windowWidth = angular.element($window).width();
					if(sectionElement.hasClass("ssb-page-section-layout-nav-hero-v4") && windowWidth < 768){
						sectionElement.find(".flex-container-absolute-column").css("min-height", sectionElementTextHeight);
					}
					if((sectionElement.hasClass("ssb-section-amm") && windowWidth>768 ) ||
					   (sectionElement.hasClass("ssb-section-wmm") && windowWidth>768 && windowWidth<1025 )
					){
						sectionElement.find("ul.slick-dots").css('top',(sectionElementTextHeight-80)+'px')
					}
				}
			}
		}	

		function componentClass(component, index) {			
			if (vm.section && vm.section.layoutModifiers && vm.section.layoutModifiers.columns) {
				var fixedColumn;
				if (angular.isDefined(vm.section.layoutModifiers.columns.columnsNum)) {					
						var actualColumnsToIgnore = [];
					if (vm.section.layoutModifiers.columns.ignoreColumns && vm.section.layoutModifiers.columns.ignoreColumns.length) {
						var ignoreColumns = vm.section.layoutModifiers.columns.ignoreColumns;
						_.each(ignoreColumns, function (val) {
							if (val === 'last') {
								actualColumnsToIgnore.push(vm.section.components.length - 1);
							} else {
								actualColumnsToIgnore.push(val - 1);
							}
						});
					}
					fixedColumn = actualColumnsToIgnore.indexOf(index) > -1 ? true : false;
				}

				if (!fixedColumn && parseInt(vm.section.layoutModifiers.columns.columnsNum) > 1) {
					var element = angular.element(".inner-component-style." + component.type + "" + component._id);
					if (vm.section.columnBorder && vm.section.columnBorder.show && vm.section.columnBorder.color) {
						if (element) {
							element.css({
								'border-color': vm.section.columnBorder.color,
								'border-width': vm.section.columnBorder.width + 'px',
								'border-style': vm.section.columnBorder.style,
								'border-radius': vm.section.columnBorder.radius + "%"
							});
						}
					} else {
						if (element) {
							element.css({
								'border': 'none'
							});
						}
					}
				}
			}
		}

		/**
		 * setFixedPosition
		 * - If fixed element is first on page, just make it fixed
		 * - Else, create new StickyState for element to fix at scroll position
		 */
		function setFixedPosition(_isVerticalNav) {
			if (!_isVerticalNav) {
				var elementIsFirstPosition = vm.index === 0;
				
				if (elementIsFirstPosition) {
					// Preview page
					var dup ;
					dup = vm.element.clone();
					dup.addClass('ssb-fixed-clone-element');
					dup.attr('id', 'clone_of_' + vm.section._id);
					dup.insertAfter(vm.element);
					
					$scope.$watch(
						function () {
							return angular.element(".ssb-fixed-first-element").height();
						},
						function (value) {
							if (dup)
								dup.css("min-height", value + "px");								
							SsbPageSectionService.setSectionOffset(value);
						}
					);

				} else {
					SsbPageSectionService.isSticky = true;
					$timeout(function () {
						$(vm.element[0]).sticky({
							zIndex: 999
						});
						
						$scope.$watch(
							function () {
								return $(vm.element[0]).height();
							},
							function (value) {
								SsbPageSectionService.setSectionOffset(value);
							}
						);
						
						//new StickyState(vm.element[0]);
					}, 1000);
				}
			}
			vm.elementLoaded = true;
		}

		function setUpFroalaVideoSize(section) {
			if (section) {
				var sectionElement = angular.element("#section_" + section._id);
				if (sectionElement.length) {
					var iframes = sectionElement.find(".fr-video>iframe");
					if (iframes.length) {
						_.each(iframes, function (iframe) {
							var width = $(iframe).width();
							var height = (width / 16) * 9;
							$(iframe).height(height + "px");
						});
					}
				}
			}
		}

		function setupVideoBackground() {

			var windowWidth = angular.element($window).width();

			if (windowWidth > 767 && vm.section.bg.video && vm.section.bg.video.id) {

				if (vm.playerObject.destroy) {
					vm.playerObject.destroy();
				}
				if (YT && YT.Player) {
					vm.playerObject = new YT.Player('section_video_' + vm.section._id, {
						height: '100%',
						width: '100%',
						videoId: vm.section.bg.video.id,
						events: {
							'onReady': vm.onPlayerReady,
							'onStateChange': vm.onPlayerStateChange,
							'onError': vm.onPlayerError
						},
						playerVars: {
							autohide: 1,
							loop: 1,
							rel: 0,
							enablejsapi: 1,
							controls: 0,
							autoplay: 1,
							showinfo: 0,
							modestbranding: 1,
							playlist: vm.section.bg.video.id,
						}
					});
				} else {
					$timeout(setupVideoBackground, 500);
				}

			}

		}

		vm.onPlayerReady = function (event) {
			vm.player = event.target;
			vm.player.playVideo();
			vm.player.mute();
		};
		

		function init(element) {
			vm.element = element;

			var _isVerticalNav = false;
			var elementIsFirstPosition = vm.index === 0; 
			if(!$window.indigenous.firstVisibleElement && vm.section.showSection){
				$window.indigenous.firstVisibleElement=true;
				elementIsFirstPosition=true;
			}
			if (vm.section && vm.section.fixedLeftNavigation && elementIsFirstPosition && vm.section.showSection) {
				_isVerticalNav = true;
				var isBlogPage = angular.element(".ssb-layout__header_2-col_footer").length;
				if (!isBlogPage) {
					var sectionLength=vm.index+1;
					if (!angular.element(".ssb-wrap-left-fixed-left-nav").length) {
						angular.element(".ssb-page-section:eq("+(sectionLength-1)+")").addClass("ssb-wrap-left-fixed-left-nav");
						angular.element(".ssb-page-section").slice(sectionLength).wrapAll("<div class='ssb-wrap-fixed-right-nav' />");
						$timeout(function () {
							if (!angular.element(".ssb-wrap-fixed-right-nav").length)
								angular.element(".ssb-page-section").slice(sectionLength).wrapAll("<div class='ssb-wrap-fixed-right-nav' />");
						}, 0);

					}
				} else {
					if (!angular.element(".ssb-wrap-left-fixed-left-nav").length) {
						angular.element(".ssb-page-layout-row:first").addClass("ssb-wrap-left-fixed-left-nav");
						angular.element(".ssb-page-layout-row").slice(1).wrapAll("<div class='ssb-wrap-fixed-right-nav' />");
						$timeout(function () {
							if (!angular.element(".ssb-wrap-fixed-right-nav").length)
								angular.element(".ssb-page-layout-row").slice(1).wrapAll("<div class='ssb-wrap-fixed-right-nav' />");
						}, 0);
					}
				}

				$scope.$watch(
					function () {
						return angular.element(".ssb-wrap-left-fixed-left-nav").width();
					},
					function (value) {
						angular.element(".ssb-wrap-fixed-right-nav").css("margin-left", value + "px");
						$timeout(function () {
							angular.element(".ssb-wrap-fixed-right-nav").css("margin-left", value + "px");
						}, 0);
					}
				);
			}

			if (vm.section && vm.section.layoutModifiers && vm.section.layoutModifiers.fixed) {
				$timeout(function () {
					vm.setFixedPosition(_isVerticalNav);
				}, 0);
			}
			if(vm.section){
				vm.sectionStyle = sectionStyle(vm.section);
			}

		};

		angular.element($window).bind('resize', function () {
			if(vm.section){
				vm.sectionStyle = sectionStyle(vm.section);
			}
		});

	}

})();
