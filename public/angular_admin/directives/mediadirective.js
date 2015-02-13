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
                                case "video":
                                    if (500 * 1024 * 1024 + 1 > parseInt(item.size)) {
                                        return true;
                                    } else {
                                        ToasterService.show('error', 'Max Video file size 500MB. Unable to Upload.');
                                    }
                                    break;
                                case "image":
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
                $scope.selectModel = {
                    select_all: false
                };
                $scope.batch = [];
                $scope.m = $scope.m || {};
                $scope.isMobile =  false;
                $scope.checkMobile = function() {
                  var check = false;
                  (function(a, b) {
                    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
                  })(navigator.userAgent || navigator.vendor || window.opera);
                  $scope.isMobile = check;
                  return check;
                }
                $scope.checkMobile();
                //http://en.wikipedia.org/wiki/Internet_media_type
                $scope.typeMimes = {
                  image: ['image/png', 'image/jpeg', 'image/gif'],
                  video: ['video/mpeg', 'video/mp4', 'video/webm', 'video/x-flv', 'video/x-ms-wmv'],
                  audio: ['audio/mpeg'],
                  document: ['application/octet-stream', 'application/pdf']
                };

                $scope.m.selectTriggerFn = function (status) {
                    $scope.selectModel.select_all = status;
                    $scope.m.selectAll();
                };

                $scope.m.selectAll = function(showType, filterOnly) {
                    filterOnly = filterOnly || false;

                    if (showType) {
                        $scope.showType = showType;
                    }
                    $scope.batch = [];
                    $scope.assets = [];
                    $scope.mimeList = [];

                    if ($scope.showType !== 'all') {
                      $scope.mimeList = $scope.typeMimes[$scope.showType];
                    }

                    $scope.originalAssets.forEach(function(value, index) {
                      if ( !filterOnly ) {
                        value.checked = $scope.selectModel.select_all;
                      }

                      if ($scope.showType === 'all') {
                        $scope.assets.push(value);
                        if ( value.checked ) {
                            $scope.batch.push(value);
                        }
                      } else {
                        if ($scope.mimeList.indexOf(value.mimeType) > -1) {
                          $scope.assets.push(value);
                          if ( value.checked ) {
                            $scope.batch.push(value);
                          }
                        }
                      }
                    });
                    $scope.lastSelect = null;
                    $scope.m.selectAllStatus();
                };

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
                                if (asset._id !== v._id) {
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
                    var allTrue = false;
                    if ( $scope.assets.length > 0 ) {
                        allTrue = true;
                        $scope.assets.forEach(function(v, i) {
                            if (v.checked !== true) {
                                allTrue = false;
                            }
                        });
                    }
                    $scope.selectModel.select_all = allTrue;
                };

                $scope.m.deleteAsset = function() {
                    AssetsService.deleteAssets($scope.batch, function(resp, status) {
                        if ( status === 200 ) {
                          $scope.originalAssets.forEach(function(v, i) {
                            if (v._id === $scope.batch[0]['_id']) {
                              $scope.originalAssets.splice(i, 1);
                            }
                          });
                            $scope.assets.forEach(function(v, i) {
                                if (v._id === $scope.batch[0]['_id']) {
                                    $scope.assets.splice(i, 1);
                                }
                            });
                            $scope.batch.forEach(function(v, i) {
                                if (v._id === $scope.batch[0]['_id']) {
                                    $scope.batch.splice(i, 1);
                                }
                            });
                        }
                        $scope.selectModel.select_all = false;
                    });
                };

                $scope.m.editImage = function(asset) {
                    $scope.editingImage = true;
                    $scope.singleAsset = asset;

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
                        scope.originalAssets = data.slice(0);
                        scope.assets = data.slice(0);
                        if (scope.insertMediaType) {
                          scope.m.selectAll(scope.insertMediaType, true);
                        }
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
