(function(){

app.controller('SiteBuilderThemeBtnController', ssbThemeBtnController);

ssbThemeBtnController.$inject = ['$rootScope', '$scope', '$attrs', '$filter', '$transclude', '$sce', '$timeout', '$compile'];
/* @ngInject */
function ssbThemeBtnController($rootScope, $scope, $attrs, $filter, $transclude, $sce, $timeout, $compile) {

    console.info('ssb-theme-btn directive init...')

    var vm = this;

    //get functions from parent component
    // var pScope = $scope.$parent.$parent; //parent scope to froala editor instance
    var pVm = $scope.pVm;
    // $scope.pVm = pVm;

    vm.init = init;
    vm.btnClass = btnClass;
    vm.setActiveElementId = setActiveElementId;
    vm.editControl;
    vm.compiledEditControl = compiledEditControl;
    vm.showEditControl = showEditControl;
    vm.hideEditControl = hideEditControl;
    vm.removeEditControl = removeEditControl;
    vm.positionEditControl = positionEditControl;

    //TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components

    function btnClass() {
        var classString = ' ';

        if (vm.editControl) {
            if (vm.editControl.hasClass('on')) {
                classString += ' ssb-theme-btn-active-element';
            }
        }

        return classString;
    }

    function setActiveElementId(reset) {

        if (!reset) {
            pVm.uiState.activeElement = {
                name: 'Button',
                id: 'button-element_' + vm.element.data('compiled')
            }
        } else {
            pVm.uiState.activeElement = {}
        }

    }

    function showEditControl(e) {

        e.stopPropagation();

        if (!vm.editControl) {
            $scope.component = { title: 'Button', type: 'Button' };
            var template = '<ssb-edit-control ' +
                                'control-id="control_' + vm.element.data('compiled') + '" ' +
                                'class="ssb-edit-control ssb-edit-control-component ssb-edit-control-component-btn" ' +
                                'component="component" ' +
                                'state="pVm.state" ' +
                                'ui-state="pVm.uiState" ' +
                                'section-index="null" ' +
                                'component-index="null">' +
                            '</ssb-edit-control>';
            $compile(template)($scope, vm.compiledEditControl);
        } else {
            $timeout(function() {
                vm.positionEditControl();
                vm.editControl.addClass('on');
            }, 500)
        }

    }

    function hideEditControl(e) {
        vm.editControl.removeClass('on');
    }

    function removeEditControl() {
        if (vm.editControl) {
            vm.editControl.remove();
            vm.editControl = null;
        }
    }

    function compiledEditControl(cloned, scope) {
        $timeout(function() {
            cloned.prependTo(vm.parentComponent.parent());
            vm.editControl = angular.element('[control-id="control_' + vm.element.data('compiled') + '"]');
            vm.setActiveElementId();
            vm.positionEditControl();
            vm.editControl.addClass('on');
        }, 500);
    }

    function positionEditControl() {
        var top = 0;
        var left = 0;
        var topbarHeight = 125;
        var sidebarWidth = 140;
        var scrollTop = document.querySelector('.ssb-site-builder-container').scrollTop;
        var topOffset = 35;
        var leftOffset = 35;

        // while (!parent.hasClass('ssb-section-layout') && limit) {
        //     top = top + parent.position().top;
        //     left = left + parent.position().left;
        //     console.log('top / left', top + ' / ' + left);
        //     parent = parent.parent();
        //     limit--;
        // }

        top = vm.element[0].getBoundingClientRect().top - topOffset - topbarHeight + scrollTop;
        left = vm.element[0].getBoundingClientRect().left - leftOffset - sidebarWidth;

        vm.editControl.css({ top: top, left: left });
    }

    function init(element) {

        vm.element = element;

        vm.parentComponent = vm.element.closest('[component]');

        vm.element.on('click', showEditControl);

        $rootScope.$on('$ssbComponentRemoved_' + vm.element.data('compiled'), function(id) {
            console.log('remove edit control for component w/ id', id);
            vm.removeEditControl();
        });

    }

}


})();
