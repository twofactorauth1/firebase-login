angular.module('app.services').factory('CourseVideo', ['$resource', 'host', function ($resource, host) {
    var CourseVideo = $resource(host + "/api/1.0/courses/:courseId/video/:videoId", {
        courseId: '@courseId',
        videoId: '@id'
    }, {
        'update': {method: 'PUT'}
    });
    return CourseVideo;
}]);