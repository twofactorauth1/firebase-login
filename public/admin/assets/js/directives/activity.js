app.directive('customerActivity', ['$filter', 'CustomerService', '$modal', 'contactConstant', function($filter, CustomerService, $modal, contactConstant) {

    return {
        require: [],
        restrict: 'E',
        transclude: false,
        scope: {
            singleCustomer: '=singleCustomer',
            allActivity: '=allActivity',
            newLeads: '=newLeads',
            customersAtRisk: '=customersAtRisk',
            currentPage: '=currentPage',
            numPerPage: '=numPerPage'
        },
        templateUrl: '/admin/assets/views/partials/activity.html',
        link: function(scope, element, attrs, controllers) {
            console.log('singleCustomer ', scope.singleCustomer);
            scope.next = false;
            scope.disablePaging = true;
            scope.main = {
                page: scope.currentPage,
                take: scope.numPerPage
            }
            if (scope.singleCustomer) {
                scope.customerId = scope.$parent.customerId;
                scope.newActivity = {
                    contactId: parseInt(scope.customerId),
                    start: new Date(),
                    end: new Date()
                };
                CustomerService.getActivityTypes(function(activity_types) {
                    scope.activity_types = activity_types;
                });
            }

            scope.activityTypes = [];

            contactConstant.customer_activity_types.dp.forEach(function(value, index) {
              scope.activityTypes.push(value.label);
            });

            scope.updateActivityTypeFn = function(selection) {
              contactConstant.customer_activity_types.dp.forEach(function(value, index) {
                scope.activityTypes.push(value.label);
                if (value.label == selection) {
                  scope.newActivity.activityType = value.data;
                }
              });
            };

            scope.openModal = function(modal) {
                scope.modalInstance = $modal.open({
                    templateUrl: modal,
                    scope: scope
                });
            };

            scope.closeModal = function() {
                scope.modalInstance.close();
            };

            scope.addActivityFn = function() {
                CustomerService.postCustomerActivity(scope.newActivity, function(activity) {
                    scope.all_activities.push(activity);
                    scope.all_activities = _.sortBy(scope.all_activities, function(o) {
                        return o.start;
                    }).reverse();
                    scope.newActivity = {
                        contactId: parseInt(scope.customerId),
                        start: new Date(),
                        end: new Date()
                    };
                    if (!angular.isDefined(scope.activity_type))
                        scope.activity_type = '';
                    scope.activities = $filter('filter')(scope.all_activities, {
                        activityType: scope.activity_type
                    });
                    scope.total = scope.activities.length;

                    scope.closeModal('addActivityModal');
                });
            };
            scope.filterActivities = function(newVal) {
                scope.main = {
                    page: scope.currentPage,
                    take: scope.numPerPage
                }

                scope.activity_type = newVal.activityTypeFilter.activityType;
                scope.activities = $filter('filter')(scope.all_activities, {
                    activityType: scope.activity_type
                });
                scope.total = scope.activities.length;
            }

            scope.loadPage = function() {
                var queryParams = {
                    limit: scope.main.take,
                    skip: (scope.main.page - 1) * scope.main.take
                }
                if (scope.singleCustomer) {
                    CustomerService.getCustomerUnreadActivities(scope.customerId, function(activities) {
                        scope.unread = activities.length;
                    });

                    CustomerService.getCustomerActivities(scope.customerId, function(activities) {
                        for (var i = 0; i < activities.length; i++) {
                            activities[i]['customer'] = scope.$parent.customer;
                            activities[i]['activityType'] = activities[i]['activityType'];
                        };
                        scope.activities = activities;
                        scope.activities = _.sortBy(scope.activities, function(o) {
                            return o.start;
                        }).reverse();
                        scope.all_activities = angular.copy(activities);
                        scope.total = scope.all_activities.length;
                        scope.disablePaging = false;
                    });
                } else {
                    if (scope.customersAtRisk) {
                        queryParams = {
                            limit: scope.main.take,
                            skip: (scope.main.page - 1) * scope.main.take,
                            activityType: "SUBSCRIBE_CANCEL"
                        }
                    }
                    if (scope.newLeads) {
                        queryParams = {
                            limit: scope.main.take,
                            skip: (scope.main.page - 1) * scope.main.take,
                            activityType: "CONTACT_CREATED,ACCOUNT_CREATED"
                        }
                    }
                    CustomerService.getAllCustomerActivitiesWithLimit(queryParams, function(data) {
                        var activites = data.results;
                        for (var i = 0; i < activites.length; i++) {
                            var customer = _.where(scope.customers, {
                                _id: activites[i].contactId
                            });
                            activites[i]['customer'] = customer[0];
                            activites[i]['activityType'] = activites[i]['activityType'];
                        };
                        scope.total = data.total;
                        scope.activities = activites;
                        scope.disablePaging = false;
                    });
                }
            }
            if (scope.singleCustomer)
                scope.loadPage();
            else {
                if (scope.$parent.customers) {
                    scope.customers = scope.$parent.customers;
                    CustomerService.getAllCustomerUnreadActivities(function(data) {
                        scope.unread = data.total;
                    });
                    scope.loadPage();
                } else {
                    CustomerService.getCustomers(function(customers) {
                        scope.$parent.customers = customers;
                        scope.customers = customers;
                        CustomerService.getAllCustomerUnreadActivities(function(data) {
                            scope.unread = data.total;
                        });
                        scope.loadPage();
                    });
                }
            }

            scope.nextPage = function() {
                scope.disablePaging = true;
                scope.main.page++;
                if (!scope.singleCustomer)
                    scope.loadPage();

            };

            scope.previousPage = function() {
                scope.disablePaging = true;
                scope.main.page--;
                if (!scope.singleCustomer)
                    scope.loadPage();
            };
            scope.nextPageDisabled = function() {
                return scope.main.page === scope.pageCount() ? true : false;
            };
            scope.prevPageDisabled = function() {
                return scope.main.page <= 1 ? true : false;
            };
            scope.pageCount = function() {
                return Math.ceil(scope.total / scope.numPerPage);
            };
        }
    };

}]);
