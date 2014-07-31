angular.module('app.services').factory('Course', ['$resource', 'host', function ($resource, host) {
    var Course = $resource(host + "/api/1.0/courses/:id", {
        id: '@id'
    }, {
        'update': {method: 'PUT'},
        'isSubdomainFree': {url: host + "/api/1.0/courses/free/:subdomain", method: 'GET'}
    });
    return Course;
}]);