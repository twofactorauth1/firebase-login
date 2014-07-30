angular.module('app.services').factory('courseService', ['$resource', 'host', function ($resource, host) {
    var Course = $resource(host + "/api/courses/:id", {
        id: '@id'
    }, {
        'query': {method: 'GET', isArray: false},
        'isSubdomainFree': {url: host + "/api/courses/free/:subdomain", method: 'GET'}
    });
    return Course;
}]);