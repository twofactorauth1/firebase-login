app.directive('stSortTable', function(){
   return {
            require: '^stTable',            
            link: function (scope, element, attr, ctrl) {
                scope.getSortOrder = function() {
                    return ctrl.tableState();   
                }
                scope.setSortOrder = function(order) {
                    ctrl.tableState.sortBy(order.predicate, order.reverse);                   
                } 
            }
        };
});