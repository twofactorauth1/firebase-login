angular.module('var.services').factory('Course', ['$resource', function ($resource) {
    var Course = $resource("/api/1.0/courses/:id", {
        id: '@id'
    }, {
        'update': {method: 'PUT'},
        'isSubdomainFree': {url: "/api/1.0/courses/free/:subdomain", method: 'GET'}
    });
    return Course;
}]);