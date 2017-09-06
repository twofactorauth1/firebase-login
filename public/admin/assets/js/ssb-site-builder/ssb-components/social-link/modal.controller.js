/*global app, angular ,console ,_*/
/* eslint-disable no-console*/
app.controller('SiteBuilderSocialLinkModalController', ['$timeout', 'parentVm', function ($timeout, parentVm) {
	'use strict';
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
			console.log('link is added already');
			vm.social.selectedLink = social_link.name;
		} else {
			console.log('link is NOT added already');
			vm.social.selectedLink = null;
		}

	}

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
			}),
			selectedName,
			showErrorMessage = function (inputId, errorMessages) {
				angular.element("#" + inputId + " .error").html(errorMessages);
				angular.element("#" + inputId).addClass('has-error');
			};
		switch (mode) {
			case "add":
				if (social && social.name) {
					if (!social.url || social.url === "") {
						showErrorMessage("social-link-url", "Link url can not be blank.");
						return;
					} else if (social.url) {
						var urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
						if (urlRegex.test(social.url) === false) {
							showErrorMessage("social-link-url", "Link url incorrect format");
							return;
						}
					}
					selectedName = _.findWhere(vm.component.networks, {
						name: social.name
					});
					if (selectedName) {
						showErrorMessage("social-link-name", "Link icon already exists");
						return;
					}
					var selectedUrl = _.findWhere(vm.component.networks, {
						url: social.url
					});
					if (selectedUrl) {
						showErrorMessage("social-link-url", "Link url already exists");
						return;
					}
				} else {
					showErrorMessage("social-link-url", "Please enter link url.");
					showErrorMessage("social-link-url", "Please select link icon.");
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
						}),
						existingUrl = _.where(networks, {
							url: social.url
						});
					if (existingName.length > 1) {
						showErrorMessage("social-link-name", "Link icon already exists");
						return;
					} else if (existingUrl.length > 1) {
						showErrorMessage("social-link-name", "Link url already exists");
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
						var index = vm.component.networks.indexOf(selectedName);
						vm.component.networks.splice(index, 1);
					}

				}, 500);
				break;
		}
	}

	(function init() {
		// vm.setSelectedSocialLink(vm.component.network, );

	}());

}]);
