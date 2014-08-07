angular.module('app.modules.video').controller('SearchOptionsModalController', ['$scope', '$modalInstance', 'searchOptions', function ($scope, $modalInstance, searchOptions) {
    $scope.searchOptions = {sources: ["youtube"], dateFrom: "", dateUntil: ""};
    if (searchOptions != null) {
        $scope.searchOptions = searchOptions;
    }
    $scope.minDate = new Date('2000-01-01');
    $scope.maxDate = new Date();
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.modal = {dateFromOpened: false, dateUntilOpened: false};
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.submit = function () {
        $modalInstance.close($scope.searchOptions);
    }
    $scope.openDateFrom = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.modal.dateFromOpened = true;
    };
    $scope.openDateUntil = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.modal.dateUntilOpened = true;
    };
}]);