'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
app.directive('indigOnboarding', function ($location, $sce, $state, toaster, $templateCache, UserService, ONBOARDINGCONSTANT) {
  return {
    scope: {
      minRequirements: '='
    },
    restrict: 'E',
    template: '<div ng-joy-ride="startJoyRide" config="config" on-finish="onFinish()" on-skip="onSkip()"></div>',
    link: function ($scope, elem, attrs) {

      //set initial joyRide to false
      $scope.startJoyRide = false;

      //step map based on onboarding constant tasks
      $scope.onboardingStepMap = ONBOARDINGCONSTANT.tasks;

      /*
       * @watch: minRequirements
       * - if the minimum requirements are updated to true then complete the task
       */

      $scope.$watch('minRequirements', function (newValue, oldValue) {
        if (!oldValue && newValue) {
          $scope.taskComplete();
        }
      });

      /*
       * @getUserPreferences
       * - create a userTasks scope to access tasks for user
       */

      $scope.getUserPreferences = function (fn) {
        UserService.getUserPreferences(function (preferences) {
          $scope.userPreferences = preferences;
          $scope.userTasks = preferences.tasks;
          if (fn) {
            fn();
          }
        });
      };

      /*
       * @executeOnboarding
       * - execute the onboarding task based on the state
       */

      $scope.executeOnboarding = function () {
        if ($scope.objType) {
          var matchingStep = _.find($scope.onboardingStepMap, function (step) {
            return step.pane.taskKey === $scope.objType;
          });

          if (matchingStep) {
            $scope.config = [];
            _.each(matchingStep.steps, function (step) {
              step.finishText = 'Got It';
              $scope.config.push(step);
            });
            $scope.startJoyRide = true;
            $location.url($location.path());
          }
        }
      };

      /*
       * @onFinish
       * - when user has clicked "Got it" and recieved task instructions
       */

      $scope.onFinish = function () {
        $scope.userPreferences.tasks[$scope.objType] = 'started';
        UserService.updateUserPreferences($scope.userPreferences, false, function (updatedPreferences) {
          console.log('updatedPreferences ', updatedPreferences);
        });
      };

      /*
       * @checkTaskStatus
       * - check the task status and then execute
       */

      $scope.checkTaskStatus = function () {

        var _matchingTask = _.find($scope.onboardingStepMap, function (task) {
          return task.pane.state === $state.current.name;
        });

        if (_matchingTask) {

          $scope.objType = _matchingTask.pane.taskKey;


          var status = _.find($scope.userTasks, function (v, k) {
            return k === $scope.objType;
          });

          if (status === 'not_started' || $scope.resetTask) {
            $scope.executeOnboarding();
          }

          if (status === 'started' && !$scope.manualComplete && !$scope.resetTask) {
            toaster.pop('info', null, 'Your almost completed this step. Finish the task or manually complete. <br><div class="margin-top-10"><a class="btn btn-primary margin-right-10" href="' + $scope.getOnboardURL(_matchingTask) + '">Task Info</a><a class="btn btn-warning" href="' + $scope.getOnboardURL(_matchingTask, true) + '">Mark Complete</a></div>', 15000, 'trustedHtml');
          }

          if (status === 'finish' || $scope.manualComplete) {
            console.log('task finished');
          }
        }

      };

      /*
       * @getOnboardURL
       * - add parameters to current state
       */

      $scope.getOnboardURL = function (task, complete) {
        var url = $state.href(task.pane.state, {}, {
          absolute: false
        });
        if (complete) {
          url += '?task=' + task.pane.taskKey + '&complete=true';
        } else {
          url += '?onboarding=' + task.pane.taskKey + '&reset=true';
        }
        return url;
      };

      /*
       * @stateOrLocationChanged
       * - when the state or parameters have change start or disregard onboarding
       */

      $scope.stateOrLocationChanged = function () {
        //clear any toasters from previous page
        toaster.clear('*');
        if ($location.$$search['onboarding']) {
          if ($location.$$search['reset']) {
            $scope.resetTask = true;
          }

          if ($location.$$search['complete']) {
            $scope.manualComplete = true;
          }
          $scope.getUserPreferences($scope.checkTaskStatus);
          //remove parameters
          $location.url($location.path());
        } else {
          $scope.getUserPreferences($scope.checkTaskStatus);
        }
      };

      /*
       * @stateChangeSuccess
       * - when the state of the app is changed
       */

      $scope.$on("$stateChangeSuccess", function (event, current, previous) {
        $scope.stateOrLocationChanged();
      });

      /*
       * @locationChangeSuccess
       * - when the the location is changed on the same view
       */

      $scope.$on("$locationChangeSuccess", function (event, current, previous) {
        if (current.split('?')[0] === previous) {
          $scope.stateOrLocationChanged();
        }
      });

    }
  };
});
