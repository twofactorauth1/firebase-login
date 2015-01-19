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
                    $scope.originalAssets.push(response.files[0]);
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

                //http://en.wikipedia.org/wiki/Internet_media_type
                $scope.typeMimes = {
                  image: ['image/png', 'image/jpeg', 'image/gif'],
                  video: ['video/mpeg'],
                  audio: ['audio/mpeg'],
                  document: ['application/octet-stream', 'application/pdf']
                };


                $scope.m.deleteAsset = function(assetId) {
                    AssetsService.deleteAssetById(function(resp, status) {
                        if (status === 1) {
                          $scope.originalAssets.forEach(function(v, i) {
                            if (v._id === assetId) {
                              $scope.originalAssets.splice(i, 1);
                            }
                          });
                            $scope.assets.forEach(function(v, i) {
                                if (v._id === assetId) {
                                    $scope.assets.splice(i, 1);
                                }
                            });
                        }
                    }, assetId);
                };
                $scope.m.batchDeleteAsset = function() {
                  $scope.originalAssets.forEach(function(v, i) {
                    if (v.checked)
                      $scope.m.deleteAsset(v._id);
                    });
                    $scope.assets.forEach(function(v, i) {
                        if (v.checked)
                            $scope.m.deleteAsset(v._id);
                    });
                };
                $scope.m.selectAll = function(filter) {
                    $scope.showType = filter;
                    $scope.batch = [];
                    $scope.assets = [];
                    $scope.mimeList = [];

                    if ($scope.showType !== 'all') {
                      $scope.mimeList = $scope.typeMimes[$scope.showType];
                    }

                    $scope.originalAssets.forEach(function(value, index) {
                      value.checked = $scope.select_all;
                      if ($scope.showType === 'all') {
                        $scope.assets.push(value);
                        $scope.batch.push(value);
                      } else {
                        if ($scope.mimeList.indexOf(value.mimeType) > -1) {
                          $scope.assets.push(value);
                          $scope.batch.push(value);
                        }
                      }
                    });

                    $scope.lastSelect = null;
                    $scope.m.selectAllStatus();
                    console.info('Total:', $scope.originalAssets.length, 'Filtered:', $scope.assets.length);
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
                          $scope.originalAssets.forEach(function(v, i) {
                            if (v._id === assetId) {
                              $scope.originalAssets.splice(i, 1);
                            }
                          });
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
                        scope.originalAssets = data;
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
