'use strict';
/**
 * A directive used for "setting up onboarding".
 */
app.directive('indigOnboarding', function($location, $sce, UserService, toaster) {
    return {
        restrict: 'E',
        template: '<div ng-joy-ride="startJoyRide" config="config" on-finish="onFinish()" on-skip="onFinish()"></div>',
        // controller: function($scope, $element, $attrs) {
        //     $scope.onboardingSteps = [{
        //         overlay: false
        //     }];
        // },
        link: function(scope, elem, attrs) {

            scope.startJoyRide = false;

            UserService.getUserPreferences(function(preferences) {
                scope.userPreferences = preferences;
            });

            scope.onboardingStepMap = {
                pages: [{
                    type: "title",
                    heading: 'Task: Visit page list',
                    text: "This view provides you with listing of all the system pages."
                }],
                'single-page': [{
                  type: "title",
                    heading: 'Task: Add pages',
                    text: "Add a page here for your site."
                }],
                posts: [{
                  type: "title",
                    heading: 'Task: Post list',
                    text: "Here you can see all the posts on your system."
                }],
                'single-post': [{
                  type: "title",
                    heading: 'Task: Add Posts',
                    text: "Add a post here for your site."
                }],
                commerce: [{
                  type: "title",
                    heading: 'Task: List products',
                    text: "Here you see listing of all products."
                }],
                'single-product': [{
                  type: "title",
                    heading: 'Task: Add Products',
                    text: "Here you can add a product for your business."
                }],
                'social-feed': [{
                  type: "title",
                    heading: 'Task: Add feed',
                    text: "See your social presence."
                }],
                customers: [{
                  type: "title",
                    heading: 'Task: List customers',
                    text: "See your business contacts here."
                }],
                'single-customer': [{
                  type: "title",
                    heading: 'Task: Add contacts',
                    text: "Add a contact here."
                }],
                'profile-business': [{
                  type: "title",
                    heading: 'Task: Add business info',
                    text: "Here you can add info about your business."
                }],
                'profile-personal': [{
                  type: "title",
                    heading: 'Task: Add personal info',
                    text: "Here you can add your personal info."
                }],
                billing: [{
                  type: "title",
                    heading: 'Task: Add billing info',
                    text: "Here you can add your social accounts."
                }],
                integrations: [{
                  type: "title",
                    heading: 'Task: Add social accounts',
                    text: "Here you can add your social accounts."
                }],
                dashboard: [{
                  type: "title",
                    heading: 'Task: Dashboard',
                    text: "Here you can see your site's progress."
                }],
                'site-analytics': [{
                  type: "title",
                    heading: 'Task: Analytics',
                    text: "Hee whats happening on your site."
                }]
            };

            scope.$on("$stateChangeSuccess", function(event, current, previous) {
                if ($location.$$search['onboarding']) {
                    scope.obType = $location.$$search['onboarding'].trim();
                    if (scope.obType in scope.onboardingStepMap) {
                        console.info('Found onboarding steps >>>', scope.onboardingStepMap[scope.obType][0]);
                        scope.config = [];
                        scope.config.push(scope.onboardingStepMap[scope.obType][0]);
                        scope.startJoyRide = true;
                    }
                }
            });

            scope.onFinish = function() {
                scope.userPreferences.tasks[scope.obType] = true;
                UserService.updateUserPreferences(scope.userPreferences, false, function() {
                    scope.startJoyRide = false;

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
