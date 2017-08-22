(function(){

app.controller('SiteBuilderTextSettingsController', ssbTextSettingsController);

ssbTextSettingsController.$inject = ['$rootScope', '$scope', '$attrs', '$filter', '$timeout', '$compile', '$window'];
/* @ngInject */
function ssbTextSettingsController($rootScope, $scope, $attrs, $filter, $timeout, $compile, $window) {

    var vm = this;
    var pvm = null;
    var limit = 10;
    var pScope = $scope.$parent;

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
        'hideOnlyMobile':false,
        'showOnlyMobile':false,
        'visibility': true,
        'spacing': {}
    };
    vm.showHide=showHide;
    function showHideClass(){
        var classString="";
        if(vm.elementData){
            if(vm.elementData.hideOnlyMobile){
                classString += " ssb-text-o-desktop" ;
            }
            if(vm.elementData.showOnlyMobile){
                classString += " ssb-text-o-moblie";
            }
        }
        return classString;
    }
    function showHide(){
         return vm.elementData.visibility!==false;
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
            var pvmActiveElement = $scope.$watch('pvm.uiState.activeElement', function(activeElement) {
                if (activeElement) {
                    if (activeElement.id === vm.elementData.id) {
                        if (!angular.equals(vm.elementDataOriginal, activeElement)) {
                            console.log('changed activeElement.id:', activeElement.id)
                            vm.elementData = activeElement;
                            updateSettingsForModel();
                        }
                    }
                }
            }, true);
        }

        return pvm;

    }


    function getTempUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        })
    }

    function setupElementForEditing() {

        var data = {};

        var editingEnabled = setupActiveElementWatch();

        if (!editingEnabled) {
            return false;
        }

        //layout reflow hack
        if (vm.parentSection.hasClass('ssb-page-section-layout-hero')) {
            $timeout(function() {
                // vm.element.get(0).style.webkitTransform = vm.element.get(0).style.webkitTransform;
                var el = vm.element[0];
                el.style.display='none';
                el.offsetHeight;
                el.style.display='';
                console.log('did it')
            }, 4000);
        }

        vm.elementId = 'text-element_' + vm.parentSectionId + "-" + vm.parentComponentId + "-" + vm.elementModelName;

        if (vm.isNestedModelProp) {
            if (vm.parentNgRepeat.length || vm.parentRepeatIndex.length) {
                if(vm.parentRepeatIndex.length){
                    vm.elementModelIndex = vm.parentRepeatIndex.attr("data-repeat-index-id");
                }
                else if(vm.parentNgRepeat.hasClass('thumbnail-image-slider-collection')){
                    var parentIndex = vm.parentNgRepeat.scope().$parent.$index;
                    var index = vm.parentNgRepeat.scope().$index;
                    var w = angular.element($window);
                    var winWidth = w.width();
                    var number_of_arr = 4;
                    if (winWidth < 768) {
                        number_of_arr = 1;
                    }
                    vm.elementModelIndex = parentIndex > 0 ? (parentIndex * number_of_arr + index) : index;
                     
                }else{
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

        if(vm.parentTextElementClassNameAttribute && vm.parentTextElementClassNameAttribute === 'btn-form-text'){
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

    }

    function getStylesForModel() {

        var data = {};

        if (pvm.component.elementStyles && pvm.component.elementStyles[vm.elementModelName]) {
            if (!vm.isNestedModelProp) {

                data = pvm.component.elementStyles[vm.elementModelName];

            } else {

                if (vm.parentNgRepeat.length  || vm.parentRepeatIndex.length) {

                    if(vm.parentRepeatIndex.length){
                        vm.elementModelIndex = vm.parentRepeatIndex.attr("data-repeat-index-id");
                    }

                    else if(vm.parentNgRepeat.hasClass('thumbnail-image-slider-collection')){
                        var parentIndex = vm.parentNgRepeat.scope().$parent.$index;
                        var index = vm.parentNgRepeat.scope().$index;
                        var w = angular.element($window);
                        var winWidth = w.width();
                        var number_of_arr = 4;
                        if (winWidth < 768) {
                            number_of_arr = 1;
                        }
                        vm.elementModelIndex = parentIndex > 0 ? (parentIndex * number_of_arr + index) : index;
                     
                    }else{
                        vm.elementModelIndex = vm.parentNgRepeat.scope().$index;
                    }

                }

                if (vm.elementModelIndex !== undefined && vm.elementModelIndex !== null) {

                    data = pvm.component.elementStyles[vm.elementModelName][vm.elementModelIndex];

                }

            }

        }

        return data;

    }

    function setStylesForModel() {

        pvm.component.elementStyles = pvm.component.elementStyles || {};

        if (!vm.isNestedModelProp) {

            pvm.component.elementStyles[vm.elementModelName] = vm.elementData;

        } else { // i.e. "testimonial.title" array nested prop

            pvm.component.elementStyles[vm.elementModelName] = pvm.component.elementStyles[vm.elementModelName] || {};

            if (vm.parentNgRepeat.length  || vm.parentRepeatIndex.length) {

                if(vm.parentRepeatIndex.length){
                    vm.elementModelIndex = vm.parentRepeatIndex.attr("data-repeat-index-id");
                }

                else if(vm.parentNgRepeat.hasClass('thumbnail-image-slider-collection')){
                    var parentIndex = vm.parentNgRepeat.scope().$parent.$index;
                    var index = vm.parentNgRepeat.scope().$index;
                    var w = angular.element($window);
                    var winWidth = w.width();
                    var number_of_arr = 4;
                    if (winWidth < 768) {
                        number_of_arr = 1;
                    }
                    vm.elementModelIndex = parentIndex > 0 ? (parentIndex * number_of_arr + index) : index;
                     
                }else{
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


    function getParentRepeatIndex () {
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

            return ''

        }

    }

    function elementStyle(isEdit) {
        if (vm.elementData && vm.elementData.type) {
            var styleString = ' ';
            var component = vm.elementData;

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
                    styleString += 'margin-bottom: ' + component.spacing.mb + 'px;';
                }

                if (component.spacing.ml) {
                    styleString += component.spacing.ml == 'auto' ? 'margin-left: ' + component.spacing.ml + ';float: none;' : 'margin-left: ' + component.spacing.ml + 'px;';
                }

                if (component.spacing.mr) {
                    styleString += (component.spacing.mr == 'auto') ? 'margin-right: ' + component.spacing.mr + ';float: none;' : 'margin-right: ' + component.spacing.mr + 'px;';
                }

                if (component.spacing.mw) {
                    styleString += (component.spacing.mw == '100%') ?
                    'max-width: ' + component.spacing.mw + ';' :
                    'max-width: ' + component.spacing.mw  + 'px;margin:0 auto!important;';
                }

                if (component.spacing.lineHeight) {
                styleString += 'line-height: ' + component.spacing.lineHeight;
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

            if(component.border && component.border.show && component.border.color){
                styleString += 'border-color: ' + component.border.color + ';';
                styleString += 'border-width: ' + component.border.width + 'px;';
                styleString += 'border-style: ' + component.border.style + ';';
                styleString += 'border-radius: ' + component.border.radius + '%;';
            }

            return styleString;

        } else {

            return '';

        }
    }

    function init(element) {

        console.info('ssb-text-settings directive init...');

        vm.element = element;

        vm.parentTextElement = vm.element.parent();

        vm.parentTextElementModelAttribute = vm.parentTextElement.attr('ng-model');

        vm.parentTextElementClassNameAttribute = vm.parentTextElement.attr('class-name');

        vm.elementModelName = vm.parentTextElementModelAttribute.replace('component.', '').replace('vm.', '').replace(/\./g,'/');

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

    }

}


})();
