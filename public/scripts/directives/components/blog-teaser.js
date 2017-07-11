app.directive('blogTeaserComponent', ['postsService', '$filter', function (postsService, $filter) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    controller: function ($scope, postsService) {


      /*
       * @postsService
       * -
       */

      postsService(function (err, data) {
      	console.log('post data ', data);
      	$scope.teaserposts = data;
      });

       $scope.sortBlogFn = function (component) {
        return function (blogpost) {
          if (component.postorder) {
            if (component.postorder == 1 || component.postorder == 2) {
                return new Date(blogpost.modified.date).getTime();
              //return Date.parse($filter('date')(blogpost.modified.date, "MM/dd/yyyy HH:mm:ss"));
            } else if (component.postorder == 3 || component.postorder == 4) {
              return new Date(blogpost.modified.date).getTime();
            } else if (component.postorder == 5 || component.postorder == 6) {
              return new Date(blogpost.modified.date).getTime();
            }
          } else
            return new Date(blogpost.modified.date ||  blogpost.created.date).getTime();
        };
      };
      $scope.titleStyle = function (component) {
        var styleString = ' ';
		if(component && component.settings){
            if(component.settings.title){
                if(component.settings.title.fontSize){
                    styleString += 'font-size: ' + component.settings.title.fontSize + 'px !important;';
                }
                if(component.settings.title.fontFamily){
                    styleString += 'font-family: ' + component.settings.title.fontFamily + 'px !important;';
                }
                if(component.settings.title.color){
                    styleString += 'color: ' + component.settings.title.color + "!important;";
                }
            }
		}
		return styleString;
      };
      $scope.descriptionStyle = function (component) {
        var styleString = ' ';
		if(component && component.settings){
            if(component.settings.description){
                if(component.settings.description.fontSize){
                    styleString += 'font-size: ' + component.settings.description.fontSize + 'px !important;';
                }
                if(component.settings.description.fontFamily){
                    styleString += 'font-family: ' + component.settings.description.fontFamily + 'px !important;';
                }
                if(component.settings.description.color){
                    styleString += 'color: ' + component.settings.description.color + "!important;";
                }
            }
		}
		return styleString;
      };
      $scope.customSortOrder = function (component) {
        if (component.postorder == 1 || component.postorder == 3 || component.postorder == 5) {
          return false;
        } else if (component.postorder == 2 || component.postorder == 4 || component.postorder == 6) {
          return true;
        } else {
          return true;
        }
      };
    }
  };
}]);
