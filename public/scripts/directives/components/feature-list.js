/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('featureListComponent', function () {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html'
  };
});
