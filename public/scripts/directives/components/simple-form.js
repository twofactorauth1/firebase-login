app.directive('simpleFormComponent', function () {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html'
  }
});