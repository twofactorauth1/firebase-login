'use strict';
/*global app, Papa*/
app.controller('ImportCustomerModalCtrl', ['$scope', '$timeout', '$modalInstance', 'FileUploader', 'editableOptions', 'CustomerService', function ($scope, $timeout, $modalInstance, FileUploader, editableOptions, CustomerService) {

  /*
   * @editableOptions
   * - editable options for xeditable in preview customers
   */

  editableOptions.theme = 'bs3';

  /*
   * @closeModal
   * -
   */

  $scope.closeModal = function () {
    $timeout(function () {
      $modalInstance.close();
      angular.element('.modal-backdrop').remove();
    });
  };

  $scope.validateEmail = function (_email) {
    var regex = new RegExp('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$');
    return regex.test(_email);
  };

  $scope.validatePhone = function (_phone) {
    var regex = new RegExp('^([0-9\(\)\/\+ \-]*)$');
    return regex.test(_phone);
  };

  /*
   * @validatePhones
   * - validate a list of phones and update error rows array
   */

  $scope.validatePhones = function (fn) {
    //get matched email headers
    var _formattedColumns = $scope.formatColumns();
    var _phoneIndex = _formattedColumns['phone'].index;
    var _errorRows = [];
    _.each($scope.csvResults, function (_row, index) {
      if (index != 0) {
        var _phone = _row[_phoneIndex];
        if (!$scope.validatePhone(_phone)) {
          _errorRows.push(index);
        }
      }
    });

    if (_errorRows.length > 0) {

      var matchingColumn = _.find($scope.customerColumns, function (_col) {
        return _col.value === 'phone';
      });
      if (matchingColumn.errorRows.length > 0) {
        matchingColumn.errorRows = _.union(_errorRows, matchingColumn.errorRows);
        $scope.errorRows = _.union(matchingColumn.errorRows, $scope.errorRows);
      } else {
        matchingColumn.errorRows = _errorRows;
        if ($scope.errorRows.length > 0) {
          $scope.errorRows = _.union(_errorRows, $scope.errorRows);
        } else {
          $scope.errorRows = _errorRows;
        }
      }
      console.log('$scope.errorRows >>>', $scope.errorRows);
    }
    if (fn) {
      fn();
    }
  };


  /*
   * @uploader
   * - instance of file uploaded
   */

  var uploader = new FileUploader({
    url: '/api/1.0/assets/',
    filters: []
  });
  $scope.uploader = uploader;

  /*
   * @uploader.filters
   * - filters for the fileuploader
   */

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

  /*
   * @onAfterAddingFile
   * - uploader callback on upload
   */

  uploader.onAfterAddingFile = function (fileItem) {
    $scope.csvUploaded([fileItem._file]);
  };

  /*
   * @customerColumns
   * - list of main columns with list of known for mapping
   * - ['given name', 'first', 'first name'] -- specific to general
   */

  $scope.customerColumns = [{
    name: 'First Name',
    value: 'first',
    match: '',
    known: ['given name', 'first name', 'first'],
    errorRows: []
  }, {
    name: 'Middle Name',
    value: 'middle',
    match: '',
    known: ['addtional name', 'middle', 'middle name'],
    errorRows: []
  }, {
    name: 'Last Name',
    value: 'last',
    match: '',
    known: ['family name', 'last', 'last name'],
    errorRows: []
  }, {
    name: 'Email Address',
    value: 'email',
    match: '',
    known: ['e-mail 1 - value', 'email', 'email address', 'e-mail', 'e-mail address'],
    errorRows: []
  }, {
    name: 'Phone Number',
    value: 'phone',
    match: '',
    known: ['phone 1 - value', 'phone', 'business phone', 'personal phone', 'phone number', 'number'],
    errorRows: []
  }, {
    name: 'Website URL',
    value: 'website',
    match: '',
    known: ['website', 'web page', 'url', 'site', 'site url'],
    errorRows: []
  }, {
    name: 'Company Name',
    value: 'company',
    match: '',
    known: ['company', 'company name'],
    errorRows: []
  }, {
    name: 'Gender',
    value: 'gender',
    match: '',
    known: ['gender', 'sex'],
    errorRows: []
  }, {
    name: 'Birthday',
    value: 'birthday',
    match: '',
    known: ['birthday', 'bday', 'b-day', 'dob', 'date of birth'],
    errorRows: []
  }, {
    name: 'Tags',
    value: 'tags',
    match: '',
    known: [],
    errorRows: []
  }, {
    name: 'Address',
    value: 'address',
    match: '',
    known: ['address 1 - street', 'address', 'business street'],
    errorRows: []
  }, {
    name: 'Address 2',
    value: 'address2',
    match: '',
    known: ['address 1 - extended address', 'address2', 'business street 2'],
    errorRows: []
  }, {
    name: 'City',
    value: 'city',
    match: '',
    known: ['address 1 - city', 'city', 'business city'],
    errorRows: []
  }, {
    name: 'State',
    value: 'state',
    match: '',
    known: ['address 1 - region', 'state', 'business state'],
    errorRows: []
  }, {
    name: 'Zip',
    value: 'zip',
    match: '',
    known: ['address 1 - postal code', 'zip', 'zip code', 'postal code', 'business postal code'],
    errorRows: []
  }];

  /*
   * @guessHeaders
   * - on upload match fileds automatically based on known variations
   */

  $scope.guessHeaders = function (fn) {
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

    if (fn) {
      fn();
    }
  };

  /*
   * @variables
   * - variables for parsing and matching
   */

  $scope.csvResults = [];
  $scope.uploadingCsv = false;
  var startUpload;
  $scope.endUpload = 0;
  var _results = [];
  $scope.csv = {
    percent: 0
  };
  $scope.previewCustomer = {};
  $scope.currentRow = 1;
  var startServerUploadTime;
  $scope.alerts = [];
  $scope.errorRows = [];


  /*
   * @csvComplete
   * - after csv has been uploaded but not imported
   */

  $scope.csvComplete = function (results) {
    $timeout(function () {
      $scope.uploadingCsv = false;
      $scope.csvHeaders = results.data[0];
      $scope.csvResults = results.data;

      console.time("start validating ...");
      $scope.guessHeaders(function() {
        $scope.validateEmails(function() {
          $scope.validatePhones(function() {
            console.timeEnd("start validating ...");
          });
        });
      });

      var _diff = (new Date() - startUpload) / 1000;
      $scope.endUpload = _diff.toFixed(2);
    }, 2500);
  };

  /*
   * @changeFile
   * - redirect to upload section and reset variables
   */

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

  /*
   * @increaseRow
   * - increase the row and update the preview customer
   */

  $scope.increaseRow = function () {
    if ($scope.currentRow < $scope.csvResults.length - 1) {
      $scope.currentRow = $scope.currentRow + 1;
      $scope.updatePreview();
    }
  };

  /*
   * @decreaseRow
   * - decrease the row and update the preview customer
   */

  $scope.decreaseRow = function () {
    if ($scope.currentRow > 1) {
      $scope.currentRow = $scope.currentRow - 1;
      $scope.updatePreview();
    }
  };

  /*
   * @goToRow
   * - decrease the row and update the preview customer
   */

  $scope.goToRow = function (_row) {
    $scope.currentRow = _row;
    $scope.updatePreview();
    $scope.showPreviewPulse = true;
    $timeout(function() {
      $scope.showPreviewPulse = false;
    }, 1000);
  };

  /*
   * @updatePreview
   * - update the preview when details are changed
   */

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

  /*
   * @updateColumn
   * - update an individual column when editing with xeditable
   */

  $scope.updateColumn = function (data, col) {
    console.log('updateColumn >>>');
    var _formattedColumns = $scope.formatColumns();
    $scope.csvResults[$scope.currentRow][_formattedColumns[col.value].index] = data;
    $scope.errorRows = _.reject($scope.errorRows, function (d) {
      return d === $scope.currentRow;
    });
    var matchingColumn = _.find($scope.customerColumns, function (_col) {
      return _col.value === col.value;
    });
    matchingColumn.errorRows = _.reject(matchingColumn.errorRows, function (d) {
      return d === $scope.currentRow;
    });
    console.log('$scope.errorRows >>>', $scope.errorRows);
  };

  /*
   * @formatColumns
   * - format columns for values as keys for easy pulling
   */

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

  /*
   * @blankFormattedCustomer
   * - black formatted customer object for uploading
   */

  var blankFormattedCustomer = {
    first: '',
    middle: '',
    last: '',
    birthday: '',
    gender: '',
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

  /*
   * @uploadMatchedCSV
   * - import the formtted CSV and create customers
   */

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
                number: _csvResult
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

  /*
   * @on:importingCustomers
   * - callback from service to update import progress
   */

  $scope.$on('importingCustomers', function (event, args) {
    $scope.serverUploadPercent = Math.round(args.current / args.total * 100);
    if (args.current === args.total) {
      $scope.uploadingComplete = true;
      var _diff = (new Date() - startServerUploadTime) / 1000;
      $scope.endServerUpload = _diff.toFixed(2);
      // $scope.getCustomers();
    }
  });

  /*
   * @validateEmails
   * - validate a list of emails and update error rows array
   */

  $scope.validateEmails = function (fn) {
    //get matched email headers
    var _formattedColumns = $scope.formatColumns();
    var _emailIndex = _formattedColumns['email'].index;
    var _errorRows = [];
    _.each($scope.csvResults, function (_row, index) {
      if (index != 0) {
        var _email = _row[_emailIndex];
        if (!$scope.validateEmail(_email)) {
          _errorRows.push(index);
        }
      }
    });

    if (_errorRows.length > 0) {

      var matchingColumn = _.find($scope.customerColumns, function (_col) {
        return _col.value === 'email';
      });
      if (matchingColumn.errorRows.length > 0) {
        matchingColumn.errorRows = _.union(_errorRows, matchingColumn.errorRows);
        $scope.errorRows = _.union(matchingColumn.errorRows, $scope.errorRows);
      } else {
        matchingColumn.errorRows = _errorRows;
        if ($scope.errorRows.length > 0) {
          $scope.errorRows = _.union(_errorRows, $scope.errorRows);
        } else {
          $scope.errorRows = _errorRows;
        }
      }
      console.log('$scope.errorRows >>>', $scope.errorRows);
    }
    if (fn) {
      fn();
    }
  };

  $scope.closeAlert = function (index) {
    $scope.alerts.splice(index, 1);
  };

  /*
   * @csvUploaded
   * - begin the CSV upload with uploader config
   */

  $scope.csvUploaded = function (files) {
    if (files[0].type === 'text/csv' || files[0].type === 'application/vnd.ms-excel') {
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
