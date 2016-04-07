// 'use strict'; <--- DO NOT USE! CKEDITOR FAILS (https://github.com/WebSpellChecker/ckeditor-plugin-scayt/issues/65)
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
app.directive("elem", function($rootScope, $timeout, $compile, SimpleSiteBuilderService) {
  return {
    require: '?ngModel',
    replace: true,
    transclude: true,
    scope: {
      title: '@ngModel',
      className: '@className'
    },
    template: '<div ' +
                'data-edit ' +
                'class="edit-wrap ssb-edit-wrap ssb-element"> ' +
                '<span class="editable-title">{{title | formatText}}</span>' +
                '<div ' +
                    'ng-class="{{vm.elementClass()}}" ' +
                    'ng-attr-style="{{vm.elementStyle()}}" ' +
                    'class="editable element-wrap ssb-text-settings {{className}}" ' +
                    'is-edit="true" ' +
                    'ng-bind-html="ngModel | unsafe">' +
                '</div>' +
              '</div>',
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

        scope.updateFroalaContent = _.debounce(function(editor) {
            $timeout(function() {
                ngModel.$setViewValue(editor.html.get());
                scope.compileEditorElements(editor);
            });
        }, 500)

        scope.compileEditorElements = function(editor, initial) {

            SimpleSiteBuilderService.compileEditorElements(editor, initial, componentId, editor.id, scope);

        };


      var elem = angular.element(element[0].querySelector('.editable'))[0];
      var componentId = $(elem).closest('[component]').attr('id');

      if (scope.$parent.ssbEditor || (scope.$parent.vm && scope.$parent.vm.ssbEditor)) {
        $(function() {
          $timeout(function() {
            $(elem).on('froalaEditor.initialized', function(e, editor) {

              //topbar positioning
              $('.fr-toolbar.fr-inline.fr-desktop:first').addClass('ssb-froala-first-editor');

              //set initial text
              if (ngModel.$viewValue) {
                editor.html.set(ngModel.$viewValue);
              }

              //compile special elements
              scope.compileEditorElements(editor, true);

            }).froalaEditor($.FroalaEditor.config)
                .on('froalaEditor.contentChanged', function(e, editor) {
                    scope.updateFroalaContent(editor);
                    // $(elem).froalaEditor('html.cleanEmptyTags');
                }).on('froalaEditor.click', function(e, editor, clickEvent) {

                }).on('froalaEditor.keydown', function(e, editor, keydown) {
                    scope.updateFroalaContent(editor);
                }).on('froalaEditor.image.resizeEnd', function(e, editor, $img) {
                    scope.updateFroalaContent(editor);
                }).on('froalaEditor.toolbar.show', function(e, editor) {

                    console.log('toolbar show')

                    //close sidebar
                    $rootScope.app.layout.isSidebarClosed = true;

                    //hide any currently shown toolbar
                    $('.fr-toolbar').removeClass('ssb-froala-active-editor');

                    //move toolbar to highest z-index
                    editor.$tb.addClass('ssb-froala-active-editor');

                    //hide any edit-control labels
                    // $('.ssb-site-builder .ssb-edit-control').addClass('hide-edit-control');

                }).on('froalaEditor.toolbar.hide', function(e, editor) {

                    // console.log('toolbar hide');

                    if (editor.popups.areVisible()) {
                        //hide any currently shown toolbar
                        $('.fr-toolbar').removeClass('ssb-froala-active-editor');
                    }

                    // $('.ssb-site-builder .ssb-edit-control').removeClass('hide-edit-control');

                }).on('froalaEditor.commands.after', function (e, editor, cmd, param1, param2) {

                    if (editor.popups.areVisible()) {
                        //hide any currently shown toolbar
                        $('.fr-toolbar').removeClass('ssb-froala-active-editor');
                    }

                    if (cmd === 'undo') {
                        scope.compileEditorElements(editor, true);
                    }

                }).on('froalaEditor.blur', function (e, editor) {

                    //hide any currently shown toolbar
                    $('.fr-toolbar').removeClass('ssb-froala-active-editor');

                }).on('froalaEditor.popups.hide.image.insert', function(e, editor) {
                    console.log('froalaEditor.popups.hide.image.insert');
                }).on('froalaEditor.popups.hide.image.edit', function(e, editor) {
                    console.log('froalaEditor.popups.hide.image.edit');
                });

                $(elem).froalaEditor('events.on', 'keydown', function (e) {

                    // if enter key is pressed inside of button
                    if (e.which === 13 && $(window.getSelection().focusNode).parents('.ssb-theme-btn').length) {
                        // prevent it if cursor is in the middle of the button
                        if (window.getSelection().focusOffset !== 0 && window.getSelection().focusOffset !== window.getSelection().focusNode.length) {
                            e.preventDefault();
                            return false
                        }
                    }

                }, true);

          }, 2000);
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
