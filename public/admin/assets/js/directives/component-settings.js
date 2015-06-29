/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/

app.directive('componentSettings', ['$modal', '$http', '$timeout', '$q', '$compile', '$filter', 'WebsiteService', 'CustomerService', 'toaster', function ($modal, $http, $timeout, $q, $compile, $filter, WebsiteService, CustomerService, toaster) {
  return {
    require: [],
    restrict: 'C',
    transclude: false,
    replace: false,
    scope: false,
    controller: function ($scope, WebsiteService, CustomerService, $compile, $timeout) {
      $scope.openModal = function (template, id) {
        $scope.changeComponentEditing(id);
        $scope.modalInstance = $modal.open({
          templateUrl: template,
          scope: $scope
        });
      };

      $scope.changeComponentEditing = function (id) {
        $scope.componentEditing = _.find($scope.components, function (component) {
          return component._id === id;
        });
      };

      $scope.closeModal = function () {
        $timeout(function () {
          $scope.$apply(function () {
            $scope.modalInstance.close();
            angular.element('.modal-backdrop').remove();
          });
        });
      };

      /*
       * @initializeLinks
       * -
       */

      $scope.initializeLinks = function (status) {
        $scope.addLink = status;
        $scope.newLink = {
          linkUrl: null,
          linkTitle: null,
          linkType: null
        };
      };

      /*
       * @setLinkUrl
       * -
       */

      $scope.setLinkUrl = function () {
        $scope.newLink.linkTitle = angular.element("#linkSection option:selected").html();
      };

      /*
       * @setLinkTitle
       * -
       */

      $scope.setLinkTitle = function (value, index, newLink) {
        var newArray = _.first(angular.copy($scope.$scope.components), [index + 1]);
        var hash = _.filter(newArray, function (obj) {
          return obj.type === value;
        })
        if (hash.length > 1)
          return value.replace("-", " ") + "-" + (hash.length - 1);
        else
          return value.replace("-", " ");
      };

      /*
       * @deleteLinkFromNav
       * -
       */

      $scope.deleteLinkFromNav = function (index) {
        if ($scope.componentEditing.customnav) {
          $scope.componentEditing.linkLists.forEach(function (value) {
            if (value.handle === "head-menu") {
              value.links.splice(index, 1);
              setTimeout(function () {
                $scope.updateLinkList();
              }, 1000)
            }
          });
        } else {
          $scope.website.linkLists.forEach(function (value) {
            if (value.handle === "head-menu") {
              value.links.splice(index, 1);
              setTimeout(function () {
                $scope.updateLinkList();
              }, 1000)
            }
          });
        }
      };

      /*
       * @addLinkToNav
       * -
       */

      $scope.addLinkToNav = function () {

        if ($scope.newLink && $scope.newLink.linkTitle && $scope.newLink.linkUrl) {
          if ($scope.componentEditing.customnav) {
            if (!$scope.componentEditing.linkLists) {
              $scope.componentEditing.linkLists = [];
              $scope.componentEditing.linkLists.push({
                name: "Head Menu",
                handle: "head-menu",
                links: []
              })
            }
            $scope.componentEditing.linkLists.forEach(function (value, index) {
              if (value.handle === "head-menu") {
                value.links.push({
                  label: $scope.newLink.linkTitle,
                  type: "link",
                  linkTo: {
                    data: $scope.newLink.linkUrl,
                    type: $scope.newLink.linkType
                  }
                });
                $scope.initializeLinks(false);
              }
            });
          } else {
            $scope.website.linkLists.forEach(function (value, index) {
              if (value.handle === "head-menu") {
                value.links.push({
                  label: $scope.newLink.linkTitle,
                  type: "link",
                  linkTo: {
                    data: $scope.newLink.linkUrl,
                    type: $scope.newLink.linkType
                  }
                });
                $scope.initializeLinks(false);
              }
            });
          }

        }
        setTimeout(function () {
          $scope.updateLinkList();
        }, 1000)
      };

      /*
       * @updateLinkList
       * - when the navigation is reordered, update the linklist in the website object
       */

      $scope.updateLinkList = function (index) {
        var linkLabelsArr = [];
        var editedLinksLists = angular.element('.head-menu-links');
        // if(index)
        // editedLinksLists.splice(index,1);
        for (var i = 0; i < editedLinksLists.length; i++) {
          var linkLabel = editedLinksLists[i].attributes['data-label'].value;
          if (linkLabel)
            linkLabelsArr.push(linkLabel);
        }
        if (linkLabelsArr.length) {
          if ($scope.componentEditing.customnav) {
            $scope.componentEditing.linkLists.forEach(function (value, index) {
              if (value.handle === "head-menu") {
                var newLinkListOrder = [];
                for (var i = 0; i < editedLinksLists.length; i++) {
                  if (value) {
                    var matchedLinkList = _.findWhere(value.links, {
                      label: linkLabelsArr[i]
                    });
                    newLinkListOrder.push(matchedLinkList);
                  }
                };
                if (newLinkListOrder.length) {
                  $scope.componentEditing.linkLists[index].links = newLinkListOrder;
                  $scope.saveCustomComponent();
                }
              }
            });
          } else {
            $scope.website.linkLists.forEach(function (value, index) {
              if (value.handle === "head-menu") {
                var newLinkListOrder = [];
                for (var i = 0; i < editedLinksLists.length; i++) {
                  if (value) {
                    var matchedLinkList = _.findWhere(value.links, {
                      label: linkLabelsArr[i]
                    });
                    newLinkListOrder.push(matchedLinkList);
                  }
                };
                if (newLinkListOrder.length) {
                  $scope.website.linkLists[index].links = newLinkListOrder;
                  $scope.childScope.updateWebsite($scope.website);
                }

              }
            });
          }

        } else {

          if ($scope.componentEditing.customnav) {
            $scope.website.linkLists.forEach(function (value, index) {
              if (value.handle === "head-menu") {
                $scope.componentEditing.linkLists[index].links = [];
                $scope.saveCustomComponent();
              }
            });
          } else {
            $scope.website.linkLists.forEach(function (value, index) {
              if (value.handle === "head-menu") {
                $scope.website.linkLists[index].links = [];
                $scope.childScope.updateWebsite($scope.website);
              }
            });
          }

        }
      };
    }
  };
}]);
