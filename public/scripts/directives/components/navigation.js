app.directive('navigationComponent', ['websiteService', 'accountService', function (websiteService, accountService) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    controller: function ($scope, websiteService, accountService, $compile) {
      websiteService(function (err, website) {
        $scope.website = website;
      });

      accountService(function (err, account) {
        $scope.account = account;
      });
    }
  }
}]);
