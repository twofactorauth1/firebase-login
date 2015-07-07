app.directive('pricingTablesComponent', function () {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.isEditing = true;
      scope.addPricingTableFeature = function (componentId, index) {
        console.log('add feature');
      }
      scope.deletePricingTableFeature = function (componentId, index) {
        console.log('delete feature');
      }
      scope.addPricingTable = function (componentId, index) {
      	console.log('add table');
      }
      scope.deletePricingTable = function (componentId, index) {
      	console.log('delete table');
      }
    }
  }
});
