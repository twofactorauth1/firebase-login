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
    template: '<div class="element-wrap" ng-bind-html="ngModel | unsafe"></div>',
    link: function(scope, element, attrs, modelCtrl) {


        /*
         * Replace square bracket tokens with valid script tags
         *
         * Example string and result:
         *
         * String -> '[script]asdfasdfasdf[/script]<div class="something">some content</div>[script src="whatever.js"][/script]'
         *                  .replace(/\[script /g, '<script ')
         *                  .replace(/\]\[\/script\]/g, '></script>')
         *                  .replace(/\[script\]/, '<script>')
         *                  .replace(/\[\/script\]/, '</script>');
         *
         * Result -> "<script>asdfasdfasdf</script><div class="something">some content</div><script src="whatever.js"></script>"
         */

         scope.ngModel = scope.ngModel.replace(/\[script /g, '<script ')
                .replace(/\]\[\/script\]/g, '></script>')
                .replace(/\[script\]/, '<script>')
                .replace(/\[\/script\]/, '</script>');


    }
  };
});
