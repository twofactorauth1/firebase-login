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
  vm.sectionStyle = sectionStyle;

  //TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components

  function sectionClass(section) {
    var classString = '';

    classString += 'ssb-page-section-layout-' + section.layout;

    return classString;
  }

  function sectionStyle(section) {
    var styleString = '';

    if (section.spacing) {
      if (section.spacing.pt) {
        styleString += 'padding-top: ' + section.spacing.pt + 'px;';
      }

      if (section.spacing.pt) {
        styleString += 'padding-bottom: ' + section.spacing.pb + 'px;';
      }

      if (section.spacing.pt) {
        styleString += 'padding-left: ' + section.spacing.pl + 'px;';
      }

      if (section.spacing.pt) {
        styleString += 'padding-right: ' + section.spacing.pr + 'px;';
      }

      if (section.spacing.pt) {
        styleString += 'margin-top: ' + section.spacing.mt + 'px;';
      }

      if (section.spacing.pt) {
        styleString += 'margin-bottom: ' + section.spacing.mb + 'px;';
      }

      if (section.spacing.pt) {
        styleString += 'margin-left: ' + section.spacing.ml == 'auto' ? section.spacing.ml: section.spacing.ml + 'px;';
      }

      if (section.spacing.pt) {
        styleString += 'margin-right: ' + section.spacing.mr == 'auto' ? section.spacing.mr : section.spacing.mr + 'px;';
      }

      if (section.spacing.pt) {
        styleString += 'max-width: ' + section.spacing.mw == '100%' ? section.spacing.mw : section.spacing.mw  + 'px;';
      }

      if (section.spacing.lineHeight) {
        styleString += 'line-height: ' + section.spacing.lineHeight;
      }
    }

    if (section.txtcolor) {
      styleString += 'color: ' + section.txtcolor + ';';
    }

    if (section.bg) {
      if (section.bg.color) {
        styleString += 'background-color: ' + section.bg.color + ';';
      }

      if (section.bg.img && section.bg.img.show) {
        styleString += 'background-image: url("' + section.bg.img.url + '")';
      }
    }

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
