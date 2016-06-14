'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
angular.module('mainApp').directive("elem", function ($timeout) {
  return {
    replace: true,
    transclude: true,
    scope: {
      ngModel: '=',
      className: '@className'
    },
    template: '<div class="element-wrap fr-view" ng-class="className">' +
                '<div ' +
                    'ng-class="{{vm.elementClass()}}" ' +
                    'ng-attr-style="{{vm.elementStyle()}}" ' +
                    'class="ssb-text-settings" ' +
                    'ng-bind-html="ngModel | unsafe">' +
                '</div>' +
              '</div>',
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
        if (scope.ngModel && scope.ngModel.indexOf && scope.ngModel.indexOf('[script') !== -1) {

            var unescapeMap = {
                "&amp;":"&",
                "&lt;":"<",
                "&gt;":">",
                '&quot;':'"',
                '&#39;':"'",
                '&#x2F;':"/",
                '&apos;': "'"
            };

            var unescapeHTML = function(string) {
                return String(string).replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2f;|&apos;)/g, function(s) {
                    return unescapeMap[s] || s;
                });
            }

            var modelString = scope.ngModel.replace(/\[script /g, '<script ')
                .replace(/\]\[\/script\]/g, '></script>')
                .replace(/\[script\]/, '<script>')
                .replace(/\[\/script\]/, '</script>');

            scope.ngModel = unescapeHTML(modelString);
        }


    }
  };
});
