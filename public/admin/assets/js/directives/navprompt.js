'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
app.directive('indigNavprompt', function ($rootScope, $location, $state, SweetAlert, $urlRouter) {
  return {
    restrict: 'C',
    scope:{
      checkIfDirty: '&',
      resetDirty: '&',
      myState: '@myState'
    },
    link: function (scope, elem, attrs) {
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if(scope.myState && $state.$current.name === scope.myState && scope.checkIfDirty && scope.checkIfDirty()){
          event.preventDefault();
          SweetAlert.swal({
              title: "Are you sure?",
              text: "You have unsaved data. Are you sure you want to leave this page?",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, leave this page!",
              cancelButtonText: "No, do not leave this page",
              closeOnConfirm: false,
              closeOnCancel: true
              }, function (isConfirm) {
                if (isConfirm) {
                  scope.resetDirty && scope.resetDirty();
                  SweetAlert.swal("Not Saved!", "Data not saved.", "success");
                  $state.go(toState, toParams, {notify: false})
                  .then(function() {
                      $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                   })
                }
                else{
                  $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                }
          });
        }
      });
    }
  };
});
