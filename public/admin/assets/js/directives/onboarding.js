'use strict';
/**
 * A directive used for "setting up onboarding".
 */
app.directive('indigOnboarding', function($location, $sce, UserService, toaster) {
    return {
        restrict: 'E',
        template: '<onboarding-popover enabled="onboardingEnabled" steps="onboardingSteps" on-finish-callback="onboardingFinishFn" step-index="onboardingIndex"></onboarding-popover>',
        controller: function($scope, $element, $attrs) {
            $scope.onboardingSteps = [{
                overlay: false
            }];
        },
        link: function(scope, elem, attrs) {
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
                    title: 'Task: Visit page list',
                    description: "This view provides you with listing of all the system pages.",
                    position: 'centered'
                }],
                'single-page': [{
                    overlay: true,
                    title: 'Task: Add pages',
                    description: "Add a page here for your site.",
                    position: 'centered'
                }],
                posts: [{
                    overlay: true,
                    title: 'Task: Post list',
                    description: "Here you can see all the posts on your system.",
                    position: 'centered'
                }],
                'single-post': [{
                    overlay: true,
                    title: 'Task: Add Posts',
                    description: "Add a post here for your site.",
                    position: 'centered'
                }],
                commerce: [{
                    overlay: true,
                    title: 'Task: List products',
                    description: "Here you see listing of all products.",
                    position: 'centered'
                }],
                'single-product': [{
                    overlay: true,
                    title: 'Task: Add Products',
                    description: "Here you can add a product for your business.",
                    position: 'centered'
                }],
                'social-feed': [{
                    overlay: true,
                    title: 'Task: Add feed',
                    description: "See your social presence.",
                    position: 'centered',
                    showCloseButton: true
                }],
                customers: [{
                    overlay: true,
                    title: 'Task: List customers',
                    description: "See your business contacts here.",
                    position: 'centered'
                }],
                'single-customer': [{
                    overlay: true,
                    title: 'Task: Add contacts',
                    description: "Add a contact here.",
                    position: 'centered'
                }],
                'profile-business': [{
                    overlay: true,
                    title: 'Task: Add business info',
                    description: "Here you can add info about your business.",
                    position: 'centered'
                }],
                'profile-personal': [{
                    overlay: true,
                    title: 'Task: Add personal info',
                    description: "Here you can add your personal info.",
                    position: 'centered',
                    link: '/admin/#/account/profile?onboarding=profile-personal'
                }],
                billing: [{
                    overlay: true,
                    title: 'Task: Add billing info',
                    description: "Here you can add your social accounts.",
                    position: 'centered'
                }],
                integrations: [{
                    overlay: true,
                    title: 'Task: Add social accounts',
                    description: "Here you can add your social accounts.",
                    position: 'centered'
                }],
                dashboard: [{
                    overlay: true,
                    title: 'Task: Dashboard',
                    description: "Here you can see your site's progress.",
                    position: 'centered'
                }],
                'site-analytics': [{
                    overlay: true,
                    title: 'Task: Analytics',
                    description: "Hee whats happening on your site.",
                    position: 'centered'
                }]
            };

            scope.$on("$stateChangeSuccess", function(event, current, previous) {
                if ($location.$$search['onboarding']) {
                    scope.obType = $location.$$search['onboarding'].trim();
                    if (scope.obType in scope.onboardingStepMap) {
                        console.info('Found onboarding steps >>>', scope.onboardingStepMap[scope.obType]);
                        scope.onboardingSteps = scope.onboardingStepMap[scope.obType];
                        scope.onboardingEnabled = true;
                    }
                }
            });

            scope.onboardingFinishFn = function() {
                scope.userPreferences.tasks[scope.obType] = true;
                UserService.updateUserPreferences(scope.userPreferences, false, function() {
                    scope.onboardingEnabled = false;

                    //get next task
                    var nextTasks = [];
                    _.each(scope.userPreferences.tasks, function(val, key) {
                        if (val == false) {
                            nextTasks.push(scope.onboardingStepMap[key]);
                        }
                    });

                    if (nextTasks.length > 0) {
                        //success message
                        toaster.pop('success', null, 'Complete: Next task is <br> <a class="btn btn-primary" href="'+nextTasks[0][0].link+'">' + nextTasks[0][0].title + '</a>', 15000, 'trustedHtml');
                    } else {
                        toaster.pop('success', 'Task Complete. No more tasks to complete.')
                    }

                });
            };
        }
    };
});
