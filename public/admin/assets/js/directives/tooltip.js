'use strict';
/** 
  * A directive used for "close buttons" (eg: alert box).
  * It hides its parent node that has the class with the name of its value.
*/
app.directive('ctooltip', function ($compile) {
    return {
        restrict: 'A',
         scope:{
            msg: '@msg',
            placement: "@placement"
        },
        link: function (scope, elem, attrs) {
            if(angular.isUndefined(elem.attr('tooltip'))) {
                elem.attr('tooltip-placement', scope.placement || 'right');
                elem.attr('tooltip', scope.msg || 'This link will work on front End only');
                $compile(elem)(scope);
            }
        }
    };
});