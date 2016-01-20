(function(){

app.controller('SiteBuilderPageSectionController', ssbPageSectionController);

ssbPageSectionController.$inject = ['$scope', '$attrs', '$filter', '$transclude'];
/* @ngInject */
function ssbPageSectionController($scope, $attrs, $filter, $transclude) {

  console.info('page-section directive init...')

  var vm = this;

  vm.init = init;
  vm.sectionClass = sectionClass;
  vm.sectionStyle = sectionStyle;
  vm.componentClass = componentClass;
  vm.componentStyle = componentStyle;

  //TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components

  function sectionClass(section) {
    var classString = 'col-xs-12 ';
    console.log('section.layout', section.layout);
    if (section.layout) {
        classString += 'ssb-page-section-layout-' + section.layout;
    }
    // console.debug('section classString')
    // console.debug(classString)
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

            /*
            TODO: implement all the inline-style and inline <style> stuff for sections
            bg:
                color: ""
                img:
                    blur: false
                    height: null
                    overlay: true
                    overlaycolor: "#d24d57"
                    overlayopacity: 60
                    parallax: false
                    show: true
                    url: "//s3.amazonaws.com/indigenous-digital-assets/account_1191/graph_paper_1447199316134.gif"
                    width: null
                opacity: 0.4

            */

            // .{{component.type}}{{component._id}} .bg-overlay {
            //     background: {{component.bg.img.overlaycolor || 'transparent'}}!important;
            //     opacity: {{component.bg.img.overlayopacity === 0 ? component.bg.img.overlayopacity : component.bg.img.overlayopacity/100 || 1}};
            // }
            // .{{component.type}}{{component._id}} {
            //     opacity: {{component.bg.opacity === 0 ? 0 : component.bg.opacity || 1}};
            // }

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
    var classString = 'col-xs-12';

    if (vm.section.layout === '1-col') {
      // classString += 'col-sm-12 ';
    }

    if (vm.section.layout === '2-col') {
      classString += ' col-md-6 ';
    }

    if (vm.section.layout === '3-col') {
      classString += ' col-md-4 ';
    }

    if (vm.section.layout === '4-col') {
      classString += ' col-md-3';
    }

    if (index) {
      classString += ' ssb-component-index-' + index + ' ';
    }


    if (vm.uiState && index === vm.uiState.activeComponentIndex) {
      classString += ' ssb-active-component ';
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
