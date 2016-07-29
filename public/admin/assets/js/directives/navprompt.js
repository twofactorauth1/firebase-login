'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
app.directive('indigNavprompt', function ($rootScope, $location, $state, SweetAlert, $urlRouter) {
    return {
        restrict: 'C',
        scope: {
            checkIfDirty: '&',
            resetDirty: '&',
            myState: '@myState',
            savePage: '&',
            savePageCheck: "=",
            allowRedirect: "=?"
        },
        link: function (scope, elem, attrs) {
            if (!angular.isDefined(scope.allowRedirect)) {
                scope.allowRedirect = true;
            }


            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if (scope.myState && $state.$current.name === scope.myState && scope.checkIfDirty && scope.checkIfDirty()) {
                    event.preventDefault();
                    SweetAlert.swal({
                        title: "Are you sure?",
                        text: "You have unsaved data. Do you want to save it before navigating to a new page?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                        showNoActionButton: true,
                        noActionButtonText: 'Cancel',
                        closeOnConfirm: true,
                        closeOnCancel: true,
                    }, function (isConfirm) {
                        if (isConfirm) {
                            if (scope.savePage) {
                                scope.savePage();
                                scope.$watch(function () {
                                    return scope.savePageCheck
                                }, function (newValue) {
                                    if (newValue && scope.allowRedirect) {
                                        $state.go(toState, toParams, {
                                                notify: false
                                            })
                                            .then(function () {
                                                $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                                            })
                                    }
                                }, true);
                            }
                            $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                        } else if (!angular.isDefined(isConfirm)) {
                            $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                        } else {
                            scope.resetDirty && scope.resetDirty();
                            SweetAlert.swal("Not Saved!", "Unsaved data was discarded.", "success");
                            $state.go(toState, toParams, {
                                    notify: false
                                })
                                .then(function () {
                                    $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                                })
                        }
                    });
                }
            });
        }
    };
});
