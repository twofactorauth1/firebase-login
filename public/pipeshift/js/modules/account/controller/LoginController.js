angular.module("loginApp", []).controller("LoginController", ["$scope", "$http", function ($scope, $http) {
    this.user = {};
    this.login = function () {
        this.submited = true;
        if (this.loginForm.$valid) {
            $http.post('/login', {email: this.user.email, password: this.user.password}).success(function (data) {
                if (data.success) {
                    window.location = "/video/listeditor";
                } else {
                    alert(data.error);
                }
            }).error(function (data) {
                alert("Some error happened.");
            });
        }
    }
}]);