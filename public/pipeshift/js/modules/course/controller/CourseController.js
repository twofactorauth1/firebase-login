/**
 * The controller used when editing video courses
 */
angular.module('app.modules.course',[]).controller('CourseController', ['$scope', function ($scope) {
    var body = document.body,
        html = document.documentElement;

    var height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);
    $scope.minHeight = height;
}]);
