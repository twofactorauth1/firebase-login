app.directive('navigationComponent', ['websiteService', 'accountService', '$timeout', function (websiteService, accountService, $timeout) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    controller: function ($scope, websiteService, accountService, $compile) {
      websiteService(function (err, website) {
        $scope.website = website;
        $timeout(function () {
          $(window).trigger('resize');
        }, 0);
      });
      accountService(function (err, account) {
        $scope.account = account;
      });
    }
  }
}]);
