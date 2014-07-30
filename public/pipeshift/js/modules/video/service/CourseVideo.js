angular.module('app.services').factory('CourseVideo', ['$resource', 'host', function ($resource, host) {
    var CourseVideo = $resource(host + "/api/courses/:courseId/video/:videoId", {
        courseId: '@courseId',
        videoId: '@id'
    }, {
        'query': {method: 'GET', isArray: false}
    });
    return CourseVideo;
}]);