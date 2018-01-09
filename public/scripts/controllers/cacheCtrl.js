/*global mainApp, console, indigenous, window, document , angular ,$ */
mainApp.controller('CacheCtrl', ['$scope', '$rootScope', 'embeddedSiteDataService', 'SsbPageSectionService', '$window', '$location', '$document', '$timeout', function ($scope, $rootScope, embeddedSiteDataService, SsbPageSectionService, $window, $location, $document, $timeout) {
	'use strict';
	$scope.isEditing = false;
	$scope.blog_post = null;
	console.log('cache ctrl');
	var firstheroNavId;
	/*
	function checkIntercom(data) {
	    if (data.hideIntercom) {
	        $scope.$parent.hideIntercom = true;
	    }
	}*/
	$scope.addUnderNavSetting = function (masthead_id, fn) {
		var data = {
			allowUndernav: false,
			navComponent: null
		};

		if ($scope.components && $scope.components.length > 0) {
			$scope.components.forEach(function (value, index) {
				if (value && value.type === 'masthead' && value._id == masthead_id && $scope.components[index - 1]) {
					if (index !== 0 && $scope.components[index - 1].type === "navigation") {
						data.allowUndernav = true;
						data.navComponent = $scope.components[index - 1];
					} else {
						data.allowUndernav = false;
					}
				}
			});
		} else if ($scope.sections && $scope.sections.length > 0) {
			$scope.sections.forEach(function (sectionValue, sectionIndex) {
				sectionValue.components.forEach(function (value) {
					if (value && value.type === 'masthead' && value._id == masthead_id && $scope.sections[sectionIndex - 1]) {
						var navComponent = _.findWhere($scope.sections[sectionIndex - 1].components, {
							type: 'navigation'
						});
						if (sectionIndex !== 0 && navComponent !== undefined) {
							data.allowUndernav = true;
							data.navComponent = navComponent;
						} else {
							data.allowUndernav = false;
						}
					}
				});
			});
		}
		fn(data);
	};

	$scope.defaultSpacings = {
		'pt': 0,
		'pb': 0,
		'pl': 0,
		'pr': 0,
		'mt': 0,
		'mb': 0,
		'mr': 'auto',
		'ml': 'auto',
		'mw': '100%',
		'usePage': false
	};

	$scope.$on('getCurrentPage', function (event, args) {
		args.currentpage = $scope.page;
	});


	$scope.components = [];
	embeddedSiteDataService.getPageData($scope.websiteId, function (err, data) {
		console.log('pagesService ', data);		
		if (err) {
			console.warn('no page found', $location.$$path);
			if ($location.$$path === '/login') {
				$window.location.href = '/login';
			} else {
				$window.location.reload();
			}

		} else {			
			$scope.page = data;			
			$scope.sections = data.sections;
			_.each(data.sections, function (section, index1) {
				if (section) {
					
					if (section.ssb === false) {
						$scope.components = $scope.components.concat(section.components);
					} else {
						//this is what the template should be:
						//<ssb-page-section section="section" index="$index" class="ssb-page-section"></ssb-page-section>
						$scope['sections_' + index1] = section;
					}
					if(section.layout== "nav-hero" && firstheroNavId==undefined){
					    firstheroNavId="section_"+section._id;
					}
				}
			});		
			$rootScope.title = $scope.page.title;
			$rootScope.pageHandle = $scope.page.handle;	
			$window.indigenous.firstVisibleElement=false;
			SsbPageSectionService.setSectionOffset(0);
			_.each($scope.components, function (cmp, index) {
				$scope['components_' + index] = cmp;
			});
			console.log('$scope.components_0:', $scope.components_0);

			if (data.handle === 'single-post') {
				var post_component = _.findWhere($scope.page.components, {
					type: 'single-post'
				});
				if (post_component) {
					$scope.blog_post = post_component;
				}
			}

			angular.element(document).ready(function () {
				$document.scrollTop(0);
				$timeout(function () {
					if ($location.$$hash) {
						var unbindWatcher = $scope.$watch(function() {
                			return document.getElementById($location.$$hash) 
                			|| document.getElementById("section_" + $location.$$hash) 
                			|| document.getElementById("component_" + $location.$$hash)
		            	}, function(newValue, oldValue) {
			                if (newValue) {
			                	unbindWatcher();
								var waitTime = 1000;
								if(firstheroNavId){
									waitTime = 2000;
								}
								if(SsbPageSectionService.isSticky)
									waitTime = 2000;
								
			                	$timeout(function() {
			                		var element = document.getElementById($location.$$hash);
									if (!element) {
										element = document.getElementById("section_" + $location.$$hash);
									}
									if (!element) {
										element = document.getElementById("component_" + $location.$$hash);
									}
									if (element) {									
				                       $document.scrollToElementAnimated(element, SsbPageSectionService.offset, 1000);
									}

			                	}, waitTime);
			                }
		            	});
					}
					$(window).on('hashchange', function () { 
						var $anchor = $(':target');
						if ($anchor.length > 0) {
							var element = document.getElementById($anchor.attr('id'));
							if (!element) {
								element = document.getElementById("section_" + $anchor.attr('id'));
							}
							if (!element) {
								element = document.getElementById("component_" + $anchor.attr('id'));
							}
							$document.scrollTop(0);
							$timeout(function () {
								$document.scrollToElementAnimated(element, SsbPageSectionService.offset, 1000);
							}, 200);
						}else{
							var hashElement= document.getElementById($location.$$hash) 
                			|| document.getElementById("section_" + $location.$$hash) 
							|| document.getElementById("component_" + $location.$$hash);
							if(hashElement){
								$timeout(function() { 								
				                       $document.scrollToElementAnimated(hashElement, SsbPageSectionService.offset, 1000); 
			                	}, 100);
							}
						}
					}); 
					$(window).on('scroll', function () {   
						if (angular.element(".sticky-wrapper.is-sticky").length>0){
							angular.element(".ssb-fixed-first-element").hide();
						}else{
							angular.element(".ssb-fixed-first-element").show();
						} 
					});
					$('a[du-smooth-scroll]:not(.ssb-sub-nav-menu)').on('click', function(event) {
						var hash = this.hash;  
						if(hash){
							hash=hash.substring(1);
							var hashElement= document.getElementById(hash);
							if(!hashElement){ 
								event.preventDefault();
								hashElement= document.getElementById("section_" + hash) 
									|| document.getElementById("component_" + hash);
								if(hashElement){
									$timeout(function() { 								
										$document.scrollToElementAnimated(hashElement, SsbPageSectionService.offset, 1000); 
									}, 100);
								}
							} 
						} 	
					});
				}, 0);
			});
		}
	});

}]);
