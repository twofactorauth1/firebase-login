(function(){

app.directive('ssbPageSection', ssbPageSection);

ssbPageSection.$inject = ['$compile'];
/* @ngInject */
function ssbPageSection($compile) {
  return {
  	// transclude: true,
  	restrict: 'E',
  	controller: 'SiteBuilderPageSectionController',
  	controllerAs: 'vm',
  	bindToController: true,
    scope: {
        section: '=',
        index: '=',
        state: '=',
        uiState: '=',
        sectionLayoutName: '=?',
        sectionLayoutIndex: '=?'
    },
    templateUrl: function(element, attrs) {
        var url = '/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html';
        if (attrs.uiState) {
            url = '/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.edit.html';
        }
        return url;
    },
    replace: true,
  	link: function (scope, element, attrs, ctrl) {
  		ctrl.init(element);
  	}
  }

}

})();
