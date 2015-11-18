(function(){

app.controller('SiteBuilderPageSectionController', ssbPageSectionController);

ssbPageSectionController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams', '$transclude'];
/* @ngInject */
function ssbPageSectionController($scope, $attrs, $filter, SimpleSiteBuilderService, $stateParams, $transclude) {

  console.info('page-section directive init...')

  var vm = this;

  vm.init = init;
  vm.componentClass = componentClass;
  vm.sectionClass = sectionClass;

  //TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components

  function sectionClass(section) {
    var classString = '';

    classString += 'ssb-page-section-layout-' + layout];

    return classString;
  }

  function sectionStyle(section) {
    var styleString = '';

    styleString += 'padding-top: ' + component.spacing.pt + 'px;';
    styleString += 'padding-bottom: ' + component.spacing.pb + 'px;';
    styleString += 'padding-left: ' + component.spacing.pl + 'px;';
    styleString += 'padding-right: ' + component.spacing.pr + 'px;';
    styleString += 'margin-top: ' + component.spacing.mt + 'px;';
    styleString += 'margin-bottom: ' + component.spacing.mb + 'px;';
    styleString += 'margin-left: ' + component.spacing.ml == 'auto' ? component.spacing.ml: component.spacing.ml + 'px;';
    styleString += 'margin-right: ' + component.spacing.mr == 'auto' ? component.spacing.mr : component.spacing.mr + 'px;';
    styleString += 'max-width: ' + component.spacing.mw == '100%' ? component.spacing.mw : component.spacing.mw  + 'px;';

    return styleString;
  }

  function componentClass(index) {
    // console.log('index: ' + index);
    // console.log('vm.uiState.activeComponentIndex: ' + vm.uiState.activeComponentIndex);
    var classObj = {
        'ssb-active-component': (index === vm.uiState.activeComponentIndex)
        // 'ssb-active-component': (index === vm.page.sections[vm.uiState.activeComponentIndex].components[vm.uiState.activeComponentIndex])
    };

    if (vm.section.layout === '1-col') {
        classObj['col-md-12'] = true;
    }

    if (vm.section.layout === '2-col') {
        classObj['col-md-6'] = true;
    }

    if (vm.section.layout === '3-col') {
        classObj['col-md-4'] = true;
    }

    classObj['ssb-component-index-' + index] = true;

    return classObj;
  }

  function init(element) {
  	vm.element = element;
  }

}


})();
