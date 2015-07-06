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
      //WebsiteService.getWebsite(function (website) {
        $scope.website = $scope.$parent.website;
      //});

      AccountService.getAccount(function (account) {
        $scope.account = account;
      });
    }
  }
}]);
