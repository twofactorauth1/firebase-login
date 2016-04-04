'use strict';
/*global app*/
app.controller('SiteBuilderSocialLinkModalController', ['$timeout', 'parentVm', 'toaster', 'SimpleSiteBuilderService', function ($timeout, parentVm, toaster, SimpleSiteBuilderService) {

    var vm = this;

    vm.parentVm = parentVm;
    vm.setSelectedLink = setSelectedLink;
    // vm.setSelectedSocialLink = setSelectedSocialLink;
    vm.saveSocialLink = saveSocialLink;
    vm.updateSocialNetworks = updateSocialNetworks;

    vm.component = parentVm.state.page.sections[parentVm.uiState.activeSectionIndex].components[parentVm.uiState.activeComponentIndex];
    vm.social = {};

    function setSelectedLink(social_link) {
        vm.social = social_link;
        var isLinkAdded = _.findWhere(vm.component.networks, {
            name: social_link.name
        });

        if (isLinkAdded) {
            console.log('link is added already')
            vm.social.selectedLink = social_link.name;
        } else {
            console.log('link is NOT added already')
            vm.social.selectedLink = null;
        }

    };

    // function setSelectedSocialLink(link, id, update, nested, index) {

    //     if (!vm.social) {
    //         vm.social = {};
    //     }

    //     if (nested) {
    //         vm.meetTeamIndex = index;
    //     } else {
    //         vm.meetTeamIndex = null;
    //     }
    //     if (update) {
    //         vm.social.selectedLink = link.name;
    //         vm.social.name = link.name;
    //         vm.social.icon = link.icon;
    //         vm.social.url = link.url;
    //     } else {
    //         vm.social = {};
    //     }

    //     if(vm.social.selectedLink){
    //         vm.matchingLink = _.findWhere(vm.social_links, {
    //             name: vm.social.selectedLink
    //         });
    //     }

    //     angular.element("#social-link-name .error").html("");
    //     angular.element("#social-link-name").removeClass('has-error');
    //     angular.element("#social-link-url .error").html("");
    //     angular.element("#social-link-url").removeClass('has-error');

    //     vm.component.networks = vm.component.networks;

    // };

    function saveSocialLink(social, id, mode) {
        angular.element("#social-link-name .error").html("");
        angular.element("#social-link-name").removeClass('has-error');
        angular.element("#social-link-url .error").html("");
        angular.element("#social-link-url").removeClass('has-error');
        var old_value = _.findWhere(vm.component.networks, {
          name: vm.social.selectedLink
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
              selectedName = _.findWhere(vm.component.networks, {
                name: social.name
              });
              if (selectedName) {
                angular.element("#social-link-name .error").html("Link icon already exists");
                angular.element("#social-link-name").addClass('has-error');
                return;
              }
              var selectedUrl = _.findWhere(vm.component.networks, {
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
              var networks = angular.copy(vm.component.networks);

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

        // if (vm.meetTeamIndex !== null) {
        //     vm.updateTeamNetworks(old_value, mode, social, vm.meetTeamIndex);
        // } else {
            vm.updateSocialNetworks(old_value, mode, social);
            vm.social = {};
            vm.meetTeamIndex = null;
            vm.parentVm.closeModal();
        // }

    }

    function updateSocialNetworks(old_value, mode, new_value) {
        var selectedName;
        switch (mode) {
          case "add":
            if (new_value && new_value.name && new_value.url) {
              vm.component.networks.push({
                name: new_value.name,
                url: new_value.url,
                icon: new_value.icon
              });
            }
            break;
          case "update":
            if (new_value && new_value.name && new_value.url) {
              selectedName = _.findWhere(vm.component.networks, {
                name: old_value.name
              });
              selectedName.name = new_value.name;
              selectedName.url = new_value.url;
              selectedName.icon = new_value.icon;
            }
            break;
          case "delete":
            //wait for modal animation for 500ms
            $timeout(function () {
              selectedName = _.findWhere(vm.component.networks, {
                name: old_value.name
              });
              if (selectedName) {
                  var index = vm.component.networks.indexOf(selectedName)
                  vm.component.networks.splice(index, 1);
              }
              
            }, 500);
            break;
        }
    };

    (function init() {

        // vm.setSelectedSocialLink(vm.component.network, );

    })();

}]);
