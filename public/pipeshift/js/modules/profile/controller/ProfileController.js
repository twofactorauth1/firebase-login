angular.module('app.modules.profile')
    .controller('ProfileController', ['$scope', '$http', 'security', 'host', function ($scope, $http, security, host) {
        $http.get(host + '/current-user').then(function (response) {
            $scope.user = response.data.user;
        }, function (error) {
            if (error.status == 401) {
                security.resetUser();
            }
        });
        $scope.submitStripe = function () {

        }
    }]);