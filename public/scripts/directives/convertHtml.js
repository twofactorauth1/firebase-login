'use strict';

angular.module('mainApp').directive('convertHtml', function($sce) {
    return {
        restrict: 'E',
        replace:true,
        template: "<div data-ng-bind-html='obj'> </div>",
        link:function(scope,element,attr){
            scope.obj=$sce.trustAsHtml(attr.contents);
        }
    };
});
