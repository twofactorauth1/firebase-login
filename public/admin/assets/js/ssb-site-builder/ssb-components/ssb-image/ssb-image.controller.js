(function(){

app.controller('SiteBuilderImageComponentController', ssbImageComponentController);

ssbImageComponentController.$inject = ['$scope', '$attrs', '$filter', 'SimpleSiteBuilderService', '$stateParams', '$transclude'];
/* @ngInject */
function ssbImageComponentController($scope, $attrs, $filter, SimpleSiteBuilderService, $stateParams, $transclude) {

  console.info('ssb-image directive init...')

  var vm = this;

  vm.init = init;
  // vm.componentStyle = componentStyle;

  // function componentStyle(component) {
  //   var styleString = '';

  //   if (section.spacing) {
  //     if (section.spacing.pt) {
  //       styleString += 'padding-top: ' + section.spacing.pt + 'px;';
  //     }

  //     if (section.spacing.pt) {
  //       styleString += 'padding-bottom: ' + section.spacing.pb + 'px;';
  //     }

  //     if (section.spacing.pt) {
  //       styleString += 'padding-left: ' + section.spacing.pl + 'px;';
  //     }

  //     if (section.spacing.pt) {
  //       styleString += 'padding-right: ' + section.spacing.pr + 'px;';
  //     }

  //     if (section.spacing.pt) {
  //       styleString += 'margin-top: ' + section.spacing.mt + 'px;';
  //     }

  //     if (section.spacing.pt) {
  //       styleString += 'margin-bottom: ' + section.spacing.mb + 'px;';
  //     }

  //     if (section.spacing.pt) {
  //       styleString += 'margin-left: ' + section.spacing.ml == 'auto' ? section.spacing.ml: section.spacing.ml + 'px;';
  //     }

  //     if (section.spacing.pt) {
  //       styleString += 'margin-right: ' + section.spacing.mr == 'auto' ? section.spacing.mr : section.spacing.mr + 'px;';
  //     }

  //     if (section.spacing.pt) {
  //       styleString += 'max-width: ' + section.spacing.mw == '100%' ? section.spacing.mw : section.spacing.mw  + 'px;';
  //     }

  //     if (section.spacing.lineHeight) {
  //       styleString += 'line-height: ' + section.spacing.lineHeight;
  //     }
  //   }

  //   if (section.txtcolor) {
  //     styleString += 'color: ' + section.txtcolor + ';';
  //   }

  //   if (section.bg) {
  //     if (section.bg.color) {
  //       styleString += 'background-color: ' + section.bg.color + ';';
  //     }

  //     if (section.bg.img && section.bg.img.show) {
  //       styleString += 'background-image: url("' + section.bg.img.url + '")';
  //     }
  //   }

  //   return styleString;
  // }


  function init(element) {
  	vm.element = element;
  }

}


})();
