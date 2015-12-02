'use strict';
/*global app*/
app.controller('SiteBuilderAddSectionModalController', ['$timeout', 'parentVm', 'SimpleSiteBuilderService', function ($timeout, parentVm, SimpleSiteBuilderService) {

	var sectionLabel;
	var vm = this;

	vm.parentVm = parentVm;

	/*
	* @platformSections
	* - an array of section types and icons for the add section modal
	*/
	vm.enabledPlatformSections = _.where(vm.parentVm.state.platformSections, {
		enabled: true
	});

    /*
    * @userSections
    * - an array of sections created by current user
    */
    vm.enabledUserSections = _.where(vm.parentVm.state.userSections, {
        enabled: true
    });

    //initially show platform sections
    vm.sections = vm.enabledPlatformSections;
    vm.sectionType = 'enabledPlatformSections';

	/************************************************************************************************************
	* Takes the platformSections object and gets the value for the filter property from any that are enabled.
	* It then makes that list unique, sorts the results alphabetically, and and removes the misc value if
	* it exists. (The misc value is added back on to the end of the list later)
	************************************************************************************************************/
	vm.sectionFilters = _.without(_.uniq(_.pluck(_.sortBy(vm.enabledPlatformSections, 'filter'), 'filter')), 'misc');

	// Iterates through the array of filters and replaces each one with an object containing an
	// upper and lowercase version
	_.each(vm.sectionFilters, function (element, index) {
		sectionLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
		vm.sectionFilters[index] = {
		  'capitalized': sectionLabel,
		  'lowercase': element
		};
		sectionLabel = null;
	});

	// Manually add the All option to the begining of the list
	vm.sectionFilters.unshift({
		'capitalized': 'All',
		'lowercase': 'all'
	});

	// Manually add the Misc section back on to the end of the list
	// Exclude 'Misc' filter for emails
	vm.sectionFilters.push({
	  'capitalized': 'Misc',
	  'lowercase': 'misc'
	});

    vm.setFilterType = function (label) {
        vm.typefilter = label;
    };

    // type is 'enabledPlatformSections' or 'enabledUserSections'
	vm.setSectionType = function (type) {
        SimpleSiteBuilderService.getUserSections().then(function() {
            vm.sectionType = type;
            vm.sections = vm[type];
        })
	};

}]);
