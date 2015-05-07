'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
app.controller('CkeditorCtrl', ["$scope", function ($scope) {

  // Editor options.
  $scope.options = {
    language: 'en',
    allowedContent: true,
    entities: false
  };

  // Called when the editor is completely ready.
  $scope.onReady = function () {
    console.log('ckeditor ready');
  };
}]);
