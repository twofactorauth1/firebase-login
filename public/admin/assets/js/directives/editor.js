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
      className: '@className'
    },
    template: '<div class="edit-wrap"><span class="editable-title">{{title | formatText}}</span><div class="editable {{className}}" ng-bind-html="ngModel | unsafe"></div></div>',
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
              editor.on('change', function (e) {
                if (!scope.initial) {
                  clearTimeout(scope.delay);
                  var selection = editor.getSelection();
                  var bookmarks = selection.createBookmarks(true);
                  scope.delay = setTimeout(function () {
                    scope.update(e);
                    var range = selection.getRanges()[0];
                    range.moveToBookmark(bookmarks[0]);
                    range.select();
                  }, 500);
                } else {
                  scope.initial = false;
                }

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
