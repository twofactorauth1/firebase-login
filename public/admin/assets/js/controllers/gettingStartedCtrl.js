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
      header: "Import/Create Products",
      content: "Import or create new products to start selling and creating revenue.",
      taskKey: 'commerce',
      state: 'app.commerce'
    }, {
      header: "Discover the Dashboard",
      content: "Now evetything is set up, its time to start trakcing.",
      taskKey: 'dashboard',
      state: 'app.dashboard'
    }, {
      header: 'View pages',
      content: 'See all pages',
      taskKey: 'pages',
      state: 'app.website.pages'
    }, {
      header: 'View posts',
      content: 'See all posts',
      taskKey: 'posts',
      state: 'app.website.posts'
    }, {
      header: 'Add product',
      content: 'Add a product',
      taskKey: 'single-product',
      state: 'app.commerce'
    }, {
      header: 'Add business info',
      content: 'Add business info',
      taskKey: 'profile-business',
      state: 'app.account'
    }, {
      header: 'Add billing info',
      content: 'Add billing info',
      taskKey: 'billing',
      state: 'app.account.billing'
    }, {
      header: 'Analytics',
      content: 'Check site status',
      taskKey: 'site-analytics',
      state: 'app.dashboard'
    }];

    $scope.startOnboardFn = function(pane) {
      var url = $state.href(pane.state, {}, {
        absolute: false
      });
      url += '?onboarding=' + pane.taskKey;
      window.location = url;
    };

  }]);
})(angular);

app.controller('ChartCtrl3', ["$scope", 'UserService', function($scope, UserService) {
  UserService.getUserPreferences(function(preferences) {
    var taskKeys = ["basic_info", "profile-personal", "single-page", "single-post", "integrations", "social-feed", "customers", "single-customer", "commerce", "dashboard", "pages", "posts", "single-product", "profile-business", "billing", "site-analytics"];
    var totalTasks = taskKeys.length;
    var completedTasks = 0;

    taskKeys.forEach(function(value, index) {
      if (preferences.tasks[value]) {
        completedTasks += 1;
      }
    });

    $scope.completedPercent = parseInt((completedTasks / totalTasks) * 100);
    $scope.inCompletedPercent = parseInt(((totalTasks - completedTasks) / totalTasks) * 100);

    $scope.completedTasks = completedTasks;
    $scope.totalTasks = totalTasks;

    // Chart.js Data
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
