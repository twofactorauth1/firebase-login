angular.module('app.services').factory('CourseVideo', ['$resource', function ($resource) {
    var CourseVideo = $resource("/api/1.0/courses/:courseId/video/:videoId", {
        courseId: '@courseId',
        videoId: '@id'
    }, {
        'update': {method: 'PUT'}
    });
    return CourseVideo;
}]);