'use strict';

mainApp.controller('BlogCtrl', ['$scope', 'postsService', 'pagesService', '$location', '$route', '$routeParams', '$filter',
    function ($scope, postsService, pagesService, $location, $route, $routeParams, $filter) {

        var account, pages, website, route, that = this;
        var post = {};
        route = $location.$$path;

        $scope.$back = function() {
            window.history.back();
          };

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:pageService Error: ' + err);
            } else {
                    route = 'single-post';
                that.pages = data[route];
            }
        });

        postsService(function(err, data){
            if(err) {
                console.log('BlogCtrl Error: ' + err);
            } else {
                // if (route.indexOf('/blog/tag/') > -1) {
                //      var found = $filter('getByProperty')('post_tags', $route.current.params.tagname, data);
                // } else {
                    var found = $filter('getByProperty')('post_url', $route.current.params.postname, data);
                    if (found) {
                        that.post = found;
                    }
                //}
            }
        });


    }]);
