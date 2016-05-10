'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('meetTeamComponent',["$window", function ($window) {
  return {
    scope: {
      component: '=',
      media: '&',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
        scope.isEditing = true;

        scope.addImageFromMedia = function (componentId, index, update) {
            scope.media({
            componentId: componentId,
            index: index,
            update: update
            });
        };

      /*
       * @deleteTeamMember
       * -
       */

        scope.deleteTeamMember = function (index) {
            console.log('index', index);
            scope.component.teamMembers.splice(index, 1);
        };

        scope.addTeamMember = function (index) {
            if (!index) {
              index = 0;
            }
            var newTeam = {
              "name": "<p>First Last</p>",
              "position": "<p>Position of Person</p>",
              "profilepic": "https://s3-us-west-2.amazonaws.com/indigenous-admin/default-user.png",
              "bio": "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
              "networks": [{
                "name": "linkedin",
                "url": "http://www.linkedin.com",
                "icon": "linkedin"
              }]
            };
            scope.component.teamMembers.splice(index + 1, 0, newTeam);
        };

        scope.teamClass = function(){
            var parent_id = scope.component.anchor || scope.component._id;
            var element = angular.element("#"+parent_id + " div.team-member-wrap")
            if(element.width() < 768){
                return "team-xs-width";
            }
            else if(element.width() < 992){
                return "team-sm-width";
            }
            else{
                return "";
            }
        }

    }
  };
}]);
