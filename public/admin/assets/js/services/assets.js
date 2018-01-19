/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('AssetsService', ['$http', function ($http) {
    var baseUrl = '/api/1.0/';
    this.getAssetsByAccount = function (fn) {
      var apiUrl = baseUrl + ['assets'].join('/');
      $http.get(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };


    this.getPagedAssetsByAccount = function (pagingParams, fn) {
      var _qString = "?limit="+ pagingParams.limit + "&skip="+ pagingParams.skip;
      
      if(pagingParams.filterType && pagingParams.filterType !== 'all'){
        _qString += "&filterType="+ pagingParams.filterType;
      }
      if(pagingParams.search){
        _qString += "&search="+ pagingParams.search;
      }
      var apiUrl = baseUrl + ['assets', 'paged', 'list'].join('/') + _qString;
      $http.get(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };

    this.deleteAssets = function (assets, fn) {
      assets.forEach(function (v) {
        this.deleteAssetById(v._id, fn);
      }, this);
    };

    this.deleteAssetById = function (assetId, fn) {
      var apiUrl = baseUrl + ['assets', assetId].join('/');
      $http.delete(apiUrl)
        .error(function (data, status) {
          fn(data, status);
        })
        .success(function (data, status) {
          fn(data, status);
        });
    };
    
    this.updateAsset = function (asset, fn) {
      var apiUrl = baseUrl + ['assets', asset._id].join('/');
      $http.post(apiUrl, asset)
        .error(function (data, status) {
          fn(data, status);
        })
        .success(function (data, status) {
          fn(data, status);
        });
    };

    this.getAssetsByFontType = function (fn) {
      var apiUrl = baseUrl + ['assets', 'fonts', 'fonts'].join('/');
      $http.get(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };


    this.updateMatadata = function (asset, fn) {
      var apiUrl = baseUrl + ['assets','cache', asset._id].join('/');
      $http.post(apiUrl, asset)
        .error(function (data, status) {
          fn(data, status);
        })
        .success(function (data, status) {
          fn(data, status);
        });
    };
    this.shareUnshare = function (asset, fn) {
      var apiUrl = baseUrl + ['assets','shareUnshare', asset._id].join('/');
      $http.post(apiUrl, asset)
        .error(function (data, status) {
          fn(data, status);
        })
        .success(function (data, status) {
          fn(data, status);
        });
    };
  }]);
}(angular));
