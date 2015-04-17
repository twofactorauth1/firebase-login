'use strict';
/**
 * A directive used for "setting up onboarding".
 */
app.directive('indigOnboarding', function($location, UserService) {
  return {
    restrict: 'E',
    template: '<onboarding-popover enabled="onboardingEnabled" steps="onboardingSteps" on-finish-callback="onboardingFinishFn" step-index="onboardingIndex"></onboarding-popover>',
    controller: function($scope, $element, $attrs) {
      $scope.onboardingSteps = [{
        overlay: false
      }];
    },
    link: function($scope, scope, elem, attrs) {
      UserService.getUserPreferences(function(preferences) {
        scope.userPreferences = preferences;
      });
      scope.onboardingEnabled = false;
      scope.onboardingSteps = [{
        overlay: false
      }];
      scope.onboardingIndex = 0;
      scope.onboardingStepMap = {
        pages: [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        'single-page': [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        posts: [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        'single-post': [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        commerce: [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        'single-product': [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        'social-feed': [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        customers: [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        'single-customer': [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        'profile-business': [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        'profile-personal': [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        billing: [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        integrations: [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        dashboard: [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }],
        'site-analytics': [{
          overlay: true,
          title: 'Task: Add pages',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }]
      };

      if ($location.$$search['onboarding']) {
        scope.obType = $location.$$search['onboarding'];
        if (scope.obType in scope.onboardingStepMap) {
          console.info('Found onboarding steps >>>', scope.onboardingStepMap[scope.obType]);
          scope.onboardingSteps = scope.onboardingStepMap[scope.obType];
          scope.onboardingEnabled = true;
        }
      }

      scope.onboardingFinishFn = function() {
        scope.userPreferences.tasks[scope.obType] = true;
        UserService.updateUserPreferences(scope.userPreferences, false, function() {
          scope.onboardingEnabled = false;
        });
      };
    }
  };
});
