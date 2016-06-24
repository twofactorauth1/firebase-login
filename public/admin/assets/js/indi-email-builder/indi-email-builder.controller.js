(function () {

    app.controller('EmailBuilderController', indiEmailBuilderController);

    indiEmailBuilderController.$inject = ['$scope', 'EmailBuilderService', '$stateParams', '$state', 'toaster', 'AccountService', 'WebsiteService', '$modal'];
    /* @ngInject */
    function indiEmailBuilderController($scope, EmailBuilderService, $stateParams, $state, toaster, AccountService, WebsiteService, $modal) {

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

        vm.froalaConfig = angular.copy($.FroalaEditor.config);
        _.extend(vm.froalaConfig, {toolbarInline: false, scrollableContainer: '#email-froala-scrollable-container', placeholderText: 'Type your email here'});

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
        
        function addComponentFn(type) {
            console.log(type);
        }

        function init(element) {
            vm.element = element;
            vm.element.find('#email-froala-editor').froalaEditor(vm.froalaConfig);

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
                        $state.go('app.emails');
                    });
        }


    }

})();
