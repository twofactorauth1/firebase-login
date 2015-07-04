/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
app.directive('componentLoader', ['$timeout', '$modal', '$document', 'toaster', function ($timeout, $modal, $document, toaster) {
  return {
    templateUrl: '/admin/assets/views/partials/component-loader.html',

    link: function (scope, element, attributes, controller) {
      if (typeof (CKEDITOR) !== "undefined") {
        CKEDITOR.disableAutoInline = true;
      }
    },
    controller: function ($scope, WebsiteService, CustomerService, $modal) {
      $scope.deleteComponent = function (index) {
        $scope.components.splice(index, 1);
      };

      $scope.sortableCompoents = $scope.components;
      $scope.savePage = function () {
        $scope.saveLoading = true;
        WebsiteService.updatePage($scope.page, function (data) {
          $scope.saveLoading = false;
          toaster.pop('success', "Page Saved", "The " + $scope.page.handle + " page was saved successfully.");
        });
      };
      $scope.wait;
      $scope.first = true;
      $scope.sortableOptions = {
        parentElement: "#componentloader",
        containerPositioning: 'relative',
        dragStart: function (e, ui) {
          $scope.dragging = true;
          $scope.first = false;
          clearTimeout($scope.wait);
        },
        dragMove: function (e, ui) {
          console.log('sorting update');
        },
        dragEnd: function (e, ui) {
          $scope.first = true;
          $scope.dragging = false;
          $scope.wait = setTimeout(function () {
            e.dest.sortableScope.element.removeClass("active");
            $timeout(function () {
              var element = document.getElementById($scope.components[e.dest.index]._id);
              var rect = element.getBoundingClientRect();
              console.log(rect.top, rect.right, rect.bottom, rect.left);
              if (element) {
                $document.scrollToElementAnimated(element, 175, 1000);
              }
            }, 500);
          }, 1500);
        }
      };
    }
  };
}]);
