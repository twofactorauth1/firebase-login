'use strict';
/**
 * A directive used for "setting up onboarding".
 */
app.directive('indigOnboarding', function() {
  return {
    restrict: 'E',
    template: '<onboarding-popover enabled="onboardingEnabled" steps="onboardingSteps" on-finish-callback="onboardingFinishFn" step-index="onboardingIndex"></onboarding-popover>',
    link: function(scope, elem, attrs) {
      console.log(scope, elem, attrs);
    }
  };
});
