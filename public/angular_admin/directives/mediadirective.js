define(['angularAMD', 'angularFileUpload', 'assetsService', 'moment', 'timeAgoFilter','confirmClick2'], function (angularAMD) {
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
                //$compile('<div class="modal fade" id="media-manager-modal" tabindex="-1" role="dialog" aria-labelledby="mediaModelLabel"     aria-hidden="true">    <div class="modal-dialog modal-lg">        <div class="modal-content">            <div class="modal-header">                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>                <h4 class="modal-title"><span class="fa fa-image"></span> Media Manager</h4></div>            <div class="modal-body">                <div class="row filemanager {{showType}}">                    <ul class="filemanager-options">                        <li class="checked">                            <div class="ckbox ckbox-default"><input type="checkbox" id="selectall" ng-model="select_all"                                                                    ng-change="m.selectAll()" value="1"> <label                                    for="selectall">Select All</label></div>                        </li>                        <li class="hidden"><a href="" class="itemopt" ng-disabled="!select_all"><i                                class="fa fa-envelope-o"></i> <span class="hidden-xs">Email</span></a></li>                        <li class="hidden"><a href="" class="itemopt" ng-disabled="!select_all"><i                                class="fa fa-download"></i> <span class="hidden-xs">Download</span></a></li>                        <li class="hidden"><a href="" class="itemopt" ng-disabled="!select_all"><i                                class="fa fa-pencil"></i> <span class="hidden-xs">Edit</span></a></li>                        <li><a href="" class="itemopt" ng-disabled="!select_all" ng-click="m.batchDeleteAsset()"><i                                class="fa fa-trash-o"></i> <span class="hidden-xs">Delete</span></a></li>                        <li class="filter-type"> Show: <a href="" data-active="all"                                                          ng-click="m.showType(\'all\')">All</a> <a href=""                                                                                                    data-active="document"                                                                                                    ng-click="m.showType(\'document\')">Documents</a>                            <a href="" data-active="audio" ng-click="m.showType(\'audio\')">Audio</a> <a href=""                                                                                                         data-active="image"                                                                                                         ng-click="m.showType(\'image\')">Images</a>                            <a href="" data-active="video" ng-click="m.showType(\'video\')">Videos</a></li>                    </ul>                    <div class="media">                        <div ng-repeat="asset in assets track by $index"                             class="col-xs-6 col-sm-4 image {{asset.mimeType}}">                            <div class="thmb checked">                                <div class="ckbox ckbox-default" style="display: block;"><input type="checkbox"                                                                                                id="{{asset._id}}"                                                                                                name="{{asset._id}}"                                                                                                ng-change="m.selectStatus()"                                                                                                ng-model="asset.checked">                                    <label for="{{asset._id}}"></label></div>                                <div class="btn-group fm-group" style="display: block;">                                    <button type="button" class="btn btn-default dropdown-toggle fm-toggle"                                            data-toggle="dropdown"><span class="caret"></span></button>                                    <ul class="dropdown-menu fm-menu" role="menu">                                        <li class="hidden"><a href="#"><i class="fa fa-share"></i> Share</a></li>                                        <li class="hidden"><a href="#"><i class="fa fa-envelope-o"></i> Email</a></li>                                        <li class="hidden"><a href="#"><i class="fa fa-pencil"></i> Edit</a></li>                                        <li class="hidden"><a href="#"><i class="fa fa-download"></i> Download</a></li>                                        <li><a href="" ng-click="m.deleteAsset(asset._id)"><i class="fa fa-trash-o"></i>                                            Delete</a></li>                                    </ul>                                </div>                                <div class="thmb-prev">                                    <div><img ng-src="{{asset.url}}" alt=""></div>                                </div>                                <h5 class="fm-title"><a href="">{{asset.filename}}</a></h5>                                <small class="text-muted">{{asset.created.date | timeAgoFilter}}</small>                            </div>                        </div>                    </div>                </div>            </div>            <div class="modal-footer">                <div class="row">                    <div class="col-md-offset-8 col-md-4"><label for="upload_image" class="btn btn-primary"> Upload File                        <input type="file" id="upload_image" class="hidden" nv-file-select="" uploader="uploader"                               ng-click="resetUploader()" multiple> </label>                        <button type="button" class="btn btn-primary insert-image" ng-click="m.onInsertMedia()">Insert Images</button>                    </div>                </div>                <div class="row" ng-if="uploader.queue.length" ng-hide="uploadComplete">                    <div class="col-md-12">                        <table class="table">                            <thead>                            <tr>                                <th width="50%">Name</th>                                <th ng-show="uploader.isHTML5">Size</th>                                <th ng-show="uploader.isHTML5">Progress</th>                                <th>Status</th>                                <th>Actions</th>                            </tr>                            </thead>                            <tbody>                            <tr ng-repeat="item in uploader.queue">                                <td><strong>{{ item.file.name }}</strong></td>                                <td ng-show="uploader.isHTML5" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>                                <td ng-show="uploader.isHTML5">                                    <div class="progress" style="margin-bottom: 0;">                                        <div class="progress-bar" role="progressbar"                                             ng-style="{ \'width\': item.progress + \'%\' }"></div>                                    </div>                                </td>                                <td class="text-center"><span ng-show="item.isSuccess"><i                                        class="glyphicon glyphicon-ok"></i></span> <span ng-show="item.isCancel"><i                                        class="glyphicon glyphicon-ban-circle"></i></span> <span ng-show="item.isError"><i                                        class="glyphicon glyphicon-remove"></i></span></td>                                <td nowrap>                                    <button type="button" class="btn btn-success btn-xs" ng-click="item.upload()"                                            ng-disabled="item.isReady || item.isUploading || item.isSuccess"><span                                            class="glyphicon glyphicon-upload"></span> Upload                                    </button>                                    <button type="button" class="btn btn-warning btn-xs" ng-click="item.cancel()"                                            ng-disabled="!item.isUploading"><span                                            class="glyphicon glyphicon-ban-circle"></span> Cancel                                    </button>                                    <button type="button" class="btn btn-danger btn-xs" ng-click="item.remove()"><span                                            class="glyphicon glyphicon-trash"></span> Remove                                    </button>                                </td>                            </tr>                            </tbody>                        </table>                        <button type="button" class="btn btn-success btn-s" ng-click="uploader.uploadAll()"                                ng-disabled="!uploader.getNotUploadedItems().length"><span                                class="glyphicon glyphicon-upload"></span> Upload all                        </button>                    </div>                </div>            </div>        </div>    </div>    <style>                                        #media-manager-modal label[for="upload_image"] {        margin-bottom: 0 !important;    }    #media-manager-modal .media > * {        display: none;    }    #media-manager-modal .all .media > * {        display: inline;    }    #media-manager-modal .document .media > [class*="documnet"] {        display: inline;    }    #media-manager-modal .audio .media > [class*="audio"] {        display: inline;    }    #media-manager-modal .video .media > [class*="video"] {        display: inline;    }    #media-manager-modal .image .media > [class*="image"] {        display: inline;    }    #media-manager-modal .all [data-active="all"], #media-manager-modal .video [data-active="video"], #media-manager-modal .audio [data-active="audio"], #media-manager-modal .image [data-active="image"], #media-manager-modal .document [data-active="document"] {        text-decoration: underline;        color: #2A6496;    }    .filemanager .thmb-prev {        background: #eee;        overflow: hidden;        display: table;        width: 100%;        height: 150px;    }    .filemanager .thmb-prev > div {        display: table-cell;        vertical-align: middle;        text-align: center;    }    .filemanager .thmb-prev img {        max-height: 150px;        width: auto;         max-width: 100%;    }    </style></div>')($scope).appendTo($('#model_container'));

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
