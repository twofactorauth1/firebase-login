'use strict';

mainApp.controller('BlogCtrl', ['$scope', 'postsService', 'pagesService', '$location', '$route', '$routeParams', '$filter',
    function ($scope, postsService, pagesService, $location, $route, $routeParams, $filter) {

        var account, pages, website, route, postTags, currentTag, categories, currentCat, authors, currentAuthor, latestposts, that = this;
        var post = {};
        var blogposts = {};

        route = $location.$$path;

        $scope.$back = function() {
            window.history.back();
          };

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:pageService Error: ' + err);
            } else {
                    if (route.indexOf("blog/") > -1) {
                        route = 'single-post';
                    }
                    if (route === 'blog' || route === '/blog' || route.indexOf("tag/") > -1 || route.indexOf("category/") > -1 || route.indexOf("author/") > -1) {
                        route = 'blog';
                    }
                    console.log('Page: ', data[route]);
                    console.log('Route: ', route);
                    that.pages = data[route];
            }
        });

        postsService(function(err, data){
            if(err) {
                console.log('BlogCtrl Error: ' + err);
            } else {
                console.log('Route: ', route);
                that.currentTag, that.currentAuthor, that.currentCat = '';
                //get post tags for sidebar
                    //should be replaced by get tags filter
                    that.postTags = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_tags) {
                            var tags = data[i].post_tags;
                            for (var j = 0; j < tags.length; j++) {
                                if(that.postTags.indexOf(tags[j]) == -1) {
                                    that.postTags.push(tags[j]);
                                }
                            };
                        }
                    };

                     //get post cateogires for sidebar
                    //should be replaced by get cateogires filter
                    that.categories = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_category) {
                            if(that.categories.indexOf(data[i].post_category) <= -1) {
                                that.categories.push(data[i].post_category);
                            }
                        }
                    };

                     //get latest posts for sidebar
                    //should be replaced by get latest posts filter
                    that.latestposts = [];
                    for (var i = 0; i < data.length; i++) {
                        that.latestposts.push(data[i]);
                    };
                    that.latestposts.slice(Math.max(data.length - 3, 1));

                if (route.indexOf('blog') > -1)  {
                    console.log('Blog', data);
                    that.blogposts = data;
                }

                //if tagname is present, filter the cached posts with the tagname
                if ($route.current.params.tagname != null) {
                    console.log('Tag Name');
                    var filterPosts = [];
                    that.currentTag = $route.current.params.tagname;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_tags) {
                            var tags = data[i].post_tags;
                            for (var i2 = 0; i2 < tags.length; i2++) {
                                if (tags[i2] === $route.current.params.tagname) {
                                    filterPosts.push(data[i]);
                                }
                            };
                        }
                    };
                    that.blogposts = filterPosts;
                    return;
                }

                //if authorname is present, filter the cached posts with the authorname
                if ($route.current.params.authorname != null) {
                    console.log('Author: ', $route.current.params.authorname);
                    var filterPosts = [];
                    that.currentAuthor = $route.current.params.authorname;
                    for (var i = 0; i < data.length; i++) {
                        if (typeof data[i].post_author !== "undefined") {
                            if (data[i].post_author === $route.current.params.authorname) {
                                filterPosts.push(data[i]);
                            }
                        }
                    };
                    that.blogposts = filterPosts;
                    return;
                }

                //if catname is present, filter the cached posts with the catname
                if ($route.current.params.catname != null) {
                    var filterPosts = [];
                    that.currentCat = $route.current.params.catname;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].post_category) {
                            if (data[i].post_category === $route.current.params.catname) {
                                filterPosts.push(data[i]);
                            }
                        }
                    };
                    that.blogposts = filterPosts;
                    return;
                }

                if ($route.current.params.postname != null) {
                    var found = $filter('getByProperty')('post_url', $route.current.params.postname, data);
                    if (found) {
                        that.post = found;
                    }
                    return;
                }

                return;
            }
        });


    }]);
