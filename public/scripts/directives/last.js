'use strict';

angular.module('mainApp')
    .directive('lastItem', function ($timeout) {
        return {
            restrict:   'A',
            link    :   function ( scope, element, attr) {
                scope.parent = $(element[0].parentElement || element[0].parentNode);
                scope.parent.css('visibility', 'hidden');
                if ( scope.$last ) {
                    $timeout(function () {
                        scope.parent.css('visibility', 'visible')
                    }, 350);
                }
            }
        };
    });
