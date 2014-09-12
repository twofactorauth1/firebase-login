'use strict';
mainApp.controller('ScrollerCtrl', ['$scope', '$location', '$anchorScroll',
    function ($scope, $location, $anchorScroll) {
        $scope.scroll = function (id) {
            setTimeout(function () {
                $location.hash(id);
                $anchorScroll();
            },10);
        }
    }
]);
