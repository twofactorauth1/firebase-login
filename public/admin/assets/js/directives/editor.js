'use strict';
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
app.directive("elem", function ($timeout) {
  return {
    replace: true,
    transclude: true,
    scope: {
      title: '@ngModel',
      ngModel: '=',
    },
    template: '<div class="edit-wrap"><span class="editable-title">{{title | formatText}}</span><div class="editable" ng-bind-html="ngModel | unsafe"></div></div>',
    link: function (scope, element, attrs, ctrl) {
      $timeout(function () {

        scope.update = function (e) {
          scope.$apply(function () {
            scope.ngModel = e.editor.getData();
          });
        };

        scope.delay = null;
        scope.initial = true;

        var elem = angular.element(element[0].querySelector('.editable'))[0];

        CKEDITOR.inline(elem, {
          on: {
            instanceReady: function (ev) {
              var editor = ev.editor;
              editor.setReadOnly(false);
              editor.on('blur', function (e) {
                  clearTimeout(scope.delay);
                  scope.delay = setTimeout(function () {
                    scope.update(e);
                  }, 500);
              });
            }
          },
          sharedSpaces: {
            top: 'editor-toolbar'
          }
        });
      });
    }
  };
});
