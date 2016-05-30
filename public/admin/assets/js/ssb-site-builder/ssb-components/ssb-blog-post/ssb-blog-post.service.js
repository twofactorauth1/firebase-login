'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

    app.factory('SimpleSiteBuilderBlogService', SimpleSiteBuilderBlogService);

    SimpleSiteBuilderBlogService.$inject = ['$rootScope', '$compile', '$http', '$q', '$timeout', 'AccountService', 'WebsiteService', '$modal', 'pageConstant'];
    /* @ngInject */
    function SimpleSiteBuilderBlogService($rootScope, $compile, $http, $q, $timeout, AccountService, WebsiteService, $modal, pageConstant) {
        var ssbBlogService = {};
        var baseWebsiteAPIUrl = '/api/1.0/cms/website/';
        var basePageAPIUrl = '/api/1.0/cms/page/';
        var baseComponentAPIUrl = '/api/1.0/cms/component/';
        var baseTemplateAPIUrl = '/api/1.0/cms/template/';
        var baseWebsiteAPIUrlv2 = '/api/2.0/cms/websites/'
        var basePageAPIUrlv2 = '/api/2.0/cms/pages/';
        var baseTemplateAPIUrlv2 = '/api/2.0/cms/templates/';
        var baseSiteTemplateAPIUrlv2 = '/api/2.0/cms/sitetemplates/';
        var baseThemesAPIUrlv2 = '/api/2.0/cms/themes/';
        var baseSectionAPIUrlv2 = '/api/2.0/cms/sections/';
        var baseComponentAPIUrlv2 = '/api/2.0/cms/components/';
        var basePagesWebsiteAPIUrl = '/api/2.0/cms/website/';

        ssbBlogService.loadDataFromPage = loadDataFromPage;
        ssbBlogService.getPost = getPost;
        ssbBlogService.getPosts = getPosts;

        ssbBlogService.blog = {
            posts: []
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
            console.info('service | loading +1 : ' + ssbBlogService.loading.value);
            fn.finally(function() {
                ssbBlogService.loading.value = ssbBlogService.loading.value - 1;
                console.info('service | loading -1 : ' + ssbBlogService.loading.value);
            })
            return fn;
        }

        function loadDataFromPage(scriptId) {

            var data = $(scriptId).html();

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
