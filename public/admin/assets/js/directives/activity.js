app.directive('contactActivity', ['$filter', 'ContactService', '$modal', 'contactConstant', function($filter, ContactService, $modal, contactConstant) {

    return {
        require: [],
        restrict: 'E',
        transclude: false,
        scope: {
            singleContact: '=singleContact',
            allActivity: '=allActivity',
            newLeads: '=newLeads',
            contactsAtRisk: '=contactsAtRisk',
            currentPage: '=currentPage',
            numPerPage: '=numPerPage',
            contactId: "@contactId",
            hideNewActivity: "@hideNewActivity",
            contact:'='
        },
        templateUrl: '/admin/assets/views/partials/activity.html',
        link: function(scope, element, attrs, controllers) {
            console.log('singleContact ', scope.singleContact);
            scope.next = false;
            scope.disablePaging = true;
            scope.main = {
                page: scope.currentPage,
                take: scope.numPerPage
            }
            if (scope.singleContact) {
                scope.contactId = scope.$parent.contactId || scope.contactId;
                scope.newActivity = {
                    contactId: parseInt(scope.contactId),
                    start: new Date(),
                    end: new Date()
                };
                ContactService.getActivityTypes(function(activity_types) {
                    scope.activity_types = activity_types;
                });
            }

            scope.activityTypes = [];

            contactConstant.contact_activity_types.dp.forEach(function(value, index) {
              scope.activityTypes.push(value.label);
            });

            scope.updateActivityTypeFn = function(selection) {
                var activity_hash = _.findWhere(contactConstant.contact_activity_types.dp, {
                    label: selection
                });
                if(activity_hash)
                    scope.newActivity.activityType = activity_hash.data;
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
                // Reinitializing the time to get current time
                if(scope.singleContact) {
                    angular.element("#contact_activity_type .error").html("");
                    angular.element("#contact_activity_type .error").removeClass('has-error');
                    var activity_type = angular.element("#contact_activity_type input").val();
                    var activity_hash = _.findWhere(contactConstant.contact_activity_types.dp, {
                        label: activity_type
                    });
                    if(!activity_type || !activity_type.trim())
                    {
                         angular.element("#contact_activity_type .error").html("Activity Type Required");
                         angular.element("#contact_activity_type .error").addClass('has-error');
                         return;
                    }
                    if(!activity_hash)
                    {
                        scope.newActivity.activityType = activity_type;
                    }else
                        scope.newActivity.activityType = activity_hash.data;
                    scope.newActivity.start = new Date();
                    scope.newActivity.end = new Date();
                }

                ContactService.postContactActivity(scope.newActivity, function(activity) {
                    if(scope.singleContact) {
                        activity.contact = scope.$parent.contact || scope.contact;
                    }
                    scope.all_activities.push(activity);
                    scope.all_activities = _.sortBy(scope.all_activities, function(o) {
                        return o.start;
                    }).reverse();
                    scope.newActivity = {
                        contactId: parseInt(scope.contactId),
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
                if (scope.singleContact) {
                    ContactService.getContactUnreadActivities(scope.contactId, function(activities) {
                        scope.unread = activities.length;
                    });

                    ContactService.getContactActivities(scope.contactId, function(activities) {
                        ContactService.getContact(scope.contactId, function (contact) {
                            for (var i = 0; i < activities.length; i++) {
                                activities[i]['contact'] = contact;
                                activities[i]['activityType'] = activities[i]['activityType'];
                            };
                            scope.activities = activities;
                            scope.activities = _.sortBy(scope.activities, function(o) {
                                return o.start;
                            }).reverse();
                            scope.all_activities = angular.copy(activities);
                            scope.total = scope.all_activities.length;
                            scope.disablePaging = false;
                        })
                    });
                } else {
                    if (scope.contactsAtRisk) {
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
                    ContactService.getAllContactActivitiesWithLimit(queryParams, function(data) {
                        var activites = data.results;
                        for (var i = 0; i < activites.length; i++) {
                            var contact = _.where(scope.contacts, {
                                _id: activites[i].contactId
                            });
                            activites[i]['contact'] = contact[0];
                            activites[i]['activityType'] = activites[i]['activityType'];
                        };
                        scope.total = data.total;
                        scope.activities = activites;
                        scope.disablePaging = false;
                    });
                }
            }
            if (scope.singleContact)
                scope.loadPage();
            else {
                if (scope.$parent.contacts) {
                    scope.contacts = scope.$parent.contacts;
                    ContactService.getAllContactUnreadActivities(function(data) {
                        scope.unread = data.total;
                    });
                    scope.loadPage();
                } else {
                    ContactService.getContacts(function(contacts) {
                        scope.$parent.contacts = contacts;
                        scope.contacts = contacts;
                        ContactService.getAllContactUnreadActivities(function(data) {
                            scope.unread = data.total;
                        });
                        scope.loadPage();
                    });
                }
            }

            scope.nextPage = function() {
                scope.disablePaging = true;
                scope.main.page++;
                if (!scope.singleContact)
                    scope.loadPage();

            };

            scope.previousPage = function() {
                scope.disablePaging = true;
                scope.main.page--;
                if (!scope.singleContact)
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
            /*
           * @getActivityName
           * - get activity actual name
           */
            scope.getActivityName = function(activity)
            {
                var activity_hash = _.findWhere(contactConstant.contact_activity_types.dp, {
                    data: activity
                });
                if(activity_hash)
                    return activity_hash.label;
                else
                    activity;
                }
            }
    };

}]);
