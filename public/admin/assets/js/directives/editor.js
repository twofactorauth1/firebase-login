// 'use strict'; <--- DO NOT USE! CKEDITOR FAILS (https://github.com/WebSpellChecker/ckeditor-plugin-scayt/issues/65)
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
app.directive("elem", function($timeout, $compile) {
  return {
    require: '?ngModel',
    replace: true,
    transclude: true,
    scope: {
      title: '@ngModel',
      className: '@className'
    },
    template: '<div class="edit-wrap"><span class="editable-title">{{title | formatText}}</span><div class="editable element-wrap {{className}}" ng-bind-html="ngModel | unsafe"></div></div>',
    link: function(scope, element, attrs, ngModel) {

      scope.update = function(e) {
        $timeout(function() {
          scope.$apply(function() {
            ngModel.$setViewValue(e.editor.getData());
          });
        }, 0);
      };

      scope.setContent = function(e) {
        $timeout(function() {
          scope.$apply(function() {
            e.editor.setData(ngModel.$viewValue);
          });
        }, 0);
      };

      scope.updateFroalaContent = function(editor) {
        $timeout(function() {
          scope.$apply(function() {
            ngModel.$setViewValue(editor.html.get());
          });
        }, 0);
      };

      var elem = angular.element(element[0].querySelector('.editable'))[0];

      if (scope.$parent.ssbEditor || (scope.$parent.vm && scope.$parent.vm.ssbEditor)) {
        $(function() {
          $timeout(function() {
            $(elem).on('froalaEditor.initialized', function(e, editor) {
              //var div = editor.$tb.first("fr-toolbar");
              //div.attr('ind-draggable', 'ind-draggable');
              //$compile(div)(scope);
              if (ngModel.$viewValue) {
                editor.html.set(ngModel.$viewValue);
              }
            }).froalaEditor($.FroalaEditor.config)
              .on('froalaEditor.contentChanged', function(e, editor) {
                scope.updateFroalaContent(editor);
                $(elem).froalaEditor('html.cleanEmptyTags');
              }).on('froalaEditor.keydown', function(e, editor) {
                scope.updateFroalaContent(editor);
              }).on('froalaEditor.image.resizeEnd', function(e, editor, $img) {
                scope.updateFroalaContent(editor);
              }).on('froalaEditor.toolbar.show', function(e, editor) {

                editor.$tb.css({ 'opacity': 0 });

                $timeout(function(){
                    var left = editor.$tb.offset().left;
                    var screenLeft = 0;

                    if ($("#componentloader").offset) {
                        screenLeft = $("#componentloader").offset().left;
                    }

                    if (left < screenLeft) {
                        editor.$tb.css("left", screenLeft);
                    }

                    /*
                     * Adjust the vertical position of the toolbar so that it doesn't cover up the text!
                     */
                    var frElementTopLine = parseInt($(editor.selection.element()).offset().top, 10);
                    var frElementHeightLine = parseInt($(editor.selection.element()).height(), 10);
                    var lineHeight = parseInt($(e.currentTarget).find('.fr-element').css('line-height'), 10);
                    var fontSize = parseInt($(e.currentTarget).find('.fr-element').css('font-size'), 10);

                    // debugging divs
                    // $('.testel123').remove();
                    // $('<div class="testel123"></div>').appendTo($('body')).css({
                    //     'position': 'absolute', 'width': '150px', 'height': '350px', 'background-color': 'red', 'top': frElementTopLine - fontSize - frElementHeightLine, 'right': '20px'
                    // })
                    // $('<div class="testel123"></div>').appendTo($('body')).css({
                    //     'position': 'absolute', 'width': '150px', 'height': '350px', 'background-color': 'blue', 'top': frElementTopLine - lineHeight - frElementHeightLine
                    // })

                    editor.$tb.css({ 'top': frElementTopLine + frElementHeightLine, 'opacity': 1 });

                }, 0);
              });
          }, 1000);
        });
      } else {
        CKEDITOR.inline(elem, {
          on: {
            instanceReady: function(ev) {
              var editor = ev.editor;
              editor.setReadOnly(false);
              editor.setData(ngModel.$viewValue);
              editor.on('change', function(e) {
                scope.update(e);
              });
              editor.on('key', function(e) {
                scope.update(e);
              });
              editor.on('customUpdate', function(e) {
                scope.setContent(e);
              });
            }
          },
          sharedSpaces: {
            top: 'editor-toolbar'
          }
        });
      }

    }
  }
});
