(function(){

app.directive('ssbImageGalleryComponent', ssbImageGalleryComponent);

function ssbImageGalleryComponent() {
  return {
  	// transclude: true,
  	restrict: 'A',
  	controller: 'SiteBuilderImageGalleryComponentController',
  	controllerAs: 'vm',
  	bindToController: true,
    scope: {
      ssbEditor: '=',
      componentClass: '&',
      component: '='
    },
    templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-image-gallery/ssb-image-gallery.component.html',
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();
