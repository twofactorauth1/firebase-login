'use strict';
/*global app, Papa*/
app.controller('importContactModalCtrl', ['$scope', '$location', '$timeout', '$modalInstance', 'FileUploader', 'editableOptions', 'ContactService', 'userConstant', 'SocialConfigService', 'getContacts', 'contactConstant', 'toaster','$filter', function ($scope, $location, $timeout, $modalInstance, FileUploader, editableOptions, ContactService, userConstant, SocialConfigService, getContacts, contactConstant, toaster,$filter) {
  $scope.counter=0;
  $scope.getContacts = getContacts;

  /*
   * @editableOptions
   * - editable options for xeditable in preview contacts
   */

  editableOptions.theme = 'bs3';

  $scope.socailType = "";
  $scope.socailList = false;
  $scope.groupList = false;
  $scope.socialAccounts = {};
  $scope.googlePlusActive = false;
  $scope.uniqueTags = [];
  $scope.contactConstant = contactConstant;

  SocialConfigService.getAllSocialConfig(function (config) {
    $scope.socialAccounts = config.socialAccounts;
    var _match = _.find(config.trackedAccounts, function (_account) {
      return _account.type === 'go';
    });
    if (_match) {
      $scope.googlePlusActive = true;
    }
  });

  $scope.dropdownFocus = function () {
    console.log('dropdownFocus >>>');
  };

  $scope.importContacts = function (selectedAccount) {
    console.log('importContacts >>> ', selectedAccount);
    var foundSocialId = false;
    if (selectedAccount.type === userConstant.social_types.GOOGLE) {
      foundSocialId = true;
      $scope.tempGoogleAccount = selectedAccount;
      SocialConfigService.getGoogleGroups(selectedAccount.id, function (data) {
        data.push({
          name: 'All',
          id: 'All'
        });
        $scope.socialAccountGroups = data;
      });
      //$scope.closeModal();
      //toaster.pop('success', "Contacts import initiated.");
      //SocialConfigService.importGoogleContact(selectedAccount.id, function(data) {
      //    $scope.closeModal();
      //    toaster.pop('success', "Your Google contacts are being imported in the background.");
      //});
    }
    if (selectedAccount.type === userConstant.social_types.LINKEDIN) {
      foundSocialId = true;
      $scope.closeModal();
      toaster.pop('success', "Contacts import initiated.");
      SocialConfigService.importLinkedinContact(selectedAccount.id, function () {
        $scope.closeModal();
        toaster.pop('success', "Your LinkedIn contacts are being imported in the background.");

      });
      $scope.socailList = false;
      $scope.groupList = false;
    }

    if (foundSocialId === false) {
      $scope.closeModal();
      toaster.pop('warning', "No such account integrated.");
      $scope.socailList = false;
      $scope.groupList = false;
    }
  };

  $scope.showSocialAccountSelect = function (socailType) {

    $scope.socailType = socailType;
    $scope.socailList = false;
    $scope.showCSVUpload = false;

    if (socailType === 'csv') {
      $scope.showCSVUpload = true;
    }

    if (socailType === userConstant.social_types.GOOGLE) {
      $scope.socailList = true;
      $scope.groupList = true;
    } else {
      $scope.groupList = false;
    }
  };

  $scope.importGoogleContacts = function (groupId) {
    $scope.closeModal();
    toaster.pop('success', "Contacts import initiated.");
    SocialConfigService.importGoogleContactsForGroup($scope.tempGoogleAccount.id, groupId.id, function () {
      $scope.closeModal();
      $scope.minRequirements = true;
      toaster.pop('success', "Your Google contacts are being imported in the background. Please refresh the page to see newly imported contacts");
    });
    $scope.tempGoogleAccount = null;
    $scope.socailList = false;
    $scope.groupList = false;
  };

  /*
   * @closeModal
   * -
   */

  $scope.closeModal = function (redirect) {
    $timeout(function () {
      $modalInstance.close();
      angular.element('.modal-backdrop').remove();
      if (redirect) {
        $location.path(redirect);
      }
    });
  };

  $scope.validateEmail = function (_email) {
    var regex = new RegExp('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$');
    return regex.test(_email.toLowerCase());
  };

  $scope.validatePhone = function (_phone) {
    var regex = new RegExp('^([0-9\(\)/\+ \-]*)$');
    return regex.test(_phone);
  };

  /*
   * @validatePhones
   * - validate a list of phones and update error rows array
   */

  $scope.validatePhones = function (fn) {
    //get matched email headers
    var _formattedColumns = $scope.formatColumns();
    var _phoneIndex = _formattedColumns.phone.index;
    var _errorRows = [];
    _.each($scope.csvResults, function (_row, index) {
      if (index !== 0) {
        var _phone = _row[_phoneIndex];
        if (_phone && !$scope.validatePhone(_phone)) {
          _errorRows.push(index);
        }
      }
    });

    if (_errorRows.length > 0) {

      var matchingColumn = _.find($scope.contactColumns, function (_col) {
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

  // uploader.filters.push({
  //   name: 'csvFilter',
  //   fn: function (item) {
  //     if (/\/(csv)$/.test(item.type) === true) {
  //       return true;
  //     }
  //     $scope.fileTypeError = 'Incorrect filetype';
  //     return false;
  //   }
  // });

  /*
   * @onAfterAddingFile
   * - uploader callback on upload
   */

  uploader.onAfterAddingFile = function (fileItem) {
    $scope.csvUploaded([fileItem._file]);
  };

  /*
   * @contactColumns
   * - list of main columns with list of known for mapping
   * - ['given name', 'first', 'first name'] -- specific to general
   */

  $scope.contactColumns = [{
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
  }
  //,{
  //   name: 'Custom',
  //   value: 'custom',
  //   match: '',
  //   known: ['custom', 'extra', 'additional'],
  //   errorRows: []
  // }
  ];

  /*
   * @guessHeaders
   * - on upload match fields automatically based on known variations
   */
   var blankFormattedContact = {
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
      }],

    }],
    extra:[]

  };

  $scope.addmorefields = function(){
      var newcolumns= {
        name: 'Custom'+$scope.counter,
        value: 'qa'+($scope.counter+1),
        label: 'Custom'+$scope.counter,
        match: '',
        flag: 'custom',
        known: ['custom', 'extra', 'additional'],
        errorRows: []
    };
      $scope.contactColumns.push(newcolumns);
      $scope.counter++;
  };
  $scope.guessHeaders = function (fn) {
    _.each($scope.contactColumns, function (_column) {
      var bestMatch = {
        value: '',
        percent: 0
      };
      _.each($scope.csvHeaders, function (_header) {
        var columnName = _column.value;
        //first make lowercase
        var header = _header.replace(new RegExp('[^a-zA-Z ]'), "").toLowerCase();
        //check in list of known header matches
        if (_column.known.indexOf(_header.toLowerCase()) > -1) {
          bestMatch.value = _header;
          bestMatch.percent = 1;
        } else {
          //if not in known list get a best match percent score
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
  $scope.previewContact = {};
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

      $scope.guessHeaders(function () {
        $scope.validateEmails(function () {
          $scope.validatePhones(function () {
            console.log('Validation Complete');
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
    $scope.previewContact = {};
    $scope.currentRow = 1;
    startUpload = 0;
    $scope.endUpload = 0;
    _.each($scope.contactColumns, function (_col) {
      _col.match = '';
      _col.index = '';
    });
    _results = [];
    $scope.csv.percent = 0;
  };

  /*
   * @increaseRow
   * - increase the row and update the preview contact
   */

  $scope.increaseRow = function () {
    if ($scope.currentRow < $scope.csvResults.length - 1) {
      $scope.currentRow = $scope.currentRow + 1;
      $scope.updatePreview();
    }
  };

  /*
   * @decreaseRow
   * - decrease the row and update the preview contact
   */

  $scope.decreaseRow = function () {
    if ($scope.currentRow > 1) {
      $scope.currentRow = $scope.currentRow - 1;
      $scope.updatePreview();
    }
  };

  /*
   * @goToRow
   * - decrease the row and update the preview contact
   */

  $scope.goToRow = function (_row) {
    $scope.currentRow = _row;
    $scope.updatePreview();
    $scope.showPreviewPulse = true;
    $timeout(function () {
      $scope.showPreviewPulse = false;
    }, 1000);
  };

  /*
   * @updatePreview
   * - update the preview when details are changed
   */
  $scope.updatePreviewSelection=function(selected){
       $timeout(function () { $scope.updatePreview(selected); }, 1000);
  }
  $scope.compareTag = function(tag, arr){
    var query = tag.toLowerCase();
    var index = -1;
    arr.some(function(element, i) {
        if (query === element.toLowerCase()) {
            index = i;
            return true;
        }
    });
    return index;
  }
  $scope.updatePreview = function (selected) {
      /* if(selected!=undefined){
          if(selected.name!=undefined){
              var currentobj = $filter('filter')($scope.contactColumns,{'flag': 'Custom','name':selected.name})[0];
             // currentobj.value=selected.match;
          }
      }*/
      var customfields = $filter('filter')($scope.contactColumns, {'flag': 'Custom'});
      blankFormattedContact.extra = [];
      for(var k=0;k<customfields.length;k++){
          blankFormattedContact.extra.push(customfields[k]);
      }
      var column = angular.copy(selected);
      if (selected && !selected.match) {
          selected.index = null;
      }
      var _colVal,_formatIndex = null;
      var _formattedColumns = $scope.formatColumns();
      if(column && !column.match){
          _colVal = column.value;
          _formatIndex = _formattedColumns[_colVal].index;
         $scope.previewContact[_colVal] = "";
      }
      else{
          _.each($scope.contactColumns, function (_column) {
              _colVal = _column.value;
              //blankFormattedContact.custom

              _formatIndex = _formattedColumns[_colVal].index;
              if(angular.isDefined(_formatIndex) && _formatIndex !== null)
                  $scope.previewContact[_colVal] = angular.copy($scope.csvResults[$scope.currentRow][_formatIndex]);

                if(_colVal === 'tags'){
                    var tags_value = $scope.previewContact[_colVal];
                    var tags_value_arr = tags_value.split('|');
                    if(tags_value_arr.length > 0){
                        var new_tags = [];
                        _.each(tags_value_arr, function(tag){
                          var tagExist = $scope.compareTag(tag, $scope.uniqueTags);
                          if(tagExist !== -1){
                            tag = $scope.uniqueTags[tagExist];
                          }
                          else{
                             $scope.uniqueTags.push(tag);
                          }
                          new_tags.push(tag);
                        });
                    }
                    $scope.previewContact[_colVal] = new_tags.join("|");
                }

              if(blankFormattedContact.extra!=undefined){
                  for(var j=0;j< blankFormattedContact.extra.length;j++){
                      if(blankFormattedContact.extra[j]!=undefined){
                          if(blankFormattedContact.extra[j].match==_colVal){
                              blankFormattedContact.extra[j].value =  $scope.previewContact[_colVal];
                          }
                      }
                  }
              }
          });
      }
  };


  /*
   * @updateColumn
   * - update an individual column when editing with xeditable
   */

  $scope.updateColumn = function (data, col) {
    var _formattedColumns = $scope.formatColumns();
	var colIndex=_formattedColumns[col.value].index
	if(!isNaN(colIndex)){
		$scope.csvResults[$scope.currentRow][colIndex] = data;
		$scope.errorRows = _.reject($scope.errorRows, function (d) {
			return d === $scope.currentRow;
		});
		var matchingColumn = _.find($scope.contactColumns, function (_col) {
			return _col.value === col.value;
		});
		matchingColumn.errorRows = _.reject(matchingColumn.errorRows, function (d) {
			return d === $scope.currentRow;
		});
	}
  };

  /*
   * @formatColumns
   * - format columns for values as keys for easy pulling
   */

  $scope.formatColumns = function () {
    var _formattedColumns = [];
    _.each($scope.contactColumns, function (_column) {
      var indexMatch = _.indexOf($scope.csvHeaders, _column.match);
      if (indexMatch >= 0) {
        _column.index = indexMatch;
      }
      _formattedColumns[_column.value] = _column;
    });
    return _formattedColumns;
  };

  /*
   * @blankFormattedContact
   * - black formatted contact object for uploading
   */



  /*
   * @uploadMatchedCSV
   * - import the formatted CSV and create contacts
   */

  $scope.uploadMatchedCSV = function () {
    startServerUploadTime = new Date();
    var _formattedColumns = $scope.formatColumns();
    var contactsToAdd = [];
    var partAddress = ['address', 'address2', 'city', 'state', 'zip', 'country', 'lat', 'lon'];
    var nameParts = ['first', 'middle', 'last'];
    var topLevelParts = ['gender', 'birthday'];
    var _formattedContact = angular.copy(blankFormattedContact);
    _.each($scope.csvResults, function (_result, i) {
      if (i !== 0) {
        _.each($scope.contactColumns, function (_column) {
          var _colVal = _column.value;
          var _formatIndex = _formattedColumns[_colVal].index;
          var _csvResult = _result[_formatIndex];
          if (_csvResult !=undefined) {
            var _formatVal = _formattedColumns[_colVal].value;
            var _details = _formattedContact.details[0];

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
            if (_column.flag  === 'custom') {
              //_details.custom = _csvResult;
                var match = _.findWhere(_formattedContact.extra, {index:_column.index });
                match.value = _csvResult
            };

            if (_formatVal === 'website') {
              var _website = {
                _id: Math.uuid(8),
                website: _csvResult
              };
              _details.websites.push(_website);
            }

            if (_formatVal === 'company') {
              _details.company = _csvResult;
            }

            if (topLevelParts.indexOf(_colVal) > -1) {
              _formattedContact[_colVal] = _csvResult;
            }

            if (nameParts.indexOf(_colVal) > -1) {
              _formattedContact[_colVal] = _csvResult;
            }
            // map contact tags
            if (_formatVal === 'tags') {
              var contactTags = contactConstant.contact_tags.dp;
              // Allow multiple tags to be imported using saparated by "|"
              var _tagsArr = _csvResult.split("|");
              var _tagsToBeAdded = [];
                _.each(_tagsArr, function (_tag, index) {
                  if(_tag){
                    var _tagData =  _.filter(contactTags, function(cTag){
                      return cTag.data.toLowerCase() == _tag.toLowerCase() || cTag.label.toLowerCase() == _tag.toLowerCase()
                    });

                    if(_tagData && _tagData.length){
                      _tagsToBeAdded.push(_tagData[0].data);
                    }
                    else{
                          var tagExist = $scope.compareTag(_tag, $scope.uniqueTags);
                          if(tagExist !== -1){
                            _tag = $scope.uniqueTags[tagExist];
                          }
                          else{
                            $scope.uniqueTags.push(_tag);
                          }
                         _tagsToBeAdded.push(_tag);
                    }
                  }
                });

                if(_tagsToBeAdded.length)
                  _formattedContact[_colVal] = _tagsToBeAdded;
            }



          }

        });

        contactsToAdd.push(_formattedContact);
        _formattedContact = angular.copy(blankFormattedContact);
      }
    });

    $scope.uploadingServerCsv = true;
    ContactService.resetCount();
    ContactService.importCsvContacts(contactsToAdd, function () {
      console.log('upload started ...', $scope.uploadingServerCsv);
    });



  };

  /*
   * @on:importingContacts
   * - callback from service to update import progress
   */

  $scope.$on('importingContacts', function (event, args) {
    console.log('on import ', args);
    $scope.serverUploadPercent = Math.round(args.current / args.total * 100);
    if (args.current === args.total) {
      $scope.uploadingComplete = true;
      var _diff = (new Date() - startServerUploadTime) / 1000;
      $scope.endServerUpload = _diff.toFixed(2);
      $scope.getContacts();
    }
  });

  /*
   * @validateEmails
   * - validate a list of emails and update error rows array
   */

  $scope.validateEmails = function (fn) {
    //get matched email headers
    var _formattedColumns = $scope.formatColumns();
    var _emailIndex = _formattedColumns.email.index;
    var _errorRows = [];
    _.each($scope.csvResults, function (_row, index) {
      if (index !== 0) {
        var _email = _row[_emailIndex];
        if (!$scope.validateEmail(_email)) {
          console.log('email not validated');
          _errorRows.push(index);
        }
      }
    });

    if (_errorRows.length > 0) {

      var matchingColumn = _.find($scope.contactColumns, function (_col) {
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
   * - if file is in accepted types, begin the CSV upload with uploader config
   * - else if file is unknown type, attempt quick parse to check that file could probably be parsed as csv
   * - quick check checks first 5 rows, if they all have same # of columns, probably good data
   *
   */

  var acceptedFiletypes = ['text/csv', 'application/vnd.ms-excel', 'application/msexcel', 'application/x-msexcel', 'application/x-ms-excel', 'application/x-excel', 'application/x-dos_ms_excel', 'application/xls', 'application/x-xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

  $scope.csvUploaded = function (files) {
    var numColumnsArray = [];
    var filteredNumColumnsArray = [];
    var parsedLikeCSV = false;
    $scope.errorRows = [];
    $scope.incorrectFileType = false;

    console.log('file type >>> ', files);

    if (acceptedFiletypes.indexOf(files[0].type) > -1) {
      parseUploadedFile();
    } else {
      //quick check
      Papa.parse(files[0], {
        step: function (results, parser) {
          numColumnsArray.push(results.data[0].length)

          if (numColumnsArray.length === 5) {
            filteredNumColumnsArray = numColumnsArray.filter(function(value){ return value === numColumnsArray[0] });
            parsedLikeCSV = numColumnsArray[0] > 1 && (numColumnsArray.length === filteredNumColumnsArray.length);
            if (!parsedLikeCSV) {
              parseError();
            } else {
              parseUploadedFile();
            }
            parser.abort();
            $scope.$apply();
          }

        },
        error: function (error) {
          parseError(error);
        },
        fastMode: true
      });
    }

    function parseError(error) {
      $scope.incorrectFileType = true;
      $scope.incorrectFile = files[0];
      $scope.$apply();
    }

    function parseUploadedFile() {
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
        error: parseError,
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
    }

  };
}]);
