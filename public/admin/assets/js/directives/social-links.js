/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/

app.directive('socialLinks', ['$modal', '$http', '$timeout', '$q', '$compile', '$filter', 'toaster', function ($modal, $http, $timeout, $q, $compile, $filter, toaster) {
  return {
    require: [],
    restrict: 'C',
    transclude: false,
    replace: false,
    scope: false,
    link: function (scope, element, attrs, ctrl) {
      scope.openModal = function (template, id, index, parentIndex) {
          scope.setEditingComponent(id, index, parentIndex);
          scope.modalInstance = $modal.open({
            templateUrl: template,
            scope: scope
          });
        };

      scope.setEditingComponent = function (id, index, parent_index) {
          var network = [];
          var editIndex = index;         
          var nested = angular.isDefined(parent_index) ? true : false;
          if (nested)
            network = angular.isDefined(editIndex) ? scope.component.teamMembers[parent_index].networks[editIndex] : null;
          else
            network = scope.component.networks[editIndex];
          var update = angular.isDefined(editIndex) ? true : false;
        scope.setSelectedSocialLink(network, scope.component._id, update, nested, parent_index);   
      }

      scope.closeModal = function () {
        $timeout(function () {
          //scope.$apply(function () {
            scope.modalInstance.close();
            angular.element('.modal-backdrop').remove();
          //});
        });
      };

      /*
     * @saveSocialLink
     * -
     */

    scope.saveSocialLink = function (social, id, mode) {
      angular.element("#social-link-name .error").html("");
      angular.element("#social-link-name").removeClass('has-error');
      angular.element("#social-link-url .error").html("");
      angular.element("#social-link-url").removeClass('has-error');
      var old_value = _.findWhere(scope.networks, {
        name: scope.social.selectedLink
      });
      var selectedName;
      switch (mode) {
        case "add":
          if (social && social.name) {
            if (!social.url || social.url == "") {
              angular.element("#social-link-url .error").html("Link url can not be blank.");
              angular.element("#social-link-url").addClass('has-error');
              return;
            }

            if (social.url) {
              var urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
              if (urlRegex.test(social.url) == false) {
                angular.element("#social-link-url .error").html("Link url incorrect format");
                angular.element("#social-link-url").addClass('has-error');
                return;
              }
            }
            selectedName = _.findWhere(scope.networks, {
              name: social.name
            });
            if (selectedName) {
              angular.element("#social-link-name .error").html("Link icon already exists");
              angular.element("#social-link-name").addClass('has-error');
              return;
            }
            var selectedUrl = _.findWhere(scope.networks, {
              url: social.url
            });
            if (selectedUrl) {
              angular.element("#social-link-url .error").html("Link url already exists");
              angular.element("#social-link-url").addClass('has-error');
              return;
            }
          } else {
            angular.element("#social-link-url .error").html("Please enter link url.");
            angular.element("#social-link-url").addClass('has-error');
            angular.element("#social-link-name .error").html("Please select link icon.");
            angular.element("#social-link-name").addClass('has-error');
            return;
          }
          angular.element("#social-link-name .error").html("");
          angular.element("#social-link-name").removeClass('has-error');
          angular.element("#social-link-url .error").html("");
          angular.element("#social-link-url").removeClass('has-error');
          break;
        case "update":
          if (social && social.name && social.url) {
            var networks = angular.copy(scope.networks);

            selectedName = _.findWhere(networks, {
              name: old_value.name
            });
            selectedName.name = social.name;
            selectedName.url = social.url;
            selectedName.icon = social.icon;


            var existingName = _.where(networks, {
              name: social.name
            });
            var existingUrl = _.where(networks, {
              url: social.url
            });
            if (existingName.length > 1) {
              angular.element("#social-link-name .error").html("Link icon already exists");
              angular.element("#social-link-name").addClass('has-error');
              return;
            } else if (existingUrl.length > 1) {
              angular.element("#social-link-url .error").html("Link url already exists");
              angular.element("#social-link-url").addClass('has-error');
              return;
            }
          }
          break;
      }
      if (scope.meetTeamIndex !== null)
        scope.updateTeamNetworks(old_value, mode, social, scope.meetTeamIndex);
      else
        scope.updateSocialNetworks(old_value, mode, social);
      scope.social = {};
      scope.meetTeamIndex = null;
      scope.closeModal();
    };

    /*
     * @setSelectedLink
     * -
     */

    scope.setSelectedLink = function (social_link) {
      scope.social.name = social_link.name;
      scope.social.icon = social_link.icon;
      scope.social.url = social_link.url;
    };

    /*
     * @setSelectedSocialLink
     * -
     */

    scope.setSelectedSocialLink = function (link, id, update, nested, index) {
      if (!scope.social)
        scope.social = {};
      if (nested)
        scope.meetTeamIndex = index;
      else
        scope.meetTeamIndex = null;
      if (update) {
        scope.social.selectedLink = link.name;
        scope.social.name = link.name;
        scope.social.icon = link.icon;
        scope.social.url = link.url;
      } else {
        scope.social = {};
      }
      angular.element("#social-link-name .error").html("");
      angular.element("#social-link-name").removeClass('has-error');
      angular.element("#social-link-url .error").html("");
      angular.element("#social-link-url").removeClass('has-error');
      //scope.$apply(function () {
      scope.networks = scope.getSocialNetworks(nested, index);
      //});
    };

    /*
     * @getSocialNetworks
     * -
     */

    scope.getSocialNetworks = function (nested, parent_index) {
      if (nested)
        return scope.component.teamMembers[parent_index].networks;
      else
        return scope.component.networks;
    };

    scope.updateSocialNetworks = function (old_value, mode, new_value) {
      var selectedName;
      switch (mode) {
        case "add":
          if (new_value && new_value.name && new_value.url) {
            scope.component.networks.push({
              name: new_value.name,
              url: new_value.url,
              icon: new_value.icon
            });
          }
          break;
        case "update":
          if (new_value && new_value.name && new_value.url) {
            selectedName = _.findWhere(scope.component.networks, {
              name: old_value.name
            });
            selectedName.name = new_value.name;
            selectedName.url = new_value.url;
            selectedName.icon = new_value.icon;
          }
          break;
        case "delete":
          selectedName = _.findWhere(scope.component.networks, {
            name: old_value.name
          });
          if (selectedName) {
            var index = scope.component.networks.indexOf(selectedName)
            scope.component.networks.splice(index, 1);
          }
          break;
      }
    };

    /*
     * @social_links
     * -
     */

      scope.social_links = [{
        name: "adn",
        icon: "adn",
        tooltip: "Adn",
        url: "http://www.adn.com"
      }, {
        name: "bitbucket",
        icon: "bitbucket",
        tooltip: "BitBucket",
        url: "https://bitbucket.org"
      }, {
        name: "dropbox",
        icon: "dropbox",
        tooltip: "Dropbox",
        url: "https://www.dropbox.com"
      }, {
        name: "facebook",
        icon: "facebook",
        tooltip: "Facebook",
        url: "https://www.facebook.com"
      }, {
        name: "flickr",
        icon: "flickr",
        tooltip: "Flickr",
        url: "https://www.flickr.com"
      }, {
        name: "foursquare",
        icon: "foursquare",
        tooltip: "Four Square",
        url: "https://foursquare.com"
      }, {
        name: "github",
        icon: "github",
        tooltip: "Github",
        url: "https://github.com"
      }, {
        name: "google-plus",
        icon: "google-plus",
        tooltip: "Google Plus",
        url: "https://www.gmail.com"
      }, {
        name: "instagram",
        icon: "instagram",
        tooltip: "Instagram",
        url: "https://instagram.com"
      }, {
        name: "linkedin",
        icon: "linkedin",
        tooltip: "Linkedin",
        url: "https://www.linkedin.com"
      }, {
        name: "microsoft",
        icon: "windows",
        tooltip: "Microsoft",
        url: "http://www.microsoft.com"
      }, {
        name: "openid",
        icon: "openid",
        tooltip: "Open Id",
        url: "http://openid.com"
      }, {
        name: "pinterest",
        icon: "pinterest",
        tooltip: "Pinterest",
        url: "https://www.pinterest.com"
      }, {
        name: "reddit",
        icon: "reddit",
        tooltip: "Reddit",
        url: "http://www.reddit.com"
      }, {
        name: "comment-o",
        icon: "comment-o",
        tooltip: "Snapchat",
        url: "https://www.snapchat.com"
      }, {
        name: "soundcloud",
        icon: "soundcloud",
        tooltip: "Sound Cloud",
        url: "https://soundcloud.com"
      }, {
        name: "tumblr",
        icon: "tumblr",
        tooltip: "Tumblr",
        url: "https://www.tumblr.com"
      }, {
        name: "twitter",
        icon: "twitter",
        tooltip: "Twitter",
        url: "https://twitter.com"
      }, {
        name: "vimeo",
        icon: "vimeo-square",
        tooltip: "Vimeo",
        url: "https://vimeo.com"
      }, {
        name: "vine",
        icon: "vine",
        tooltip: "Vine",
        url: "http://www.vinemarket.com"
      }, {
        name: "vk",
        icon: "vk",
        tooltip: "Vk",
        url: "http://vk.com"
      }, {
        name: "desktop",
        icon: "desktop",
        tooltip: "Website",
        url: "http://www.website.com"
      }, {
        name: "yahoo",
        icon: "yahoo",
        tooltip: "Yahoo",
        url: "https://yahoo.com"
      }, {
        name: "youtube",
        icon: "youtube",
        tooltip: "Youtube",
        url: "https://www.youtube.com"
      }, {
        name: "yelp",
        icon: "yelp",
        tooltip: "Yelp",
        url: "http://www.yelp.com"
      }];
    }
  };
}]);
