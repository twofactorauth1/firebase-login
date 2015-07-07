// 'use strict'; <--- DO NOT USE! CKEDITOR FAILS (https://github.com/WebSpellChecker/ckeditor-plugin-scayt/issues/65)
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
app.directive("elem", function ($timeout) {
  return {
    require: '?ngModel',
    replace: true,
    transclude: true,
    scope: {
      title: '@ngModel',
      className: '@className'
    },
    template: '<div class="edit-wrap"><span class="editable-title">{{title | formatText}}</span><div class="editable {{className}}" ng-bind-html="ngModel | unsafe"></div></div>',
    link: function (scope, element, attrs, ngModel) {

      scope.update = function (e) {
        scope.$apply(function () {
          ngModel.$setViewValue(e.editor.getData());
        });
      };

      var elem = angular.element(element[0].querySelector('.editable'))[0];
      CKEDITOR.inline(elem, {
        on: {
          instanceReady: function (ev) {
            var editor = ev.editor;
            editor.setReadOnly(false);
            editor.setData(ngModel.$viewValue);
            editor.on('change', function (e) {
              scope.update(e);
            });
          }
        },
        sharedSpaces: {
          top: 'editor-toolbar'
        }
      });
    }
  };
});
