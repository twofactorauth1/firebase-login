define(['angularAMD', 'angularFileUpload', 'assetsService'], function (angularAMD) {
    angularAMD.directive('mediaModal', [ 'FileUploader', 'AssetsService', function (FileUploader, AssetsService) {
        return {
            require: [],
            restrict: 'C',
            transclude: true,
            scope: {
                user: '=user'
            },
            templateUrl: '/angular_admin/views/partials/_fileUploadModal.html',
            controller: function ($scope, AssetsService) {
                $scope.showType = "all";
                $scope.m = {};

                $scope.m.deleteAsset = function (assetId) {
                    AssetsService.deleteAssetById(function (resp, status){
                        if (status === 1 ) {
                            $scope.assets.forEach(function(v, i){
                                if ( v._id === assetId ) {
                                    $scope.assets.splice(i, 1);
                                }
                            })
                        }
                    }, assetId );
                };

                $scope.m.batchDeleteAsset = function () {
                    $scope.assets.forEach(function (v, i){
                        if(v.checked)
                            $scope.m.deleteAsset(v._id);
                    });
                };

                $scope.m.selectAll=function(){
                    $scope.assets.forEach(function (v, i){
                        v.checked=$scope.select_all;
                    });
                };

                $scope.m.selectStatus=function(){
                    var allTrue = true;
                    $scope.assets.forEach(function (v, i) {
                        if ( v.checked !== true ) {
                            allTrue = false;
                        }
                    });
                    $scope.select_all = allTrue === true;
                };

                $scope.m.showType = function (type) {
                    $scope.showType = type;
                };

                var uploader = $scope.uploader = new FileUploader({
                    url: '/api/1.0/assets/'
                });

                uploader.filters.push({
                    name: 'customFilter',
                    fn: function(item /*{File|FileLikeObject}*/, options) {
                        return this.queue.length < 10;
                    }
                });
                uploader.onSuccessItem = function(fileItem, response, status, headers) {
                    $scope.assets.push( response )
                };
            },
            link: function (scope, element) {
                AssetsService.getAssetsByAccount(function(data){
                    scope.assets = data;
                });

            }
        };
    }]);
});
