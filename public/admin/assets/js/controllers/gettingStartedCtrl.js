'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('GettingStartedCtrl', ["$scope", '$state', 'UserService', 'ONBOARDINGCONSTANT', function ($scope, $state, UserService, ONBOARDINGCONSTANT) {

    $scope.panes = [];
    UserService.getUserPreferences(function (preferences) {

      _.each(ONBOARDINGCONSTANT.tasks, function (task) {
        var matchedTask = _.find(preferences.tasks, function (v, k) {
          return k === task.pane.taskKey;
        });

        if (matchedTask) {
          task.pane.completed = matchedTask;
        } else {
          task.pane.completed = false;
        }

        $scope.panes.push(task.pane);
      });
    });

    $scope.startOnboardFn = function (pane) {
      var url = $state.href(pane.state, {}, {
        absolute: false
      });
      url += '?onboarding=' + pane.taskKey;
      console.log('url ', url);
      window.location = url;
    };

  }]);
}(angular));

app.controller('CompletionDonutCtrl', ["$scope", 'UserService', 'ONBOARDINGCONSTANT', function ($scope, UserService, ONBOARDINGCONSTANT) {
  UserService.getUserPreferences(function (preferences) {

    var taskKeys = [];
    _.each(ONBOARDINGCONSTANT.tasks, function (task) {
      taskKeys.push(task.pane.taskKey);
    });

    var totalTasks = taskKeys.length;
    var completedTasks = 0;

    taskKeys.forEach(function (value, index) {
      if (preferences.tasks[value]) {
        completedTasks += 1;
      }
    });

    $scope.completedPercent = parseInt((completedTasks / totalTasks) * 100, 10);
    $scope.inCompletedPercent = parseInt(((totalTasks - completedTasks) / totalTasks) * 100, 10);

    $scope.completedTasks = completedTasks;
    $scope.totalTasks = totalTasks;

    $scope.data = [{
      value: $scope.completedPercent,
      color: '#27ae60',
      highlight: '#2ecc71',
      label: 'Completion'
    }, {
      value: $scope.inCompletedPercent,
      color: 'rgba(0,0,0,0)',
      highlight: 'rgba(0,0,0,0)',
      label: ''
    }];

    // Chart.js Options
    $scope.options = {
      // Sets the chart to be responsive
      responsive: false,
      //Boolean - Whether we should show a stroke on each segment
      segmentShowStroke: true,
      //String - The colour of each segment stroke
      segmentStrokeColor: '#fff',
      //Number - The width of each segment stroke
      segmentStrokeWidth: 2,
      //Number - The percentage of the chart that we cut out of the middle
      percentageInnerCutout: 50, // This is 0 for Pie charts
      //Number - Amount of animation steps
      animationSteps: 100,
      //String - Animation easing effect
      animationEasing: 'easeOutBounce',
      //Boolean - Whether we animate the rotation of the Doughnut
      animateRotate: true,
      //Boolean - Whether we animate scaling the Doughnut from the centre
      animateScale: false,
      //String - A legend template
      legendTemplate: '<ul class="tc-chart-js-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'

    };
  });
}]);
