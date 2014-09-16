angular.module('var.directives').directive('psEditable', function ($compile) {
    return {
        controller: function ($scope) {

        },
        replace: true,
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.removeAttr("ps-editable");
            var wrapper = element.wrap("<div></div>").parent();
            var editableClone = element.clone();
            editableClone.attr("editable-" + attrs['psEditableType'], attrs['psEditable']);
            editableClone.attr("ng-show", attrs['editMode']);
            element.attr("ng-hide", attrs['editMode']);
            wrapper.append(editableClone);
            $compile(wrapper)(scope);
        }

    }
});
