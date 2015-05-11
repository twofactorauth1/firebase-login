'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
app.directive('indigOnboarding', function ($location, $sce, $state, UserService, toaster, ONBOARDINGCONSTANT) {
  return {
    restrict: 'E',
    template: '<div ng-joy-ride="startJoyRide" config="config" on-finish="onFinish()" on-skip="onSkip()"></div>',
    link: function (scope, elem, attrs) {

      scope.startJoyRide = false;

      var defaultTasks = [];
      _.each(ONBOARDINGCONSTANT.tasks, function (task) {
        defaultTasks.push(task.taskKey);
      });

      UserService.getUserPreferences(function (preferences) {
        var addedTask = false;
        _.each(defaultTasks, function (task) {
          var matchedTask = _.find(preferences.tasks, function (v, k) {
            return k === task;
          });

          if (!matchedTask) {
            addedTask = true;
            preferences.tasks[task] = false;
          }

          if (task === 'sign_up') {
            preferences.tasks[task] = true;
          }
        });
        scope.userPreferences = preferences;

        if (addedTask) {
          UserService.updateUserPreferences(scope.userPreferences, false, function (newPreferences) {
            // console.log('newPreferences >>> ', newPreferences);
          });
        }
      });

      scope.onboardingStepMap = ONBOARDINGCONSTANT.tasks;

      scope.$on("$locationChangeSuccess", function (event, current, previous) {
        if ($location.$$search['onboarding'] && $location.$$search['onboarding'] === 'sign_up') {
          $location.url($location.path());
        }
      });

      scope.$on("$stateChangeSuccess", function (event, current, previous) {
        scope.executeOnboarding();
      });

      scope.openPageModal = function () {
        console.log('scope.$parent');
      };

      scope.executeOnboarding = function () {
        if ($location.$$search['onboarding']) {
          scope.obType = $location.$$search['onboarding'].trim();

          var matchingStep = _.find(scope.onboardingStepMap, function (step) {
            return step.pane.taskKey === scope.obType;
          });
          if (matchingStep) {
            scope.config = [];
            _.each(matchingStep.steps, function (step) {
              scope.config.push(step);
            });
            scope.startJoyRide = true;
            $location.url($location.path());
          }
        }
      };

      scope.onSkip = function () {
        toaster.pop('warning', 'Task Skipped. Not completed.');
      };

      scope.onFinish = function () {
        scope.userPreferences.tasks[scope.obType] = true;
        console.log(' scope.userPreferences.tasks[scope.obType] ' + scope.obType + ' ' + scope.userPreferences.tasks[scope.obType]);
        UserService.updateUserPreferences(scope.userPreferences, false, function (updatedPreferences) {
          console.log('updatedPreferences >>> ', updatedPreferences.tasks);
          scope.startJoyRide = false;
          var tasksRemaining = false;
          _.each(scope.onboardingStepMap, function (step) {
            var matchingTask = _.find(scope.userPreferences.tasks, function (v, k) {
              return k === step.pane.taskKey;
            });
            if (!matchingTask) {
              tasksRemaining = true;
            }
            step.pane.completed = matchingTask;
          });

          if (tasksRemaining) {
            var nextTask = _.find(scope.onboardingStepMap, function (step) {
              return !step.pane.completed;
            });
            var url = $state.href(nextTask.pane.state, {}, {
              absolute: false
            });
            url += '?onboarding=' + nextTask.pane.taskKey;
            toaster.pop('success', null, 'Complete: Next task is <br> <a class="btn btn-primary" href="' + url + '">' + nextTask.pane.heading + '</a>', 15000, 'trustedHtml');
          } else {
            toaster.pop('success', 'Task Complete. No more tasks to complete.');
          }

        });
      };
    }
  };
});
