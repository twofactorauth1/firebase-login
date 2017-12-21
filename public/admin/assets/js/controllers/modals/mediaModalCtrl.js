'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
app.controller('MediaModalCtrl', ['$scope', '$rootScope', 'mediaManagerConstant', '$injector', '$modalInstance', '$http', '$timeout', 'FileUploader', 'AssetsService', 'ToasterService', 'showInsert', 'insertMedia', 'isSingleSelect', 'SweetAlert', "$window", "AccountService", "editableOptions", function ($scope, $rootScope, mediaManagerConstant, $injector, $modalInstance, $http, $timeout, FileUploader, AssetsService, ToasterService, showInsert, insertMedia, isSingleSelect, SweetAlert, $window, AccountService, editableOptions) {
  var uploader, footerElement, headerElement, contentElement, mediaElement, mediaModalElement;

  $scope.showInsert = showInsert;
  $scope.loadingAssets = true;
  $scope.maximumUploadItems = 20;
  $scope.cachebuster = new Date().getTime();
  $scope.mediaModal = {
    replace:false,
    asset: null
  };
  $scope.paging ={
    recordPerPage: mediaManagerConstant.numberOfRowsPerPage
  }
  $scope.numberOfPages = numberOfPages;
  $scope.selectPage = selectPage;
  $scope.refreshPaging = refreshPaging;
  $scope.pagingParams = {
    limit: $scope.paging.recordPerPage,
    skip: 0,
    curPage: 1,
    showPages: mediaManagerConstant.displayedPages,
    filterType: $scope.insertMediaType || $scope.showType
  }

  /*
     * set editor theme
     */
  editableOptions.theme = 'bs3';

  AccountService.getAccount(function (account) {
    $scope.account = account;
    loadAssets();
  });


  function loadAssets(file){
    AssetsService.getPagedAssetsByAccount($scope.pagingParams, function (data) {
      if (data.results instanceof Array) {
        $scope.originalAssets = data.results;
        $scope.assets = data.results;
        $scope.assetsCount = data.total;
        drawPages();
        // Keep selected item selected on page
        if($scope.batch.length == 1 && !file){
          $scope.assets.forEach(function (v) {
            if ($scope.batch[0]['_id'] === v._id) {
              v.checked = true;
            }
          });
        }

        if($scope.selectModel.select_all){
          $scope.m.selectAll();
          $scope.singleSelected = false;
        }

        if(file){
          var asset = _.find($scope.assets, function(asset){return asset._id == file._id});
          if(asset){
            asset.checked = true;
            $scope.m.singleSelect(asset);
          }
        }

        $scope.pageLoading = false;
        $timeout(function() {
          $scope.loadingAssets = false;
        }, 0);
      }
    });
  }

  $scope.successCopy = function () {
      ToasterService.show('success', 'Successfully copied text to your clipboard! Now just paste it wherever you would like.');
  };

  $scope.replaceAssetFn = function(replace, asset){
    $scope.mediaModal = {
      replace:replace,
      asset: asset
    };
  };

  /*
   * @closeModal
   * -
   */

  $scope.closeModal = function () {
    console.log('closeModal >>> ');
    $timeout(function () {
      $modalInstance.close();
      angular.element('.modal-backdrop').remove();
    });
  };

  function resizeModal() {
    if (contentElement) {
      contentElement.css('height', angular.element($window).height() - 30 + 'px');
      mediaElement.css('height', angular.element($window).height() - 30 + 'px');
      $scope.bodyHeight = angular.element($window).height() - 210 + 'px';

      var filterType = $('.filter-type');
      $timeout(function () {
        filterType.removeClass('filter-type');
      }, 0);
      $timeout(function () {
        filterType.addClass('filter-type');
      }, 0);
    }

  };

  uploader = $scope.uploader = new FileUploader({
    url: '/api/1.0/assets/',
    removeAfterUpload: true,
    filters: [{
      name: "SizeLimit",
      fn: function (item) {
        switch (item.type.substring(0, item.type.indexOf('/'))) {
          case "video":
            if (500 * 1024 * 1024 + 1 > parseInt(item.size)) {
              return true;
            } else {
              ToasterService.show('error', 'The maximum video file size 500MB. Unable to Upload.');
            }
            break;
          case "image":
          case "audio":
            //size in bytes
            if (50 * 1024 * 1024 > parseInt(item.size)) {
              return true;
            } else {
              ToasterService.show('error', 'The maximum audio file size 50MB. Unable to Upload.');
            }
            break;
          case "document":
          default:
            //size in bytes
            if (10 * 1024 * 1024 > parseInt(item.size)) {
              return true;
            } else {
              ToasterService.show('error', 'The maximum file size 10MB. Unable to Upload.');
            }
        }
        return false;
      }
    }]
  });

  uploader.onBeforeUploadItem = onBeforeUploadItem;


  function onBeforeUploadItem(item) {
    if($scope.mediaModal.asset)  {
        item.formData.push({
            replace: $scope.mediaModal.replace,
            assetToBeReplaced :  $scope.mediaModal.asset._id
        });
    } else {
        item.formData.push({
            replace: $scope.mediaModal.replace,
            assetToBeReplaced : ''
        });
    }
  }

  uploader.filters.push({
    name: 'customFilter',
    fn: function (item /*{File|FileLikeObject}*/ , options) {
      if(this.queue.length < $scope.maximumUploadItems)
        $scope.maxLengthExceed = false;
      else
        $scope.maxLengthExceed = true;
      return this.queue.length < $scope.maximumUploadItems;
    }
  });

  uploader.filters.push({
    name: 'customFonts',
    fn: function (item, options) {
      var _this = this;
      $scope.customFonts = false;
      if(item.name && _.contains([".ttf", ".woff", ".woff2", ".eot", ".otf"], item.name.substr(item.name.lastIndexOf('.')))){
        SweetAlert.swal({
          title: "",
          text: "Indigenous is not responsible for acquiring rights to the fonts uploaded here. Please ensure you have the appropriate license(s) or rights.",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, I agree!",
          cancelButtonText: "No, do not agree!",
          closeOnConfirm: true,
          closeOnCancel: true,
        }, function (isConfirm) {
          if(isConfirm){
            $timeout(function() {
              $scope.customFonts = true;
              return true;
            }, 0);
          }
          else{
            $scope.customFonts = false;
            _this.clearQueue();
          }
        });

        return true;
      }
      else{
        return true;
      }
    }
  });

  uploader.onSuccessItem = function (fileItem, response, status, headers) {
    $scope.uploadComplete = false;
    $scope.selectModel.select_all = false;
    var file_name = fileItem.file.name;
    file_name = file_name.replace(/ /g, "_");
    response.files[0].filename = file_name;
    response.files[0].mimeType = fileItem.file.type;
    //$rootScope.$broadcast('$refreshCustomFonts');
    if($scope.mediaModal.replace){
        if($scope.mediaModal.asset){
          $scope.cachebuster = new Date().getTime();
          response.files[0].filename = $scope.mediaModal.asset.filename;
          var originalAsset =_.findWhere($scope.originalAssets, { _id: $scope.mediaModal.asset._id });
          var asset =_.findWhere($scope.assets, { _id: $scope.mediaModal.asset._id });
          _.extend(originalAsset, response.files[0]);
          _.extend(asset, response.files[0]);
          originalAsset.checked = true;
          asset.checked = true;
          $scope.m.singleSelect(asset);
          ToasterService.showWithTitle('success', 'Replacement image has been uploaded', 'By default, images are cached by the browser for 24 hours. Flush your browser cache to see the latest media (or wait)');
        }
    }
    else{
      //$scope.originalAssets.push(response.files[0]);
      //$scope.assets.push(response.files[0]);
      if(uploader.queue.length <= 1){
        loadDefaultsForPaging();
        loadAssets(response.files[0]);
      }

      if($scope.customFonts){
        ToasterService.showWithTitle('success', 'Custom fonts has been uploaded', 'You will need to log out and log back in to see the added font(s)');
        $scope.customFonts = false;
      }

    }


  };

  uploader.onErrorItem = function (item, response, status, headers) {
    $scope.uploadComplete = false;
    ToasterService.show('error', 'Connection timed out');
  };

  angular.element($window).resize(function () {
    resizeModal();
  });

  $scope.lastSelect = null;
  $scope.isSingleSelect = isSingleSelect;
  $scope.showType = "all";
  if(insertMedia && insertMedia.name === 'insertVideoMedia'){
    $scope.showType = "video";
    $scope.pagingParams.filterType= "video";
  }
  $scope.editingImage = false;
  $scope.selectModel = {
    select_all: false
  };
  $scope.batch = [];
  $scope.m = $scope.m || {};
  $scope.isMobile = false;

  $scope.checkMobile = function () {
    var check = false;
    (function (a, b) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
    })(navigator.userAgent || navigator.vendor || $window.opera);
    $scope.isMobile = check;
    return check;
  };

  $scope.checkMobile();
  //http://en.wikipedia.org/wiki/Internet_media_type
  $scope.typeMimes = {
    image: ['image/png', 'image/jpeg', 'image/gif', 'image/*'],
    video: ['video/mpeg', 'video/mp4', 'video/webm', 'video/x-flv', 'video/x-ms-wmv', 'video/*' ],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/*'],
    document: ['application/octet-stream', 'application/pdf', 'text/plain']
  };

  //.ttf, .woff, .woff2, .eot

  $scope.getFileType = function(mime, value){
    if(value && value.type === 'fonts'){
      return "fonts"
    }else if(mime.match('audio.*'))
      return "audio"
    else if(mime.match('video.*'))
      return "video"
    else if(mime.match('image.*'))
      return "image"
    else if(mime === 'application/pdf')
      return "pdf"
    else if(mime === 'application/octet-stream' || mime === 'text/plain')
      return "octet-stream"
  }

  $scope.m.selectTriggerFn = function (status) {
    $scope.selectModel.select_all = status;
    $scope.m.selectAll();
    $scope.singleSelected = false;
  };

  $scope.m.selectAll = function (showType, filterOnly) {
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

    $scope.originalAssets.forEach(function (value, index) {
      if (!filterOnly) {
        value.checked = $scope.selectModel.select_all;
      }

      if ($scope.showType === 'all') {
        $scope.assets.push(value);
        if (value.checked) {
          $scope.batch.push(value);
        }
      } else {
        if ($scope.mimeList.indexOf(value.mimeType) > -1 || $scope.getFileType(value.mimeType, value) === $scope.showType ) {
          $scope.assets.push(value);
          if (value.checked) {
            $scope.batch.push(value);
          }
        }
      }
    });
    $scope.lastSelect = null;
    $scope.m.selectAllStatus();
  };

  $scope.m.filterAssets = function(showType){
    if (showType) {
      $scope.showType = showType;
    }
    loadDefaultsForPaging();
    $scope.pagingParams.filterType = showType;
    loadAssets();
  };


  function loadDefaultsForPaging(){
    $scope.pagingParams.curPage = 1;
    $scope.pagingParams.skip = 0;
    $scope.pageLoading = true;
  }

  $scope.m.singleSelect = function (asset) {
    $scope.singleSelected = asset.checked;

    $timeout(function () {
      if (!$scope.isSingleSelect || !$scope.singleSelected || $scope.selectModel.select_all) {
        //$scope.batch.push(asset);
        var hasAsset = false;
        $scope.batch.forEach(function (v, i) {
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
        $scope.batch.forEach(function (v) {
          if (asset._id !== v._id) {
            v.checked = false;
          }
        });

        $scope.batch = [];
        if ($scope.singleSelected)
          $scope.batch.push(asset);
        $scope.m.selectAllStatus();
      }
    }, 0)
  };

  $scope.m.toggleShiftKey = function (event) {
    $scope.isSingleSelect = !$scope.isSingleSelect;
  };

  $scope.m.selectAllStatus = function () {
    var allTrue = false;
    if ($scope.assets.length > 0) {
      allTrue = true;
      $scope.assets.forEach(function (v, i) {
        if (v.checked !== true) {
          allTrue = false;
        }
      });
    }
    $scope.selectModel.select_all = allTrue;
  };

  $scope.m.deleteAsset = function (asset) {

  angular.element('.modal.in').hide();
   var _deleteText = "Do you want to delete";
   SweetAlert.swal({
      title: "Are you sure?",
      text: _deleteText,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "No, do not delete!",
      closeOnConfirm: true,
      closeOnCancel: true,
    }, function (isConfirm) {
      if (isConfirm) {
        if (asset)
          $scope.batch.push(asset);
        if($scope.batch && $scope.batch.length){
          $scope.batch = _.uniq($scope.batch);
          var refreshList = angular.equals($scope.batch.length, $scope.assets.length);
          AssetsService.deleteAssets($scope.batch, function (resp, status) {
            if (status === 200) {
                $scope.originalAssets.forEach(function (v, i) {
                  if (v._id === $scope.batch[0]['_id']) {
                    $scope.originalAssets.splice(i, 1);
                  }
                });
                $scope.assets.forEach(function (v, i) {
                  if (v._id === $scope.batch[0]['_id']) {
                    $scope.assets.splice(i, 1);
                  }
                });
                $scope.batch.forEach(function (v, i) {
                  if (v._id === $scope.batch[0]['_id']) {
                    $scope.batch.splice(i, 1);
                  }
              });
              if(!$scope.batch.length){
                //Check if the all the items of page are deleted
                if(refreshList){
                  loadDefaultsForPaging();
                }
                // Else land to the same
                {
                  $scope.pageLoading = true;
                  loadAssets();
                }
              }

              SweetAlert.swal("Saved!", "deleted.", "success");
              angular.element('.modal.in').show();
            }
            else
            {
              SweetAlert.swal("Error!", "error deleting files.", "error");
              angular.element('.modal.in').show();
            }
            $scope.selectModel.select_all = false;
            $scope.singleSelected = false;
          });
        }
        else
        {
          SweetAlert.swal("Error!", "No file found for deletion.", "error");
          angular.element('.modal.in').show();
        }
      } else {
        angular.element('.modal.in').show();
      }
    });
  };

  $scope.m.editImage = function (asset) {
    $scope.editingImage = true;
    $scope.singleAsset = asset;

    var targetImage = $('#targetEditImage');
  };

  $scope.m.goback = function () {
    $scope.editingImage = false;
  };

  $scope.m.onInsertMedia = function () {
    if ($scope.batch.length > 0) {
      if (insertMedia) {
        if ($scope.isSingleSelect) {
            insertMedia($scope.batch[$scope.batch.length - 1], $scope.type || $scope.insertMediaType);
        } else {
            insertMedia($scope.batch, $scope.type || $scope.insertMediaType);
        }
        $scope.type = null;
      } else {
        if ($scope.isSingleSelect) {
            insertMedia($scope.batch[$scope.batch.length - 1]);
        } else {
            insertMedia($scope.batch);
        }
      }
    }
    $scope.m.selectTriggerFn(false);
    $scope.singleSelected = false;
    $scope.closeModal();
  };
  $scope.m.onCallbackOnMediaClose = function(){
    insertMedia();
    $scope.closeModal();
  }

  $scope.m.onAssetUpdateCallback = function (asset) {
    var originalAsset = angular.copy(asset);
    originalAsset.checked = false;
    originalAsset.accountId = $scope.account._id;
    AssetsService.updateAsset(originalAsset, function (data, status) {
      if (status == 200) {
        asset.url=data.url;
        ToasterService.show('success', 'Asset updated.');
      }
    });
  };

  $scope.validateAsset = function(data){
    if(!data){
      return "Please fill this field";
    }
  }
  $scope.m.addRemoveAssetFromCache = function (asset) {
    var originalAsset = angular.copy(asset);
    originalAsset.isCached = originalAsset.isCached==false?true:false;
    originalAsset.accountId = $scope.account._id;
    AssetsService.updateMatadata(originalAsset, function (data, status) {
      if (status == 200) {
        $scope.cachebuster = new Date().getTime();
        asset.url=data.url;
        asset.isCached=data.isCached;
        ToasterService.show('success', 'Asset updated.');
      }
    });
  };



  function drawPages(){
      var start = 1;
      var end;
      var i;
      var prevPage = $scope.pagingParams.curPage;
      var totalItemCount = $scope.assetsCount;
      var currentPage = $scope.pagingParams.curPage;
      var numPages = numberOfPages();

      start = Math.max(start, currentPage - Math.abs(Math.floor($scope.pagingParams.showPages / 2)));
      end = start + $scope.pagingParams.showPages;

      if (end > numPages) {
        end = numPages + 1;
        start = Math.max(1, end - $scope.pagingParams.showPages);
      }

      $scope.pages = [];


      for (i = start; i < end; i++) {
        $scope.pages.push(i);
      }
    }


    function numberOfPages() {
        if ($scope.assets) {
            return Math.ceil($scope.assetsCount / $scope.pagingParams.limit);
        }
        return 0;
    }

    function selectPage(page){
        if(page != $scope.pagingParams.curPage){
            $scope.pagingParams.curPage = page;
            $scope.pagingParams.skip = (page - 1) * $scope.pagingParams.limit;
            $scope.pageLoading = true;
            loadAssets();
        }
    }

    $scope.$watch('pagingParams.search', function(search){
      if(angular.isDefined(search)){
        loadDefaultsForPaging();
        loadAssets();
      }
    })

    function refreshPaging(limit){
        $scope.pagingParams.limit = limit;
        loadDefaultsForPaging();
        loadAssets();
    }

}]);
