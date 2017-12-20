/*global app, console, angular ,document , $ */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	app.controller('SiteBuilderThemeBtnController', ssbThemeBtnController);

	ssbThemeBtnController.$inject = ['$rootScope', '$scope', '$attrs', '$filter', '$transclude', '$sce', '$timeout', '$compile', '$window', 'SimpleSiteBuilderService'];
	/* @ngInject */
	function ssbThemeBtnController($rootScope, $scope, $attrs, $filter, $transclude, $sce, $timeout, $compile, $window, SimpleSiteBuilderService) {

		var vm = this,
			elementId = '',
			parentComponent,
			parentEditor,
			parentEditorId,
			buildDataObjFromHTMLDone = false;

		vm.init = init;
		vm.elementClass = elementClass;
		vm.elementStyle = elementStyle;

		vm.elementDataOriginal;
		vm.elementData = {
			'name': 'Button',
			'type': 'ssb-element-button',
			'title': 'Button',
			'version': null,
			'bg': {
				'img': {
					'url': '',
					'width': null,
					'height': null,
					'parallax': false,
					'blur': false,
					'overlay': false,
					'show': false
				},
				'color': ''
			},
			'txtcolor': '',
			'visibility': true,
			'spacing': {},
			'hover': {
				'txtcolor': '',
				'bg': {
					'color': ''
				}
			},
			'pressed': {
				'txtcolor': '',
				'bg': {
					'color': ''
				}
			},
			'border': {}
		};

		//get functions from parent text component
		var limit = 10,
			pScope = $scope.$parent; 
		while ((!pScope.vm || pScope.vm && !pScope.vm.uiState) && limit > 0) {
			if(pScope.$parent){
				pScope = pScope.$parent;
			}else{
				break;
			}
			limit--;
		}
		var pvm = pScope.vm;
		$scope.pvm = pvm;

		// check if email editor
		vm.defaultBtnStyles = {};
		if ($scope.pvm && $scope.pvm.state && $scope.pvm.state.emails) {
			if ($scope.pvm.state.website && $scope.pvm.state.website.themeOverrides && $scope.pvm.state.website.themeOverrides.styles && $scope.pvm.state.website.themeOverrides.styles) {
				vm.defaultBtnStyles.primaryBtnBackgroundColor = $scope.pvm.state.website.themeOverrides.styles.primaryBtnBackgroundColor;
				vm.defaultBtnStyles.primaryBtnTextColor = $scope.pvm.state.website.themeOverrides.styles.primaryBtnTextColor;
				vm.defaultBtnStyles.primaryBtnBorderColor = $scope.pvm.state.website.themeOverrides.styles.primaryBtnBackgroundColor;
			}
		}
		$rootScope.$on('$ssbElementsChanged', function (event, componentId, editorId) {

			if (parentEditorId && parentEditorId === editorId && parentComponent && componentId === parentComponent.attr('id')) {
				console.log('$ssbElementsChanged');
				positionEditControl();
			}

		});

		var watchElementData = $scope.$watch('vm.elementData', updateTextEditor, true);

		function buildDataObjFromHTML() {
			// var el = SimpleSiteBuilderService.getCompiledElement(parentComponent.attr('id'), parentEditorId, elementId);
			var ssbStyle = vm.element.attr('data-ssb-style'),
				ssbHoverStyle = vm.element.attr('data-ssb-hover-style'),
				ssbActiveStyle = vm.element.attr('data-ssb-active-style'),
				ssbClass = vm.element.attr('data-ssb-class'),
				ssbShowBorder = vm.element.attr('data-show-border'),
				data = {
					id: 'button-element_' + elementId,
					_id: 'button-element_' + elementId,
					anchor: 'button-element_' + elementId,
					'bg': {},
					'hover': {
						'bg': {}
					},
					'pressed': {
						'bg': {}
					},
					'border': {},
					'spacing': {}
				};

			if (ssbStyle) {
				var styleEl = $('<div style="' + ssbStyle + '"></div>'),
					style = styleEl.get(0).style,
					bgcolor = style.backgroundColor,
					txtcolor = style.color,
					visibility = style.display !== 'none',
					spacingPT = style.paddingTop.replace('px', ''),
					spacingPL = style.paddingLeft.replace('px', ''),
					spacingPR = style.paddingRight.replace('px', ''),
					spacingPB = style.paddingBottom.replace('px', ''),
					spacingMT = style.marginTop.replace('px', ''),
					spacingML = style.marginLeft.replace('px', ''),
					spacingMR = style.marginRight.replace('px', ''),
					spacingMB = style.marginBottom.replace('px', ''),
					spacingMW = style.maxWidth.replace('px', ''),

				// Border related
					borderColor = style.borderColor,
					borderWidth = style.borderWidth.replace('px', ''),
					borderRadius = style.borderRadius.replace('%', ''),
					borderStyle = style.borderStyle;

				data.bg.color = bgcolor;
				data.txtcolor = txtcolor;
				data.visibility = visibility;
				data.spacing.pt = spacingPT;
				data.spacing.pl = spacingPL;
				data.spacing.pr = spacingPR;
				data.spacing.pb = spacingPB;
				data.spacing.mt = spacingMT;
				data.spacing.ml = spacingML;
				data.spacing.mr = spacingMR;
				data.spacing.mb = spacingMB;
				data.spacing.mw = spacingMW;

				data.border.color = borderColor;
				data.border.width = borderWidth;
				data.border.style = borderStyle;
				data.border.radius = borderRadius;
			}
			data.border.show = ssbShowBorder;
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
					activetxtcolor = activeStyle.color,
					classObj;

				data.pressed.bg.color = activebgcolor;
				data.pressed.txtcolor = activetxtcolor;
			}

			if (ssbClass) {
				try {
					classObj = JSON.parse(ssbClass);
				} catch (e) {
					console.log('error', e);
				}

				console.log('classObj', classObj);

				if (classObj) {
					data.version = _.each(classObj, function (value, key, obj) {
						if (key.indexOf('ssb-theme-btn-style-') === 0) {
							return key.replace('ssb-theme-btn-style-', '')
						}
					});
				}
			}

			// bind hover and active events to button

			vm.element.hover(function () {
				var component = vm.elementData;
				if (component.hover.txtcolor) {
					this.style.setProperty('color', data.hover.txtcolor, 'important');
				}

				if (component.hover.bg) {
					this.style.setProperty('background-color', component.hover.bg.color, 'important');
				}
			}, function () {
				vm.elementStyle(vm.element);
			});

			vm.element.on("mousedown touchstart", function () {
				var component = vm.elementData;
				if (component.pressed.txtcolor) {
					this.style.setProperty('color', data.pressed.txtcolor, 'important');
				}

				if (component.pressed.bg) {
					this.style.setProperty('background-color', component.pressed.bg.color, 'important');
				}
			})

			angular.extend(vm.elementData, data);

			buildDataObjFromHTMLDone = true;

		}

		function updateTextEditor(force) {

			if (buildDataObjFromHTMLDone) {

				positionEditControl();

				vm.elementDataOriginal = vm.elementDataOriginal || angular.copy(vm.elementData);

				if (!angular.equals(vm.elementDataOriginal, vm.elementData)) {

					pvm.state.pendingPageChanges = true;

					if (parentEditor.froalaEditor) {
						parentEditor.froalaEditor('events.trigger', 'contentChanged');
					}

				}

				if (force && parentEditor.froalaEditor) {
					parentEditor.froalaEditor('events.trigger', 'contentChanged');
				}

			}

		}

		//TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components
		function elementClass() {
			var classObj = {},
				version = parseInt(vm.elementData.version),
				versionIsNumber = typeof parseInt(vm.elementData.version) === "number",
				versionIsNaN = isNaN(parseInt(vm.elementData.version));
			classObj['ssb-element'] = true;

			classObj[vm.elementData.type] = true;

			classObj['ssb-hide-during-load'] = !buildDataObjFromHTMLDone;

			if (versionIsNumber && !versionIsNaN) {
				classObj['ssb-theme-btn-style-' + version] = true;
			}
			if (vm.element) {
				vm.element.attr('data-ssb-class', JSON.stringify(classObj));
			}
			return classObj;
		}


		function checkIfLayoutStylesExists() {
			return vm.element.attr("class") && vm.element.attr("class").indexOf("ssb-theme-btn-style-") > -1;
		}

		function elementStyle(el) {

			var styleString = ' ',
				hoverStyleString = ' ',
				activeStyleString = ' ',
				component = vm.elementData;
			if (component.spacing) {
				if (component.spacing.pt) {
					styleString += 'padding-top: ' + component.spacing.pt + 'px;';
				}
				if (component.spacing.pb) {
					styleString += 'padding-bottom: ' + component.spacing.pb + 'px;';
				}
				if (component.spacing.pl) {
					styleString += 'padding-left: ' + component.spacing.pl + 'px;';
				}
				if (component.spacing.pr) {
					styleString += 'padding-right: ' + component.spacing.pr + 'px;';
				}
				if (component.spacing.mt) {
					styleString += 'margin-top: ' + component.spacing.mt + 'px;';
				}
				if (component.spacing.mb) {
					styleString += 'margin-bottom: ' + component.spacing.mb + 'pspacing.mwx;';
				}
				if (component.spacing.ml) {
					styleString += component.spacing.ml == 'auto' ? 'margin-left: ' + component.spacing.ml + ';float: none;' : 'margin-left: ' + component.spacing.ml + 'px;';
				}
				if (component.spacing.mr) {
					styleString += (component.spacing.mr == 'auto') ? 'margin-right: ' + component.spacing.mr + ';float: none;' : 'margin-right: ' + component.spacing.mr + 'px;';
				}

				if (component.spacing.mw) {

                      //apply max-width base on the px or %
                       component.spacing.mw = component.spacing.mw.toString();
                        if(component.spacing.mw == '100%' || component.spacing.mw == 'auto') {
                          styleString +=   'max-width: ' + component.spacing.mw + ';' ;
                        }
                        else{
                            if(component.spacing.mw && component.spacing.mw !== "" && component.spacing.mw.indexOf("%") === -1){
                               var isPx = "";
                               (component.spacing.mw.toLowerCase().indexOf('px') === -1) ? isPx="px" : isPx = "";
                               styleString +=  'max-width: ' + component.spacing.mw + isPx +';margin-left:auto!important;margin-right:auto!important;';
                            }
                            else
                            {
                               styleString +=  'max-width: ' + component.spacing.mw + ';margin-left:auto!important;margin-right:auto!important;';
                            }

                       }

				}

				if (component.spacing.lineHeight) {
					styleString += 'line-height: ' + component.spacing.lineHeight;
				}
			}

			if (component.txtcolor) {
				styleString += 'color: ' + component.txtcolor + ';';
			} else if (vm.defaultBtnStyles.primaryBtnTextColor) {
				styleString += 'color: ' + vm.defaultBtnStyles.primaryBtnTextColor + ';';
			}

			if (component.visibility === false) {
				styleString += 'display: none!important;';
			}

			if (component.bg) {
				if (component.bg.color) {
					styleString += 'background-color: ' + component.bg.color + ';';
					styleString += 'border-color: transparent;';
				} else if (vm.defaultBtnStyles.primaryBtnBackgroundColor && vm.element && !checkIfLayoutStylesExists()) {
					styleString += 'background-color: ' + vm.defaultBtnStyles.primaryBtnBackgroundColor + ';';
					styleString += 'border-color: transparent;';
				}
			}

			if (component.hover) {
				if (component.hover.txtcolor) {
					hoverStyleString += 'color: ' + component.hover.txtcolor + ';';
				}
				if (component.hover.bg) {
					hoverStyleString += 'background-color: ' + component.hover.bg.color + ';';
					hoverStyleString += 'border-color: transparent;';
				}
			}

			if (component.pressed) {
				if (component.pressed.txtcolor) {
					activeStyleString += 'color: ' + component.pressed.txtcolor + ';';
				}
				if (component.pressed.bg) {
					activeStyleString += 'background-color: ' + component.pressed.bg.color + ';';
					activeStyleString += 'border-color: transparent;';
				}
			}

			if (component.border && component.border.show && component.border.color && component.border.style) {
				styleString += 'border-color: ' + component.border.color + ';';
				styleString += 'border-width: ' + component.border.width + 'px;';
				styleString += 'border-style: ' + component.border.style + ';';
				styleString += 'border-radius: ' + component.border.radius + '%;';
			}

			if (vm.element) {
				vm.element.attr('data-show-border', component.border.show);
				vm.element.attr('data-ssb-style', styleString);
				vm.element.attr('data-ssb-hover-style', hoverStyleString);
				vm.element.attr('data-ssb-active-style', activeStyleString);
			}
			if (el) {
				el.attr('style', styleString);
			}

			return styleString;
		}

		function setActiveElementId(reset) {

			if (!reset) {
				pvm.uiState.activeElement = vm.elementData;
			} else {
				pvm.uiState.activeElement = {}
			}
		}

		function hideAllControls() {

			//hide editable-title's and borders
			angular.element('.ssb-edit-wrap, .editable-title, .editable-cover, [data-edit]', '.ssb-main').removeClass('ssb-on');

			//hide all edit-controls
			angular.element('.ssb-main').find('.ssb-active-edit-control').removeClass('ssb-active-edit-control');
			angular.element('.ssb-main').find('.ssb-on').removeClass('ssb-on');

			//components
			angular.element('.ssb-main').find('.ssb-active-component').removeClass('ssb-active-component');

			//btns
			angular.element('.ssb-main').find('.ssb-theme-btn-active-element').removeClass('ssb-theme-btn-active-element');
			angular.element('.ssb-main').find('.ssb-edit-control-component-btn').removeClass('on');
		}

		function showEditControl(e) {

			//prevent other handling
			e.stopPropagation();

			hideAllControls();

			//close section panel
			// pvm.uiState.openSidebarSectionPanel = null;
			// pvm.uiState.showSectionPanel = false;
			pvm.uiState.activeSectionIndex = null;
			pvm.uiState.activeComponentIndex = null;

			//get element
			var el = SimpleSiteBuilderService.getCompiledElement(parentComponent.attr('id'), parentEditorId, elementId);

			$timeout(function () {
				// un-highlight other compiled elements in this component
				parentComponent.find('[data-compiled]').removeClass('ssb-theme-btn-active-element');

				// highlight clicked element
				el.addClass('ssb-theme-btn-active-element');

				// hide other element edit controls
				$('.ssb-edit-control[data-compiled-control-id]').removeClass('on');
			});

			// if edit control hasn't been created, create it and compile it
			if (!SimpleSiteBuilderService.getCompiledElementEditControl(parentComponent.attr('id'), parentEditorId, elementId)) {
				$scope.component = {
					title: 'Button_' + elementId,
					type: 'Button'
				}; //TODO: make generic/configurable
				var template = getEditControlTemplate();
				$compile(template)($scope, compiledEditControl);

				var _state = angular.copy(pvm.uiState.showSectionPanel);
				pvm.uiState.showSectionPanel = false;

				$timeout(function () {
					pvm.uiState.showSectionPanel = _state;
					setActiveElementId();
					positionEditControl();

					var editControlComponent = $('.ssb-edit-control[data-compiled-control-id="control_' + elementId + '"]')

					editControlComponent.addClass('on');

					//if contextual menu is already open, open directly from single click
					if (pvm.uiState.showSectionPanel) {
						$timeout(function () {
							editControlComponent.find('.ssb-settings-btn').click();
						}, 0);

					}

					/*
					 * if contextual menu is already open, open directly from single click
					 */
					if (pvm.uiState.showSectionPanel || SimpleSiteBuilderService.isIENotEdge) {
						$timeout(function () {
							editControlComponent.find('.ssb-settings-btn').click();
						});
					}

				});


				// else set active element (for contextual menu) and position the edit control and make visible
			} else {
				$timeout(function () {

					setActiveElementId();
					positionEditControl();

					var editControlComponent = $('.ssb-edit-control[data-compiled-control-id="control_' + elementId + '"]')

					editControlComponent.addClass('on');

					//if contextual menu is already open, open directly from single click
					if (pvm.uiState.showSectionPanel) {
						$timeout(function () {
							editControlComponent.find('.ssb-settings-btn').click();
						}, 0);

					}

					/*
					 * if contextual menu is already open, open directly from single click
					 */
					if (pvm.uiState.showSectionPanel || SimpleSiteBuilderService.isIENotEdge) {
						$timeout(function () {
							editControlComponent.find('.ssb-settings-btn').click();
						});
					}

				});
			}
		}

		function hideEditControl(e) {
			$timeout(function () {
				$('.ssb-edit-control[data-compiled-control-id="control_' + elementId + '"]').removeClass('on');
			});
		}

		function compiledEditControl(cloned, scope) {
			var newEl;
			$timeout(function () {
				cloned.prependTo(parentComponent.parent());
				newEl = $('.ssb-edit-control[data-compiled-control-id="control_' + elementId + '"]')
				newEl.addClass('on');
				SimpleSiteBuilderService.addCompiledElementEditControl(parentComponent.attr('id'), parentEditorId, elementId, newEl);
				setActiveElementId();
				positionEditControl();

				//if contextual menu is already open, open directly from single click
				if (pvm.uiState.showSectionPanel) {
					newEl.find('.ssb-settings-btn').click();
				}

			});
		}

		function positionEditControl() {
			var windowWidth = angular.element($window).width();



			var container = document.querySelector('.ssb-site-builder-container') || document.querySelector('.email-builder-container');
			var top = 0;
			var left = 0;
			var topbarHeight = 125;
			var sidebarWidth = 140;

			var scrollTop = container ? container.scrollTop : 0;
			var topOffset = 35;
			var leftOffset = 35;
			if (windowWidth < 768) {
				sidebarWidth = 0;
				leftOffset = 20;
			}
			var compiledEl = SimpleSiteBuilderService.getCompiledElement(parentComponent.attr('id'), parentEditorId, elementId);
			var compiledEditControl = SimpleSiteBuilderService.getCompiledElementEditControl(parentComponent.attr('id'), parentEditorId, elementId);

			if (compiledEl.length && document.querySelector('.ssb-site-builder-container')) {
				top = compiledEl[0].getBoundingClientRect().top - topOffset - topbarHeight + scrollTop;
				left = compiledEl[0].getBoundingClientRect().left - leftOffset - sidebarWidth;
			}

			if (compiledEl.length && document.querySelector('.email-builder-container')) {
				top = compiledEl[0].getBoundingClientRect().top - topOffset;
				left = compiledEl[0].getBoundingClientRect().left - leftOffset;
			}

			if (compiledEditControl && compiledEditControl.length) {
				compiledEditControl.css({
					top: top,
					left: left
				});
			}

		}

		function getEditControlTemplate() {
			var ret = '';
			var baseTemplate = 'data-compiled-control-id="control_' + elementId + '" ' +
				'class="ssb-edit-control ssb-edit-control-component ssb-edit-control-component-btn on" ' +
				'component="component" ' +
				'state="pvm.state" ' +
				'ui-state="pvm.uiState" ' +
				'section-index="null" ' +
				'component-index="null">';

			if (document.querySelector('.email-builder-container') !== null) {
				ret = '<email-edit-control ' + baseTemplate + '</email-edit-control>';
			} else {
				ret = '<ssb-edit-control ' + baseTemplate + '</ssb-edit-control>';
			}

			return ret;
		}

		function init(element) {

			console.info('ssb-theme-btn directive init...');

			vm.element = element;

			if (pvm && element.data('compiled')) {

				elementId = element.data('compiled');

				parentComponent = element.closest('[component]');

				parentEditor = element.closest('.editable');

				parentEditorId = parentEditor.froalaEditor().data('froala.editor').id;

				buildDataObjFromHTML();

				$timeout(function () {
					$('[data-compiled=' + elementId + ']').on('click', showEditControl);

					$('[data-compiled-control-id=control_' + elementId + ']').on('click', setActiveElementId);

					// angular.element('.ssb-page-section').on('click', clearActiveElement);
				});

			} else {

				console.log('button outside of editor context: ', element.html());

				/**
				 *  unbind watchers for inactive .ssb-theme-btn's
				 */
				vm.elementClass = angular.noop();

				watchElementData();

				// pvmStateLoading();

			}

		}

	}


}());
