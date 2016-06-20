'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('SimpleSiteBuilderBlogService', SimpleSiteBuilderBlogService);

    SimpleSiteBuilderBlogService.$inject = ['$rootScope', '$compile', '$http', '$q', '$timeout', '$modal'];
    /* @ngInject */
    function SimpleSiteBuilderBlogService($rootScope, $compile, $http, $q, $timeout, $modal) {
        var ssbBlogService = {};
        var baseWebsiteAPIUrl = '/api/1.0/cms/website/';
        var basePageAPIUrl = '/api/1.0/cms/page/';
        var baseBlogAPIUrl = '/api/2.0/cms/blog';

        ssbBlogService.loadDataFromPage = loadDataFromPage;
        ssbBlogService.getPost = getPost;
        ssbBlogService.getPosts = getPosts;
        ssbBlogService.savePost = savePost;
        ssbBlogService.deletePost = deletePost;
        ssbBlogService.duplicatePost= duplicatePost;

        ssbBlogService.blog = {
            posts: [],
            postFilters: ['all', 'published', 'draft', 'featured']
        };

        /**
         * A wrapper around API requests
         * @param {function} fn - callback
         *
         * @returns {function} fn - callback
         *
         */
        function ssbBlogRequest(fn) {
            //ssbBlogService.loading.value = ssbBlogService.loading.value + 1;
            //console.info('blog service | loading +1 : ' + ssbBlogService.loading.value);
            fn.finally(function() {
                //ssbBlogService.loading.value = ssbBlogService.loading.value - 1;
                //console.info('blog service | loading -1 : ' + ssbBlogService.loading.value);
            })
            return fn;
        }

        function savePost(post) {

            function success(data) {

                var index = _.findIndex(ssbBlogService.blog.posts, {
                    _id: data._id
                });

                if (index > -1) {
                    ssbBlogService.blog.posts[index] = data;
                } else {
                    ssbBlogService.blog.posts.push(data);
                }

            }

            function error(error) {
                console.error('SimpleSiteBuilderBlogService savePost error: ', JSON.stringify(error));
            }

            if (post._id) {
                return (
                    ssbBlogRequest($http({
                        url: baseBlogAPIUrl + '/post/' + post._id,
                        method: 'PUT',
                        data: angular.toJson(post)
                    }).success(success).error(error))
                )
            } else {
                return (
                    ssbBlogRequest($http({
                        url: baseBlogAPIUrl + '/post/',
                        method: 'POST',
                        data: angular.toJson(post)
                    }).success(success).error(error))
                )
            }

        }

        function duplicatePost(post) {

            function success(data) {
                ssbBlogService.blog.posts.push(data);
            }

            function error(error) {
                console.error('SimpleSiteBuilderBlogService duplicatePost error: ', JSON.stringify(error));
            }

            return (
                ssbBlogRequest($http({
                    url: baseBlogAPIUrl + '/duplicate/post/',
                    method: 'POST',
                    data: angular.toJson(post)
                }).success(success).error(error))
            )

        }

        function deletePost(post) {
            var postId = post._id;
            function success(data) {
                console.log("post deleted");
                ssbBlogService.blog.posts = _.without(ssbBlogService.blog.posts, _.findWhere(ssbBlogService.blog.posts, {_id: postId}));
            }

            function error(error) {
                console.error('SimpleSiteBuilderBlogService deletePost error: ', JSON.stringify(error));
            }

            return (
                ssbBlogRequest($http({
                    url: baseBlogAPIUrl + '/post/' + post._id,
                    method: 'delete',
                    data: angular.toJson(post)
                }).success(success).error(error))
            )
        }

        function loadDataFromPage(scriptId) {

            var data = $(scriptId).html();

            if (!angular.isDefined(data)) {
                return
            }

            var unescapeMap = {
                "&amp;":"&",
                "&lt;":"<",
                "&gt;":">",
                '&quot;':'"',
                '&#39;':"'",
                '&#x2F;':"/",
                '&apos;': "'"
            };

            function unescapeHTML(string) {
                return String(string).replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2f;|&apos;)/g, function(s) {
                    return unescapeMap[s] || s;
                });
            }

            var parsedData = JSON.parse(unescapeHTML(data));

            return parsedData;

        }

        function getPosts() {

        }

        function getPost(pageId, id) {

        }


        (function init() {



        })();


        return ssbBlogService;
    }

})();
