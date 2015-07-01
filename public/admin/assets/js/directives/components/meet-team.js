app.directive('meetTeamComponent', function () {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.isEditing = true;

      /*
       * @deleteTeamMember
       * -
       */

      scope.deleteTeamMember = function (index) {
      	console.log('index', index);
        scope.component.teamMembers.splice(index, 1);
      };

    }
  }
});
