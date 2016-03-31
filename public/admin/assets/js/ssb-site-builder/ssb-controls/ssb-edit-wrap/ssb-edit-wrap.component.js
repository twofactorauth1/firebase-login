(function(){

app.directive('ssbEditWrap', ssbEditWrap);

ssbEditWrap.$inject = ['$compile', '$timeout'];
/* @ngInject */
function ssbEditWrap($compile, $timeout) {

    return {
        restrict: 'C',
        // controller: 'SiteBuilderEditWrapController',
        // controllerAs: 'vm',
        // scope: {},
        // bindToController: true,
        link: function(scope, element, attrs, ctrl) {

            var isSection = element.hasClass('ssb-page-section');
            var isComponent = element.hasClass('component-wrap');
            var isElement = element.hasClass('ssb-element');

            setupEvents();

            function setupEvents() {

                element.on('mouseover', handleSectionOrComponentMouseOver);

                element.on('mouseleave', handleSectionOrComponentMouseLeave);

                element.on('click', handleSectionOrComponentClick);

                $(element).on('mouseover', '[data-edit]', handleComponentAreaMouseOver);

                $(element).on('mouseleave', '[data-edit]', handleComponentAreaMouseLeave);

                $(element).on('click', '[data-edit]', function(e) {
                    e.stopPropagation();
                    handleComponentAreaClick(e);
                });

                // var elementSection = angular.element(e.currentTarget).closest('.ssb-section-layout');
                // var elementComponent = angular.element(e.currentTarget);
                // var elementElement = angular.element(e.currentTarget).closest('.ssb-element');

                // var dataSection = angular.element(e.currentTarget).closest('.ssb-section-layout').scope().section;
                // var dataComponent = angular.element(e.currentTarget).scope().component;
                // var dataElement = angular.element(e.currentTarget).closest('.ssb-element').scope().component;
            }

            function handleSectionOrComponentMouseOver(e) {

                //ignore hover on an edit-control
                // if ($(e.target).parents('.ssb-edit-control-component').length > 0) {
                //     return
                // }

                console.log('handleSectionOrComponentMouseOver', e.target);

                var hasSectionChildMouseOver = element.children().find('.ssb-edit-wrap.on').length > 0;
                var hasComponentChildMouseOver = element.children().find('[data-edit]').length > 0;
                var hasActiveEditControl = element.hasClass('ssb-active-edit-control');

                if (!hasActiveEditControl && (isSection && !hasSectionChildMouseOver || isComponent && !hasComponentChildMouseOver || isElement)) {

                    e.stopPropagation();

                    angular.element('.ssb-edit-wrap, .editable-title, .editable-cover, [data-edit]', '.ssb-main').removeClass('ssb-on');
                    element.addClass('ssb-on');

                    angular.element('.editable-title').removeClass('ssb-on');
                    element.find('> .editable-title:first').addClass('ssb-on');
                    element.find('> .editable-cover:first').addClass('ssb-on');

                }

            }

            function handleComponentAreaMouseOver(e) {

                console.log('handleComponentAreaMouseOver', e.target);
                console.log('handleComponentAreaMouseOver', e.currentTarget);

                var el = angular.element(e.currentTarget);
                var hasActiveEditControl = el.hasClass('ssb-active-edit-control');
                if (!hasActiveEditControl) {
                    e.stopPropagation();

                    angular.element('.ssb-edit-wrap, .editable-title, [data-edit]', '.ssb-main').removeClass('ssb-on');
                    angular.element('.editable-title').removeClass('ssb-on');

                    console.log('hovered over part of a component yay!', e.currentTarget);
                    var isList = el.is('ul') || el.is('ol');
                    var componentScope = el.closest('.ssb-component').scope();
                    var editableTitleText = componentScope.vm.component.type;
                    var hasEditableCover = el.children('.editable-cover').length > 0;
                    var hasEditControl = el.prev('ssb-edit-control').length > 0;

                    el.addClass('ssb-on');

                    if (!hasEditableCover) {
                        if (!isList) {
                            el.append('<span class="editable-cover"></span><span class="editable-title">' + editableTitleText + '</span>')
                        } else {
                            el.append('<li class="editable-cover"></li><li class="editable-title">' + editableTitleText + '</li>')
                        }
                    }

                    if (!hasEditControl) {
                        var template = '<ssb-edit-control ' +
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

            function handleComponentAreaMouseLeave(e) {

                console.log('left part of a component OK!', e.currentTarget);
                var el = angular.element(e.currentTarget);
                el.removeClass('ssb-on');

            }

            function handleSectionOrComponentMouseLeave(e) {

                element.removeClass('ssb-on');
                element.find('.editable-title:first').removeClass('ssb-on');
                element.find('.editable-cover:first').removeClass('ssb-on');

            }

            function handleSectionOrComponentClick(e) {

                //ignore if clicked on a control
                if ($(e.target).hasClass('ssb-edit-control') ||
                    $(e.target).hasClass('ssb-theme-btn') ||
                    $(e.target).hasClass('ssb-settings-btn') ||
                    $(e.target).parent().hasClass('ssb-settings-btn')) {

                    return;
                }


                e.preventDefault();

                var el = angular.element(e.currentTarget);
                var hasComponentChildMouseOver = el.find('[data-edit]').length > 0;

                //let section handle clicks if the component has [data-edit] areas to surface menu
                if ((isSection || isComponent) && !(isComponent && hasComponentChildMouseOver)) {
                    var clickedComponent = el.closest('.ssb-component');
                    if(isComponent && clickedComponent.prev().hasClass("ssb-on")){
                        e.stopPropagation();
                        return;
                    }
                    //hide editable-title
                    angular.element('.ssb-edit-wrap, .editable-title, [data-edit]', '.ssb-main').removeClass('ssb-on');
                    angular.element('.editable-title').removeClass('ssb-on');

                    //hide all edit-controls
                    angular.element('.ssb-main').find('.ssb-active-edit-control').removeClass('ssb-active-edit-control');
                    angular.element('.ssb-main').find('.ssb-on').removeClass('ssb-on');


                    angular.element('.ssb-component').removeClass('ssb-active-component');

                    //get related component data
                    var clickedComponentScope = clickedComponent.scope();

                    if (clickedComponentScope) {
                        var clickedComponentData = clickedComponentScope.vm.component;

                        //reset uiState
                        // clickedComponentScope.vm.uiState.activeSectionIndex = undefined;
                        // clickedComponentScope.vm.uiState.activeComponentIndex = undefined;
                        clickedComponentScope.vm.uiState.hoveredSectionIndex = undefined;
                        clickedComponentScope.vm.uiState.hoveredComponentIndex = undefined;
                        clickedComponentScope.vm.uiState.hoveredComponentEl = undefined;
                    }

                    //show edit-control for this section|component|element
                    if (isSection) {
                        el.addClass('ssb-active-edit-control');

                        $timeout(function() {
                            el.find('> ssb-edit-control').addClass('ssb-on');
                        }, 500);

                        //if contextual menu is already open, open directly from single click
                        if (el.scope().vm.uiState.showSectionPanel) {
                            el.find('> ssb-edit-control .ssb-settings-btn').click();
                        }


                    } else if (isComponent) {

                        e.stopPropagation();

                        $timeout(function() {
                            var editControlComponent = el.parent().prev('.ssb-edit-control-component');

                            editControlComponent.addClass('ssb-active-edit-control');
                            clickedComponent.addClass('ssb-active-component');

                            /**
                             * set hovered edit control on uiState
                             */
                            clickedComponentScope.vm.uiState.hoveredComponentEditControl = editControlComponent;

                            /**
                             find index of section based on component _id
                             */


                            clickedComponentScope.vm.uiState.hoveredSectionIndex = _(clickedComponentScope.vm.state.page.sections).chain()
                                .pluck('components')
                                .map(function(components){
                                    return _.pluck(components, '_id')
                                })
                                .findIndex(function(component) {
                                    return -1 !== _.indexOf(component, clickedComponentData._id)
                                })
                                .value()

                            /**
                             find index of component based on component _id
                             */
                            clickedComponentScope.vm.uiState.hoveredComponentIndex = _(clickedComponentScope.vm.state.page.sections[clickedComponentScope.vm.uiState.hoveredSectionIndex].components).chain()
                                .findIndex(function(component) {
                                    return component._id === clickedComponentData._id
                                })
                                .value()

                            /**
                             * set current el on uiState
                             */
                            clickedComponentScope.vm.uiState.hoveredComponentEl = el;

                            //if contextual menu is already open, open directly from single click
                            if (clickedComponentScope.vm.uiState.showSectionPanel) {
                                editControlComponent.find('.ssb-settings-btn').click();
                            } else {
                                // editControlComponent.addClass('ssb-on');
                            }

                        }, 100);



                    }

                } else if (isElement) {

                    //TODO: handle text elements, needs editable-cover?
                    console.log('isElement');

                } else {

                    console.log('component has clickable child area, allow bubble up to section');

                }


            }

            function handleComponentAreaClick(e) {

                e.preventDefault();

                var el = angular.element(e.currentTarget);
                var hasComponentChildMouseOver = el.find('[data-edit]').length > 0;

                //let section handle clicks if the component has [data-edit] areas to surface menu
                if (!(isComponent && hasComponentChildMouseOver)) {
                    e.stopPropagation();

                    var clickedComponentScope = el.closest('.ssb-component').scope();
                    var clickedComponentData = clickedComponentScope.vm.component;

                    //hide editable-title
                    angular.element('.ssb-edit-wrap, .editable-title, [data-edit]', '.ssb-main').removeClass('ssb-on');
                    angular.element('.editable-title').removeClass('ssb-on');

                    //hide all edit-controls
                    angular.element('.ssb-main').find('.ssb-active-edit-control').removeClass('ssb-active-edit-control');
                    angular.element('.ssb-main').find('.ssb-on').removeClass('ssb-on');

                    //reset uiState
                    // clickedComponentScope.vm.uiState.activeSectionIndex = undefined;
                    // clickedComponentScope.vm.uiState.activeComponentIndex = undefined;
                    clickedComponentScope.vm.uiState.hoveredSectionIndex = undefined;
                    clickedComponentScope.vm.uiState.hoveredComponentIndex = undefined;
                    clickedComponentScope.vm.uiState.hoveredComponentEl = undefined;
                    clickedComponentScope.vm.uiState.hoveredComponentEditControl = undefined;

                    /**
                     * set hovered edit control on uiState
                     */
                    clickedComponentScope.vm.uiState.hoveredComponentEditControl = el.prev('ssb-edit-control');

                    /**
                     * find index of section based on component _id
                     */
                    clickedComponentScope.vm.uiState.hoveredSectionIndex = _(clickedComponentScope.vm.state.page.sections).chain()
                        .pluck('components')
                        .map(function(components){
                            return _.pluck(components, '_id')
                        })
                        .findIndex(function(component) {
                            return -1 !== _.indexOf(component, clickedComponentData._id)
                        })
                        .value()

                    /**
                     * find index of component based on component _id
                     */
                    clickedComponentScope.vm.uiState.hoveredComponentIndex = _(clickedComponentScope.vm.state.page.sections[clickedComponentScope.vm.uiState.hoveredSectionIndex].components).chain()
                        .findIndex(function(component) {
                            return component._id === clickedComponentData._id
                        })
                        .value()

                    /**
                     * set current el on uiState
                     */
                    clickedComponentScope.vm.uiState.hoveredComponentEl = el;

                    //highlight component area
                    el.addClass('ssb-active-edit-control');

                    $timeout(function() {
                        el.prev('ssb-edit-control').addClass('ssb-on');
                    }, 500);

                    //if contextual menu is already open, open directly from single click
                    if (clickedComponentScope.vm.uiState.showSectionPanel) {
                        el.prev('ssb-edit-control').find('.ssb-settings-btn').click();
                    }


                } else {
                    console.log('component has clickable child area, allow bubble up');
                }

            }

            function compiledEditControl(el, clonedEditControl) {

                console.log('compiled edit control for component area');

                var clickedComponentScope = el.closest('.ssb-component').scope();

                $timeout(function() {
                    el.before(clonedEditControl);

                    /**
                     * set current edit el on uiState
                     */
                    // clickedComponentScope.vm.uiState.hoveredComponentEditControl = clonedEditControl;

                });

            }


        }
    };

}

})();
