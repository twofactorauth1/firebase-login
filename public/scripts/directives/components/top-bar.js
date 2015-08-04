app.directive('topBarComponent', function () {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.getUrl = function (value) {
        if (value && !/http[s]?/.test(value)) {
          value = 'http://' + value;
        }
        return value;
      };
    }
  }
});