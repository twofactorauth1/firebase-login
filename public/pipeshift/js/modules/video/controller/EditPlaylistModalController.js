angular.module('app.modules.video').controller('EditPlaylistModalController', ['$scope', '$modal', '$http', '$location', '$timeout', '$modalInstance', 'playlist', 'templates', 'playlistService', function ($scope, $modal, $http, $location, $timeout, $modalInstance, playlist, templates, playlistService) {
    $scope.modal = {};
    $scope.isSubdomainChecked = true;
    $scope.isSubdomainFree = true;
    $scope.protocol = $location.protocol() + "://"
    var host = $location.host();
    $scope.hostHasWWW = host.indexOf("www.") == 0;
    if ($scope.hostHasWWW) {
        host = host.substring(4, host.length);
    }
    $scope.domain = host + ":" + $location.port();
    $scope.isAdd = false;
    $scope.title = "Course info"
    $scope.playlist = {_id: playlist._id, title: playlist.title, description: playlist.description, template: playlist.template, videos: playlist.videos, subtitle: playlist.subtitle, body: playlist.body, userId: playlist.userId, subdomain: playlist.subdomain, price: playlist.price};
    $scope.templates = templates;
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.submit = function () {
        $modalInstance.close({playlist: $scope.playlist, isRemove: false});
    }
    $scope.removePlaylist = function () {
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/removeModal.html',
            controller: 'RemoveModalController',
            resolve: {
                message: function () {
                    return "Are you sure you want to remove this playlist?";
                }
            }
        });
        modalInstance.result.then(function () {
            $modalInstance.close({playlist: $scope.playlist, isRemove: true});
        }, function () {
        });
    }
    var subdomainChangeTimeout = -1;
    $scope.onSubdomainChange = function () {
        $scope.isSubdomainChecked = false;
        $scope.isSubdomainFree = false;
        if (subdomainChangeTimeout > 0) {
            $timeout.cancel(subdomainChangeTimeout);
        }
        subdomainChangeTimeout = $timeout(function () {
            if ($scope.playlist.subdomain == playlist.subdomain) {
                $scope.isSubdomainChecked = true;
                $scope.isSubdomainFree = true;
            } else {
                playlistService.isSubdomainFree({subdomain: $scope.playlist.subdomain}).success(function (response) {
                    $scope.isSubdomainChecked = true;
                    if (response.success) {
                        $scope.isSubdomainFree = response.result;
                    }
                    if ($scope.isSubdomainFree) {
                        $scope.playlistForm.subdomain.$setValidity("isNotFree", true);
                    } else {
                        $scope.playlistForm.subdomain.$setValidity("isNotFree", false);
                    }
                });
            }
        }, 250)
    }
}])
;