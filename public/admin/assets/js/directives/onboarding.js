'use strict';
/**
 * A directive used for "setting up onboarding".
 */
app.directive('indigOnboarding', function($location) {
  return {
    restrict: 'E',
    template: '<onboarding-popover enabled="onboardingEnabled" steps="onboardingSteps" on-finish-callback="onboardingFinishFn" step-index="onboardingIndex"></onboarding-popover>',
    controller: function($scope, $element, $attrs) {
      $scope.onboardingSteps = [{
        overlay: false
      }];
    },
    link: function(scope, elem, attrs) {
      scope.onboardingEnabled = false;
      scope.onboardingSteps = [{
        overlay: false
      }];
      scope.onboardingIndex = 0;
      scope.onboardingStepMap = {
        pages: [{
          overlay: true,
          title: 'Task: Edit home page',
          description: "Find the home page in the list to edit.",
          position: 'centered'
        }, {
          position: 'bottom',
          overlay: false,
          title: 'Task: Click edit',
          width: 400,
          description: "Once you find the page click the edit button in the tile."
        }, {
          position: 'bottom',
          overlay: false,
          title: 'Task: Save edit',
          width: 400,
          description: 'After all your editing is done click save in top right of the view and your are done.'
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
        scope.onboardingEnabled = false;
      };
    }
  };
});
