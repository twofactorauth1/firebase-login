'use strict';
/*global app, Papa*/
app.controller('ImportCustomerModalCtrl', ['$scope', '$timeout', 'FileUploader', 'editableOptions', 'CustomerService', 'getCustomers', function ($scope, $timeout, FileUploader, editableOptions, CustomerService, getCustomers) {

  editableOptions.theme = 'bs3';

  $scope.getCustomers = getCustomers;

  var uploader = new FileUploader({
    url: '/api/1.0/assets/',
    filters: []
  });

  // FILTERS

  uploader.filters.push({
    name: 'csvFilter',
    fn: function (item) {
      if (/\/(csv)$/.test(item.type) === true) {
        return true;
      }
      $scope.fileTypeError = 'Incorrect filetype';
      return false;
    }
  });

  $scope.uploader = uploader;

  uploader.onAfterAddingFile = function (fileItem) {
    $scope.csvUploaded([fileItem._file]);
  };

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
    name: 'Birthday',
    value: 'birthday',
    match: '',
    known: ['birthday', 'bday', 'b-day', 'dob', 'date of birth']
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
        var header = _header.replace(new RegExp('[^a-zA-Z ]'), "").toLowerCase();
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

  $scope.csvComplete = function (results) {
    $timeout(function () {
      $scope.uploadingCsv = false;
      $scope.csvHeaders = results.data[0];
      $scope.csvResults = results.data;
      $scope.guessHeaders();
      var _diff = (new Date() - startUpload) / 1000;
      $scope.endUpload = _diff.toFixed(2);
    }, 2500);
  };

  $scope.changeFile = function () {
    $scope.csvHeaders = [];
    $scope.csvResults = [];
    $scope.previewCustomer = {};
    $scope.currentRow = 1;
    startUpload = 0;
    $scope.endUpload = 0;
    _.each($scope.customerColumns, function (_col) {
      _col.match = '';
      _col.index = '';
    });
    _results = [];
    $scope.csv.percent = 0;
  };

  $scope.previewCustomer = {};
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

  $scope.updatePreview = function (item, model, selected) {
    if (selected && !selected.match) {
      selected.index = null;
    }
    var _formattedColumns = $scope.formatColumns();
    _.each($scope.customerColumns, function (_column) {
      var _colVal = _column.value;
      var _formatIndex = _formattedColumns[_colVal].index;
      $scope.previewCustomer[_colVal] = $scope.csvResults[$scope.currentRow][_formatIndex];
    });
  };

  $scope.removePreviewRow = function (item, model) {
    console.log('removePreviewRow ', item, model);
  };

  $scope.updateColumn = function (data, col) {
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

  var blankFormattedCustomer = {
    first: '',
    middle: '',
    last: '',
    birthday : '',
    gender : '',
    details: [{
      _id: Math.uuid(8),
      source: "csv",
      location: "",
      emails: [],
      photos: {
        square: "",
        small: "",
        medium: "",
        large: ""
      },
      websites: [],
      company: "",
      phones: [],
      addresses: [{
        _id: Math.uuid(8),
        type: "w",
        address: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        countryCode: '',
        displayName: '',
        lat: "",
        lon: "",
        defaultShipping: false,
        defaultBilling: false
      }]
    }]
  };

  $scope.uploadMatchedCSV = function () {
    startServerUploadTime = new Date();
    var _formattedColumns = $scope.formatColumns();
    var customersToAdd = [];
    var partAddress = ['address', 'address2', 'city', 'state', 'zip', 'country', 'lat', 'lon'];
    var nameParts = ['first', 'middle', 'last'];
    var topLevelParts = ['company', 'gender', 'birthday'];
    var _formattedCustomer = angular.copy(blankFormattedCustomer);
    _.each($scope.csvResults, function (_result, i) {
      if (i !== 0) {

        _.each($scope.customerColumns, function (_column) {
          var _colVal = _column.value;
          var _formatIndex = _formattedColumns[_colVal].index;
          var _csvResult = _result[_formatIndex];
          if (_csvResult) {
            var _formatVal = _formattedColumns[_colVal].value;
            var _details = _formattedCustomer.details[0];

            if (partAddress.indexOf(_colVal) > -1) {
              _details.addresses[0][_colVal] = _csvResult;
            }

            if (_formatVal === 'email') {
              var _email = {
                _id: Math.uuid(8),
                email: _csvResult
              };
              _details.emails.push(_email);
            }

            if (_formatVal === 'phone') {
              var _phone = {
                _id: Math.uuid(8),
                phone: _csvResult
              };
              _details.phones.push(_phone);
            }

            if (_formatVal === 'website') {
              var _website = {
                _id: Math.uuid(8),
                website: _csvResult
              };
              _details.websites.push(_website);
            }

            if (topLevelParts.indexOf(_colVal) > -1) {
              _formattedCustomer[_colVal] = _csvResult;
            }

            if (nameParts.indexOf(_colVal) > -1) {
              _formattedCustomer[_colVal] = _csvResult;
            }
          }

        });

        customersToAdd.push(_formattedCustomer);
        _formattedCustomer = angular.copy(blankFormattedCustomer);
      }
    });

    $scope.uploadingServerCsv = true;
    console.log('customersToAdd ', customersToAdd);
    CustomerService.importCsvCustomers(customersToAdd, function () {
      console.log('upload started ...', $scope.uploadingServerCsv);
    });
  };

  $scope.$on('importingCustomers', function (event, args) {
    $scope.serverUploadPercent = Math.round(args.current / args.total * 100);
    if (args.current === args.total) {
      $scope.uploadingComplete = true;
      var _diff = (new Date() - startServerUploadTime) / 1000;
      $scope.endServerUpload = _diff.toFixed(2);
      // $scope.getCustomers();
    }
  });


  $scope.csvUploaded = function (files) {
    if (files[0].type === 'text/csv') {
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
        step: function (results) {
          _results.push(results.data[0]);
          var progress = results.meta.cursor;
          var newPercent = Math.round(progress / files[0].size * 100);
          if (newPercent !== $scope.csv.percent) {
            $timeout(function () {
              $scope.csv.percent = newPercent;
              $scope.$apply();
            });
          }
        },
        error: undefined,
        download: false,
        skipEmptyLines: true,
        keepEmptyRows: false,
        chunk: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
      };
      $timeout(function () {
        Papa.parse(files[0], config);
      }, 1000);
    } else {
      console.log('Incorrect filetype');
    }
  };

}]);
