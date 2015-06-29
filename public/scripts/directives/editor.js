'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
angular.module('mainApp').directive("elem", function ($timeout) {
  return {
    replace: true,
    transclude: true,
    scope: {
      ngModel: '=',
    },
    template: '<div ng-bind-html="ngModel | unsafe"></div>'
  };
});
