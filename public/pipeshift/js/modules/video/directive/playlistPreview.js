angular.module('app.directives').directive('playlistPreview', function () {
    function getTimezoneOffset() {
        return (new Date()).getTimezoneOffset();
    }

    return {
        scope: {
            editMode: "=",
            playlist: "=",
            minHeight: "="
        },
        controller: function ($scope, $http, host) {
            var playlist = $scope.playlist;
            $scope.modal = {};
            $scope.subscribe = function () {
                if (playlist.subdomain == null || playlist.subdomain.trim() == "") {
                    alert("Please define course subdomain first.");
                } else {
                    $scope.modal.submited = true;
                    if ($scope.modal.emailForm.$valid) {
                        if (playlist.videos.length == 0) {
                            alert("Error: empty playlist");
                        } else {
                            $http.post(host + '/api/playlists/' + playlist._id + '/subscribe/', {email: $scope.modal.email, playlist: playlist, timezoneOffset: getTimezoneOffset()}).success(function (data) {
                                if (data.success) {
                                    alert("Course has been scheduled for " + $scope.modal.email);
                                } else {
                                    alert(data.error);
                                }
                            }).error(function (data) {
                                alert("Some error happened.");
                            });
                        }
                    }
                }
            };
        },
        replace: true,
        restrict: 'E',
        templateUrl: '/views/directives/playlistPreview.html'
    }
});
