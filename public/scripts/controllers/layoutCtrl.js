'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'websiteService', 'postsService', 'accountService', 'ENV', '$window', '$location', '$route', '$routeParams', '$filter', '$document', '$anchorScroll',
    function ($scope, pagesService, websiteService, postsService, accountService, ENV, $window, $location, $route, $routeParams, $filter, $document, $anchorScroll) {
        var account, theme, website, pages, teaserposts, route, postname, that = this;
        route = $location.$$path;

        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;

        //var config = angular.module('config');
        //that.segmentIOWriteKey = ENV.segmentKey;
        //$window.segmentIOWriteKey = ENV.segmentKey;
        //that.themeUrl = $scope.themeUrl;

        // $scope.activateSettings = function() {
        //     console.log('>>>>> ', window.parent);
        //     window.parent.frames[0].parentNode.activateSettings();
        // };

        $scope.sortingLog = [];

        $scope.wait;

        $scope.sortableOptions = {
            handle: '.reorder',
            start: function(e, ui) {
                console.log('ui >>> ', ui);
                ui.item[0].parentNode.className += ' active';
                ui.item[0].className += ' dragging';
                clearTimeout($scope.wait);
                ui.placeholder.height('60px');
                // ui.item.sortable('refreshPositions');
                angular.element(ui.item[0].parentNode).sortable( "refresh" );
            },
            update: function(e, ui) {
              console.log('sorting update');
            },
            stop: function(e, ui) {
                ui.item[0].classList.remove('dragging');
                $scope.wait = setTimeout(function () {
                    ui.item[0].parentNode.classList.remove('active');
                }, 1500);
                // var componentId = ui.item[0].querySelectorAll('.component')[0].attributes['data-id'].value;
                // var newOrder = ui.item.index();
            }
        };

        accountService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
            } else {
                that.account = data;

                //Include Layout For Theme
                that.themeUrl = 'components/layout/layout_indimain.html';

            }
        });

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:pageService Error: ' + err);
            } else {
                if (route === '/' || route === '') {
                     route = 'index';
                     route = route.replace('/', '');
                     that.pages = data[route];
                } else {
                    route = $route.current.params.pagename;
                    that.pages = data[route];
                }
                $scope.currentpage = that.pages;
            }
        });

        websiteService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
            } else {
                that.website = data;
            }
        });

        postsService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:postsService Error: ' + err);
            } else {
                if (that.teaserposts) {
                    //donothing
                } else {
                    if (route === '/' || route === '') {
                        that.teaserposts = data;
                    }
                }
            }
        });

        window.updateComponents = function(data) {
            console.log('data recieved >>> ', data);
            $scope.$apply(function() {
                $scope.currentpage.components = data;
                console.log('data applied', $scope.currentpage.components);
            });
        };

        window.triggerEditMode = function() {
            document.getElementsByTagName('body')[0].className+=' editing'
        };

        // $scope.$on('$locationChangeStart', function(event, next, current) {
        //     console.log('location changed '+event+' '+next+' '+current);
        //     $scope.currentLoc = next.replace("?editor=true", "").substr(next.lastIndexOf('/') + 1);
        //     // parent.document.getUpdatediFrameRoute($scope.currentLoc);
        // });

        // window.scrollTo = function(section) {
        //     console.log('>>> ', section);
        //     if(section) {
        //         $location.hash(section);
        //         $anchorScroll();

        //         //TODO scrollTo on click

        //         // var offset = 0;
        //         // var duration = 2000;
        //         // var someElement = angular.element(document.getElementById(section));
        //         // console.log('someElement >>>', document);
        //         // console.log('>>> scrollTo '+ document.body.getElementById(section));
        //         // $document.scrollToElementAnimated(someElement);
        //     }
        // };

        window.activateAloha = function() {
            console.log('aloha');
            $('.editable').aloha();
        };

        window.deactivateAloha = function() {
            console.log('mahalo');
            $('.editable').mahalo();
        };

    }]);
