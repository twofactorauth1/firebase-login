(function(){

app.directive('ssbEditWrap', ssbEditWrap);

function ssbEditWrap() {

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
                var el = angular.element(e.currentTarget);
                var hasActiveEditControl = el.hasClass('ssb-active-edit-control');
                if (!hasActiveEditControl) {
                    e.stopPropagation();

                    angular.element('.ssb-edit-wrap, .editable-title, [data-edit]', '.ssb-main').removeClass('ssb-on');
                    angular.element('.editable-title').removeClass('ssb-on');

                    console.log('hovered over part of a component yay!', e.currentTarget);
                    var isList = el.is('ul') || el.is('ol');
                    var editableTitleText = el.closest('.ssb-component').scope().vm.component.type;
                    var hasEditableCover = el.children('.editable-cover').length > 0;

                    el.addClass('ssb-on');

                    if (!hasEditableCover) {
                        if (!isList) {
                            el.append('<span class="editable-cover"></span><span class="editable-title">' + editableTitleText + '</span>')
                        } else {
                            el.append('<li class="editable-cover"></li><li class="editable-title">' + editableTitleText + '</li>')
                        }
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

                e.preventDefault();

                var el = angular.element(e.currentTarget);
                var hasComponentChildMouseOver = el.find('[data-edit]').length > 0;

                if (isElement) {
                    type = 'element';
                } else if (isComponent) {
                    type = 'component';
                } else if (isSection) {
                    type = 'section';
                } else {
                    throw new Error('Unknown content type.');
                }

                //let section handle clicks if the component has [data-edit] areas to surface menu
                if ((isSection || isComponent) && !(isComponent && hasComponentChildMouseOver)) {
                    e.stopPropagation();
                    console.log('type', type);

                    //hide editable-title
                    angular.element('.ssb-edit-wrap, .editable-title, [data-edit]', '.ssb-main').removeClass('ssb-on');
                    angular.element('.editable-title').removeClass('ssb-on');

                    //hide all edit-controls
                    angular.element('.ssb-main').find('.ssb-active-edit-control').removeClass('ssb-active-edit-control');

                    //show edit-control for this section|component|element
                    if (isSection) {
                        el.addClass('ssb-active-edit-control');
                    } else if (isComponent) {

                        var clickedComponentScope = el.closest('.ssb-component').scope();
                        var clickedComponentData = clickedComponentScope.vm.component;

                        el.parent().prev('.ssb-edit-control-component').addClass('ssb-active-edit-control');

                        clickedComponentScope.vm.uiState.hoveredSectionIndex = _(clickedComponentScope.vm.state.page.sections).chain()
                            .pluck('components')
                            .map(function(components){
                                return _.pluck(components, '_id')
                            })
                            .findIndex(function(component) {
                                return -1 !== _.indexOf(component, clickedComponentData._id)
                            })
                            .value()

                        clickedComponentScope.vm.uiState.hoveredComponentIndex = _(clickedComponentScope.vm.state.page.sections[clickedComponentScope.vm.uiState.hoveredSectionIndex].components).chain()
                            .findIndex(function(component) {
                                return component._id === clickedComponentData._id
                            })
                            .value()

                    }

                } else if (isElement) {

                    console.log('isElement');

                } else {

                    console.log('component has clickable child area, allow bubble up to section');

                }


            }

            function handleComponentAreaClick(e) {

                e.preventDefault();

                var el = angular.element(e.currentTarget);
                var hasComponentChildMouseOver = el.find('[data-edit]').length > 0;

                if (isElement) {
                    type = 'element';
                } else if (isComponent) {
                    type = 'component';
                } else if (isSection) {
                    type = 'section';
                } else {
                    throw new Error('Unknown content type.');
                }

                //let section handle clicks if the component has [data-edit] areas to surface menu
                if (!(isComponent && hasComponentChildMouseOver)) {
                    e.stopPropagation();
                    console.log('type', type);

                    //hide editable-title
                    angular.element('.ssb-edit-wrap, .editable-title, [data-edit]', '.ssb-main').removeClass('ssb-on');
                    angular.element('.editable-title').removeClass('ssb-on');

                    //hide all edit-controls
                    angular.element('.ssb-main').find('.ssb-active-edit-control').removeClass('ssb-active-edit-control');

                    //show edit-control for this section|component|element
                    el.addClass('ssb-active-edit-control');

                } else {
                    console.log('component has clickable child area, allow bubble up to section');
                }

            }


        }
    };

}

})();
