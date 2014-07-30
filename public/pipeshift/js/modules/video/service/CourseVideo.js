angular.module('app.services').factory('courseVideoService', ['$resource', 'host', function ($resource, host) {
    var Course = $resource(host + "/api/courses/:courseId/video/:videoId", {
        courseId: '@courseId',
        videoId: '@id'
    }, {
        'query': {method: 'GET', isArray: false}
    });
    return CourseVideo;
}]);