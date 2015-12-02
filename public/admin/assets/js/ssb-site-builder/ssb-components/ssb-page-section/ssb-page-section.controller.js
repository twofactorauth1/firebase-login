(function(){

app.controller('SiteBuilderPageSectionController', ssbPageSectionController);

ssbPageSectionController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams', '$transclude'];
/* @ngInject */
function ssbPageSectionController($scope, $attrs, $filter, SimpleSiteBuilderService, $stateParams, $transclude) {

  console.info('page-section directive init...')

  var vm = this;

  vm.init = init;
  vm.sectionClass = sectionClass;
  vm.sectionStyle = sectionStyle;
  vm.componentClass = componentClass;
  vm.componentStyle = componentStyle;

  //TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components

  function sectionClass(section) {
    var classString = '';

    if (section.layout) {
        classString += 'ssb-page-section-layout-' + section.layout;
    }

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

      if (section.bg.img && section.bg.img.show && section.bg.img.url !== '') {
        styleString += 'background-image: url("' + section.bg.img.url + '")';
      }
    }

    return styleString;
  }

  function componentClass(component, index) {
    var classString = '';

    if (vm.section.layout === '1-col') {
      classString += 'col-md-12 ';
    }

    if (vm.section.layout === '2-col') {
      classString += 'col-md-6 ';
    }

    if (vm.section.layout === '3-col') {
      classString += 'col-md-4 ';
    }

    if (vm.section.layout === '4-col') {
      classString += 'col-md-3';
    }

    if (index) {
      classString += 'ssb-component-index-' + index + ' ';
    }

    if (index === vm.uiState.activeComponentIndex) {
      classString += 'ssb-active-component ';
    }

    return classString;

  }

  function componentStyle(component) {
    var styleString = '';

    if (component.spacing) {
      if (component.spacing.pt) {
        styleString += 'padding-top: ' + component.spacing.pt + 'px;';
      }

      if (component.spacing.pt) {
        styleString += 'padding-bottom: ' + component.spacing.pb + 'px;';
      }

      if (component.spacing.pt) {
        styleString += 'padding-left: ' + component.spacing.pl + 'px;';
      }

      if (component.spacing.pt) {
        styleString += 'padding-right: ' + component.spacing.pr + 'px;';
      }

      if (component.spacing.pt) {
        styleString += 'margin-top: ' + component.spacing.mt + 'px;';
      }

      if (component.spacing.pt) {
        styleString += 'margin-bottom: ' + component.spacing.mb + 'px;';
      }

      if (component.spacing.pt) {
        styleString += 'margin-left: ' + component.spacing.ml == 'auto' ? component.spacing.ml: component.spacing.ml + 'px;';
      }

      if (component.spacing.pt) {
        styleString += 'margin-right: ' + component.spacing.mr == 'auto' ? component.spacing.mr : component.spacing.mr + 'px;';
      }

      if (component.spacing.pt) {
        styleString += 'max-width: ' + component.spacing.mw == '100%' ? component.spacing.mw : component.spacing.mw  + 'px;';
      }

      if (component.spacing.lineHeight) {
        styleString += 'line-height: ' + component.spacing.lineHeight;
      }
    }

    if (component.txtcolor) {
      styleString += 'color: ' + component.txtcolor + ';';
    }

    if (component.bg) {
      if (component.bg.color) {
        styleString += 'background-color: ' + component.bg.color + ';';
      }

      if (component.bg.img && component.bg.img.show && component.bg.img.url !== '') {
        styleString += 'background-image: url("' + component.bg.img.url + '")';
      }
    }

    return styleString;
  }

  function init(element) {
  	vm.element = element;
  }

}


})();
