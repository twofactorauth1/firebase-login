app.directive('stFilteredCollection', function ($timeout) {
  return {
    require: '^stTable',
    link: function (scope, element, attr, ctrl) {
		scope.$watch(ctrl.getFilteredCollection, function(val) {
			scope.filteredCollection = val;
		})

		scope.$on("refreshTableData", function(args, params) {
			var globalSearch = params.globalSearch;
			var fieldSearch = params.fieldSearch;
			if(!Object.keys(ctrl.tableState().search).length){
				ctrl.tableState().search = {
					predicateObject: {}
				};
			}
			if(globalSearch){
				ctrl.tableState().search.predicateObject.$ = globalSearch;
			}
			if(!_.isEmpty(fieldSearch)){
                for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                    var key = Object.keys(fieldSearch)[i];
                    var value = fieldSearch[key];

                    if(value){
                       ctrl.tableState().search.predicateObject[key] = value;
                    }
                }
            }
            
            ctrl.pipe(ctrl.tableState());
			
		});
    }
  }
});