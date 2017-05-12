app.directive('textOnlyComponent',  ['$timeout',function ($timeout) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html'
  ,
   controller: function ($scope,SsbPageSectionService,$compile) {

       $scope.$watch(function() { return SsbPageSectionService.offset }, function(offset) {
           $timeout(function () {
               var anchors= $("#" +$scope.component._id +" [du-smooth-scroll]");
               var stickyParent=$("#" +$scope.component._id).parent("#sticky-wrapper");
               if(anchors && stickyParent){
                   angular.forEach(anchors, function(value, key) {
                      $( value).attr("offset",offset);
                       $compile($(value))($scope);
                   });
               }
           },100);
       }, true);
   }
  }

}]);
