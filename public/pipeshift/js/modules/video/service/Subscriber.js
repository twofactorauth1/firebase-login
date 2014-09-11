angular.module('app.services').factory('Subscriber', ['$resource', function ($resource) {
    var Subscriber = $resource("/api/1.0/courses/:id/subscribers", {
        id: '@id'
    }, {
    });
    return Subscriber;
}]);