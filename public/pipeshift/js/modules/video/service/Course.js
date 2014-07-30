angular.module('app.services').factory('Course', ['$resource', 'host', function ($resource, host) {
    var Course = $resource(host + "/api/courses/:id", {
        id: '@id'
    }, {
        'query': {method: 'GET', isArray: false},
        'isSubdomainFree': {url: host + "/api/courses/free/:subdomain", method: 'GET'}
    });
    return Course;
}]);