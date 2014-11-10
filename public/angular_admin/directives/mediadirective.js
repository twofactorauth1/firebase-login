define(['angularAMD', 'angularFileUpload', 'assetsService', 'moment', 'timeAgoFilter','confirmClick2'], function (angularAMD) {
    angularAMD.directive('mediaModal', [ 'FileUploader', 'AssetsService', '$http', '$timeout', function (FileUploader, AssetsService, $http, $timeout) {
        return {
            require: [],
            restrict: 'C',
            transclude: false,
            replace: true,
            scope: {
                onInsertMediacb: "=",
                user: '=user'
            },
            controller: function ($scope, AssetsService,  $compile) {
                var uploader, footerElement, headerElement, contentElement,mediaElement, mediaModalElement;
                function resizeModal() {
                    contentElement.css('height', $(window).height() - 30 + 'px');
                    mediaElement.css( 'height', (contentElement.innerHeight() - ( footerElement.innerHeight() + headerElement.innerHeight() + 48)) + 'px');

                    var filterType = $('.filter-type');
                    $timeout(function (){
                        filterType.removeClass('filter-type');
                    },0 );
                    $timeout(function (){
                        filterType.addClass('filter-type');
                    },0 );
                }
                uploader = $scope.uploader = new FileUploader({
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

                    mediaModalElement = $('#media-manager-modal', '#model_container');
                    footerElement = $('.modal-footer', mediaModalElement);
                    headerElement = $('.modal-header', mediaModalElement);
                    contentElement = $('.modal-content', mediaModalElement);
                    mediaElement = $('.media', contentElement);

                    contentElement.css('visibility','hidden');
                    mediaModalElement.on('shown.bs.modal', function (e) {
                        $(window).trigger( "resize" )
                        contentElement.css('visibility', 'visible')
                    });

                });
                $(window).resize(function() {
                    resizeModal();
                });


                $scope.lastSelect = null;
                $scope.isSingleSelect = true;
                $scope.showType = "all";
                $scope.select_all = false;
                $scope.batch = [];
                $scope.m = $scope.m || {};

/*
                $scope.m.selectAll = function () {
                    $scope.assets.forEach(function (v, i) {
                        if ($scope.showType === 'all' || v.mimeType.match($scope.showType)) {
                            v.checked = $scope.select_all;
                        }
                    });
                };
                $scope.m.selectStatus = function () {
                    var allTrue = true;
                    $scope.assets.forEach(function (v, i) {
                        if (v.checked !== true) {
                            allTrue = false;
                        }
                    });
                    $scope.select_all = allTrue === true;
                };
                $scope.m.showType = function (type) {
                    $scope.showType = type;
                };
                $scope.m.resetUploader = function () {
                    $scope.uploadComplete = false;
                };
                $scope.m.singleSelect = function (event) {
                    if ($scope.lastSelect !== null && $scope.lastSelect.id !== event.target.id && $scope.lastSelect.checked === true) {
                        $scope.lastSelect.checked = false;
                    }
                    $scope.lastSelect = event.target;
                    $scope.m.getSingleSelect();
                };
*/
/*
                $scope.m.deleteAsset = function (assetId) {
                    AssetsService.deleteAssetById(function (resp, status) {
                        if (status === 1) {
                            $scope.assets.forEach(function (v, i) {
                                if (v._id === assetId) {
                                    $scope.assets.splice(i, 1);
                                }
                            })
                        }
                    }, assetId);
                };
                $scope.m.batchDeleteAsset = function () {
                    $scope.assets.forEach(function (v, i) {
                        if (v.checked)
                            $scope.m.deleteAsset(v._id);
                    });
                };
                $scope.m.getSingleSelect = function () {
                    $scope.batch = [];


                    $scope.assets.forEach(function (v, i) {
                        if (v.checked)
                            $scope.batch.push(v);
                    });
                };
                $scope.m.onInsertMedia = function () {
                    $scope.m.getSingleSelect();
                    if ($scope.batch.length > 0) {
                        $scope.onInsertMediacb($scope.batch[$scope.batch.length - 1]);
                    }
                };
                $scope.m.singleSelect = function (event) {
                    if ($scope.lastSelect !== null && $scope.lastSelect.id !== event.target.id && $scope.lastSelect.checked === true) {
                        $scope.lastSelect.checked = false;
                    }
                    $scope.lastSelect = event.target;
                    $scope.m.getSingleSelect();
                };


                $scope.m.onInsertMedia = function () {
                    $scope.m.getSingleSelect();
                    if ($scope.batch.length > 0) {
                        $scope.onInsertMediacb($scope.batch[$scope.batch.length - 1]);
                    }

                };
                */
                $scope.m.selectAll = function() {
                    $scope.batch = [];
                    $scope.assets.forEach(function (v) {
                        if ( $scope.select_all === false ) {
                            v.checked = false;
                        }
                        else if ( $scope.showType === 'all' || v.mimeType.match($scope.showType) ) {
                            v.checked = true;
                            $scope.batch.push(v);
                        }
                    });

                    $scope.lastSelect = null;
                    $scope.m.selectAllStatus();
                };
/*
                $scope.$watch("select_all", function () {
                    $scope.m.selectAll();
                });
*/
                $scope.m.singleSelect = function (asset) {
                    $timeout(function () {
                        if( !$scope.isSingleSelect) {
                            //$scope.batch.push(asset);
                            var hasAsset = false;
                            $scope.batch.forEach(function (v, i) {
                                if ( asset._id === v._id ) {
                                    $scope.batch.splice(i, 1);
                                    hasAsset = true;
                                }
                            });
                            if ( !hasAsset ) {
                                $scope.batch.push(asset)
                            }

                            $scope.m.selectAllStatus();
                        } else if ( $scope.isSingleSelect ) {
                            $scope.batch.forEach(function (v) {
                                if ( asset._id === v._id ) {
                                } else {
                                    v.checked = false;
                                }
                            });
                            $scope.batch = [];
                            $scope.batch.push(asset);

                            $scope.m.selectAllStatus();
                        }
                    }, 0)
                };
                $scope.m.toggleShiftKey = function (event){
                    $scope.isSingleSelect = !$scope.isSingleSelect;
                };

                $scope.m.selectAllStatus = function () {
                    var allTrue = true;
                    $scope.assets.forEach(function (v, i) {
                        if (v.checked !== true) {
                            allTrue = false;
                        }
                    });
                    $scope.select_all = allTrue === true;
                };
                $scope.m.deleteAsset = function () {
                    AssetsService.deleteAssetById($scope.batch, function (assetId, resp, status) {
                        if ( status === 1 ) {
                            $scope.assets.forEach(function (v, i) {
                                if (v._id === assetId) {
                                    $scope.assets.splice(i, 1);
                                }
                            });
                            $scope.batch.forEach(function (v, i) {
                                if (v._id === assetId) {
                                    $scope.batch.splice(i, 1);
                                }
                            });
                        }
                    });
                };
                $scope.m.onInsertMedia = function () {
                    if ($scope.batch.length > 0) {
                        $scope.onInsertMediacb && $scope.onInsertMediacb($scope.batch[$scope.batch.length - 1]);
                    }

                    $("#media-manager-modal").modal('hide');
                };
            },

            link: function (scope, element) {
                scope.assets = [];
                AssetsService.getAssetsByAccount(function(data){
                    scope.assets = data;
                });
                element.attr("data-toggle", "modal");
                element.attr("data-target", "#media-manager-modal");

            }
        };
    }]).directive('captureShift', function(){
            return {
                restrict: 'A',
                scope: {
                    onPresskey: "="
                },
                link: function(scope, elem, attrs) {
                    function onShift(e){
                        if ( e.shiftKey ) {
                            scope.onPresskey();
                            elem[0].onkeydown = null;
                            elem[0].onkeyup = offShift;
                        }
                    }
                    function offShift(e) {
                        if ( e.keyIdentifier==='Shift' ) {
                            scope.onPresskey();
                            elem[0].onkeyup = null;
                            elem[0].onkeydown = onShift;
                        }
                    }
                    elem[0].onkeydown = onShift;
                }
            }
        });
});