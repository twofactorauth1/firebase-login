app.directive('navigationComponent', ['WebsiteService', 'AccountService', function (WebsiteService, AccountService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
    },
    controller: function ($scope, WebsiteService, AccountService, $compile) {
      $scope.isSinglePost = $scope.$parent.isSinglePost;
      if($scope.$parent.website)
        $scope.website = $scope.$parent.website;
      else
        $scope.$parent.getWebsite(function (website) {
          $scope.website = website;
        });     

      AccountService.getAccount(function (account) {
        $scope.account = account;
      });
    }
  }
}]);
