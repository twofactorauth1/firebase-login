define(['angularAMD', 'angularFileUpload', 'assetsService', 'timeAgoFilter', 'confirmClick2', 'toasterService', 'truncateDirective'], function(angularAMD) {
    angularAMD.directive('mediaModal', ['FileUploader', 'AssetsService', '$http', '$timeout', 'ToasterService', function(FileUploader, AssetsService, $http, $timeout, ToasterService) {
        return {
            require: [],
            restrict: 'C',
            transclude: false,
            replace: true,
            scope: {
                insertMediaType: "=",
                onInsertMediacb: "=",
                user: '=user'
            },
            controller: function($scope, AssetsService, $compile) {
                var uploader, footerElement, headerElement, contentElement, mediaElement, mediaModalElement;

                function resizeModal() {
                    contentElement.css('height', $(window).height() - 30 + 'px');
                    mediaElement.css('height', $(window).height() - 30 + 'px');
                    $scope.bodyHeight = $(window).height() - 210 + 'px';

                    var filterType = $('.filter-type');
                    $timeout(function() {
                        filterType.removeClass('filter-type');
                    }, 0);
                    $timeout(function() {
                        filterType.addClass('filter-type');
                    }, 0);
                }
                uploader = $scope.uploader = new FileUploader({
                    url: '/api/1.0/assets/',
                    removeAfterUpload: true,
                    filters: [{
                        name: "SizeLimit",
                        fn: function(item) {
                            switch (item.type.substring(0, item.type.indexOf('/'))) {
                                case "image":
                                    console.log('image type');
                                case "video":
                                    if (500 * 1024 * 1024 + 1 > parseInt(item.size)) {
                                        return true;
                                    } else {
                                        ToasterService.show('error', 'Max Video file size 500MB. Unable to Upload.');
                                    }
                                    break;
                                case "audio":
                                case "document":
                                default:
                                    //size in bytes
                                    if (10 * 1024 * 1024 > parseInt(item.size)) {
                                        return true;
                                    } else {
                                        ToasterService.show('error', 'Max file size 10MB. Unable to Upload.');
                                    }
                            }
                            return false;
                        }
                    }]
                });
                uploader.filters.push({
                    name: 'customFilter',
                    fn: function(item /*{File|FileLikeObject}*/ , options) {
                        return this.queue.length < 10;
                    }
                });
                uploader.onSuccessItem = function(fileItem, response, status, headers) {
                    $scope.uploadComplete = false;
                    response.files[0].filename = fileItem.file.name;
                    response.files[0].mimeType = fileItem.file.type;
                    $scope.assets.push(response.files[0]);
                };

                uploader.onErrorItem = function(item, response, status, headers) {
                    $scope.uploadComplete = false;
                    ToasterService.show('error', 'Connection timed out');
                };

                $http.get('/angular_admin/views/partials/mediamodal.html').success(function(data) {
                    $compile(data)($scope).appendTo($('#model_container'));

                    mediaModalElement = $('#media-manager-modal', '#model_container');
                    footerElement = $('.modal-footer', mediaModalElement);
                    headerElement = $('.modal-header', mediaModalElement);
                    contentElement = $('.modal-content', mediaModalElement);
                    mediaElement = $('.media', mediaModalElement);

                    contentElement.css('visibility', 'hidden');
                    mediaModalElement.on('shown.bs.modal', function(e) {
                        $scope.showInsert = $(e.relatedTarget).attr("media-modal-show-insert");
                        $(window).trigger("resize")
                        contentElement.css('visibility', 'visible')
                    });

                });
                $(window).resize(function() {
                    resizeModal();
                });


                $scope.lastSelect = null;
                $scope.isSingleSelect = true;
                $scope.showType = "all";
                $scope.editingImage = false;
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

                $scope.m.deleteAsset = function(assetId) {
                    AssetsService.deleteAssetById(function(resp, status) {
                        if (status === 1) {
                            $scope.assets.forEach(function(v, i) {
                                if (v._id === assetId) {
                                    $scope.assets.splice(i, 1);
                                }
                            })
                        }
                    }, assetId);
                };
                $scope.m.batchDeleteAsset = function() {
                    $scope.assets.forEach(function(v, i) {
                        if (v.checked)
                            $scope.m.deleteAsset(v._id);
                    });
                };
                $scope.m.selectAll = function(showType) {

                    if (showType) {
                        $scope.showType = showType;
                    }
                    $scope.batch = [];
                    $scope.assets.forEach(function(v) {
                        if ($scope.select_all === false) {
                            v.checked = false;
                        } else if ($scope.showType === 'all' || v.mimeType.match($scope.showType)) {
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
                $scope.m.singleSelect = function(asset) {
                    $scope.singleSelected = true;
                    $timeout(function() {
                        if (!$scope.isSingleSelect) {
                            //$scope.batch.push(asset);
                            var hasAsset = false;
                            $scope.batch.forEach(function(v, i) {
                                if (asset._id === v._id) {
                                    $scope.batch.splice(i, 1);
                                    hasAsset = true;
                                }
                            });
                            if (!hasAsset) {
                                $scope.batch.push(asset)
                            }

                            $scope.m.selectAllStatus();
                        } else if ($scope.isSingleSelect) {
                            $scope.batch.forEach(function(v) {
                                if (asset._id === v._id) {} else {
                                    v.checked = false;
                                }
                            });
                            $scope.batch = [];
                            $scope.batch.push(asset);

                            $scope.m.selectAllStatus();
                        }
                    }, 0)
                };

                $scope.m.toggleShiftKey = function(event) {
                    $scope.isSingleSelect = !$scope.isSingleSelect;
                };

                $scope.m.selectAllStatus = function() {
                    var allTrue = true;
                    $scope.assets.forEach(function(v, i) {
                        if (v.checked !== true) {
                            allTrue = false;
                        }
                    });
                    $scope.select_all = allTrue === true;
                };
                $scope.m.deleteAsset = function() {
                    AssetsService.deleteAssetById($scope.batch, function(assetId, resp, status) {
                        if (status === 1) {
                            $scope.assets.forEach(function(v, i) {
                                if (v._id === assetId) {
                                    $scope.assets.splice(i, 1);
                                }
                            });
                            $scope.batch.forEach(function(v, i) {
                                if (v._id === assetId) {
                                    $scope.batch.splice(i, 1);
                                }
                            });
                        }
                    });
                };

                $scope.m.editImage = function(asset) {
                    $scope.editingImage = true;
                    $scope.singleAsset = asset;
                    console.log('asset ', asset);

                    var targetImage = $('#targetEditImage');
                    // image.crossOrigin = 'anonymous';
                    // console.log('image ', $('#targetEditImage'));
                    // Caman('#targetEditImage', function () {
                    //     this.brightness(100);
                    //     this.contrast(30);
                    //     this.sepia(60);
                    //     this.saturation(-30);
                    //     this.render();
                    //   });

                    // var canvas =  $('#media-manager-modal #targetCanvas')[0];
                    // console.log('canvas ', canvas);
                    // var ctx = canvas.getContext('2d'),
                    // img = new Image();
                    // img.crossOrigin = 'anonymous'; // Try to remove/comment this line
                    // img.src = $("#originalSource").attr('src');
                    // ctx.drawImage(img,10,20);
                    // var imgData = JSON.parse(JSON.stringify(canvas.toDataURL("image/jpeg")));
                    // targetImage.attr('src', imgData);

                    // targetImage[0].crossOrigin = 'anonymous';
                    // var dkrm = new Darkroom(targetImage[0], {
                    //     // Size options
                    //     minWidth: 100,
                    //     minHeight: 100,
                    //     maxWidth: 650,
                    //     maxHeight: 500,

                    //     plugins: {
                    //         save: false,
                    //         crop: {
                    //             quickCropKey: 67, //key "c"
                    //             //minHeight: 50,
                    //             //minWidth: 50,
                    //             //ratio: 1
                    //         }
                    //     },
                    //     init: function() {
                    //         console.log('darkroom init');

                    //         //cropPlugin.requireFocus();
                    //     }
                    // });

                    // console.log('dkrm ', dkrm);

                };

                $scope.m.goback = function() {
                    $scope.editingImage = false;
                };

                $scope.m.onInsertMedia = function() {
                    if ($scope.batch.length > 0) {
                        $scope.onInsertMediacb && $scope.onInsertMediacb($scope.batch[$scope.batch.length - 1], $scope.type || $scope.insertMediaType);
                        $scope.type = null;
                    }

                    $("#media-manager-modal").modal('hide');
                };
            },

            link: function(scope, element) {
                scope.assets = [];
                AssetsService.getAssetsByAccount(function(data) {
                    if (data instanceof Array) {
                        scope.assets = data;
                    }
                });
                element.attr("data-toggle", "modal");
                element.attr("data-target", "#media-manager-modal");
                $(document).on("add_image", function(event) {
                    $("#media-manager-modal").modal('show');
                    scope.type = "image_gallery_add_image";
                })
                $(document).on("delete_image", function(event, index) {
                    scope.type = "image_gallery_delete_image";
                    scope.onInsertMediacb && scope.onInsertMediacb(index, scope.type);
                })
            }
        };
    }]).directive('captureShift', function() {
        return {
            restrict: 'A',
            scope: {
                onPresskey: "="
            },
            link: function(scope, elem, attrs) {
                function onShift(e) {
                    if (e.shiftKey) {
                        scope.onPresskey();
                        elem[0].onkeydown = null;
                        elem[0].onkeyup = offShift;
                    }
                }

                function offShift(e) {
                    if (e.keyIdentifier === 'Shift') {
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
