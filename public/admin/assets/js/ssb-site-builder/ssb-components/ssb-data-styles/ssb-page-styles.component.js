/*global app, angular, $ ,document,window */
/*jslint unparam:true*/
/* eslint-disable no-console*/

(function () {
    "use strict";
    app.directive('ssbPageStyles', ['websiteService', 'accountService', '$timeout', function (websiteService, accountService, $timeout) {
        'use strict';
        return {
            restrict: 'E',
            templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-data-styles/ssb-page-styles.component.html',
            link: function (scope) {
                scope.themeHandle=window.indigenous.precache.siteData.themeHandle;
            }
        }
    }]);
}())