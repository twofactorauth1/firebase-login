'use strict';
/*global app*/
app.controller('ImportCustomerModalCtrl', ['$scope', '$modalInstance', '$timeout', 'FileUploader', 'editableOptions', 'CustomerService', '$cacheFactory', 'getCustomers', function ($scope, $modalInstance, $timeout, FileUploader, editableOptions, CustomerService, $cacheFactory, getCustomers) {

  editableOptions.theme = 'bs3';

  $scope.getCustomers = getCustomers;

  var uploader = new FileUploader({
    url: '/api/1.0/assets/',
  });
  $scope.uploader = uploader;

  // FILTERS

  uploader.filters.push({
    name: 'customFilter',
    fn: function () {
      return this.queue.length < 10;
    }
  });

  // CALLBACKS

  uploader.onWhenAddingFileFailed = function (item, filter, options) {
    console.info('onWhenAddingFileFailed', item, filter, options);
  };
  uploader.onAfterAddingFile = function (fileItem) {
    console.info('onAfterAddingFile', fileItem);
    $scope.csvUploaded(null, [fileItem._file]);
  };
  uploader.onAfterAddingAll = function (addedFileItems) {
    console.info('onAfterAddingAll', addedFileItems);
  };
  uploader.onBeforeUploadItem = function (item) {
    console.info('onBeforeUploadItem', item);
  };
  uploader.onProgressItem = function (fileItem, progress) {
    console.info('onProgressItem', fileItem, progress);
  };
  uploader.onProgressAll = function (progress) {
    console.info('onProgressAll', progress);
  };
  uploader.onSuccessItem = function (fileItem, response, status, headers) {
    console.info('onSuccessItem', fileItem, response, status, headers);
  };
  uploader.onErrorItem = function (fileItem, response, status, headers) {
    console.info('onErrorItem', fileItem, response, status, headers);
  };
  uploader.onCancelItem = function (fileItem, response, status, headers) {
    console.info('onCancelItem', fileItem, response, status, headers);
  };
  uploader.onCompleteItem = function (fileItem, response, status, headers) {
    console.info('onCompleteItem', fileItem, response, status, headers);
  };
  uploader.onCompleteAll = function () {
    console.info('onCompleteAll');
  };

  console.info('uploader', uploader);
  console.log('ImportCustomerModalCtrl');
  $scope.customerColumns = [{
    name: 'First Name',
    value: 'first',
    match: '',
    known: ['first', 'first name']
  }, {
    name: 'Middle Name',
    value: 'middle',
    match: '',
    known: ['middle', 'middle name']
  }, {
    name: 'Last Name',
    value: 'last',
    match: '',
    known: ['last', 'last name']
  }, {
    name: 'Email Address',
    value: 'email',
    match: '',
    known: ['email', 'email address', 'e-mail', 'e-mail address']
  }, {
    name: 'Phone Number',
    value: 'phone',
    match: '',
    known: ['phone', 'business phone', 'personal phone', 'phone number', 'number']
  }, {
    name: 'Website URL',
    value: 'website',
    match: '',
    known: ['website', 'web page', 'url', 'site', 'site url']
  }, {
    name: 'Company Name',
    value: 'company',
    match: '',
    known: ['company', 'company name']
  }, {
    name: 'Gender',
    value: 'gender',
    match: '',
    known: ['gender', 'sex']
  }, {
    name: 'Tags',
    value: 'tags',
    match: '',
    known: []
  }, {
    name: 'Address',
    value: 'address',
    match: '',
    known: ['address', 'business street']
  }, {
    name: 'Address 2',
    value: 'address2',
    match: '',
    known: ['address2', 'business street 2']
  }, {
    name: 'City',
    value: 'city',
    match: '',
    known: ['city', 'business city']
  }, {
    name: 'State',
    value: 'state',
    match: '',
    known: ['state', 'business state']
  }, {
    name: 'Zip',
    value: 'zip',
    match: '',
    known: ['zip', 'zip code', 'postal code', 'business postal code']
  }];


  $scope.guessHeaders = function () {
    _.each($scope.customerColumns, function (_column) {
      var bestMatch = {
        value: '',
        percent: 0
      };
      _.each($scope.csvHeaders, function (_header) {
        var columnName = _column.value;
        var header = _header.replace(/[^a-zA-Z ]/g, "").toLowerCase();
        if (_column.known.indexOf(_header.toLowerCase()) > -1) {
          bestMatch.value = _header;
          bestMatch.percent = 1;
        } else {
          var percentMatch = header.score(columnName);
          if (percentMatch > bestMatch.percent) {
            bestMatch.value = _header;
            bestMatch.percent = percentMatch;
          }
        }
      });
      if (bestMatch.percent >= 0) {
        _column.match = bestMatch.value;
      }
    });
    $scope.updatePreview();
  };

  $scope.csvResults = [];
  $scope.uploadingCsv = false;
  var startUpload;
  $scope.endUpload = 0;
  var _results = [];
  $scope.csv = {
    percent: 0
  };

  $scope.csvComplete = function (results, file) {
    $timeout(function () {
      $scope.uploadingCsv = false;
      $scope.csvHeaders = results.data[0];
      $scope.csvResults = results.data;
      $scope.guessHeaders();
      var _diff = (new Date() - startUpload) / 1000;
      $scope.endUpload = _diff.toFixed(2);
    }, 2500);
    // $scope.validateCsvImport();
  };

  $scope.changeFile = function () {
    $scope.csvHeaders = [];
    $scope.csvResults = [];
    $scope.previewCustomer = {};
    $scope.currentRow = 1;
    var startUpload = 0;
    $scope.endUpload = 0;
    _.each($scope.customerColumns, function (_col) {
      _col.match = '';
      _col.index = '';
    });
    _results = [];
    $scope.csv.percent = 0;
  };

  $scope.previewCustomer = {
    first: 'hello'
  };
  $scope.currentRow = 1;

  $scope.increaseRow = function () {
    if ($scope.currentRow < $scope.csvResults.length - 1) {
      $scope.currentRow = $scope.currentRow + 1;
      $scope.updatePreview();
    }
  };

  $scope.decreaseRow = function () {
    if ($scope.currentRow > 1) {
      $scope.currentRow = $scope.currentRow - 1;
      $scope.updatePreview();
    }
  };

  function validateEmail(value) {
    if (value) {
      var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (value.match(mailformat)) {
        return true;
      }
    }
  }


  // $scope.errorMap = [];

  // $scope.validateCsvImport = function () {
  //   console.log('validating ...');
  //   var _formattedColumns = $scope.formatColumns();
  //   _.each($scope.csvResults, function (_result, i) {
  //     if (i != 0) {
  //       if (!validateEmail(_result[_formattedColumns.email.index])) {
  //         $scope.errorMap.push({value: _result[_formattedColumns.email.index], row: i, index: _formattedColumns.email.index});
  //       }
  //     }
  //   });
  //   console.log('errorMap ', $scope.errorMap);
  // };

  $scope.updatePreview = function (item, model) {
    if (item || model) {
      var _match = _.find($scope.customerColumns, function (_column) {
        return _column.match === model;
      });
    }
    var _formattedColumns = $scope.formatColumns();
    $scope.previewCustomer.first = $scope.csvResults[$scope.currentRow][_formattedColumns.first.index];
    $scope.previewCustomer.middle = $scope.csvResults[$scope.currentRow][_formattedColumns.middle.index];
    $scope.previewCustomer.last = $scope.csvResults[$scope.currentRow][_formattedColumns.last.index];
    $scope.previewCustomer.email = $scope.csvResults[$scope.currentRow][_formattedColumns.email.index];
    $scope.previewCustomer.phone = $scope.csvResults[$scope.currentRow][_formattedColumns.phone.index];
    $scope.previewCustomer.website = $scope.csvResults[$scope.currentRow][_formattedColumns.website.index];
    $scope.previewCustomer.address = $scope.csvResults[$scope.currentRow][_formattedColumns.address.index];
    $scope.previewCustomer.company = $scope.csvResults[$scope.currentRow][_formattedColumns.company.index];
  };

  $scope.updateColumn = function (data, col) {
    console.log('updateRow >>> ', data, col, $scope.currentRow);
    var _formattedColumns = $scope.formatColumns();
    $scope.csvResults[$scope.currentRow][_formattedColumns[col.value].index] = data;
  };

  $scope.formatColumns = function () {
    var _formattedColumns = [];
    _.each($scope.customerColumns, function (_column) {
      var indexMatch = _.indexOf($scope.csvHeaders, _column.match);
      if (indexMatch >= 0) {
        _column.index = indexMatch;
      }
      _formattedColumns[_column.value] = _column;
    });
    return _formattedColumns;
  };

  var startServerUploadTime;

  $scope.uploadMatchedCSV = function () {
    startServerUploadTime = new Date();
    var _formattedColumns = $scope.formatColumns();
    var customersToAdd = [];
    _.each($scope.csvResults, function (_result, i) {
      if (i !== 0) {
        // var _formattedCustomer = {
        //   first: _result[_formattedColumns.first.index],
        //   middle: '',
        //   last: '',
        //   details: [{
        //     _id: "",
        //     socialId: "", //The social Id from where these details came
        //     source: "csv",
        //     location: "" //Location string
        //     emails: []
        //     photos: {
        //       square: ""
        //       small: ""
        //       medium: ""
        //       large: ""
        //     }
        //     websites: []
        //     company: ""
        //     phones: [{
        //       _id: "",
        //       type: string "m|w|h|o" //mobile, work, home, other
        //       number: string,
        //       default: false
        //     }],
        //     addresses: [{
        //       _id: ""
        //       type: string "w|h|o"
        //       address: string
        //       address2: string
        //       city: string
        //       state: string
        //       zip: string
        //       country: string,
        //       countryCode: string
        //       displayName: string,
        //       lat: "",
        //       lon: "",
        //       defaultShipping: false
        //       defaultBilling: false

        //     }]
        //   }]
        // };

        var _formattedCustomer = {
          first: _result[_formattedColumns.first.index],
          middle: _result[_formattedColumns.middle.index],
          last: _result[_formattedColumns.last.index]
        };

        customersToAdd.push(_formattedCustomer);
      }
    });

    $scope.uploadingServerCsv = true;
    console.log('upload started ...', $scope.uploadingServerCsv);

    CustomerService.importCsvCustomers(customersToAdd, function () {});
    console.log('customersToAdd ', customersToAdd);
  };

  $scope.$on('importingCustomers', function (event, args) {
    console.log('import ', event, args);
    $scope.serverUploadPercent = Math.round(args.current / args.total * 100);
    if (args.current === args.total) {
      console.log('upload complete ...');
      $scope.uploadingComplete = true;
      var _diff = (new Date() - startServerUploadTime) / 1000;
      $scope.endServerUpload = _diff.toFixed(2);
      $scope.getCustomers();
    }
  });


  $scope.csvUploaded = function (event, files) {
    console.log('files ', files);
    startUpload = new Date();
    $scope.fileName = files[0].name;
    $scope.uploadingCsv = true;
    var config = {
      delimiter: "", // auto-detect
      newline: "", // auto-detect
      header: false,
      dynamicTyping: false,
      preview: 0,
      encoding: "",
      worker: false,
      comments: false,
      complete: function (results, file) {
        results.data = _results;
        $scope.csvComplete(results, file);
      },
      step: function (results, parser) {
        _results.push(results.data[0]);
        var progress = results.meta.cursor;
        var newPercent = Math.round(progress / files[0].size * 100);
        if (newPercent != $scope.csv.percent) {
          $timeout(function () {
            $scope.csv.percent = newPercent;
            $scope.$apply();
          });
        }
      },
      error: undefined,
      download: false,
      skipEmptyLines: true,
      chunk: undefined,
      fastMode: undefined,
      beforeFirstChunk: undefined,
    };
    $timeout(function () {
      Papa.parse(files[0], config);
    }, 1000);
  };

}]);
