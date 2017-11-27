(function() {

    app.controller('EmailBuilderController', indiEmailBuilderController);

    indiEmailBuilderController.$inject = ['$scope', '$rootScope', 'EmailBuilderService', 'EmailCampaignService', 'SimpleSiteBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal', '$timeout', '$document', '$window', '$location', 'SweetAlert'];
    /* @ngInject */
    function indiEmailBuilderController($scope, $rootScope, EmailBuilderService, EmailCampaignService, SimpleSiteBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal, $timeout, $document, $window, $location, SweetAlert) {

        console.info('email-builder directive init...');

        $scope.$state = $state;
        var vm = this;

        vm.init = init;

        vm.state = vm.state || {};
        vm.state.emailId = $stateParams.id;
        vm.state.email = null;
        vm.state.emails = null;
        vm.state.pendingEmailChanges = false;
        vm.state.pendingWebsiteChanges = false;
        vm.state.account = null;
        vm.state.website = {
            settings: {}
        };

        vm.uiState = {
            allowRedirect: true,
            sidebarOrientation: 'vertical',
            dataLoaded: false,
            modalInstance: null,
            editor: null,
            dirtyOverride: false,
            openSimpleModal: openSimpleModalFn,
            closeModal: closeModalFn,
            saveEmail: saveFn,
            saveAndLoadEmail: saveAndLoadEmail,
            createCampaign: createCampaignFn,
            sendOneTimeEmail: sendOneTimeEmailFn,
            addComponent: addComponentFn,
            delete: deleteFn,
            duplicateEmail: duplicateEmailFn,
            updateEmailCache: updateEmailCache,
            toggleSection:toggleSectionVisiblity,
            componentTypes: [{
                    title: 'Header',
                    type: 'email-header',
                    preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/photos/content_email_header.jpg',
                    filter: 'email',
                    description: 'Use this component for email header section.',
                    enabled: true
                }, {
                    title: 'Content 1 Column',
                    type: 'email-1-col',
                    preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/photos/content_email_1_column.jpg',
                    filter: 'layout',
                    description: 'Use this component for single column content.',
                    enabled: true
                }, {
                    title: 'Content 2 Column',
                    type: 'email-2-col',
                    preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/photos/content_email_2_column.jpg',
                    filter: 'layout',
                    description: 'Use this component for 2 column content.',
                    enabled: true
                }, {
                    title: 'Content 3 Column',
                    type: 'email-3-col',
                    preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/photos/content_email_3_column.jpg',
                    filter: 'layout',
                    description: 'Use this component for 3 column content.',
                    enabled: true
                }, {
                    title: 'Social Links',
                    type: 'email-social',
                    preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/photos/content_email_social.jpg',
                    filter: 'social',
                    description: 'Use this component for social links.',
                    enabled: true
                }, {
                    title: 'Horizontal Rule',
                    type: 'email-hr',
                    preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/photos/content_email_breakline.jpg',
                    filter: 'layout',
                    description: 'Use this component to insert a horizontal rule between components.',
                    enabled: true
                }, {
                    title: 'Footer',
                    type: 'email-footer',
                    preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/photos/content_email_footer.jpg',
                    filter: 'email',
                    description: 'A footer for your email.',
                    enabled: true
                }]
        };

        vm.uiState.navigation = {
            back: function() {
                vm.uiState.navigation.index = 0;
                vm.uiState.navigation.indexClass = 'ssb-sidebar-position-0';
            },
            loadEmail: function(emailId) {
                if (emailId && emailId !== vm.state.email._id) {
                    EmailBuilderService.getEmails();
                    if(!vm.state.pendingWebsiteChanges && !vm.state.pendingEmailChanges) {
                        vm.uiState.loaded = false;
                    }
                    $location.path('/emails/editor/' + emailId);
                } else {
                    vm.uiState.navigation.index = 1;
                    vm.uiState.navigation.indexClass = 'ssb-sidebar-position-1';
                }
            },
            index: 0,
            sectionPanel: {
                navigationHistory: [],
                loadPanel: function(obj, back) {

                    if (!back) {
                        vm.uiState.navigation.sectionPanel.navigationHistory.push(obj);
                    }

                    vm.uiState.openSidebarSectionPanel = obj;
                    console.log(vm.uiState.navigation.sectionPanel.navigationHistory);

                },
                back: function() {
                    var hist = vm.uiState.navigation.sectionPanel.navigationHistory;
                    var previousPanel;

                    hist.pop();

                    previousPanel = hist[hist.length - 1];

                    vm.uiState.navigation.sectionPanel.loadPanel(previousPanel, true);

                    if (previousPanel && !previousPanel.id) {
                        hideAllControls();
                        angular.element(".ssb-active-section").addClass("ssb-active-edit-control");
                    }

                },
                reset: function() {
                    vm.uiState.openSidebarSectionPanel = {
                        name: '',
                        id: ''
                    };
                    vm.uiState.navigation.sectionPanel.navigationHistory = [];
                }
            }
        };

        vm.addComponentFn = addComponentFn;
        vm.cloneComponentFn = cloneComponentFn;
        vm.saveFn = saveFn;
        vm.insertMediaFn = insertMediaFn;
        vm.moveComponentFn = moveComponentFn;
        vm.clickImageButton = clickImageButton;
        vm.deleteFn = deleteFn;
        // vm.filterComponentsFn = filterComponentsFn;
        vm.changeBackgroundFn = changeBackgroundFn;
        vm.closeSectionPanel = closeSectionPanel;
        vm.checkIfDirtyFn = checkIfDirtyFn;
        vm.resetDirtyFn = resetDirtyFn;
        vm.pageChanged = pageChanged;
        vm.openModalFn = openModalFn;
        vm.checkSettingsValidityFn = checkSettingsValidityFn;

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
            $rootScope.$broadcast('$destroyFroalaInstances');
            $rootScope.app.layout.isMinimalAdminChrome = false;
            $rootScope.app.layout.isMinimalAdminChromeLight = false;
            $rootScope.app.layout.isSidebarClosed = vm.uiState.isSidebarClosed;
        });

        function toggleSectionVisiblity(section, global, hide){
                    if (global) {
                        if(section.global === false) {
                            SweetAlert.swal({
                                title: "Are you sure?",
                                text: "Turning off this setting will remove the section from all pages except for this one.",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Remove from other pages",
                                cancelButtonText: "Cancel",
                                closeOnConfirm: true,
                                closeOnCancel: true
                            },
                            function (isConfirm) {
                                //Cancel
                                if (!isConfirm) {
                                    section.global = true;
                                }
                            });
                        }
                    } else if(section.global) {
                            if(!section.hiddenOnPages){
                                section.hiddenOnPages = {}
                            }
                            if(section.visibility === false)
                            {
                                section.hiddenOnPages[vm.state.page.handle] = true;
                                hideAllControls();
                            }
                            else{
                                delete section.hiddenOnPages[vm.state.page.handle];
                            }
                        }
                        else if(section.visibility === false){
                            hideAllControls();
                        }
        }

        function hideAllControls() {

        //hide editable-title's and borders
        angular.element('.ssb-edit-wrap, .editable-title, .editable-cover, [data-edit]', '.ssb-main').removeClass('ssb-on');

        //hide all edit-controls
        angular.element('.ssb-main').find('.ssb-active-edit-control').removeClass('ssb-active-edit-control');
        angular.element('.ssb-main').find('.ssb-on').removeClass('ssb-on');

        //components
        angular.element('.ssb-main').find('.ssb-active-component').removeClass('ssb-active-component');

        //btns
        angular.element('.ssb-main').find('.ssb-theme-btn-active-element').removeClass('ssb-theme-btn-active-element');
        angular.element('.ssb-main').find('.ssb-edit-control-component-btn').removeClass('on');

    }
        $scope.$on('email.move.component', function(event, args) {
            vm.moveComponentFn(args.component, args.direction);
        });

        $scope.$on('email.duplicate.component', function(event, args) {
            vm.cloneComponentFn(args.component);
        });

        $scope.$on('email.remove.component', function(event, args) {
            vm.uiState.dataLoaded = false;

            vm.state.email.components.forEach(function(c, index) {
                if (c._id === args.component._id) {
                    vm.state.email.components.splice(index, 1);
                }
            });
            $timeout(function() {
                var element = vm.state.email.components.length ? document.getElementById(vm.state.email.components[vm.state.email.components.length - 1]._id) : null;
                if (element) {
                    $document.scrollToElementAnimated(element, 175, 1000);
                    $(window).trigger('resize');
                }
                vm.uiState.dataLoaded = true;
                toaster.pop('warning', 'component deleted');
            }, 500);
        });

        $scope.$on('focusEditor', function(event, args) {
            vm.uiState.editor = args.editor;
            vm.uiState.editor.img = null;
        });

        $scope.$on('activeEditor', function(event, args) {
            if (args.editor)
                vm.uiState.editor = args.editor;
            if (args.editorImage)
                vm.uiState.editor.img = args.editorImage;
        });

        $scope.$on('$destroy', destroy);

        /**
         * watchers
         */
        var unbindWebsiteServiceWatcher = $scope.$watch(function() { return SimpleSiteBuilderService.website; }, function(website){
            vm.state.pendingWebsiteChanges = false;
            vm.state.website = website;
            vm.state.originalWebsite = null;
            $timeout(function() {
                vm.state.originalWebsite = angular.copy(website);
            }, 1000);
        });

        var unbindEmailServiceWatcher = $scope.$watch(function() { return EmailBuilderService.emails; }, function(emails){
            vm.state.emails = emails;
        });

        var unbindEmailStateWatcher = $scope.$watch('vm.state.email', _.debounce(function(email) {
            console.time('angular.equals for email');
            if (email && vm.state.originalEmail && vm.pageChanged(email, vm.state.originalEmail)) {
                console.timeEnd('angular.equals for email');
                $timeout(function() {
                    vm.state.pendingEmailChanges = true;
                    console.log("Email changed");
                    if (vm.uiState && vm.uiState.selectedEmail) {
                        vm.uiState.selectedEmail = vm.state.email;
                    }
                }, 0);

            } else {
                vm.state.pendingEmailChanges = false;
            }
        }, 100), true);



        function openSimpleModalFn(modal, _size) {

            var _modal = {
                templateUrl: modal,
                keyboard: true,
                // backdrop: 'static',
                scope: $scope,
                size: _size || 'md',
            };

            vm.uiState.modalInstance = $modal.open(_modal);

            vm.uiState.modalInstance.result.then(null, function() {
                angular.element('.sp-container').addClass('sp-hidden');
            });

        }

        function openModalFn(modal, controller, index, size) {
            console.log('openModal >>> ', modal, controller, index, size);
            var _modal = {
                templateUrl: modal,
                keyboard: true,
                backdrop: 'static',
                size: 'md',
                scope: $scope,
                resolve: {
                    components: function() {
                        return vm.state.email && vm.state.email.components ? vm.state.email.components : [];
                    }
                }
            };

            if (controller) {
                _modal.controller = controller;

                _modal.resolve.contactMap = function() {
                    return {};
                };
                _modal.resolve.website = function() {
                    return vm.state.website;
                };

                _modal.resolve.showInsert = function() {
                    return true;
                };

                _modal.resolve.insertMedia = function() {
                    return vm.insertMediaFn;
                };

                _modal.resolve.openParentModal = function() {
                    return vm.openModalFn;
                };

                _modal.resolve.accountShowHide = function() {
                    return vm.state.account.showhide;
                };
                _modal.resolve.isEmail = function() {
                    return true;
                };

                _modal.resolve.isSingleSelect = function() {
                    return true;
                };
            }

            if (angular.isDefined(index) && index !== null && index >= 0) {
                $scope.setEditingComponent(index);
                _modal.resolve.clickedIndex = function() {
                    return index;
                };
                _modal.resolve.pageHandle = function() {
                    return $scope.page ? $scope.page.handle : null;
                };
            }

            if (size) {
                _modal.size = size;
            }

            vm.uiState.modalInstance = $modal.open(_modal);

            vm.uiState.modalInstance.result.then(null, function() {
                angular.element('.sp-container').addClass('sp-hidden');
            });
        }


        function closeModalFn() {
            if (vm.uiState.modalInstance) {
                vm.uiState.modalInstance.close();
            }
        }

        function addComponentFn(addedType) {
            if (vm.uiState.dataLoaded) {
                vm.uiState.dataLoaded = false;
                var componentType = null;
                if (['email-footer', 'email-header'].indexOf(addedType.type) > -1) {
                    componentType = _.findWhere(vm.state.email.components, {
                        type: addedType.type
                    });
                    if (componentType) {
                        toaster.pop('error', componentType.type + " component already exists");
                        vm.uiState.dataLoaded = true;
                        return;
                    }
                }

                WebsiteService.getComponent(addedType, addedType.version || 1, function(newComponent) {
                    if (newComponent) {
                        vm.uiState.closeModal();
                        vm.state.email.components.push(newComponent);
                        $timeout(function() {
                            var element = document.getElementById(newComponent._id);
                            if (element) {
                                $document.scrollToElementAnimated(element, 175, 1000);
                                $(window).trigger('resize');
                            }
                            vm.uiState.dataLoaded = true;
                            toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
                        }, 500);
                    }
                });
            }
        }

        function cloneComponentFn(component) {
            var clone = angular.copy(component);
            delete clone['_id'];
            delete clone['anchor'];
            var addedType = {
                type: clone.type,
                version: clone.version
            };

            if (vm.uiState.dataLoaded) {
                vm.uiState.dataLoaded = false;
                var componentType = null;
                if (['email', 'email-footer', 'email-header'].indexOf(addedType.type) > -1) {
                    componentType = _.findWhere(vm.state.email.components, {
                        type: addedType.type
                    });
                    if (componentType) {
                        toaster.pop('error', componentType.type + " component can't be cloned");
                        vm.uiState.dataLoaded = true;
                        return;
                    }
                }

                WebsiteService.getComponent(addedType, addedType.version || 1, function(newComponent) {
                    if (newComponent) {
                        _.extend(newComponent, clone);
                        vm.state.email.components.push(newComponent);
                        $timeout(function() {
                            var element = document.getElementById(newComponent._id);
                            if (element) {
                                $document.scrollToElementAnimated(element, 175, 1000);
                                $(window).trigger('resize');
                            }
                            vm.uiState.dataLoaded = true;
                            toaster.pop('success', "Component cloned", "The " + newComponent.type + " component was cloned successfully.");
                        }, 500);
                    }
                });
            }
        }



        function saveFn() {
            if (vm.checkSettingsValidityFn()) {
                vm.uiState.allowRedirect = true;
                vm.uiState.dataLoaded = false;
                EmailBuilderService.updateEmail(vm.state.email).then(function(res) {
                    vm.uiState.dataLoaded = true;
                    vm.state.pendingEmailChanges = false;
                    vm.state.saveLoading = false;
                    toaster.pop('success', 'Email saved');
                    vm.uiState.updateEmailCache(res.data, true);
                }).catch(function(error) {
                    var message = error.data ? error.data.message : 'The email was not saved. Please try again.';
                    toaster.pop('error', 'Error', message);
                    vm.state.saveLoading = false;
                    vm.uiState.dataLoaded = true;
                    vm.uiState.updateEmailCache(vm.state.originalEmail, true);
                    vm.state.pendingEmailChanges = false;
                })
            } else {
                vm.uiState.allowRedirect = false;
                toaster.pop('warning', 'Mandatory field should not be blank');
            }
        }

        function updateEmailCache(email, update){
            WebsiteService.updateEmailCache(email, update);
        }

        $window.clickandInsertImageButton = function(editor) {
            console.log('clickandInsertImageButton >>> ');
            vm.clickImageButton(editor, false);
        };

        function clickImageButton(editor, edit) {
            $scope.insertMediaImage = true;
            $scope.showInsert = true;
            $scope.inlineInput = editor;
            $scope.isEditMode = edit;
            vm.openModalFn('media-modal', 'MediaModalCtrl', null, 'lg');
        }

        function insertMediaFn(asset) {
            if (vm.uiState.editor) {
                $timeout(function() {
                    vm.uiState.editor.image.insert(asset.url, !1, null, vm.uiState.editor.img);
                }, 0);
            } else {
                toaster.pop('error', 'Position cursor at the point of insertion');
            }
        }

        function moveComponentFn(component, direction) {
            var toIndex;
            var fromIndex = _.findIndex(vm.state.email.components, function(x) {
                return x._id === component._id;
            });

            if (direction === 'up') {
                toIndex = fromIndex - 1;
            }

            if (direction === 'down') {
                toIndex = fromIndex + 1;
            }

            vm.state.email.components.splice(toIndex, 0, vm.state.email.components.splice(fromIndex, 1)[0]);
        }

        function deleteFn() {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You want to delete this email?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                closeOnConfirm: true,
                closeOnCancel: true,
            }, function(isConfirm) {
                if (isConfirm) {
                    vm.uiState.dataLoaded = false;
                    WebsiteService.deleteEmail(vm.state.email, function() {
                        vm.uiState.dirtyOverride = true;
                        vm.uiState.dataLoaded = true;
                        $state.go('app.emails');
                        toaster.pop('Warning', 'Email deleted.');
                    });
                }
            });
        }

        function duplicateEmailFn(){
            SweetAlert.swal({
                title: "Are you sure?",
                text: "You want to clone this email?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                closeOnConfirm: true,
                closeOnCancel: true,
            }, function(isConfirm) {
                if (isConfirm) {
                    vm.uiState.dataLoaded = false;
                    vm.state.saveLoading = true;
                    EmailBuilderService.duplicateEmail(vm.state.email).then(function(response){
                        var email = response.data;
                        vm.uiState.dirtyOverride = true;
                        vm.uiState.dataLoaded = true;
                        vm.state.saveLoading = false;
                        toaster.pop('Warning', 'Email cloned.');
                        vm.uiState.updateEmailCache(email, false);
                        vm.uiState.navigation.loadEmail(email._id);
                    });
                }
            });
        }

        // function filterComponentsFn() {
        //     var componentLabel = '';
        //     vm.enabledComponentTypes = _.where(vm.uiState.componentTypes, {
        //         enabled: true
        //     });

        //     vm.componentFilters = _.without(_.uniq(_.pluck(_.sortBy(vm.enabledComponentTypes, 'filter'), 'filter')), 'misc');

        //     // Iterates through the array of filters and replaces each one with an object containing an
        //     // upper and lowercase version
        //     _.each(vm.componentFilters, function(element, index) {
        //         componentLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
        //         vm.componentFilters[index] = {
        //             'capitalized': componentLabel,
        //             'lowercase': element
        //         };
        //         componentLabel = null;
        //     });

        //     // Manually add the All option to the begining of the list
        //     vm.componentFilters.unshift({
        //         'capitalized': 'All',
        //         'lowercase': 'all'
        //     });
        // }

        function sendOneTimeEmailFn(address) {

            vm.uiState.dataLoaded = false;
            if(vm.state.email.components && vm.state.email.components.length > 0)
            {
              for(var i = 0, comp_length=vm.state.email.components.length;i<comp_length; i++){

                    var current_component = vm.state.email.components[i];
                    if(current_component.spacing) {

                      for(var m in current_component.spacing){
                        var current_spacing = String(current_component.spacing[m]);
                        if(current_spacing && current_spacing.indexOf("%") === -1 && current_spacing !== 'auto' && /^\d+$/.test(current_spacing)){
                          vm.state.email.components[i].spacing[m] = current_spacing+"px";

                        }
                      }

                    }
              }
            }

            EmailBuilderService.sendOneTimeEmail(address, vm.state.email).then(function() {
                vm.uiState.dataLoaded = true;
                vm.uiState.closeModal();
                toaster.pop('success', 'Test email sent successfully');
            }).catch(function(e) {
                console.error('Error sending one-time email:', JSON.stringify(e));
                vm.uiState.dataLoaded = true;
                vm.uiState.closeModal();
                toaster.pop('error', 'Test email sending failed');
            });
        }

        function pageLinkClick(e) {
            if (!angular.element(this).hasClass("clickable-link")) {
                e.preventDefault();
            }
        }

        function emailSettingsClick(e) {
            vm.uiState.navigation.sectionPanel.reset();
            vm.uiState.showSectionPanel = false;
        }

        function changeBackgroundFn() {
            vm.uiState.navigation.sectionPanel.loadPanel({
                name: 'Email Background',
                id: 'background'
            })
            vm.uiState.showSectionPanel = true;
            vm.uiState.activeComponentIndex = null;
        }

        function closeSectionPanel() {
            vm.uiState.navigation.sectionPanel.reset();
            vm.uiState.showSectionPanel = false;
            vm.uiState.activeComponentIndex = null;
        }

        function createCampaignFn() {
            var campaign = {
                "name": vm.state.email.title + ' Campaign Draft ' + moment().toDate().getTime(),
                "type": "onetime",
                "status": "DRAFT",
                "visibility": 1,
                "startDate": "",
                "emailSettings":{
                    "emailId": vm.state.email._id,
                    "fromEmail": vm.state.email.fromEmail,
                    "fromName": vm.state.email.fromName,
                    "replyTo": vm.state.email.replyTo,
                    "bcc": vm.state.email.bcc,
                    "cc": vm.state.email.cc,
                    "subject": vm.state.email.subject,
                    "vars": [],
                    "sendAt": {}
                },
                "searchTags": {
                    "operation": "set",
                    "tags": []
                },
                "contactTags": []
            };


            EmailCampaignService.createCampaign(campaign).then(function(res) {
                vm.uiState.closeModal();
                console.log('EmailCampaignService.createCampaign created', res.data.name);
                $location.path('/emails/campaigns/' + res.data._id);
            }).catch(function(err) {
                console.error('EmailCampaignService.createCampaign error', JSON.stringify(err));
            });

        }

        function checkIfDirtyFn() {
            return vm.state.pendingEmailChanges;
        }

        function resetDirtyFn() {
            vm.state.pendingEmailChanges = false;
            vm.uiState.dirtyOverride = false;
        }

        /**
         * Inspect changes beyond simple angular.equals
         * - if angular.equals detects a change, then:
         *      - get the specific change from the data (DeepDiff)
         *      - if that change is ONLY a [data-compile] difference, then:
         *          - ignore it as a change
         *          - apply to original data so future compares don't include this diff
         *          - decrement changes so we don't count it in number of changes
         *          - return changes > 0
         *      - else the change is legit, return true
         * - else the change is legit, return true
         *
         * TODO: handle undo in Froala
         * TODO: consolidate usages (ssb-site-builder.controller.js)
         */
        function pageChanged(originalEmail, currentEmail) {
            if (!angular.equals(originalEmail, currentEmail) && !vm.state.pendingEmailChanges) {
                var originalEmail = JSON.parse(angular.toJson(originalEmail));
                var currentEmail = JSON.parse(angular.toJson(currentEmail));
                var jsondiff1 = DeepDiff.diff(originalEmail, currentEmail);
                var changes = jsondiff1.length;

                if (changes) {

                    for (var i = 0; i < changes; i++) {

                        console.debug('tracked change');
                        console.debug(jsondiff1[i].lhs);
                        console.debug(jsondiff1[i].rhs);

                        var diff1 = jsondiff1[i].lhs;
                        var diff2 = jsondiff1[i].rhs;
                        var changedPath = jsondiff1[i].path;
                        if (dataIsCompiledAdded(diff1, diff2) || dataIsCompiledRemoved(diff1, diff2) || isEmptyStyleAdded(diff1, diff2)) {

                            console.debug('change to ignore detected @: ', jsondiff1[i].path);

                            $timeout(function() {

                                DeepDiff.applyChange(originalEmail, currentEmail, jsondiff1[i]);

                                vm.state.originalEmail = originalEmail;

                                console.debug('should be empty: ', DeepDiff.diff(originalEmail, currentEmail));

                                changes--;

                                return changes > 0;

                            });

                        } else {
                            console.log(diff1);
                            console.log(diff2);
                            return true;
                        }
                    }
                } else {

                    return changes > 0;

                }

            } else {

                return !angular.equals(originalEmail, currentEmail)

            }

        }

        /**
         * Detect changes to page data, determine if they should be ignored
         * - handles temp IDs for buttons inside Froala editor (button was added)
         */
        function dataIsCompiledAdded(diff1, diff2) {
                var updated = false;

                if (diff1 && diff2) {
                    updated = angular.isDefined(diff1) &&
                            angular.isDefined(diff1.indexOf) &&
                            diff1.indexOf('data-compiled') === -1
                            angular.isDefined(diff2) &&
                            angular.isDefined(diff2.indexOf) &&
                            diff2.indexOf('data-compiled') !== -1;
                }

                if (updated && angular.isDefined(diff1) && angular.isDefined(diff2)) {
                    updated = angular.equals(diff1, diff2)
                }

                return updated;
        };

        /**
         * Detect changes to page data, determine if they should be ignored
         * - handles temp IDs for buttons inside Froala editor (button was removed)
         */
        function dataIsCompiledRemoved(diff1, diff2) {
            return  diff1 &&
                    diff2 &&
                    angular.isDefined(diff1) &&
                    angular.isDefined(diff1.indexOf) &&
                    diff1.indexOf('data-compiled') !== -1 &&
                    angular.isDefined(diff2) &&
                    angular.isDefined(diff2.indexOf) &&
                    diff2.indexOf('data-compiled') === -1
        };


        function isEmptyStyleAdded(diff1, diff2) {
            if(diff1 &&
                    diff2 &&
                    angular.isDefined(diff1) && angular.isDefined(diff2))
                {
                    var compareString1 = diff1.replace(/ style=''/g, "");
                    var compareString2 = diff2.replace(/ style=''/g, "");

                    return angular.equals(compareString1, compareString2);
                }
        };

        function saveWebsite() {
            vm.state.pendingWebsiteChanges = false;
            return (
                SimpleSiteBuilderService.saveWebsite(vm.state.website).then(function(response){
                    console.log('website saved');
                })
            )
        }

        function saveAndLoadEmail(email) {
            if (vm.state.pendingEmailChanges || vm.state.pendingWebsiteChanges) {
                vm.state.saveLoading = true;
                vm.state.pendingWebsiteChanges = false;
                vm.state.pendingEmailChanges = false;
                saveWebsite().then(function(){
                    return (
                        EmailBuilderService.updateEmail(vm.state.email).then(function(response){
                            SimpleSiteBuilderService.getSite(vm.state.website._id).then(function(){
                                console.log('email saved');
                                toaster.pop('success', 'Email Saved', 'The email was saved successfully.');
                                vm.state.saveLoading = false;
                                if(response.data)
                                    vm.uiState.updateEmailCache(response.data, true);
                                vm.uiState.navigation.loadEmail(email._id);
                                EmailBuilderService.getEmails();
                                vm.state.pendingEmailChanges = false;
                            })
                        }).catch(function(error) {
                            var message = error.data ? error.data.message : 'The email was not saved. Please try again.';
                            toaster.pop('error', 'Error', message);
                            vm.state.saveLoading = false;
                        })
                    )
                })
            } else {
                vm.uiState.navigation.loadEmail(email._id);
                EmailBuilderService.getEmails();
            }
        };

        function destroy() {

            console.debug('destroyed main EmailBuilder controller');

            angular.element("body").off("click", "[email-component-loader] a", pageLinkClick);

            unbindEmailStateWatcher();
            unbindEmailServiceWatcher();
            unbindWebsiteServiceWatcher();

        }

        function checkSettingsValidityFn () {
            if (vm.state.email.title && vm.state.email.subject && vm.state.email.fromName && vm.state.email.fromEmail) {
                return true;
            } else {
                return false;
            }
        }

        function init(element) {

            vm.element = element;

            vm.uiState.isSidebarClosed = $rootScope.app.layout.isSidebarClosed;
            $rootScope.app.layout.isSidebarClosed = true;
            $rootScope.app.layout.isMinimalAdminChrome = true;
            $rootScope.app.layout.isMinimalAdminChromeLight = true;

            angular.element("body").on("click", "[email-component-loader] a", pageLinkClick);

            // vm.filterComponentsFn();

            AccountService.getAccount(function(data) {
                vm.state.account = data;
            });

            WebsiteService.getWebsite(function(data) {
                vm.state.website = data;
            });

            EmailBuilderService
                .getEmail(vm.state.emailId)
                .then(function(res) {
                    if (!res.data._id) {
                        toaster.pop('error', 'Email not found');
                        $state.go('app.emails');
                    }
                    vm.state.email = res.data;
                    vm.state.originalEmail = angular.copy(res.data);
                    $timeout(function() {
                        vm.uiState.dataLoaded = true;
                    }, 1000);
                }, function(err) {
                    console.error(err);
                    $state.go('app.emails');
                });

        }


    }

})();
