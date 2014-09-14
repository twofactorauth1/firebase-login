angular.module('app.modules.video').controller('SubscribersCsvUploadController', ['$scope', '$modal', '$http', '$location', '$timeout', '$modalInstance', 'playlist', 'subscriberService', 'FileUploader', function ($scope, $modal, $http, $location, $timeout, $modalInstance, playlist, subscriberService, FileUploader) {
    $scope.modal = {};
    $scope.protocol = $location.protocol() + "://"
    var host = $location.host();
    $scope.hostHasWWW = host.indexOf("www.") == 0;
    if ($scope.hostHasWWW) {
        host = host.substring(4, host.length);
    }
    $scope.domain = host + ":" + $location.port();
    $scope.close = function () {
        $modalInstance.dismiss();
    }
    $scope.submit = function () {
        $scope.isSubmitted = true;
        uploader.uploadAll();
    }
    var uploader = $scope.uploader = new FileUploader({
        queueLimit: 1,
        url: $scope.protocol + $scope.domain + "/api/playlists/" + playlist._id + "/subscribers/upload"
    });
    uploader.onAfterAddingFile = function (fileItem) {
        $scope.isFileSelected = true;
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
        alert(response.result);
        $modalInstance.close();
    };
}])
;