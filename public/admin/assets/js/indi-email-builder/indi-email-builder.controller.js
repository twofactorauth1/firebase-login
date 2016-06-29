(function () {

    app.controller('EmailBuilderController', indiEmailBuilderController);

    indiEmailBuilderController.$inject = ['$scope', 'EmailBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal', '$timeout', '$document'];
    /* @ngInject */
    function indiEmailBuilderController($scope, EmailBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal, $timeout, $document) {

        console.info('email-builder directive init...');

        var vm = this;

        vm.init = init;
        
        vm.emailId = $stateParams.id;
        vm.dataLoaded = false;
        vm.account = null;
        vm.website = null;
        vm.email = null;
        vm.modalInstance = null;
        vm.componentTypes = [{
                title: 'Header',
                type: 'email-header',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
                filter: 'email',
                description: 'Use this component for email header section.',
                enabled: true
            }, {
                title: 'Content 1 Column',
                type: 'email-1-col',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
                filter: 'layout',
                description: 'Use this component for single column content.',
                enabled: true
            }, {
                title: 'Content 2 Column',
                type: 'email-2-col',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
                filter: 'layout',
                description: 'Use this component for 2 column content.',
                enabled: true
            }, {
                title: 'Content 3 Column',
                type: 'email-3-col',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
                filter: 'layout',
                description: 'Use this component for 3 column content.',
                enabled: true
            }, {
                title: 'Social Links',
                type: 'email-social',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
                filter: 'social',
                description: 'Use this component for social links.',
                enabled: true
            }, {
                title: 'Horizontal Rule',
                type: 'email-hr',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
                filter: 'layout',
                description: 'Use this component to insert a horizontal rule between components.',
                enabled: true
            }, {
                title: 'Footer',
                type: 'email-footer',
                preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog-teaser.png',
                filter: 'email',
                description: 'A footer for your email.',
                enabled: true
            }];

        vm.openModalFn = openModalFn;
        vm.closeModalFn = closeModalFn;
        vm.addComponentFn = addComponentFn;
        vm.componentClassFn = componentClassFn;
        vm.componentStyleFn = componentStyleFn;
        vm.saveFn = saveFn;

        vm.enabledComponentTypes = _.where(vm.componentTypes, {
            enabled: true
        });

        vm.componentFilters = _.without(_.uniq(_.pluck(_.sortBy(vm.enabledComponentTypes, 'filter'), 'filter')), 'misc');

        // Iterates through the array of filters and replaces each one with an object containing an
        // upper and lowercase version
        _.each(vm.componentFilters, function (element, index) {
            componentLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
            vm.componentFilters[index] = {
                'capitalized': componentLabel,
                'lowercase': element
            };
            componentLabel = null;
        });

        // Manually add the All option to the begining of the list
        vm.componentFilters.unshift({
            'capitalized': 'All',
            'lowercase': 'all'
        });

        function openModalFn(modalId) {
            vm.modalInstance = $modal.open({
                templateUrl: modalId,
                keyboard: true,
                size: 'lg',
                scope: $scope
            });
        }

        function closeModalFn() {
            if (vm.modalInstance) {
                vm.modalInstance.close();
            }
        }

        function addComponentFn(addedType) {
            if (vm.dataLoaded) {
                vm.dataLoaded = false;
                var componentType = null;
                if (['email-footer', 'email-header'].indexOf(addedType.type) > -1) {
                    componentType = _.findWhere($scope.components, {
                        type: addedType.type
                    });
                    if (componentType) {
                        toaster.pop('error', componentType.type + " component already exists");
                        vm.dataLoaded = true;
                        return;
                    }
                }

                WebsiteService.getComponent(addedType, addedType.version || 1, function (newComponent) {
                    if (newComponent) {
                        vm.closeModalFn();
                        vm.email.components.push(newComponent);
                        $timeout(function () {
                            var element = document.getElementById(newComponent._id);
                            if (element) {
                                $document.scrollToElementAnimated(element, 175, 1000);
                                $(window).trigger('resize');
                            }
                        }, 500);
                        vm.dataLoaded = true;
                        toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
                    }
                });
            }
        }

        function componentClassFn(component, index) {
            var classString = 'container-fluid ';

            if (component.type === 'email-1-col') {
                // classString += 'col-sm-12 ';
            }

            if (component.type === 'email-2-col') {
                classString += ' col-md-6 ';
            }

            if (component.type === 'email-3-col') {
                classString += ' col-md-4 ';
            }

            if (component.type === 'email-4-col') {
                classString += ' col-md-3';
            }

            if (index !== undefined) {
                classString += ' email-component-index-' + index + ' ';
            }

            if (component.layoutModifiers) {

                if (component.layoutModifiers.columns) {
                    if (component.layoutModifiers.columnsNum) {
                        classString += ' email-component-layout-columns-' + component.layoutModifiers.columnsNum + ' ';
                    }

                    if (component.layoutModifiers.columnsSpacing) {
                        classString += ' email-component-layout-columns-spacing-' + component.layoutModifiers.columnsSpacing + ' ';
                    }
                }

            }

            return classString;

        }

        function componentStyleFn(component) {
            var styleString = ' ';

            if (component.spacing) {
                if (component.spacing.pt) {
                    styleString += 'padding-top: ' + component.spacing.pt + 'px;';
                }

                if (component.spacing.pb) {
                    styleString += 'padding-bottom: ' + component.spacing.pb + 'px;';
                }

                if (component.spacing.pl) {
                    styleString += 'padding-left: ' + component.spacing.pl + 'px;';
                }

                if (component.spacing.pr) {
                    styleString += 'padding-right: ' + component.spacing.pr + 'px;';
                }

                if (component.spacing.mt) {
                    styleString += 'margin-top: ' + component.spacing.mt + 'px;';
                }

                if (component.spacing.mb) {
                    styleString += 'margin-bottom: ' + component.spacing.mb + 'px;';
                }

                if (component.spacing.ml) {
                    styleString += component.spacing.ml === 'auto' ? 'margin-left: ' + component.spacing.ml + ';float: none;' : 'margin-left: ' + component.spacing.ml + 'px;';
                }

                if (component.spacing.mr) {
                    styleString += (component.spacing.mr === 'auto') ? 'margin-right: ' + component.spacing.mr + ';float: none;' : 'margin-right: ' + component.spacing.mr + 'px;';
                }

                if (component.spacing.mw) {
                    styleString += (component.spacing.mw === '100%') ?
                            'max-width: ' + component.spacing.mw + ';' :
                            'max-width: ' + component.spacing.mw + 'px;margin:0 auto!important;';
                }

                if (component.spacing.lineHeight) {
                    styleString += 'line-height: ' + component.spacing.lineHeight;
                }
            }

            if (component.txtcolor) {
                styleString += 'color: ' + component.txtcolor + ';';
            }

            if (component.visibility === false) {
                styleString += 'display: none!important;';
            }

            if (component.bg) {
                if (component.bg.color) {
                    styleString += 'background-color: ' + component.bg.color + ';';
                }

                if (component.bg.img && component.bg.img.show && component.bg.img.url !== '') {
                    styleString += 'background-image: url("' + component.bg.img.url + '");';
                }
            }

            if (component.src) {
                if (component.src && component.src !== '') {
                    styleString += 'background-image: url("' + component.src + '");';
                }
            }



            if (component.layoutModifiers) {
                if (component.layoutModifiers.columns) {
                    if (component.layoutModifiers.columnsMaxHeight) {
                        styleString += ' max-height: ' + component.layoutModifiers.columnsMaxHeight + 'px';
                    }
                }
            }

            if (component.border && component.border.show && component.border.color) {
                styleString += 'border-color: ' + component.border.color + ';';
                styleString += 'border-width: ' + component.border.width + 'px;';
                styleString += 'border-style: ' + component.border.style + ';';
                styleString += 'border-radius: ' + component.border.radius + '%;';
            }

            return styleString;
        }

        function saveFn() {
            vm.dataLoaded = false;
            vm.email.components.forEach(function (component, index) {
                var selector = '#email-component_' + component._id;
                if ($(selector).data('froala.editor')) {
                    var html = $(selector).froalaEditor('html.get', true);
                    vm.email.components[index].text = html;
                }
            });
            toaster.pop('success', 'Email saved');
        }

        function init(element) {
            vm.element = element;

            AccountService.getAccount(function (data) {
                vm.account = data;
            });

            WebsiteService.getWebsite(function (data) {
                vm.website = data;
            });

            EmailBuilderService.getEmail(vm.emailId)
                    .then(function (res) {
                        if (!res.data._id) {
                            toaster.pop('error', 'Email not found');
                            $state.go('app.emails');
                        }
                        vm.email = res.data;
                        vm.dataLoaded = true;
                    }, function (err) {
                        console.error(err);
                        $state.go('app.emails');
                    });
        }


    }

})();
