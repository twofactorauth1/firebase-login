(function(){

app.directive('ssbEditWrap', ssbEditWrap);

function ssbEditWrap() {

    return {
        restrict: 'C',
        link: function(scope, element, attrs, ctrl) {
            var isSection = element.hasClass('ssb-page-section');
            var isComponent = element.hasClass('component-wrap');
            var isElement = element.hasClass('ssb-element');

            element.on('mouseover', function(e) {

                var hasSectionChildMouseOver = element.children().find('.ssb-edit-wrap.on').length > 0;
                var hasComponentChildMouseOver = element.children().find('[data-edit]').length > 0;

                if (isSection && !hasSectionChildMouseOver || isComponent && !hasComponentChildMouseOver || isElement) {

                    e.stopPropagation();

                    angular.element('.ssb-edit-wrap, .editable-title, [data-edit]', '.ssb-main').removeClass('ssb-on');
                    element.addClass('ssb-on');

                    angular.element('.editable-title').removeClass('ssb-on');
                    element.find('> .editable-title:first').addClass('ssb-on');

                }

            });

            $(element).on('mouseover', '[data-edit]', function(e) {

                e.stopPropagation();

                angular.element('.ssb-edit-wrap, .editable-title, [data-edit]', '.ssb-main').removeClass('ssb-on');
                angular.element('.editable-title').removeClass('ssb-on');

                console.log('hovered over part of a component yay!', e.currentTarget);
                var el = angular.element(e.currentTarget);
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

            });

            $(element).on('mouseleave', '[data-edit]', function(e) {

                console.log('left part of a component OK!', e.currentTarget);
                var el = angular.element(e.currentTarget);
                el.removeClass('ssb-on');

            });

            element.on('mouseleave', function(e) {

                element.removeClass('ssb-on');
                element.find('.editable-title:first').removeClass('ssb-on');
                console.log(element.find('> .editable-title:first'))

            });

            element.on('click', handleSectionOrComponentClick);

                // function(e) {

                // e.preventDefault();



                // var elementSection = angular.element(e.currentTarget).closest('.ssb-section-layout');
                // var elementComponent = angular.element(e.currentTarget);
                // var elementElement = angular.element(e.currentTarget).closest('.ssb-element');

                // var dataSection = angular.element(e.currentTarget).closest('.ssb-section-layout').scope().vm.section;
                // var dataComponent = angular.element(e.currentTarget).scope().vm.component;
                // var dataElement = angular.element(e.currentTarget).closest('.ssb-element').scope().vm.component;

                // var closestEditControl = angular.element(e.currentTarget).closest('.ssb-edit-control');

                // var localScope = scope;

                // console.log('elementComponent:', elementComponent.get(0));
                // console.log('elementSection:', elementSection.get(0));
                // console.log('elementElement:', elementElement.get(0));

                // console.log('dataComponent:', dataComponent);
                // console.log('dataSection:', dataSection);
                // console.log('dataElement:', dataElement);

                // console.log('closestEditControl:', closestEditControl);



                // debugger;


            // })

            $(element).on('click', '[data-edit]', function(e) {
                e.stopPropagation();
                handleComponentAreaClick(e);
            });


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
