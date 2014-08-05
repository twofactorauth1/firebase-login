angular.module('app.modules.profile')
    .controller('ProfileController', ['$scope', '$http', 'security', function ($scope, $http, security) {
        $http.get('/current-user').then(function (response) {
            $scope.user = response.data.user;
        }, function (error) {
            if (error.status == 401) {
                security.resetUser();
            }
        });
        $scope.submitStripe = function () {

        }
    }]);