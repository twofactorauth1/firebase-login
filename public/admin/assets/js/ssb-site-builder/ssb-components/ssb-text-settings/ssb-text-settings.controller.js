/*global app,  console ,angular */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {

	app.controller('SiteBuilderTextSettingsController', ssbTextSettingsController);

	ssbTextSettingsController.$inject = ['$rootScope', '$scope', '$attrs', '$filter', '$timeout', '$compile', '$window'];
	/* @ngInject */
	function ssbTextSettingsController($rootScope, $scope, $attrs, $filter, $timeout, $compile, $window) {

		var vm = this,
			pvm = null,
			limit = 10,
			pScope = $scope.$parent;

		vm.init = init;
		vm.element = null;
		vm.elementId = null;
		vm.parentTextElement = null;
		vm.showHideClass = showHideClass;
		vm.parentTextElementModelAttribute = null;
		vm.parentTextElementClassNameAttribute = null;
		vm.parentComponent = null;
		vm.parentComponentId = null;
		vm.elementModelName = null;
		vm.elementModelIndex = null;
		vm.parentNgRepeat = null;
		vm.parentRepeatIndex = null;
		vm.applyStylesToSiblingTextElements = false;
		vm.elementClass = elementClass;
		vm.elementStyle = elementStyle;
		vm.elementDataOriginal;
		vm.elementData = {
			'name': 'Text Element',
			'type': 'ssb-element-text',
			'title': 'Text Element',
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
			'hideOnlyMobile': false,
			'showOnlyMobile': false,
			'visibility': true,
			'spacing': {},
			'isGrid': false
		};
		vm.showHide = showHide;
		vm.verticalAlignment = verticalAlignment;
		vm.screenLayout = screenLayout();
		function verticalAlignment(){
			if (vm && vm.elementData) {
				if(vm.elementData.vertical_align){
					return "v-dispaly-"+vm.elementData.vertical_align+"-align";
				} else{
					return "v-dispaly-auto-align";
				}
			}
		}
		function showHideClass() {
			var classString = "";
			if (vm.elementData) {
				if (vm.elementData.hideOnlyMobile) {
					classString += " ssb-text-o-desktop";
				}
				if (vm.elementData.showOnlyMobile) {
					classString += " ssb-text-o-moblie";
				}
			}
			return classString;
		}

		function showHide() {
			return vm.elementData.visibility !== false;
		}

		function applyStyles() {
			pvm = {};

			if (vm.parentComponent && vm.parentComponent.scope()) {
				pvm.component = vm.parentComponent.scope().vm.component;
				vm.elementData = getStylesForModel();
			}

		}

		function setupActiveElementWatch() {

			//get functions from parent text component
			while ((!pScope.vm || pScope.vm && !pScope.vm.uiState) && limit > 0) {
				pScope = pScope.$parent;
				limit--;
			}
			pvm = pScope.vm;
			$scope.pvm = pvm;

			if (pvm) {
				$scope.$watch('pvm.uiState.activeElement', function (activeElement) {
					if (activeElement) {
						if (activeElement.id === vm.elementData.id) {
							if (!angular.equals(vm.elementDataOriginal, activeElement)) {
								console.log('changed activeElement.id:', activeElement.id);
								vm.elementData = activeElement;
								updateSettingsForModel();
							}
						}
					}
				}, true);
			}

			return pvm;

		}


		/*function getTempUUID() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
					v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}*/

		function setupElementForEditing() {

			var data = {},
				editingEnabled = setupActiveElementWatch();

			if (!editingEnabled) {
				return false;
			}

			//layout reflow hack
			if (vm.parentSection.hasClass('ssb-page-section-layout-hero')) {
				$timeout(function () {
					// vm.element.get(0).style.webkitTransform = vm.element.get(0).style.webkitTransform;
					var el = vm.element[0];
					el.style.display = 'none';
					el.offsetHeight;
					el.style.display = '';
					console.log('did it');
				}, 4000);
			}

			vm.elementId = 'text-element_' + vm.parentSectionId + "-" + vm.parentComponentId + "-" + vm.elementModelName;

			if (vm.isNestedModelProp) {
				if (vm.parentNgRepeat.length || vm.parentRepeatIndex.length) {
					if (vm.parentRepeatIndex.length) {
						vm.elementModelIndex = vm.parentRepeatIndex.attr("data-repeat-index-id");
					} else if (vm.parentNgRepeat.hasClass('thumbnail-image-slider-collection')) {
						var parentIndex = vm.parentNgRepeat.scope().$parent.$index,
							index = vm.parentNgRepeat.scope().$index,
							w = angular.element($window),
							winWidth = w.width(),
							number_of_arr = 4;
						if (winWidth < 768) {
							number_of_arr = 1;
						}
						vm.elementModelIndex = parentIndex > 0 ? (parentIndex * number_of_arr + index) : index;

					} else {
						vm.elementModelIndex = vm.parentNgRepeat.scope().$index;
					}
				}

				if (vm.elementModelIndex !== undefined && vm.elementModelIndex !== null) {

					vm.elementId = vm.elementId + "-i" + vm.elementModelIndex;

				}

			}

			data = {
				id: vm.elementId,
				_id: vm.elementId,
				anchor: vm.elementId
			};

			if (vm.parentTextElementClassNameAttribute && vm.parentTextElementClassNameAttribute === 'btn-form-text') {
				data.disableTextSpacing = true;
			}

			//extend with id values
			vm.elementData = angular.extend(vm.elementData, data);

			//extend with existing style values
			vm.elementData = angular.extend(vm.elementData, getStylesForModel());

			//save original state
			vm.elementDataOriginal = angular.copy(vm.elementData);

			return vm.elementData;

		}

		function updateSettingsForModel() {

			setStylesForModel();
            console.warn('After setStyles:', vm.elementData);
		}

		function getStylesForModel() {

			var data = {};

			if (pvm.component.elementStyles && pvm.component.elementStyles[vm.elementModelName]) {
				if (!vm.isNestedModelProp) {

					data = pvm.component.elementStyles[vm.elementModelName];

				} else {

					if (vm.parentNgRepeat.length || vm.parentRepeatIndex.length) {

						if (vm.parentRepeatIndex.length) {
							vm.elementModelIndex = vm.parentRepeatIndex.attr("data-repeat-index-id");
						} else if (vm.parentNgRepeat.hasClass('thumbnail-image-slider-collection')) {
							var parentIndex = vm.parentNgRepeat.scope().$parent.$index,
								index = vm.parentNgRepeat.scope().$index,
								w = angular.element($window),
								winWidth = w.width(),
								number_of_arr = 4;
							if (winWidth < 768) {
								number_of_arr = 1;
							}
							vm.elementModelIndex = parentIndex > 0 ? (parentIndex * number_of_arr + index) : index;

						} else {
							vm.elementModelIndex = vm.parentNgRepeat.scope().$index;
						}

					}

					if (vm.elementModelIndex !== undefined && vm.elementModelIndex !== null) {

						data = pvm.component.elementStyles[vm.elementModelName][vm.elementModelIndex];

					}else{
						if(pvm.component.elementStyles[vm.elementModelName]){ 
							var sectionIndex=vm.element.parents(".ssb-page-section").attr("index");
							var settingData=pvm.component.elementStyles[vm.elementModelName][sectionIndex];
							if(settingData){
								data = settingData;
							}
						} 
					}

				}

			}
            if(data && data.bg && data.bg.img && data.bg.img.url === null) {
                data.bg.img.url = '';
            }
			return data;

		}

		function setStylesForModel() {

			pvm.component.elementStyles = pvm.component.elementStyles || {};

			if (!vm.isNestedModelProp) {

				pvm.component.elementStyles[vm.elementModelName] = vm.elementData;

			} else { // i.e. "testimonial.title" array nested prop

				pvm.component.elementStyles[vm.elementModelName] = pvm.component.elementStyles[vm.elementModelName] || {};

				if (vm.parentNgRepeat.length || vm.parentRepeatIndex.length) {

					if (vm.parentRepeatIndex.length) {
						vm.elementModelIndex = vm.parentRepeatIndex.attr("data-repeat-index-id");
					} else if (vm.parentNgRepeat.hasClass('thumbnail-image-slider-collection')) {
						var parentIndex = vm.parentNgRepeat.scope().$parent.$index,
							index = vm.parentNgRepeat.scope().$index,
							w = angular.element($window),
							winWidth = w.width(),
							number_of_arr = 4;
						if (winWidth < 768) {
							number_of_arr = 1;
						}
						vm.elementModelIndex = parentIndex > 0 ? (parentIndex * number_of_arr + index) : index;

					} else {
						vm.elementModelIndex = vm.parentNgRepeat.scope().$index;
					}
				}

				if (vm.elementModelIndex !== undefined && vm.elementModelIndex !== null) {

					pvm.component.elementStyles[vm.elementModelName][vm.elementModelIndex] = vm.elementData;

				} else {
					return new Error('can\'t find parent ng-repeat');
				}

			}

			return pvm.component.elementStyles;

		}

		function getParentNgRepeat() {
			var parentNgRepeat = vm.element.parents('[data-ng-repeat]:first');

			if (!parentNgRepeat.length) {
				//if(!vm.element.parents('[ng-repeat]:first').hasClass("ssb-page-section"))
				parentNgRepeat = vm.element.parents('[ng-repeat]:first');
			}

			return parentNgRepeat;
		}


		function getParentRepeatIndex() {
			var parentRepeatIndex = vm.element.closest("[data-repeat-index-id]");

			return parentRepeatIndex;
		}

		//TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components
		function elementClass() {
			if (vm.elementData && vm.elementData.type) {
				var classObj = {};
				classObj['ssb-element'] = true;
				classObj[vm.elementData.type] = true;
				// classObj['ssb-hide-during-load'] = !buildDataObjFromHTMLDone;
				return classObj;
			} else {
				return '';
			}
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
		function elementStyle(isEdit) {
			if (vm.elementData && vm.elementData.type) {
				var styleString = ' ',
					component = vm.elementData;

				var _layout = vm.screenLayout;
				var _style = "";
				switch (_layout) {
		            case 0:
		                if (component && component.spacing) {
							if (component.spacing.ptxs || component.spacing.ptsm || component.spacing.ptmd || component.spacing.pt) {
								_style = (component.spacing.ptxs || component.spacing.ptsm || component.spacing.ptmd || component.spacing.pt);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-top: ' + _style + ';';
								}
								else{
									styleString += 'padding-top: ' + _style + 'px;';
								}
							}

							if (component.spacing.pbxs || component.spacing.pbsm || component.spacing.pbmd || component.spacing.pb) {
								_style = (component.spacing.pbxs || component.spacing.pbsm || component.spacing.pbmd || component.spacing.pb);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-bottom: ' + _style + ';';
								}
								else{
									styleString += 'padding-bottom: ' + _style + 'px;';
								}
							}

							if (component.spacing.plxs || component.spacing.plsm || component.spacing.plmd || component.spacing.pl) {
								_style = (component.spacing.plxs || component.spacing.plsm || component.spacing.plmd || component.spacing.pl);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-left: ' + _style + ';';
								}
								else{
									styleString += 'padding-left: ' + _style + 'px;';
								}
							}

							if (component.spacing.prxs || component.spacing.prsm || component.spacing.prmd || component.spacing.pr) {
								_style = (component.spacing.prxs || component.spacing.prsm || component.spacing.prmd || component.spacing.pr);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-right: ' + _style + ';';
								}
								else{
									styleString += 'padding-right: ' + _style + 'px;';
								}
							}

							if (component.spacing.mtxs || component.spacing.mtsm || component.spacing.mtmd || component.spacing.mt) {
								_style = (component.spacing.mtxs || component.spacing.mtsm || component.spacing.mtmd || component.spacing.mt);
								if(_style.indexOf('%') > 0){
									styleString += 'margin-top: ' + _style + ';';
								}
								else{
									styleString += 'margin-top: ' + _style + 'px;';
								}
							}

							if (component.spacing.mbxs || component.spacing.mbsm || component.spacing.mbmd || component.spacing.mb) {
								_style = (component.spacing.mbxs || component.spacing.mbsm || component.spacing.mbmd || component.spacing.mb);
								if(_style.indexOf('%') > 0){
									styleString += 'margin-bottom: ' + _style + ';';
								}
								else{
									styleString += 'margin-bottom: ' + _style + 'px;';
								}
							}

							if (component.spacing.mlxs || component.spacing.mlsm || component.spacing.mlmd || component.spacing.ml) {
								var _ml = component.spacing.mlxs || component.spacing.mlsm || component.spacing.mlmd || component.spacing.ml;
								if(_ml.indexOf('%') > 0){
									_style = "";
								}
								else{
									_style = "px";
								}
								styleString += _ml == 'auto' ? 'margin-left: ' + _ml + ';float: none;' : 'margin-left: ' + _ml  + _style + ';';
							}

							if (component.spacing.mrxs || component.spacing.mrsm || component.spacing.mrmd || component.spacing.mr) {
								var _mr = component.spacing.mrxs || component.spacing.mrsm || component.spacing.mrmd || component.spacing.mr;
								if(_mr.indexOf('%') > 0){
									_style = "";
								}
								else{
									_style = "px";
								}
								styleString += (_mr == 'auto') ? 'margin-right: ' + _mr + ';float: none;' : 'margin-right: ' + _mr  + _style + ';';
							}

							if (component.spacing.mwxs || component.spacing.mwsm || component.spacing.mwmd || component.spacing.mw) {
								var _mw = component.spacing.mwxs || component.spacing.mwsm || component.spacing.mwmd || component.spacing.mw;
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

							}

							if (component.spacing.lineHeight) {
								styleString += 'line-height: ' + component.spacing.lineHeight;
							}

						}
		                break;
		            case 1:
		                if (component && component.spacing) {
							if (component.spacing.ptsm || component.spacing.ptmd || component.spacing.pt) {
								_style = (component.spacing.ptsm || component.spacing.ptmd || component.spacing.pt);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-top: ' + _style + ';';
								}
								else{
									styleString += 'padding-top: ' + _style + 'px;';
								}
							}

							if (component.spacing.pbsm || component.spacing.pbmd || component.spacing.pb) {
								_style = (component.spacing.pbsm || component.spacing.pbmd || component.spacing.pb);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-bottom: ' + _style + ';';
								}
								else{
									styleString += 'padding-bottom: ' + _style + 'px;';
								}
							}

							if (component.spacing.plsm || component.spacing.plmd || component.spacing.pl) {
								_style = (component.spacing.plsm || component.spacing.plmd || component.spacing.pl);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-left: ' + _style + ';';
								}
								else{
									styleString += 'padding-left: ' + _style + 'px;';
								}
							}

							if (component.spacing.prsm || component.spacing.prmd || component.spacing.pr) {
								_style = (component.spacing.prsm || component.spacing.prmd || component.spacing.pr);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-right: ' + _style + ';';
								}
								else{
									styleString += 'padding-right: ' + _style + 'px;';
								}
							}

							if (component.spacing.mtsm || component.spacing.mtmd || component.spacing.mt) {
								_style = (component.spacing.mtsm || component.spacing.mtmd || component.spacing.mt);
								if(_style.indexOf('%') > 0){
									styleString += 'margin-top: ' + _style + ';';
								}
								else{
									styleString += 'margin-top: ' + _style + 'px;';
								}
							}

							if (component.spacing.mbsm || component.spacing.mbmd || component.spacing.mb) {
								_style = (component.spacing.mbsm || component.spacing.mbmd || component.spacing.mb);
								if(_style.indexOf('%') > 0){
									styleString += 'margin-bottom: ' + _style + ';';
								}
								else{
									styleString += 'margin-bottom: ' + _style + 'px;';
								}
							}

							if (component.spacing.mlsm || component.spacing.mlmd || component.spacing.ml) {
								var _ml = component.spacing.mlsm || component.spacing.mlmd || component.spacing.ml;
								if(_ml.indexOf('%') > 0){
									_style = "";
								}
								else{
									_style = "px";
								}
								styleString += _ml == 'auto' ? 'margin-left: ' + _ml + ';float: none;' : 'margin-left: ' +  + _style + ';';
							}

							if (component.spacing.mrsm || component.spacing.mrmd || component.spacing.mr) {
								var _mr = component.spacing.mrsm || component.spacing.mrmd || component.spacing.mr;
								if(_mr.indexOf('%') > 0){
									_style = "";
								}
								else{
									_style = "px";
								}
								styleString += (_mr == 'auto') ? 'margin-right: ' + _mr + ';float: none;' : 'margin-right: ' + _mr  + _style + ';';
							}

							if (component.spacing.mwsm || component.spacing.mwmd || component.spacing.mw) {
								var _mw = component.spacing.mwsm || component.spacing.mwmd || component.spacing.mw;
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
							}

							if (component.spacing.lineHeight) {
								styleString += 'line-height: ' + component.spacing.lineHeight;
							}

						}
		                break;
		            case 2:
		                if (component && component.spacing) {
							if (component.spacing.ptmd || component.spacing.pt) {
								_style = (component.spacing.ptmd || component.spacing.pt);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-top: ' + _style + ';';
								}
								else{
									styleString += 'padding-top: ' + _style + 'px;';
								}
							}

							if (component.spacing.pbmd || component.spacing.pb) {
								_style = (component.spacing.pbmd || component.spacing.pb);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-bottom: ' + _style + ';';
								}
								else{
									styleString += 'padding-bottom: ' + _style + 'px;';
								}
							}

							if (component.spacing.plmd || component.spacing.pl) {
								_style = (component.spacing.plmd || component.spacing.pl);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-left: ' + _style + ';';
								}
								else{
									styleString += 'padding-left: ' + _style + 'px;';
								}
							}

							if (component.spacing.prmd || component.spacing.pr) {
								_style = (component.spacing.prmd || component.spacing.pr);
								if(_style.indexOf('%') > 0){
									styleString += 'padding-right: ' + _style + ';';
								}
								else{
									styleString += 'padding-right: ' + _style + 'px;';
								}
							}

							if (component.spacing.mtmd || component.spacing.mt) {
								_style = (component.spacing.mtmd || component.spacing.mt);
								if(_style.indexOf('%') > 0){
									styleString += 'margin-top: ' + _style + ';';
								}
								else{
									styleString += 'margin-top: ' + _style + 'px;';
								}
							}

							if (component.spacing.mbmd || component.spacing.mb) {
								_style = (component.spacing.mbmd || component.spacing.mb);
								if(_style.indexOf('%') > 0){
									styleString += 'margin-bottom: ' + _style + ';';
								}
								else{
									styleString += 'margin-bottom: ' + _style + 'px;';
								}
							}

							if (component.spacing.mlxs || component.spacing.mlsm || component.spacing.mlmd || component.spacing.ml) {
								var _ml = component.spacing.mlmd || component.spacing.ml;
								if(_ml.indexOf('%') > 0){
									_style = "";
								}
								else{
									_style = "px";
								}styleString += _ml == 'auto' ? 'margin-left: ' + _ml + ';float: none;' : 'margin-left: ' + _ml  + _style + ';';
							}

							if (component.spacing.mrmd || component.spacing.mr) {
								var _mr = component.spacing.mrmd || component.spacing.mr;
								if(_mr.indexOf('%') > 0){
									_style = "";
								}
								else{
									_style = "px";
								}
								styleString += (_mr == 'auto') ? 'margin-right: ' + _mr + ';float: none;' : 'margin-right: ' + _mr  + _style + ';';
							}

							if (component.spacing.mwmd || component.spacing.mw) {
                               //apply max-width base on the px or %
                                 var _mw = component.spacing.mwmd || component.spacing.mw;
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
							}

							if (component.spacing.lineHeight) {
								styleString += 'line-height: ' + component.spacing.lineHeight;
							}

						}
		                break;
		            default:
		            	if (component && component.spacing) {
							if (component.spacing.pt) {

								if(component.spacing.pt.indexOf("%") > -1) {
									styleString += 'padding-top: ' + component.spacing.pt + ';';
								}else{
									styleString += 'padding-top: ' + component.spacing.pt + 'px;';
								}


							}

							if (component.spacing.pb) {
								if(component.spacing.pb.indexOf("%") > -1) {
									styleString += 'padding-bottom: ' + component.spacing.pb + ';';
								}else{
									styleString += 'padding-bottom: ' + component.spacing.pb + 'px;';
								}


							}

							if (component.spacing.pl) {
								if(component.spacing.pl.indexOf("%") > -1) {
									styleString += 'padding-left: ' + component.spacing.pl + ';';
								}else{
									styleString += 'padding-left: ' + component.spacing.pl + 'px;';
								}


							}

							if (component.spacing.pr) {
								if(component.spacing.pr.indexOf("%") > -1) {
									styleString += 'padding-right: ' + component.spacing.pr + ';';
								}else{
									styleString += 'padding-right: ' + component.spacing.pr + 'px;';
								}


							}

							if (component.spacing.mt) {

								if(component.spacing.mt.indexOf("%") > -1) {
									styleString += 'margin-top: ' + component.spacing.mt + ';';
								}else{
									styleString += 'margin-top: ' + component.spacing.mt + 'px;';
								}
							}

							if (component.spacing.mb) {

								if(component.spacing.mb.indexOf("%") > -1) {
									styleString += 'margin-bottom: ' + component.spacing.mb + ';';
								}else{
									styleString += 'margin-bottom: ' + component.spacing.mb + 'px;';
								}


							}

							if (component.spacing.ml) {
								var type;
								(component.spacing.ml.indexOf("%") > -1) ? type = "" : type = "px";
								styleString += component.spacing.ml == 'auto' ? 'margin-left: ' + component.spacing.ml + ';float: none;' : 'margin-left: ' + component.spacing.ml + type + ';';
							}

							if (component.spacing.mr) {
								var spacing_type;
								(component.spacing.mr.indexOf("%") > -1) ? spacing_type = "" : spacing_type = "px";
								styleString += (component.spacing.mr == 'auto') ? 'margin-right: ' + component.spacing.mr + ';float: none;' : 'margin-right: ' + component.spacing.mr + spacing_type +';';
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
	        	}

				if (component.txtcolor) {
					styleString += 'color: ' + component.txtcolor + ';';
				}

				if (!isEdit && component.visibility === false) {
					styleString += 'display: none!important;';
				}

				if (component.bg) {
					if (component.bg.color) {
						styleString += 'background-color: ' + component.bg.color + ';';
					}

					if (component.bg.img && component.bg.img.show && component.bg.img.url !== '') {
						styleString += 'background-image: url("' + component.bg.img.url + '");';
					}

				}

				if (component.border && component.border.show && component.border.color) {
					styleString += 'border-color: ' + component.border.color + ';';
					styleString += 'border-width: ' + component.border.width + 'px;';
					styleString += 'border-style: ' + component.border.style + ';';
					styleString += 'border-radius: ' + component.border.radius + '%;';
				}
				applyTickerStyle(component);
				applyVerticalAlignmentSetting(component);
				return styleString;

			} else {

				return '';

			}
		}
		function applyVerticalAlignmentSetting(component){
			if(vm.element && component){
				vm.elementData.isGrid = vm.element.children(".admin_grid_view").length > 0;
			}
		}
		function applyTickerSpeedClass(component){
			var element = vm.element.parent(".ticker");
			var classString = 'ticker ticker-speed-' + component.tickerSpeed;
			element.attr("class", classString);
		}
		function applyTickerStyle(component){
			if(vm.element && component){
				if(component.allowTicker && !vm.element.hasClass("ssb-active-component")){
					if(!vm.element.parent().hasClass("ticker")){
						vm.element.wrapAll('<div id="tickerwrap" class="tickerwrap"></div>');
						vm.element.wrapAll('<div id="ticker" class="ticker"></div>');
					}
					if(component.tickerSpeed)
						applyTickerSpeedClass(component);
				}else{
					if(vm.element.parent().hasClass("ticker")){
						vm.element.unwrap();
						vm.element.unwrap();
					}
				}

			}
		}
		function init(element) {

			console.info('ssb-text-settings directive init...');

			vm.element = element;

			vm.parentTextElement = vm.element.parent();

			vm.parentTextElementModelAttribute = vm.parentTextElement.attr('ng-model');

			vm.parentTextElementClassNameAttribute = vm.parentTextElement.attr('class-name');

			vm.elementModelName = vm.parentTextElementModelAttribute.replace('component.', '').replace('vm.', '').replace(/\./g, '/');

			vm.isNestedModelProp = vm.applyStylesToSiblingTextElements ? false : vm.elementModelName.indexOf('/') !== -1;

			vm.parentComponent = vm.element.closest('.ssb-component');

			vm.parentNgRepeat = getParentNgRepeat();

			vm.parentRepeatIndex = getParentRepeatIndex();

			if ($attrs.isEdit) {

				if (!vm.element.closest('indi-email-builder').length) {

					vm.parentComponentId = vm.parentComponent.attr('id');

					vm.parentSection = vm.element.closest('.ssb-section-layout');

					vm.parentSectionId = vm.parentSection.attr('id');

					setupElementForEditing();

				} else {

					console.debug('Text Settings should not be available in Email Editor');

				}

			} else {

				//just set the style props on the frontend

				applyStyles();
			}

			if(!$attrs.isEdit){
				//$timeout(function() {
					vm.elementStyleVar = elementStyle(false);
					vm.showHideClassVar = showHideClass();
					vm.verticalAlignmentVar = verticalAlignment();
				//}, 100);
				
			}
		}

		angular.element($window).bind('resize', function () {			
			vm.screenLayout = screenLayout();
			if (!$attrs.isEdit){
				vm.elementStyleVar = elementStyle(false);
			}
		});

	}


})();
