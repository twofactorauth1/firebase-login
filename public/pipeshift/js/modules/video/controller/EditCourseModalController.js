define(['angularAMD', 'app', 'customerService', 'iStartsWithFilter', 'truncateDirective', 'toasterService', 'courseServiceAdmin'], function (angularAMD, app) {
    app.register.controller('EditCourseModalController', ['$scope', '$modal', '$http', '$location', '$timeout', '$modalInstance', 'course', 'templates', 'Course', 'Subscriber', 'CustomerService', 'ToasterService', 'CourseService', function ($scope, $modal, $http, $location, $timeout, $modalInstance, course, templates, Course, Subscriber, CustomerService, ToasterService, CourseService) {
        $scope.modal = {};
        $scope.selectedCustomers = [];
        $scope.tmpSubscribers = [];
        $scope.subscribers = [];
        $scope.isSubdomainChecked = true;
        $scope.isSubdomainFree = true;
        $scope.protocol = $location.protocol() + "://"
        var host = $location.host();
        $scope.hostHasWWW = host.indexOf("www.") == 0;
        if ($scope.hostHasWWW) {
            host = host.substring(4, host.length);
        }
        $scope.domain = host + ":" + $location.port();
        $scope.isAdd = false;
        $scope.title = "Edit Campaign";
        $scope.course = $.extend({}, course);
        $scope.templates = templates;
        $scope.subscribers = [];
        $scope.hideVideo = true;
        function refreshSubscribers() {
            Subscriber.query({id: course._id}, function (response) {
                $scope.subscribers = response;
            });
        }

        refreshSubscribers();
        $scope.close = function () {
            $modalInstance.dismiss();
        }
        $scope.submit = function () {
            $scope.tmpSubscribers.forEach(function(value, index) {
                Subscriber.save(value, function(data) {
                    console.info(data);
                });
            });
            $modalInstance.close({course: $scope.course, isRemove: false});
        }
        $scope.removeCourse = function () {
            var modalInstance = $modal.open({
                templateUrl: '/pipeshift/views/modal/removeModal.html',
                controller: 'RemoveModalController',
                resolve: {
                    message: function () {
                        return "Are you sure you want to remove this course?";
                    }
                }
            });
            modalInstance.result.then(function () {
                $modalInstance.close({course: $scope.course, isRemove: true});
            }, function () {$scope.tmpSubscribers
            });
        }
        var subdomainChangeTimeout = -1;
        $scope.onSubdomainChange = function () {
            $scope.isSubdomainChecked = false;
            $scope.isSubdomainFree = false;
            if (subdomainChangeTimeout > 0) {
                $timeout.cancel(subdomainChangeTimeout);
            }
            subdomainChangeTimeout = $timeout(function () {
                if ($scope.course.subdomain == course.subdomain) {
                    $scope.isSubdomainChecked = true;
                    $scope.isSubdomainFree = true;
                } else {
                    Course.isSubdomainFree({subdomain: $scope.course.subdomain}, function (response) {
                        $scope.isSubdomainChecked = true;
                        $scope.isSubdomainFree = response.result;
                        if ($scope.isSubdomainFree) {
                            $scope.courseForm.subdomain.$setValidity("isNotFree", true);
                        } else {
                            $scope.courseForm.subdomain.$setValidity("isNotFree", false);
                        }
                    });
                }
            }, 250)
        }
        $scope.showSubscribersCsvUploadModal = function () {
            console.log('showSubscribersCsvUploadModal >>> ');
            var modalInstance = $modal.open({
                templateUrl: '/pipeshift/views/video/modal/subsCsvUpload.html',
                controller: 'SubscribersCsvUploadController',
                resolve: {
                    course: function () {
                        return $scope.course;
                    }
                }
            });
            modalInstance.result.then(function () {
                refreshSubscribers();
            }, function () {
            });
        }

        $scope.selectCustomerFn = function(customer) {
            if ($scope.selectedCustomers.indexOf(customer) == -1) {
                $scope.selectedCustomers.push(customer);
                if (customer.details.length && customer.details[0].emails.length) {
                    var email = customer.details[0].emails[0];
                    if (email.email !== undefined) {
                        email = email.email;
                    }
                    $scope.tmpSubscribers.push({email: email, courseId: $scope.course._id, subscribeTime: new Date()});
                    $scope.subscribers.push({email: email, courseId: $scope.course._id, subscribeTime: new Date()});
                }
            }
        };
        CustomerService.getCustomersShortForm(['_id', 'first', 'middle', 'last', 'details'], function(customers) {
            $scope.customers = customers;
        });
    }])
    ;
});
