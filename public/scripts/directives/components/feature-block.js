app.directive('featureBlockComponent', function () {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html'
  }
});