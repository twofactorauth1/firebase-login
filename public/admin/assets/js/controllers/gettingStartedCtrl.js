'use strict';
/**
 * controller for getting-started
 */
(function(angular) {
  app.controller('GettingStartedCtrl', ["$scope", '$state', function($scope, $state) {

    $scope.panes = [{
      header: "Sign Up For Indigenous",
      content: "You completed the most difficult task of starting to take control of your business.",
      taskKey: 'basic_info',
      state: 'app.account'
    }, {
      header: "Basic Account Information",
      content: "Enter the basic information about your business like your address and logo.",
      taskKey: 'profile-personal',
      state: 'app.account.profile'
    }, {
      header: "Select A Theme",
      content: "Select a theme for your front facing website where your customers can visit."
    }, {
      header: "Edit the Homepage",
      content: "Lets make the home page according to your taste.",
      taskKey: 'single-page',
      state: 'app.website.pages'
    }, {
      header: "Create First BlogPost",
      content: "Keep everyone up to date and informed with a regular blog.",
      taskKey: 'single-post',
      state: 'app.website.posts'
    }, {
      header: "Connect Social Accounts",
      content: "Connect your social account so you can import contacts and create marketing campaigns.",
      taskKey: 'integrations',
      state: 'app.account.integrations'
    }, {
      header: "Add Social Feed",
      content: "Add social feeds of your friends.",
      taskKey: 'social-feed',
      state: 'app.marketing.socialfeed'
    }, {
      header: "Import/Create Contacts",
      content: "Import your contact from your various accounts or create them.",
      taskKey: 'customers',
      state: 'app.customers'
    }, {
      header: "Add New Contact",
      content: "Add a new contact.",
      taskKey: 'single-customer',
      state: 'app.customers'
    }, {
      header: "Create First Campaign",
      content: "Create your first campaign to start getting vistors."
    }, {
      header: "Import/Create Products",
      content: "Import or create new products to start selling and creating revenue.",
      taskKey: 'commerce',
      state: 'app.commerce'
    }, {
      header: "Discover the Dashboard",
      content: "Now evetything is set up, its time to start trakcing.",
      taskKey: 'dashboard',
      state: 'app.dashboard'
    }];

    $scope.startOnboardFn = function(pane) {
      console.log(pane);
      var url = $state.href(pane.state, {}, {
        absolute: true
      });
      url += '?onboarding=' + pane.taskKey;
      window.location = url;
    };

  }]);
})(angular);

app.controller('ChartCtrl3', ["$scope", 'UserService', function($scope, UserService) {
  UserService.getUserPreferences(function(preferences) {
    var totalTasks = Object.keys(preferences.tasks).length;
    var completedTasks = 0;
    for (var task in preferences.tasks) {
      if (preferences.tasks[task]) {
        completedTasks += 1;
      }
    }

    var completedPercent = parseInt((completedTasks / totalTasks) * 100);
    var inCompletedPercent = parseInt(((totalTasks - completedTasks) / totalTasks) * 100);
    // Chart.js Data
    $scope.data = [{
      value: completedPercent,
      color: '#27ae60',
      highlight: '#2ecc71',
      label: 'Completion'
    }, {
      value: inCompletedPercent,
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
