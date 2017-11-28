(function(){

app.directive('ssbEditWrap', ssbEditWrap);

ssbEditWrap.$inject = ['$rootScope', '$compile', '$timeout', 'SimpleSiteBuilderService','UtilService'];
/* @ngInject */
function ssbEditWrap($rootScope, $compile, $timeout, SimpleSiteBuilderService,UtilService) {

    return {
        restrict: 'C',
        link: function(scope, element, attrs, ctrl) {

            var isSSB = $('.ssb-main').length > 0;

            if (isSSB) {
                init();
            }

            function init() { 
                var isSection = element.hasClass('ssb-page-section');
                var isComponent = element.hasClass('component-wrap');
                var isElement = element.hasClass('ssb-element');
                var isImage = element.hasClass('ssb-img');
                var compileInProcess = false;

                (function setupEvents() {

                    element.on('mouseover', handleMouseOver);

                    element.on('mouseleave', handleSectionOrComponentMouseLeave);

                   // $(element).on('touchstart', handleTouchStart);

                    $(element).on('click', handleClick);

                    $(element).on('mouseover', '[data-edit]', handleComponentPartialAreaMouseOver);

                    $(element).on('mouseleave', '[data-edit]', handleComponentPartialAreaMouseLeave);

                    $(element).on('click', '[data-edit]', handleComponentPartialAreaClick);

                })();

                function handleTouchStart(e){
                    UtilService.flyoverhideonclick();
                    handleClick(e);
                }
                

                function handleMouseOver(e) {

                    //ignore if clicked on a control
                    if ($(e.target).hasClass('ssb-edit-control') ||
                        $(e.target).hasClass('ssb-theme-btn') ||
                        $(e.target).hasClass('ssb-settings-btn') ||
                        $(e.target).parent().hasClass('ssb-settings-btn')) {

                        return false;
                    }

                    var hasSectionChildMouseOver = element.children().find('.ssb-edit-wrap.on').length > 0;
                    var hasComponentChildMouseOver = false//element.children().find('[data-edit]').length > 0;
                    var hasActiveEditControl = element.hasClass('ssb-active-edit-control');

                    if (!hasActiveEditControl && (isSection && !hasSectionChildMouseOver || isComponent && !hasComponentChildMouseOver)) {

                        e.stopPropagation();

                        angular.element('.ssb-edit-wrap, .editable-title, .editable-cover, [data-edit]', '.ssb-main').removeClass('ssb-on');
                        element.addClass('ssb-on');
                        element.find('> .editable-title:first').addClass('ssb-on');
                        element.find('> .editable-cover:first').addClass('ssb-on');

                    } else if (isElement|| isImage) {

                        handleElementMouseOver(e);

                    }

                }


                function handleElementMouseOver(e) { 
                    var el = angular.element(e.currentTarget);
                    var hasActiveEditControl = el.hasClass('ssb-active-edit-control');
                    if (!hasActiveEditControl) {
                        e.stopPropagation();
                        hideHoverControls(); 
                        var isList = el.is('ul') || el.is('ol');
                        var componentScope = el.closest('.ssb-component').scope();
                        if (!componentScope) {
                            return
                        }
                        var editableTitleText = componentScope.vm.component.type;
                        el.addClass('ssb-on');                        
                        if (!compileInProcess) {
                            compileInProcess = true;
                            var tempUUID = SimpleSiteBuilderService.getTempUUID();
                            el.attr('data-edit-id', tempUUID);
                            var template = '<ssb-edit-control ' +
                                                'data-control-id="control_' + tempUUID + '" ' +
                                                'class="ssb-edit-control ssb-edit-control-component ssb-edit-control-element" ' +
                                                'component="ssbElement" ' +
                                                'state="vm.state" ' +
                                                'ui-state="vm.uiState" ' +
                                                'section-index="null" ' +
                                                'component-index="null">' +
                                            '</ssb-edit-control>';
                            componentScope.ssbElement = { title: isImage? 'Image Overlay':'Text Element', type: isImage? 'Image Overlay':'Text Element' };
                            $compile(template)(componentScope, function(clonedEditControl, scope) {
                                compiledEditControl(el, clonedEditControl);
                            });
                        }
                    }
                }

                function handleComponentPartialAreaMouseOver(e) {
                    var el = angular.element(e.currentTarget);
                    var hasActiveEditControl = el.hasClass('ssb-active-edit-control');
                    if (!hasActiveEditControl) {
                        e.stopPropagation();
                        hideHoverControls(); 
                        var isList = el.is('ul') || el.is('ol');
                        var componentScope = el.closest('.ssb-component').scope();
                        if (!componentScope) {
                            return
                        }
                        var editableTitleText = componentScope.vm.component.type;
                        var hasEditableCover = el.children('.editable-cover').length > 0;
                        el.addClass('ssb-on');
                        if (!hasEditableCover) {
                            if (!isList) {
                                el.append(
                                    '<span id="editable_cover_' + componentScope.vm.component._id + '" class="editable-cover"></span>' +
                                    '<span id="editable_title_' + componentScope.vm.component._id + '"class="editable-title">' + editableTitleText + '</span>'
                                )
                            } else {
                                el.append(
                                    '<li id="editable_cover_' + componentScope.vm.component._id + '"class="editable-cover"></li>' +
                                    '<li id="editable_title_' + componentScope.vm.component._id + '"class="editable-title">' + editableTitleText + '</li>'
                                )
                            }
                        }
                        var hasEditControl = angular.element('[data-control-id="control_' + el.attr('data-edit-id') + '"]').length > 0;

                        if (!hasEditControl && !compileInProcess) {
                            compileInProcess = true;
                            var tempUUID = SimpleSiteBuilderService.getTempUUID();

                            el.attr('data-edit-id', tempUUID);

                            var template = '<ssb-edit-control ' +
                                                'data-control-id="control_' + tempUUID + '" ' +
                                                'class="ssb-edit-control ssb-edit-control-component ssb-edit-control-component-area" ' +
                                                'component="vm.component" ' +
                                                'state="vm.state" ' +
                                                'ui-state="vm.uiState" ' +
                                                'section-index="vm.sectionIndex" ' +
                                                'component-index="vm.componentIndex">' +
                                            '</ssb-edit-control>';
                            $compile(template)(componentScope, function(clonedEditControl, scope) {
                                compiledEditControl(el, clonedEditControl);
                            });
                        }

                    }

                }

                function handleSectionOrComponentMouseLeave(e) {
                    var isElement = element.hasClass('ssb-element');
                    var isImage = element.hasClass('ssb-img');
                    if(isImage || isElement){
                        var componentScope = element.closest('.ssb-component').scope();
                        if (componentScope) {
                            if(componentScope.vm && componentScope.vm.uiState.activeElement)
                                if(componentScope.vm.uiState.activeElement.type ==='ssb-element-text'){
                                    $timeout(function() {
                                        componentScope.ssbElement = { title: 'Text Element', type: 'Text Element' };
                                    }, 0);                                    
                                }
                                else if(componentScope.vm.uiState.activeElement.type ==='ssb-element-image'){
                                    $timeout(function() {
                                        componentScope.ssbElement = { title: 'Image Overlay', type: 'Image Overlay'};
                                    }, 0);
                                }
                        }
                    }
                    element.removeClass('ssb-on');
                    element.find('.editable-title:first').removeClass('ssb-on');
                    element.find('.editable-cover:first').removeClass('ssb-on');
                    
                }

                function handleComponentPartialAreaMouseLeave(e) {

                    var el = angular.element(e.currentTarget);
                    el.removeClass('ssb-on');
                    el.find('.editable-title:first').removeClass('ssb-on');
                    el.find('.editable-cover:first').removeClass('ssb-on');

                }

                function isTouchDevice(){
                    return 'ontouchstart' in window;
                }

                function handleClick(e) {
                    
                       UtilService.flyoverhideonclick();
                     
                    //ignore if clicked on a control
                    if ($(e.target).hasClass('ssb-edit-control') ||
                        $(e.target).hasClass('ssb-theme-btn') ||
                        $(e.target).hasClass('ssb-settings-btn') ||
                        $(e.target).hasClass('no-edit') ||
                        $(e.target).parent().hasClass('ssb-settings-btn') ||
                        $(e.target).parent().hasClass('ssb-edit-control-active-title')) {

                        return;
                    }
                    if(isTouchDevice)
                        handleMouseOver(e);

                    e.preventDefault();

                    var el = angular.element(e.currentTarget);
                    var hasComponentChildMouseOver = false//el.find('[data-edit]').length > 0;

                    //let section handle clicks if the component has [data-edit] areas to surface menu
                    if ((isSection || isComponent) && !(isComponent && hasComponentChildMouseOver)) {
                        var clickedSection = el.closest('.ssb-section-layout');
                        var clickedComponent = el.closest('.ssb-component');

                        if(isComponent && clickedComponent.prev().hasClass("ssb-on")){
                            e.stopPropagation();
                            return;
                        }

                        hideAllControls();

                        //get related component data
                        var clickedSectionScope = clickedSection.scope();
                        var clickedComponentScope = clickedComponent.scope();

                        if (clickedSectionScope && clickedComponentScope) {
                            var clickedSectionData = clickedSectionScope.vm.section;
                            var clickedComponentData = clickedComponentScope.vm.component;

                            //reset uiState
                            // clickedComponentScope.vm.uiState.activeSectionIndex = undefined;
                            // clickedComponentScope.vm.uiState.activeComponentIndex = undefined;
                            clickedComponentScope.vm.uiState.hoveredSectionIndex = undefined;
                            clickedComponentScope.vm.uiState.hoveredComponentIndex = undefined;
                            clickedComponentScope.vm.uiState.hoveredComponentEl = undefined;
                            clickedComponentScope.vm.uiState.activeElement = {};
                        }

                        //show edit-control for this section|component|element
                        if (isSection) {

                            handleSectionClick(e, el);

                        } else if (isComponent) {

                            handleComponentClick(e, el, clickedSectionData, clickedComponent, clickedSectionScope, clickedComponentScope, clickedComponentData);

                        }

                    } else if (isElement ) { 
                        if (el.find('.ssb-active-component').length === 0) {
                            e.stopPropagation();
                            handleElementClick(el, el.closest('.ssb-component'));
                        }

                    } else if (isImage ) { 
                        if (el.find('.ssb-active-component').length === 0) {
                            e.stopPropagation();
                            handleImageClick(el, el.closest('.ssb-component'));
                        }

                    }else {

                        console.log('component has clickable child area, allow bubble up to section');

                    }


                }

                function handleSectionClick(e, el) {
                     UtilService.flyoverhideonclick();
                    el.scope().vm.uiState.hoveredSectionIndex = undefined;
                    el.scope().vm.uiState.hoveredComponentIndex = undefined;
                    el.scope().vm.uiState.hoveredComponentEl = undefined;
                    el.addClass('ssb-active-edit-control');

                    $timeout(function() {
                        el.find('> .ssb-edit-control').addClass('ssb-on');
                    }, 500);

                    //if contextual menu is already open, open directly from single click
                    if (el.scope().vm.uiState.showSectionPanel || SimpleSiteBuilderService.isIENotEdge) {
                        $timeout(function() {
                            el.find('> .ssb-edit-control .ssb-settings-btn').click();
                        });
                    }

                }

                function handleComponentClick(e, el, clickedSectionData, clickedComponent, clickedSectionScope, clickedComponentScope, clickedComponentData) {
                    UtilService.flyoverhideonclick();
                    e.stopPropagation();

                    $timeout(function() {
                        var editControlComponent = el.parent().prevAll('.ssb-edit-control-component:not(.ssb-edit-control-element):first');
                        var editControlId = editControlComponent.attr('data-control-id');
                        var uiStateObj = {};

                        editControlComponent.addClass('ssb-active-edit-control');
                        clickedComponent.addClass('ssb-active-component');

                        /**
                         * set hovered edit control on uiState
                         */
                        uiStateObj.hoveredComponentEditControl = editControlComponent;

                        /**
                         find index of section based on component _id
                         */
                        uiStateObj.hoveredSectionIndex = _(clickedComponentScope.vm.state.page.sections).chain()
                            .findIndex(function(section) {
                                return section._id === clickedSectionData._id;
                            })
                            .value()

                        /**
                         find index of component based on component _id
                         */
                        uiStateObj.hoveredComponentIndex = _(clickedComponentScope.vm.state.page.sections[uiStateObj.hoveredSectionIndex].components).chain()
                            .findIndex(function(component) {
                                return component._id === clickedComponentData._id
                            })
                            .value()

                        /**
                         * set current el on uiState
                         */
                        uiStateObj.hoveredComponentEl = el;

                        /**
                         * update uiState
                         */
                        $rootScope.$broadcast('$ssbUpdateUiState', uiStateObj);

                        /**
                         * show menu pen
                         */
                        $rootScope.$broadcast('$ssbMenuPenVisibleForComponent', editControlId, 'component');

                        /*
                         * if contextual menu is already open, open directly from single click
                         */
                        if (clickedComponentScope.vm.uiState.showSectionPanel || SimpleSiteBuilderService.isIENotEdge) {
                            $timeout(function() {
                                editControlComponent.find('.ssb-settings-btn').click();
                            });
                        }

                    }, 100);

                }

                function handleComponentPartialAreaClick(e) {
                      UtilService.flyoverhideonclick();
                    e.preventDefault();

                    var el = angular.element(e.currentTarget);
                    var targetEl = angular.element(e.target);

                    if (el.hasClass('ssb-active-edit-control') ||
                        targetEl.hasClass('ssb-active-edit-control') ||
                        el.hasClass('ssb-element')) {

                        e.stopPropagation();
                        return false;

                    }

                    if(isTouchDevice){
                            handleComponentPartialAreaMouseOver(e);
                            $timeout(function() {
                                handleComponentPartialAreaClickFn(e);
                            }, 500);
                        }
                    else
                    {
                        handleComponentPartialAreaClickFn(e);
                    }

                }

                function handleComponentPartialAreaClickFn(e){
                     UtilService.flyoverhideonclick();
                    var el = angular.element(e.currentTarget);
                    var targetEl = angular.element(e.target);
                    var hasComponentChildMouseOver = el.find('[data-edit]').length > 0;

                    //let section handle clicks if the component has [data-edit] areas to surface menu
                    if (!(isComponent && hasComponentChildMouseOver)) {
                        e.stopPropagation();

                        var clickedSectionScope = el.closest('.ssb-section-layout').scope();
                        var clickedSectionData = clickedSectionScope.vm.section;
                        var clickedComponentScope = el.closest('.ssb-component').scope();
                        var clickedComponentData = clickedComponentScope.vm.component;
                        var editControlComponent = angular.element('[data-control-id="control_' + el.attr('data-edit-id') + '"]');
                        var editControlId = editControlComponent.attr('data-control-id');
                        var uiStateObj = {}

                        hideAllControls();

                        //reset uiState
                        uiStateObj.hoveredSectionIndex = undefined;
                        uiStateObj.hoveredComponentIndex = undefined;
                        uiStateObj.hoveredComponentEl = undefined;
                        uiStateObj.hoveredComponentEditControl = undefined;
                        uiStateObj.activeElement = {};

                        /**
                         * set hovered edit control on uiState
                         */
                        uiStateObj.hoveredComponentEditControl = editControlComponent;

                        /**
                         * find index of section based on component _id
                         */
                        uiStateObj.hoveredSectionIndex = _(clickedComponentScope.vm.state.page.sections).chain()
                            .findIndex(function(section) {
                                return section._id === clickedSectionData._id;
                            })
                            .value()

                        /**
                         * find index of component based on component _id
                         */
                        uiStateObj.hoveredComponentIndex = _(clickedComponentScope.vm.state.page.sections[uiStateObj.hoveredSectionIndex].components).chain()
                            .findIndex(function(component) {
                                return component._id === clickedComponentData._id
                            })
                            .value()

                        /**
                         * current hovered el on uiState
                         */
                        uiStateObj.hoveredComponentEl = el;

                        /**
                         * update uiState
                         */
                        $rootScope.$broadcast('$ssbUpdateUiState', uiStateObj);

                        /**
                         * show menu pen
                         */
                        $rootScope.$broadcast('$ssbMenuPenVisibleForComponentPartialArea', editControlId, 'component-partial-area');

                        /**
                         * highlight component area
                         */
                        el.addClass('ssb-active-edit-control');

                        /**
                         * show pen
                         */
                        $timeout(function() {
                            editControlComponent.addClass('ssb-on');
                        }, 500);

                        /*
                         * if contextual menu is already open, open directly from single click
                         */
                        if (clickedComponentScope.vm.uiState.showSectionPanel || SimpleSiteBuilderService.isIENotEdge) {
                            $timeout(function() {
                                editControlComponent.find('.ssb-settings-btn').click();
                            });
                        }


                    } else {
                        console.log('component has clickable child area, allow bubble up');
                    }
                }

                function compiledEditControl(el, clonedEditControl) {

                    $timeout(function() {

                        if (el.hasClass('ssb-element')) {
                            el.closest('.ssb-component').before(clonedEditControl);
                        } else {
                            el.before(clonedEditControl);
                        }

                        compileInProcess = false;
                    });

                }

                function handleElementClick(el, clickedComponent) {
                    UtilService.flyoverhideonclick();
                    console.log('isElement edit control');

                    var clickedComponentScope = clickedComponent.scope();
                    var clickedTextElement = el.find('.ssb-text-settings:first');

                    if (clickedTextElement.length === 0) {
                        clickedTextElement = el.closest('.ssb-text-settings');
                    }

                    hideAllControls();

                    $timeout(function() {

                        var dataEditId = el.attr('data-edit-id');

                        if (!dataEditId) {
                            dataEditId = el.closest('[data-edit-id]').attr('data-edit-id');
                        }

                        var editControlComponent = angular.element('[data-control-id="control_' + dataEditId + '"]');
                        var editControlId = editControlComponent.attr('data-control-id');
                        var uiStateObj = {};

                        if (clickedTextElement && clickedTextElement.scope() && clickedTextElement.scope().vm) {
                            uiStateObj.hoveredComponentEl = clickedTextElement;
                            uiStateObj.hoveredComponentEditControl = editControlComponent;
                            uiStateObj.activeElement = clickedTextElement.scope().vm.elementData;
                        }

                        /**
                         * update uiState
                         */
                        $rootScope.$broadcast('$ssbUpdateUiState', uiStateObj);

                        /**
                         * show menu pen
                         */
                        $rootScope.$broadcast('$ssbMenuPenVisibleForElement', editControlId, 'element');

                        editControlComponent.addClass('ssb-active-edit-control ssb-on');
                        clickedTextElement.addClass('ssb-active-component');

                        /*
                         * if contextual menu is already open, open directly from single click
                         */
                        if (clickedComponentScope && (clickedComponentScope.vm.uiState.showSectionPanel || SimpleSiteBuilderService.isIENotEdge)) {
                            $timeout(function() {
                                editControlComponent.find('.ssb-settings-btn').click();
                            });
                        }

                    }, 100);

                }
                function handleImageClick(el, clickedComponent) {
                    UtilService.flyoverhideonclick();
                    console.log('isImage edit control');

                    var clickedComponentScope = clickedComponent.scope();
                    var clickedTextElement = el.find('.ssb-img-settings:first');

                    if (clickedTextElement.length === 0) {
                        clickedTextElement = el.closest('.ssb-img-settings');
                    }

                    hideAllControls();

                    $timeout(function() {

                        var dataEditId = el.attr('data-edit-id');

                        if (!dataEditId) {
                            dataEditId = el.closest('[data-edit-id]').attr('data-edit-id');
                        }

                        var editControlComponent = angular.element('[data-control-id="control_' + dataEditId + '"]');
                        var editControlId = editControlComponent.attr('data-control-id');
                        var uiStateObj = {};
                        if (clickedTextElement && clickedTextElement.scope() && clickedTextElement.scope().vm) {
                            uiStateObj.hoveredComponentEl = clickedTextElement;
                            uiStateObj.hoveredComponentEditControl = editControlComponent;
                            uiStateObj.activeElement = clickedTextElement.scope().vm.elementData;
                        }

                        /**
                         * update uiState
                         */
                        $rootScope.$broadcast('$ssbUpdateUiState', uiStateObj);

                        /**
                         * show menu pen
                         */
                        $rootScope.$broadcast('$ssbMenuPenVisibleForElement', editControlId, 'element');

                        editControlComponent.addClass('ssb-active-edit-control ssb-on');
                        clickedTextElement.addClass('ssb-active-component');

                        /*
                         * if contextual menu is already open, open directly from single click
                         */
                        if (clickedComponentScope && (clickedComponentScope.vm.uiState.showSectionPanel || SimpleSiteBuilderService.isIENotEdge)) {
                            $timeout(function() {
                                editControlComponent.find('.ssb-settings-btn').click();
                            });
                        }

                    }, 100);

                }
                function hideHoverControls() {

                    //hide editable-title's and borders
                    angular.element('.ssb-edit-wrap, .editable-title, .editable-cover, [data-edit]', '.ssb-main').removeClass('ssb-on');

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

            }

        }
    };

}

})();
