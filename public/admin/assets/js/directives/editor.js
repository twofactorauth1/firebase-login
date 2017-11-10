/*global app, angular, $ ,console */
/*jslint unparam:true*/
app.directive("elem", function ($rootScope, $timeout, $compile, SimpleSiteBuilderService, $window, UtilService, toaster) {
	'use strict';
	return {
		require: '?ngModel',
		replace: true,
		transclude: true,
		scope: {
			title: '@ngModel',
			className: '@className'
		},
		template: function (element, attrs) {
			var pageTemplate =
				'<div ' +
				'data-edit ' +
				'class="edit-wrap ssb-edit-wrap ssb-element"> ' +
				'<span class="editable-title">{{component}}</span>' +
				'<div ' +
				'ng-class="{{vm.elementClass()}}" ' +
				'ng-attr-style="{{vm.elementStyle(true)}}" ' +
				'class="ssb-text-settings {{className}}" ' +
				'is-edit="true" >' +
				'<div ng-if="component.isOverlayActive"' +
				'class="bg slider-overlay-bg" ng-style ="{\'background\': component.overlayBackground, opacity: component.overlayOpacity === 0 ?  component.overlayOpacity : component.overlayOpacity/100  || 0 , \'height\': component.isOverlayActive ? component.gridHeight+\'px\':\'\' }"> ' +
				'</div>' +
				'<div ng-show="vm.showHide()" ng-class="{\'admin_grid_view\': component.isGrid }" class="editable element-wrap {{vm.verticalAlignment()}}" ng-bind-html="ngModel | unsafe"></div>' +
				'<div ng-if="!vm.showHide()" class="text-center">HIDDEN</div>' +
				'</div>' +
				'</div>',
				blogTemplate =
				'<div ' +
				'class="editable {{className}}" ' +
				'ng-bind-html="ngModel | unsafe">' +
				'</div>',
				topicTemplate =
				'<div ' +
				'class="edit-wrap"> ' +
				'<span class="editable-title">{{title | formatText}}</span>' +
				'<div ' +
				'class="editable element-wrap' +
				'ng-bind-html="ngModel | unsafe">' +
				'</div>' +
				'</div>',
				messageTemplate =
				'<div ' +
				'class="editable {{className}}" ' +
				'ng-bind-html="ngModel | unsafe">' +
				'</div>',
				helpTopics = $rootScope.$state && $rootScope.$state.current && $rootScope.$state.current.name === "app.support.singletopic";
			if (helpTopics) {
				attrs.helpTopics = helpTopics;
			}

			if (attrs.ssbBlogEditor || attrs.broadcastMessageEditor) {
				return blogTemplate;
			}

			if (attrs.helpTopics) {
				return topicTemplate;
			}

			if (attrs.broadcastMessageEditor) {
				return messageTemplate;
			}

			/*if (attrs.ssbEmailEditor) {
				//TODO: jaideep
			}*/

			return pageTemplate;
		},
		link: function (scope, element, attrs, ngModel) {

			scope.component = scope.$parent.component;
			scope.update = function (e) {
				$timeout(function () {
					scope.$apply(function () {
						ngModel.$setViewValue(e.editor.getData());
					});
				}, 0);
			};

			scope.setContent = function (e) {
				$timeout(function () {
					scope.$apply(function () {
						e.editor.setData(ngModel.$viewValue);
					});
				}, 0);
			};

			scope.updateFroalaContent = _.debounce(function (editor, codeViewHtml) {
				$timeout(function () {

					var html = codeViewHtml || editor.html.get().replace(/\u2028|\u2029/g, '');

					ngModel.$setViewValue(html);
					scope.compileEditorElements(editor);
				});
			}, 500);


			function destroyShared(editor) {
				editor.shared.count = 1;
				// Deleting shared instances
				if (editor.shared) {
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


			function checkIfPageEditor(attrs) {
				if (attrs.ssbBlogEditor || attrs.broadcastMessageEditor || attrs.helpTopics || attrs.ssbEmailEditor) {
					return false;
				} else {
					return true;
				}

			}

			$rootScope.$on('$destroyFroalaInstances', function () {
				var elem = angular.element(element[0].querySelector('.editable'))[0];
				//$(elem).froalaEditor($.FroalaEditor.build());
				if ($(elem).data('froala.editor')) {
					var editor = $(elem).data('froala.editor');
					destroyShared(editor);
				}
			});


			var elem = angular.element(element[0].querySelector('.editable'))[0],
				componentId = $(elem).closest('[component]').attr('id');

			if (attrs.ssbBlogEditor || attrs.broadcastMessageEditor) {
				elem = element[0];
			}
			scope.compileEditorElements = function (editor, initial) {
				SimpleSiteBuilderService.compileEditorElements(editor, initial, componentId, editor.id, scope);
			};

			if (scope.$parent.ssbEditor || (angular.element(elem).scope() && angular.element(elem).scope().pvm) || (scope.$parent.vm && scope.$parent.vm.ssbEditor) || attrs.helpTopics || attrs.broadcastMessageEditor) {
				$(function () {
					var blogPostEditor = attrs.ssbBlogEditor,
						helpTopicsEditor = attrs.helpTopics,
						ssbEmailEditor = attrs.ssbEmailEditor,
						froalaConfig = $.FroalaEditor.build(
							(function () {
								if (attrs.broadcastMessageEditor) {
									return 'broadcastMessageEditor';
								} else if (attrs.ssbBlogEditor) {
									return 'ssbBlogEditor';
								} else if (attrs.ssbEmailEditor) {
									return 'ssbEmailEditor';
								} else {
									return;
								}
							}())
						);
					// Case when editing blog post content
					if (blogPostEditor) {
						froalaConfig.enter = $.FroalaEditor.ENTER_P;
						froalaConfig.placeholderText = attrs.placeholder;
						if (SimpleSiteBuilderService.permissions && SimpleSiteBuilderService.permissions.html === true) {
							if (froalaConfig.toolbarButtons.indexOf('html') === -1) {
								froalaConfig.toolbarButtons.push('html');
							}
						}
					}

					// Special case to allow empty healcode-widget tag
					$.merge(froalaConfig.htmlAllowedEmptyTags, ["healcode-widget"]);

			      	if(!ssbEmailEditor && SimpleSiteBuilderService.customFonts && angular.isDefined(SimpleSiteBuilderService.customFonts)){

				        var fonts = SimpleSiteBuilderService.getFontFamilyOptions();
						froalaConfig.fontFamily = fonts;
			      	}


					$timeout(function () {

						$(elem).on('froalaEditor.initialized', function (e, editor) {
								if (blogPostEditor || helpTopicsEditor || attrs.broadcastMessageEditor) {
									destroyShared(editor);
								}
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


								//var placeholderText = angular.copy(froalaConfig.placeholderText);
								if (attrs.placeholder && editor.$placeholder) {
									editor.$placeholder.text(attrs.placeholder);
								}

								//$.merge(editor.opts.htmlAllowedTags, ["healcode-widget"]);
								//$.merge(editor.opts.htmlAllowedAttrs, ["data-version", "data-link-class", "data-site-id", "data-mb-site-id", "data-type","data-inner-html", "data-service-id"]);
								//$.merge(editor.opts.htmlAllowedEmptyTags, ["healcode-widget"]);

							}).froalaEditor(froalaConfig)

							.on('froalaEditor.contentChanged', function (e, editor) {
								scope.updateFroalaContent(editor);
								// $(elem).froalaEditor('html.cleanEmptyTags');
							}).on('froalaEditor.click', function (e, editor) {
								if (checkIfPageEditor(attrs)) {
									UtilService.flyoverhideonclick();
								}
								if (attrs.placeholder && editor.$placeholder) {
									editor.$placeholder.text(attrs.placeholder);
								}
							}).on('froalaEditor.keydown', function (e, editor) {
								scope.updateFroalaContent(editor);
							}).on('froalaEditor.image.resizeEnd', function (e, editor) {
								scope.updateFroalaContent(editor);
							}).on('froalaEditor.toolbar.show', function (e, editor) {

								console.log('toolbar show');
								//  if(checkIfPageEditor(attrs))
								// {
								//  UtilService.flyoverhideonclick();

								// }



								//close sidebar
								$rootScope.app.layout.isSidebarClosed = true;

								//hide any currently shown toolbar
								$('.fr-toolbar').removeClass('ssb-froala-active-editor');

								//move toolbar to highest z-index
								editor.$tb.addClass('ssb-froala-active-editor');

								//editor.selection.save();
								scope.$emit('focusEditor', {
									editor: editor
								});

								var fonts = SimpleSiteBuilderService.getFontFamilyOptions();
								editor.opts.fontFamily = fonts;

							}).on('froalaEditor.toolbar.hide', function (e, editor) {

								console.log('toolbar hide');
								// if(checkIfPageEditor(attrs))
								// {
								//    UtilService.flyoverhideonclick();

								// }

								// hide any image overlay if toolbar is hidden
								if (editor.shared && editor.shared.$img_overlay) {
									editor.shared.$img_overlay.hide();
								}

								if (editor.popups.areVisible()) {
									//hide any currently shown toolbar

									$('.fr-toolbar').removeClass('ssb-froala-active-editor');
								}

								// $('.ssb-site-builder .ssb-edit-control').removeClass('hide-edit-control');

							}).on('froalaEditor.commands.before', function (e, editor, cmd) {

                                //wrap current element with div for list
                                if(cmd==="formatOL" || cmd === "formatUL"){
                                   editor.format.apply('span');
                                }

                                //wrap element with span before applying changes.
                                if(cmd === "fontFamily" || cmd === "fontWeight"){
                                       editor.format.apply('span', { class: 'custom-span' });
                                }
								if (cmd === 'videoInsertEmbed') {
									if ($.FE)
										$.FE.VIDEO_EMBED_REGEX = froalaConfig.VIDEO_EMBED_REGEX;
								}


							}).on('froalaEditor.image.inserted', function (e, editor, $img) {
								// Removing any protocol used for image
								if ($img && $img.attr("src")) {
									var imageSrc = $img.attr("src").replace(/^(http|https):/i, "");
									$img.attr("src", imageSrc);
								}
							})
							.on('froalaEditor.link.beforeInsert', function (e, editor, href) {
								if (attrs.ssbEmailEditor || attrs.broadcastMessageEditor) {
									if (href && href.indexOf('mailto:') !== 0 && href.indexOf('tel:') !== 0) {
										var regex = /^(f|ht)tps?:\/\//i;
										if (!regex.test(href)) {
											var $popup = editor.popups.get('link.insert');
											$popup.find('input[name="href"]').addClass('fr-error');
											editor.events.trigger('link.bad', []);
											toaster.clear('*');
											toaster.pop('warning', 'Protocol is required');
											return false;
										}
									}
								}
							}).on('froalaEditor.commands.after', function (e, editor, cmd, param1) {

								if (editor.popups.areVisible()) {
									//hide any currently shown toolbar
									$('.fr-toolbar').removeClass('ssb-froala-active-editor');
								}

								if (cmd === 'undo') {
									scope.compileEditorElements(editor, true);
								}
                                 console.log('command----------',cmd);

								if (cmd === 'imageStyle' || cmd === 'imageDisplay' || cmd === 'linkInsert' || cmd === 'imageAlign' || cmd === 'imageSetSize' || cmd === 'linkRemove' || cmd === 'imageRemove' || cmd === 'imageSetAlt') {
									scope.updateFroalaContent(editor);
								}

								if (cmd === 'html') {
									if (editor.codeView.isActive()) {
										var mirrors=editor.$box.find(".CodeMirror");
										if(mirrors && mirrors.length>0) {
											var mirror = mirrors[0].CodeMirror;
											if(mirror){
												mirror.on('change', function () {
													$timeout(function () {
														scope.updateFroalaContent(editor, editor.codeView.get());
													}, 0);
												});
											}
										}
									}
								}
								if (cmd === 'linkRemoveBtn') {
									if (editor.selection && editor.selection.element) {
										var aElem = angular.element(editor.selection.element());
										if (aElem.length) {
											aElem.removeAttr("href");
										}
									}
								}

								if(cmd=== 'tableRows' || cmd === 'tableHeader'){
									if(editor.$el.find('.fr-selected-cell').length){
										var padding = editor.$el.find('.fr-selected-cell').css("padding");
										var border = editor.$el.find('.fr-selected-cell').css("border-width")
										var tableCells = editor.$el.find('.fr-selected-cell').closest('table').find("td");
								        var tableHeaders = editor.$el.find('.fr-selected-cell').closest('table').find("th");
								        tableCells.css("padding", padding);
								        tableHeaders.css("padding", padding);
								        tableCells.css("border-width", border);
								        tableHeaders.css("border-width", border);
									}


							        if(cmd === 'tableHeader'){
							        	var $popup = editor.popups.get('table.edit');
										if ($popup) {
											var $btn = $popup.find('.fr-command[data-cmd="tableHeader"]');
											if ($btn && $btn.hasClass('fr-active')) {
												$btn.removeClass("fr-active");
											}
										}
							        }
								}
								if (cmd === 'clearFormatting') {

									var selectionEl = editor.$el,
										videoElems = selectionEl.find("video");
									if (videoElems.length) {
										videoElems.each(function () {
											var element = $(this);
											if (!element.parents('span.fr-video.fr-dvb').length) {
												element.wrap("<span class='fr-video fr-dvb' />");
											}
										});
									}

								}
								if (cmd === 'linkStyle' && param1 === 'ssb-theme-btn') {
									if (editor.selection && editor.selection.element) {
										var aElem = angular.element(editor.selection.element());
										if (aElem.hasClass("ssb-theme-btn")) {
											aElem.addClass("btn");
										} else if (aElem.is("span") && aElem.closest(".ssb-theme-btn").length) {
											aElem.closest(".ssb-theme-btn").addClass("btn");
										}
									}
								}

							}).on('froalaEditor.focus', function (e, editor) {
								editor.selection.save();
								if (checkIfPageEditor(attrs)) {
									UtilService.flyoverhideonclick();
								}
							})
							.on('froalaEditor.paste.before', function (e, editor) {
								editor.selection.restore();
							})
							.on('froalaEditor.blur', function (e, editor) {

								if (attrs.placeholder && editor.$placeholder) {
									editor.$placeholder.text(attrs.placeholder);
								}
								//hide any currently shown toolbar
								$('.fr-toolbar').removeClass('ssb-froala-active-editor');
								editor.selection.save();
								scope.$emit('activeEditor', {
									editor: editor,
									editorImage: editor.image.get()
								});

							})
							.on('froalaEditor.popups.hide.image.insert', function () {
								console.log('froalaEditor.popups.hide.image.insert');
							}).on('froalaEditor.popups.hide.image.edit', function () {
								console.log('froalaEditor.popups.hide.image.edit');
							}).on('froalaEditor.popups.show.image.edit', function (e, editor) {
								editor.selection.save();
								scope.$emit('activeEditor', {
									editor: editor,
									editorImage: editor.image.get()
								});
							}).on('froalaEditor.image.removed', function (e, editor) {
								scope.updateFroalaContent(editor);
							})

							.on('froalaEditor.bgColorChange', function (e, editor, val) {
								if (editor.opts.isButton) {
									var btnElement = editor.opts.button.scope().vm.elementData;
									if (btnElement.title === 'Button') {
										if (!btnElement.bg) {
											btnElement.bg = {};
										}
										editor.opts.button.scope().vm.elementData.bg.color = val;
									}

								}
							})
							.on('froalaEditor.txtColorChange', function (e, editor, val) {
								if (editor.opts.isButton) {
									var btnElement = editor.opts.button.scope().vm.elementData;
									if (btnElement.title === 'Button') {
										editor.opts.button.scope().vm.elementData.txtcolor = val;
									}
								}
							});
						// .on('froalaEditor.video.inserted', function (e, editor, $video) {
						//       var videoSource = $video.contents().get(0).src;
						//       $video.html('<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="' + videoSource +'" frameborder="0" allowfullscreen></iframe></div>');
						// })
						$(elem).froalaEditor('events.on', 'keydown', function (e) {
							console.log('keydown');
							if (checkIfPageEditor(attrs)) {
								UtilService.flyoverhideonclick();
							}
							// if enter key is pressed inside of button
							if (e.which === 13 && $($window.getSelection().focusNode).parents('.ssb-theme-btn').length) {
								// prevent it if cursor is in the middle of the button
								if ($window.getSelection().focusOffset !== 0 && $window.getSelection().focusOffset !== $window.getSelection().focusNode.length) {
									e.preventDefault();
									return false;
								}
							} else {
								return true;
							}

						}, true);

					}, 2000);
				});
			}
		}
	};
});
