define(['app'], function (app) {
    app.register.service('CourseService', function ($http) {
        var baseUrl = '/api/1.0/';
        this.getAllCourses = function (fn) {
            var apiUrl = baseUrl + ['courses'].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };
    });
});