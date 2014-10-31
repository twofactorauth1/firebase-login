define(['angularAMD', 'angularFileUpload', 'assetsService', 'confirmClick2'], function (angularAMD) {
    angularAMD.directive('mediaModal', [ 'FileUploader', 'AssetsService','$http', function (FileUploader, AssetsService,$http) {
        return {
            require: [],
            restrict: 'C',
            transclude: false,
            replace: true,
            scope: {
                onInsertMediacb: "=",
                user: '=user'
            },
            //templateUrl: '/angular_admin/views/partials/_fileUploadModal.html',
            controller: function ($scope, AssetsService,  $compile) {
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

                $scope.m.resetUploader = function() {
                    $scope.uploadComplete = false;
                };

                $scope.m.getSingleSelect=function(){
                    $scope.batch=[];

                    $scope.assets.forEach(function (v, i){
                        if(v.checked)
                            $scope.batch.push(v);
                    });


                };

                $scope.m.onInsertMedia=function(){
                   $scope.m.getSingleSelect();
                    if($scope.batch.length>0)
                     $scope.onInsertMediacb($scope.batch[0]);
                };

                var uploader = $scope.uploader = new FileUploader({
                    url: '/api/1.0/assets/',
                    removeAfterUpload: true
                });

                uploader.filters.push({
                    name: 'customFilter',
                    fn: function(item /*{File|FileLikeObject}*/, options) {
                        return this.queue.length < 10;
                    }
                });

                uploader.onSuccessItem = function(fileItem, response, status, headers) {
                    $scope.uploadComplete = false;
                    response.files[0].filename = fileItem.file.name;
                    response.files[0].mimeType = fileItem.file.type;
                    $scope.assets.push( response.files[0] );
                };

                $http.get('/angular_admin/views/partials/mediamodal.html').success(function(data){
                    $compile(data)($scope).appendTo($('#model_container'));

                });


            },
            link: function (scope, element) {

                AssetsService.getAssetsByAccount(function(data){
                    scope.assets = data;
                });

                element.attr("data-toggle","modal");
                element.attr("data-target","#media-manager-modal");
            }
        };
    }]);
});
