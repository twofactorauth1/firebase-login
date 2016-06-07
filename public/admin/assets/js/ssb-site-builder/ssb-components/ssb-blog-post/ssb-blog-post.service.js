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

        ssbBlogService.loadDataFromPage = loadDataFromPage;
        ssbBlogService.getPost = getPost;
        ssbBlogService.getPosts = getPosts;
        ssbBlogService.savePost = savePost;

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
            ssbBlogService.loading.value = ssbBlogService.loading.value + 1;
            console.info('blog service | loading +1 : ' + ssbBlogService.loading.value);
            fn.finally(function() {
                ssbBlogService.loading.value = ssbBlogService.loading.value - 1;
                console.info('blog service | loading -1 : ' + ssbBlogService.loading.value);
            })
            return fn;
        }

        function savePost(post) {

            function success(data) {
                var post = _.findWhere(ssbBlogService.blog.posts, {
                    _id: data._id
                });
                post = data;
            }

            function error(error) {
                console.error('SimpleSiteBuilderBlogService savePost error: ', JSON.stringify(error));
            }
            //624b61d8-d093-4cc3-bcc0-3f06fc2d162f/blog/3f5e1f03-4075-4638-936c-8fe78e60e057
            return (
                ssbBlogRequest($http({
                    url: basePageAPIUrl + '/blog/' + page._id,
                    method: 'POST',
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

        function getPost() {

        }


        (function init() {



        })();


        return ssbBlogService;
    }

})();
