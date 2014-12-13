define(['app', 'ngProgress', 'courseServiceAdmin', 'userService', 'toasterService'], function(app) {
    app.register.controller('MarketingCtrl', ['$scope', 'ngProgress', 'UserService', 'ToasterService', 'CourseService', 'Subscriber', '$state',
        function($scope, ngProgress, UserService, ToasterService, CourseService, Subscriber, $state) {
            ngProgress.start();

            $scope.courseEditFn = function(id) {
                $state.go('marketingEdit');
            };

            UserService.getUser(function(user) {
                $scope.user = user;
            });

            //account API call for object population
            UserService.getAccount(function(account) {
                $scope.account = account;
                ngProgress.complete();
                ToasterService.processPending();
            });

            CourseService.getAllCourses(function(data) {
                $scope.courses = data;
                $scope.courses.forEach(function(value, index) {
                    Subscriber.query({
                        id: value._id
                    }, function(response) {
                        $scope.courses[index].subscribers = response;
                    });
                });
            });
        }
    ]);
});
