// 'use strict'; <--- DO NOT USE! CKEDITOR FAILS (https://github.com/WebSpellChecker/ckeditor-plugin-scayt/issues/65)
/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
app.directive("elem", function($rootScope, $timeout, $compile, SimpleSiteBuilderService, $window) {
  return {
    require: '?ngModel',
    replace: true,
    transclude: true,
    scope: {
      title: '@ngModel',
      className: '@className'
    },
    template: function(element, attrs) {

        var pageTemplate =
                    '<div ' +
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
                    '</div>';

        var blogTemplate =
                    '<div ' +
                        'class="editable {{className}}" ' +
                        'ng-bind-html="ngModel | unsafe">' +
                    '</div>';

        if (attrs.ssbBlogEditor) {
            return blogTemplate
        }

        if (attrs.ssbEmailEditor) {
            //TODO: jaideep
        }

        return pageTemplate;

    },
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

                var html = editor.html.get().replace(/\u2028|\u2029/g, '');
                               
                ngModel.$setViewValue(html);
                scope.compileEditorElements(editor);
            });
        }, 500)

        scope.compileEditorElements = function(editor, initial) {

            SimpleSiteBuilderService.compileEditorElements(editor, initial, componentId, editor.id, scope);

        };

        function destroyShared(editor){
            editor.shared.count = 1;
            // Deleting shared instances
            if(editor.shared){
                editor.shared.count = 1;
                delete editor.shared.$tb;
                delete editor.shared.popup_buttons;
                delete editor.shared.popups;
                delete editor.shared.$image_resizer;
                delete editor.shared.$img_overlay;
                delete editor.shared.$line_breaker;
                delete editor.shared.exit_flag;
                delete editor.shared.vid_exit_flag;
            }
        }

        $rootScope.$on('$destroyFroalaInstances', function (event) {
            var elem = angular.element(element[0].querySelector('.editable'))[0];
            //$(elem).froalaEditor($.FroalaEditor.build());
            if($(elem).data('froala.editor')){
                var editor = $(elem).data('froala.editor');
                destroyShared(editor);
            }
        });


        var elem = angular.element(element[0].querySelector('.editable'))[0];
        var componentId = $(elem).closest('[component]').attr('id');

        if (attrs.ssbBlogEditor) {
            elem = element[0];
        }

        if (scope.$parent.ssbEditor || angular.element(elem).scope().pvm || (scope.$parent.vm && scope.$parent.vm.ssbEditor)) {
            $(function() {

                var froalaConfig = $.FroalaEditor.build(
                    (function() {
                        if (attrs.ssbBlogEditor) {
                            return 'ssbBlogEditor';
                        } else if (attrs.ssbEmailEditor) {
                            return 'ssbEmailEditor'
                        } else {
                            return
                        }
                    })()
                );

                $timeout(function() {

                    $(elem).on('froalaEditor.initialized', function(e, editor) {
                    if($(elem).parents().hasClass("ssb-blog-editor"))
                        destroyShared(editor);
                    //topbar positioning
                    $('.fr-toolbar.fr-inline.fr-desktop:first').addClass('ssb-froala-first-editor');

                    //set initial text
                    if (ngModel.$viewValue) {
                        var html = ngModel.$viewValue.replace("<span>", "<span style=''>").replace(/\u2028|\u2029/g, '');
                        ngModel.$setViewValue(html);
                        editor.html.set(html);
                    }

                    //compile special elements
                    scope.compileEditorElements(editor, true);

                }).froalaEditor(froalaConfig)
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

                        //editor.selection.save();
                        scope.$emit('focusEditor', { editor: editor });

                    }).on('froalaEditor.toolbar.hide', function(e, editor) {

                        console.log('toolbar hide');
                        // hide any image overlay if toolbar is hidden
                        if(editor.shared && editor.shared.$img_overlay)
                            editor.shared.$img_overlay.hide();

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

                    }).on('froalaEditor.focus', function (e, editor) {
                       editor.selection.save();
                    })
                    .on('froalaEditor.paste.before', function (e, editor) {
                        editor.selection.restore();
                    })
                    .on('froalaEditor.blur', function (e, editor) {
                        //hide any currently shown toolbar
                        $('.fr-toolbar').removeClass('ssb-froala-active-editor');
                        editor.selection.save();
                        scope.$emit('activeEditor', { editor: editor, editorImage: editor.image.get() });

                    })
                    .on('froalaEditor.popups.hide.image.insert', function(e, editor) {
                        console.log('froalaEditor.popups.hide.image.insert');
                    }).on('froalaEditor.popups.hide.image.edit', function(e, editor) {
                        console.log('froalaEditor.popups.hide.image.edit');
                    }).on('froalaEditor.popups.show.image.edit', function(e, editor) {
                        editor.selection.save();
                        scope.$emit('activeEditor', { editor: editor, editorImage: editor.image.get() });
                    })
                    .on('froalaEditor.bgColorChange', function(e, editor, val) {
                        if(editor.opts.isButton){
                            var btnElement = editor.opts.button.scope().vm.elementData;
                            if(!btnElement.bg){
                                btnElement.bg = {};
                            }
                            editor.opts.button.scope().vm.elementData.bg.color = val;
                        }
                    })
                    .on('froalaEditor.txtColorChange', function(e, editor, val) {
                        if(editor.opts.isButton){
                            var btnElement = editor.opts.button.scope().vm.elementData;
                            editor.opts.button.scope().vm.elementData.txtcolor = val;
                        }
                    })
                    $(elem).froalaEditor('events.on', 'keydown', function (e) {

                        // if enter key is pressed inside of button
                        if (e.which === 13 && $($window.getSelection().focusNode).parents('.ssb-theme-btn').length) {
                            // prevent it if cursor is in the middle of the button
                            if ($window.getSelection().focusOffset !== 0 && $window.getSelection().focusOffset !== $window.getSelection().focusNode.length) {
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
