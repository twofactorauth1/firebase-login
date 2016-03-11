(function(){

app.controller('SiteBuilderThemeBtnController', ssbThemeBtnController);

ssbThemeBtnController.$inject = ['$rootScope', '$scope', '$attrs', '$filter', '$transclude', '$sce', '$timeout', '$compile','SimpleSiteBuilderService'];
/* @ngInject */
function ssbThemeBtnController($rootScope, $scope, $attrs, $filter, $transclude, $sce, $timeout, $compile, SimpleSiteBuilderService) {

    var vm = this;
    var elementId = '';
    var parentComponent;
    var parentEditor;
    var parentEditorId;
    var buildDataObjFromHTMLDone = false;

    vm.init = init;
    vm.elementClass = elementClass;
    vm.elementStyle = elementStyle;
    vm.elementDataOriginal;
    vm.elementData = {
        'name': 'Button',
        'type': 'ssb-element-button',
        'title': 'Button',
        'version': 1,
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
        'spacing': {}
    };

    //get functions from parent text component
    var limit = 10;
    var pScope = $scope.$parent;
    while ((!pScope.vm || pScope.vm && !pScope.vm.uiState) && limit > 0) {
      pScope = pScope.$parent;
      limit--;
    }
    var pvm = pScope.vm;
    $scope.pvm = pvm;

    $rootScope.$on('$ssbElementsChanged', function(event, componentId, editorId) {

        if (parentEditorId && parentEditorId === editorId && parentComponent && componentId === parentComponent.attr('id')) {
            console.log('$ssbElementsChanged');
            positionEditControl();
        }

    });

    var watchElementData = $scope.$watch('vm.elementData', updateTextEditor, true);

    var pvmStateLoading = $scope.$watch('pvm.state.saveLoading', function() {
        if (parentComponent && pvm && pvm.state.saveLoading) {
            var el = SimpleSiteBuilderService.getCompiledElement(parentComponent.attr('id'), parentEditorId, elementId)

            if (el) {
                el.removeClass('ssb-theme-btn-active-element ng-scope');
                el.removeAttr('data-compiled');
            }

            updateTextEditor(true);
        }
    });



    function buildDataObjFromHTML() {
        var el = SimpleSiteBuilderService.getCompiledElement(parentComponent.attr('id'), parentEditorId, elementId);
        if(el){
            var style = el[0].style;
            var data = {
                id: 'button-element_' + elementId,
                _id: 'button-element_' + elementId,
                anchor: 'button-element_' + elementId,
                'bg': {},
                'spacing': {}
            };
            var bgcolor = style.backgroundColor;
            var txtcolor = style.color;
            var visibility = style.display !== 'none';
            var spacingPT = style.paddingTop.replace('px', '');
            var spacingPL = style.paddingLeft.replace('px', '');
            var spacingPR = style.paddingRight.replace('px', '');
            var spacingPB = style.paddingBottom.replace('px', '');
            var spacingMT = style.marginTop.replace('px', '');
            var spacingML = style.marginLeft.replace('px', '');
            var spacingMR = style.marginRight.replace('px', '');
            var spacingMB = style.marginBottom.replace('px', '');
            var spacingMW = style.maxWidth.replace('px', '');

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

            angular.extend(vm.elementData, data); 
        }        

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
        var classObj = {};
       // var el = SimpleSiteBuilderService.getCompiledElement(parentComponent.attr('id'), parentEditorId, elementId);

        classObj['ssb-' + vm.elementData.type] = true;

        return classObj;
    }

    function elementStyle() {
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

        if (component.visibility === false) {
            styleString += 'display: none!important;';
        }

        if (component.bg) {
            if (component.bg.color) {
                styleString += 'background-color: ' + component.bg.color + ';';
            }

            if (component.bg.img && component.bg.img.show && component.bg.img.url !== '') {
                styleString += 'background-image: url("' + component.bg.img.url + '")';
            }

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

    function showEditControl(e) {

        //prevent other handling
        e.stopPropagation();

        //close section panel
        // pvm.uiState.openSidebarSectionPanel = null;
        pvm.uiState.showSectionPanel = false;
        pvm.uiState.activeSectionIndex = null;
        pvm.uiState.activeComponentIndex = null;

        //get element
        var el = SimpleSiteBuilderService.getCompiledElement(parentComponent.attr('id'), parentEditorId, elementId);

        $timeout(function() {
            // un-highlight other compiled elements in this component
            parentComponent.find('[data-compiled]').removeClass('ssb-theme-btn-active-element');

            // highlight clicked element
            el.addClass('ssb-theme-btn-active-element');

            // hide other element edit controls
            $('.ssb-edit-control[data-compiled-control-id]').removeClass('on');
        });

        // if edit control hasn't been created, create it and compile it
        if (!SimpleSiteBuilderService.getCompiledElementEditControl(parentComponent.attr('id'), parentEditorId, elementId)) {
            $scope.component = { title: 'Button_'+elementId, type: 'Button' }; //TODO: make generic/configurable
            var template = '<ssb-edit-control ' +
                                'data-compiled-control-id="control_' + elementId + '" ' +
                                'class="ssb-edit-control ssb-edit-control-component ssb-edit-control-component-btn on" ' +
                                'component="component" ' +
                                'state="pvm.state" ' +
                                'ui-state="pvm.uiState" ' +
                                'section-index="null" ' +
                                'component-index="null">' +
                            '</ssb-edit-control>';
            $compile(template)($scope, compiledEditControl);

        // else set active element (for contextual menu) and position the edit control and make visible
        } else {
            $timeout(function() {
                setActiveElementId();
                positionEditControl();
                $('.ssb-edit-control[data-compiled-control-id="control_' + elementId + '"]').addClass('on');
            });
        }

    }

    function hideEditControl(e) {
        $timeout(function() {
            $('.ssb-edit-control[data-compiled-control-id="control_' + elementId + '"]').removeClass('on');
        });
    }

    function compiledEditControl(cloned, scope) {
        var newEl;
        $timeout(function() {
            cloned.prependTo(parentComponent.parent());
            newEl = $('.ssb-edit-control[data-compiled-control-id="control_' + elementId + '"]')
            newEl.addClass('on');
            SimpleSiteBuilderService.addCompiledElementEditControl(parentComponent.attr('id'), parentEditorId, elementId, newEl);
            setActiveElementId();
            positionEditControl();
        });
    }

    function positionEditControl() {
        var top = 0;
        var left = 0;
        var topbarHeight = 125;
        var sidebarWidth = 140;
        var scrollTop = document.querySelector('.ssb-site-builder-container').scrollTop;
        var topOffset = 35;
        var leftOffset = 35;
        var compiledEl = SimpleSiteBuilderService.getCompiledElement(parentComponent.attr('id'), parentEditorId, elementId);
        var compiledEditControl = SimpleSiteBuilderService.getCompiledElementEditControl(parentComponent.attr('id'), parentEditorId, elementId);

        if (compiledEl) {
            top = compiledEl[0].getBoundingClientRect().top - topOffset - topbarHeight + scrollTop;
            left = compiledEl[0].getBoundingClientRect().left - leftOffset - sidebarWidth;
        }

        if (compiledEditControl) {
            compiledEditControl.css({ top: top, left: left });
        }

    }

    function clearActiveElement(e) {
        var isEditControl = $(e.target).parents('[data-compiled-control-id], [data-compiled]').length > 0;
        if (!isEditControl) {
            pvm.uiState.activeElement = {};
            angular.element('[data-compiled-control-id], [data-compiled]').removeClass('on ssb-theme-btn-active-element');
        }
    }

    function init(element) {

        console.info('ssb-theme-btn directive init...');

        $timeout(function() {

            if (pvm && element.data('compiled')) {

                elementId = element.data('compiled');

                parentComponent = element.closest('[component]');

                parentEditor = element.closest('.editable');

                parentEditorId = parentEditor.froalaEditor().data('froala.editor').id;

                buildDataObjFromHTML();

                angular.element('[data-compiled=' + elementId + ']').on('click', showEditControl);

                angular.element('[data-compiled-control-id=control_' + elementId + ']').on('click', setActiveElementId);

                angular.element('.ssb-page-section').on('click', clearActiveElement);

            } else {

                console.log('button outside of editor context: ', element.html());

                /**
                 *  unbind watchers for inactive .ssb-theme-btn's
                 */
                vm.elementClass = angular.noop();

                watchElementData();

                pvmStateLoading();

            }

        });

    }

}


})();
