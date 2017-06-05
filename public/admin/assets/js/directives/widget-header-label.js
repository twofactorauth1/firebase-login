'use strict';

app.directive('widgetHeaderLabel', ['$filter',  function($filter) {
    return {
        restrict: 'E',
        scope: {
            count: "@",
            item: "@"
        },
        template: '{{message}}',
        link: function(scope, element, attrs) {
            scope.$watch("count", function(count){
                scope.message = getWidgetRecordsLengthMessage(count, scope.item);
            })

            function getWidgetRecordsLengthMessage(count, item){
                var str = "";
                if(count == 1){
                    str = "There is 1 " + item;
                }
                else if(count > 1){
                    str = "There are " + $filter('number')(count, 0) + " " + item + "s";
                }
                else{
                    str = "There are no " + item + "s";
                }
                return str;
            }
        }
    }
}]);