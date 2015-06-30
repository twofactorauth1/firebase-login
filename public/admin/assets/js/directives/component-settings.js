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

      //$scope.initialize = false;
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
        //if($scope.componentEditing && $scope.componentEditing.type === "navigation")
        //$scope.loadWebsitePages();
      };

      /*
       * @spectrum
       * - variables for the spectrum color picker in the settings modal
       */

      $scope.spectrum = {
        options: {
          showPalette: true,
          clickoutFiresChange: true,
          showInput: true,
          showButtons: false,
          allowEmpty: true,
          hideAfterPaletteSelect: false,
          showPaletteOnly: true,
          togglePaletteOnly: true,
          togglePaletteMoreText: 'more',
          togglePaletteLessText: 'less',
          appendTo: angular.element("#component-setting-modal"),
          palette: [
            ["#C91F37", "#DC3023", "#9D2933", "#CF000F", "#E68364", "#F22613", "#CF3A24", "#C3272B", "#8F1D21", "#D24D57"],
            ["#F08F907", "#F47983", "#DB5A6B", "#C93756", "#FCC9B9", "#FFB3A7", "#F62459", "#F58F84", "#875F9A", "#5D3F6A"],
            ["#89729E", "#763568", "#8D608C", "#A87CA0", "#5B3256", "#BF55EC", "#8E44AD", "#9B59B6", "#BE90D4", "#4D8FAC"],
            ["#5D8CAE", "#22A7F0", "#19B5FE", "#59ABE3", "#48929B", "#317589", "#89C4F4", "#4B77BE", "#1F4788", "#003171"],
            ["#044F67", "#264348", "#7A942E", "#8DB255", "#5B8930", "#6B9362", "#407A52", "#006442", "#87D37C", "#26A65B"],
            ["#26C281", "#049372", "#2ABB9B", "#16A085", "#36D7B7", "#03A678", "#4DAF7C", "#D9B611", "#F3C13A", "#F7CA18"],
            ["#E2B13C", "#A17917", "#F5D76E", "#F4D03F", "#FFA400", "#E08A1E", "#FFB61E", "#FAA945", "#FFA631", "#FFB94E"],
            ["#E29C45", "#F9690E", "#CA6924", "#F5AB35", "#BFBFBF", "#F2F1EF", "#BDC3C7", "#ECF0F1", "#D2D7D3", "#757D75"],
            ["#EEEEEE", "#ABB7B7", "#6C7A89", "#95A5A6"]
          ]
        }
      };

      /*
       * @removeImage
       * -
       */

      $scope.removeImage = function (remove) {
        if ($scope.componentEditing && $scope.componentEditing.bg && $scope.componentEditing.bg.img) {
          if (($scope.componentEditing.bg.img.show == false && remove == true) || remove == false) {
            if (remove == false)
              $scope.componentEditing.bg.img.url = null;
            $scope.componentEditing.bg.img.blur = false;
            $scope.componentEditing.bg.img.parallax = false;
            $scope.componentEditing.bg.img.overlay = false;
          }

        }
      };

      $scope.closeModal = function () {
        $timeout(function () {
          $scope.$apply(function () {
            $scope.modalInstance.close();
            angular.element('.modal-backdrop').remove();
          });
        });
      };

      $scope.$watch('newLink.linkPage', function (newValue) {
        if (newValue) {
          $scope.currentPage = _.find($scope.filterdedPages, function (page) {
            return page.handle === newValue;
          });
        }
      })

      $scope.initializeEditLinks = function (link, status) {
        if (link.page) {
          if (status)
            link.data = null;
          $scope.currentPage = _.find($scope.filterdedPages, function (page) {
            return page.handle === link.page;
          });
        }
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
          linkType: null,
          linkPage: null
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
        var newArray = _.first(angular.copy($scope.components), [index + 1]);
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
                    type: $scope.newLink.linkType,
                    page: $scope.newLink.linkPage
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
                    type: $scope.newLink.linkType,
                    page: $scope.newLink.linkPage
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
                  //$scope.updateWebsite($scope.website);
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
                //$scope.updateWebsite($scope.website);
              }
            });
          }

        }
      };
    }
  };
}]);
