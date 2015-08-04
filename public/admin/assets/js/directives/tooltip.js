'use strict';
/** 
  * A directive used for "close buttons" (eg: alert box).
  * It hides its parent node that has the class with the name of its value.
*/
app.directive('ctooltip', function ($compile) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            if(angular.isUndefined(elem.attr('tooltip'))) {
                elem.attr('tooltip-placement', 'right');
                elem.attr('tooltip', 'This link will work on front End only');
                $compile(elem)(scope);
            }
        }
    };
});