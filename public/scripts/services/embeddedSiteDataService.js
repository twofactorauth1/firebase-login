/*
 * Get site data from <script> and return to angular app
 *
 * Data format:
 *
 * {
 *      ...
 *      pages: {
 *          'page-handle' : {}
 *          ...
 *      }
 *      ...
 * }
 *
 */

'use strict';
/*global mainApp*/
mainApp.factory('embeddedSiteDataService', ['$http', '$location', '$cacheFactory', function ($http, $location) {

    var service = {};

    service.urlPathFallbacks = urlPathFallbacks;
    service.getSiteData = getSiteData;
    service.getPageData = getPageData;


    /*
     * Set equivalent paths and fallbacks
     *
     */
    function urlPathFallbacks()  {
        var path = $location.$$path.replace('/page/', '');

        if (path === "/" || path === "") {
            path = "index";
        }

        if (path === "/signup") {
            path = "signup";
        }

        if (path.indexOf("blog/") > -1) {
            path = 'single-post';
        }

        if (path.indexOf("post/") > -1) {
            path = 'single-post';
        }

        if (path === 'blog' || path === '/blog' || path.indexOf("tag/") > -1 || path.indexOf("category/") > -1 || path.indexOf("author/") > -1) {
            path = 'blog';
        }

        if (path.indexOf('/') === 0) {
            path = path.replace('/', '');
        }

        return path;
    }


    /*
     * Get data set from server on global window object
     *
     */
    function getSiteData() {

        if (window.indigenous && window.indigenous.precache && window.indigenous.precache.siteData) {

            service.siteData = window.indigenous.precache.siteData;

        }
    }


    /*
     * Get page data from siteData
     * - Keeps legacy interface from cacheCtrl usage
     *
     */
    function getPageData(websiteId, callback) {

        service.path = urlPathFallbacks();

        if (typeof service.siteData.pages[service.path] !== 'undefined') {

            callback(null, service.siteData.pages[service.path]);

        } else if (typeof service.siteData.pages['coming-soon'] !== 'undefined') {

            callback(null, service.siteData.pages['coming-soon']);

        } else {

            callback("page not found", null);

        }


    }


    (function init() {

        service.getSiteData();

    })();

    return service;

}]);
