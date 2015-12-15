'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
app.directive('indigOnboarding', function ($rootScope, $location, $sce, $state, $templateCache, UserService, ONBOARDINGCONSTANT) {
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
        if (newValue) {
          if (!$scope.userPreferences) {
            $scope.getUserPreferences(function () {
              $scope.minReq = newValue;
              $scope.taskComplete();
            });
          } else {
            $scope.minReq = newValue;
            $scope.taskComplete();
          }
        }
      });

      /*
       * @getUserPreferences
       * - create a userTasks scope to access tasks for user
       */

      $scope.getUserPreferences = function (fn) {

        UserService.getUserPreferences(function (preferences) {
          $scope.userPreferences = preferences;

          //format tasks to match model
          var _formattedTasks = {};
          var needsUpdate = false;
          _.each($scope.onboardingStepMap, function (stepmap) {
            var _matchingTask = _.find(preferences.tasks, function (v, k) {
              return k === stepmap.pane.taskKey;
            });

            if (['not_started', 'started', 'finished'].indexOf(_matchingTask) !== -1) {
              //properly formated
              _formattedTasks[stepmap.pane.taskKey] = _matchingTask;
            } else {
              //not formatted or doesnt exist so add
              needsUpdate = true;
              _formattedTasks[stepmap.pane.taskKey] = 'not_started';
            }
            if (stepmap.pane.taskKey === 'sign_up' && _matchingTask !== 'finished') {
              needsUpdate = true;
              _formattedTasks[stepmap.pane.taskKey] = 'finished';
            }
          });

          if (needsUpdate) {

            $scope.userPreferences.tasks = _formattedTasks;
            UserService.updateUserPreferences($scope.userPreferences, false, function (updatedPreferences) {
              if (fn) {
                fn();
              }
            });
          }

          $scope.userTasks = preferences.tasks;
          if (fn && !needsUpdate) {
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
        if ($scope.userPreferences.tasks[$scope.objType] === 'started') {
          $scope.taskComplete();
        } else {
          $scope.userPreferences.tasks[$scope.objType] = 'started';
          UserService.updateUserPreferences($scope.userPreferences, false, function (updatedPreferences) {
            console.log('updatedPreferences ', updatedPreferences);
          });
        }
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

          if ($scope.manualComplete) {
            $scope.taskComplete(true);
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
          url += '?completeTask=true';
        } else {
          url += '?resetTask=true';
        }
        return url;
      };

      /*
       * @stateOrLocationChanged
       * - when the state or parameters have change start or disregard onboarding
       */

      $scope.stateOrLocationChanged = function () {
        
        if ($location.search().resetTask) {
          $scope.resetTask = true;
        }

        if ($location.search().completeTask) {
          $scope.manualComplete = true;
        }
        if ($location.search().onboarding) {
          $scope.getUserPreferences($scope.checkTaskStatus);
          //remove parameters
          $location.url($location.path());
        } else {
          $scope.getUserPreferences($scope.checkTaskStatus);
        }
      };

      /*
       * @taskComplete
       * - mark task as complete after minimum requirements for task have been met
       */

      $scope.taskComplete = function (skipMinRequirements) {
        if (!$scope.objType) {
          var _matchingTask = _.find($scope.onboardingStepMap, function (task) {
            return task.pane.state === $state.current.name;
          });
          if(_matchingTask)
            $scope.objType = _matchingTask.pane.taskKey;
        }
        if ($scope.userPreferences && $scope.userPreferences.tasks && $scope.userPreferences.tasks[$scope.objType] !== 'finished' && ($scope.minReq || skipMinRequirements)) {
          $scope.userPreferences.tasks[$scope.objType] = 'finished';
          UserService.updateUserPreferences($scope.userPreferences, false, function (updatedPreferences) {

            //find any remaining tasks
            $scope.startJoyRide = false;
            
          });
        }
      };

      /*
       * @stateChangeSuccess
       * - when the state of the app is changed
       */

      $scope.$on("$stateChangeSuccess", function (event, current, previous) {
        $scope.stateOrLocationChanged();
      });

      $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (!current) {
          console.log('routeChangeStart');
        }
      });

      /*
       * @locationChangeSuccess
       * - when the the location is changed on the same view
       */

      var unbindChangeSuccess = $scope.$on("$locationChangeSuccess", function (event, current, previous) {        
        if (current.split('?')[0] === previous && current !== previous) {
          $scope.stateOrLocationChanged();
        }
      });

    }
  };
});
