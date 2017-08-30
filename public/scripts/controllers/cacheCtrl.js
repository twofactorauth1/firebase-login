'use strict';
/*global mainApp*/
mainApp.controller('CacheCtrl', ['$scope', '$rootScope', 'embeddedSiteDataService', 'SsbPageSectionService', '$window', '$location', '$document', '$timeout', function ($scope, $rootScope, embeddedSiteDataService, SsbPageSectionService, $window, $location, $document, $timeout) {
    $scope.isEditing = false;
    $scope.blog_post = null;
    console.log('cache ctrl');
    /*
    function checkIntercom(data) {
        if (data.hideIntercom) {
            $scope.$parent.hideIntercom = true;
        }
    }*/
    $scope.addUnderNavSetting = function (masthead_id, fn) {
        var data = {
            allowUndernav : false,
            navComponent: null
        };

        if ($scope.components && $scope.components.length > 0) {
            $scope.components.forEach(function (value, index) {
                if (value && value.type === 'masthead' && value._id == masthead_id && $scope.components[index - 1]) {
                    if (index != 0 && $scope.components[index - 1].type == "navigation") {
                        data.allowUndernav = true;
                        data.navComponent =  $scope.components[index - 1];
                    } else {
                        data.allowUndernav = false;
                    }
                }
            });
        } else if ($scope.sections && $scope.sections.length > 0) {
            $scope.sections.forEach(function (sectionValue, sectionIndex) {
                sectionValue.components.forEach(function (value, index) {
                    if (value && value.type === 'masthead' && value._id == masthead_id && $scope.sections[sectionIndex - 1]) {
                        var navComponent = _.findWhere($scope.sections[sectionIndex - 1].components, { type: 'navigation' });
                        if (
                            sectionIndex != 0 &&
                            navComponent !== undefined
                        ) {
                            data.allowUndernav = true;
                            data.navComponent = navComponent;
                        } else {
                            data.allowUndernav = false;
                        }
                    }
                });
            });
        }
        fn(data);
    };

    $scope.defaultSpacings = {
        'pt': 0,
        'pb': 0,
        'pl': 0,
        'pr': 0,
        'mt': 0,
        'mb': 0,
        'mr': 'auto',
        'ml': 'auto',
        'mw': '100%',
        'usePage': false
    };

    $scope.$on('getCurrentPage', function (event, args) {
        args.currentpage = $scope.page;
    });


    $scope.components = [];
    embeddedSiteDataService.getPageData($scope.websiteId, function (err, data) {
        console.log('pagesService ', data);
        $scope.$emit('external.scripts.page.data', {page: data});
        if (err) {
            console.warn('no page found', $location.$$path);
            if ($location.$$path === '/login') {
                $window.location.href = '/login';
            } else {
                $window.location.reload();
            }

        } else {
            SsbPageSectionService.setSectionOffset(0);
            $scope.page = data;
            $rootScope.title = $scope.page.title;
            $rootScope.pageHandle = $scope.page.handle;
            $scope.sections = data.sections;

            _.each(data.sections, function(section, index1){
                if (section) {
                    if(section.ssb === false) {
                        $scope.components = $scope.components.concat(section.components);
                    } else {
                        //this is what the template should be:
                        //<ssb-page-section section="section" index="$index" class="ssb-page-section"></ssb-page-section>
                        $scope['sections_' + index1] = section;
                    }
                }
            });
            _.each($scope.components, function(cmp, index){
                $scope['components_' + index] = cmp;
            });
            console.log('$scope.components_0:', $scope.components_0);

            if (data.handle === 'single-post') {
                var post_component = _.findWhere($scope.page.components, {
                    type: 'single-post'
                });
                if (post_component) {
                    $scope.blog_post = post_component;
                }
            }

            angular.element(document).ready(function () {
                $document.scrollTop(0);
                $timeout(function () {
                    var locId = $location.$$hash;
                    if (locId) {
                        var element = document.getElementById(locId);
                        if(!element){
                           element= document.getElementById("section_"+locId);
                        }
                         if(!element){
                           element= document.getElementById("component_"+locId);
                        }
                        if (element) {
                            $document.scrollToElementAnimated(element, ssbPageSectionService.offset, 1000);
                        }
                    }
                    var adjustAnchor = function(eventType) {
                        var $anchor = $(':target');
                        if ($anchor.length > 0) {
                            var element = document.getElementById($anchor.attr('id'));
                            if(!element){
                                element=document.getElementById("section_"+$anchor.attr('id'));
                            }
                            if(!element){
                                element=document.getElementById("component_"+$anchor.attr('id'));
                            }
                            $document.scrollTop(0);
                            $timeout(function() {
                                $document.scrollToElementAnimated(element, ssbPageSectionService.offset, 1000);
                            }, 200);
                        }
                    };
                    $(window).on('hashchange',function(){
                        adjustAnchor();
                    });
                },5000);
            });

            /**
             *   temp support SB global header style on blog pages
             *   TODO: remove when blogs are converted
             */
            try {

                if (!indigenous.ssbBlog && $location.path().toLowerCase().indexOf('blog') !== -1) {

                    _(indigenous.precache.siteData.pages).chain().each(function(value, key, object) {

                      if (key === 'index' && value.ssb) {

                        console.log('index found');
                        console.log('index is ssb: ' + value.ssb);

                        var globalHeader = _(value.sections).chain().findWhere({ 'global': true, 'version': 5, type: 'ssb-page-section', title: 'Header' }).value();

                        if (globalHeader !== undefined) {
                            var styles = '.ssb-main .navigation-v2 .navbar {' +
                                    'min-height: 0!important;' +
                                '}'+
                                '.ssb-main .navigation-v2 .navbar .navbar-header {' +
                                    'display: none!important;' +
                                '}';

                            $('head').append('<style type="text/css">' + styles + '</style>');
                        }


                      }

                    }).value();

                }

            } catch(e) {
                console.error(e);
            }

        }
    });




}]);
