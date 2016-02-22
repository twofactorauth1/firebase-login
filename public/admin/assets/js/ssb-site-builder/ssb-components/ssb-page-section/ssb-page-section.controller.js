(function(){

app.controller('SiteBuilderPageSectionController', ssbPageSectionController);

ssbPageSectionController.$inject = ['$scope', '$attrs', '$filter', '$transclude'];
/* @ngInject */
function ssbPageSectionController($scope, $attrs, $filter, $transclude) {

    console.info('page-section directive init...')

    var vm = this;

    vm.init = init;
    vm.sectionClass = sectionClass;
    vm.sectionBGClass = sectionBGClass;
    vm.sectionStyle = sectionStyle;
    vm.sectionBGStyle = sectionBGStyle;
    vm.componentClass = componentClass;
    vm.componentStyle = componentStyle;
    vm.sectionHasFooter = sectionHasFooter;

    //TODO: use https://github.com/martinandert/react-inline to generate inline styles for sections/components

    function sectionClass(section) {
        var classString = 'container-fluid '; //col-xs-12 was messing up legacy
        if(section){
            var title = section.title || section.name;
            var version = section.version;

            if (title) {

                classString += ' ssb-page-section-' + $filter('slugify')(title);

                if (version) {
                    classString += ' ssb-page-section-' + $filter('slugify')(title); + '-v' + version;
                }

            }

            if (section.layout) {

                classString += ' ssb-page-section-layout-' + section.layout;

                if (version) {
                    classString += ' ssb-page-section-layout-' + section.layout + '-v' + version;
                }

            }

            if (section.layoutModifiers) {

                if (section.layoutModifiers.fixed) {

                    classString += ' ssb-page-section-layout-' + section.layout + '-fixed';

                }

                // if (section.layoutModifiers.sidePadding0) {

                //     classString += ' ssb-page-section-layout-side-padding-0';

                // }

            }

            if (vm.sectionHasFooter(section)) {
                classString += ' ssb-page-section-layout-overflow-visible';
            }
        }   
        // console.debug('section classString')
        // console.debug(classString)

        return classString;
    }

    function sectionBGClass(section) {
        var classString = ' ';


        if (section && section.bg) {

            if (section.bg.img && section.bg.img.blur) {
                classString += ' blur-image';
            }

            if (section.bg.img && section.bg.img.parallax) {
                classString += ' parallax';
            }

        }

        return classString;
    }

    function sectionStyle(section) {
        var styleString = ' ';

        if (section && section.spacing) {
            if (section.spacing.pt) {
                styleString += 'padding-top: ' + section.spacing.pt + 'px;';
            }

            if (section.spacing.pb) {
                styleString += 'padding-bottom: ' + section.spacing.pb + 'px;';
            }

            if (section.spacing.pl) {
                styleString += 'padding-left: ' + section.spacing.pl + 'px;';
            }

            if (section.spacing.pr) {
                styleString += 'padding-right: ' + section.spacing.pr + 'px;';
            }

            if (section.spacing.mt) {
                styleString += 'margin-top: ' + section.spacing.mt + 'px;';
            }

            if (section.spacing.mb) {
                styleString += 'margin-bottom: ' + section.spacing.mb + 'px;';
            }

            if (section.spacing.ml) {
                styleString += section.spacing.ml == 'auto' ? 'margin-left: ' + section.spacing.ml + ';float: none;' : 'margin-left: ' + section.spacing.ml + 'px;';
            }

            if (section.spacing.mr) {
                styleString += (section.spacing.mr == 'auto') ? 'margin-right: ' + section.spacing.mr + ';float: none;' : 'margin-right: ' + section.spacing.mr + 'px;';
            }

            if (section.spacing.mw) {
                styleString += (section.spacing.mw == '100%') ?
                    'max-width: ' + section.spacing.mw + ';' :
                    'max-width: ' + section.spacing.mw  + 'px;margin:0 auto!important;';
            }

            if (section.spacing.lineHeight) {
                styleString += 'line-height: ' + section.spacing.lineHeight;
            }

        }

        if (section && section.txtcolor) {
            styleString += 'color: ' + section.txtcolor + ';';
        }

        return styleString;
    }

    function sectionBGStyle(section) {
        var styleString = ' ';

        if (section && section.bg) {

            /*
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

            if (section.bg.color) {
                styleString += 'background-color: ' + section.bg.color + ';';
            }

            if (section.bg.img && section.bg.img.show && section.bg.img.url && section.bg.img.url !== '') {
                styleString += 'background-image: url("' + section.bg.img.url + '")';
            }

        }

        return styleString;
    }

    function componentClass(component, index) {
        var classString = 'container-fluid ';

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
    var styleString = ' ';

    if (component.spacing) {
        if (component.spacing.pt) {
            styleString += 'padding-top: ' + component.spacing.pt + 'px;';
        }

        if (component.spacing.pb) {
            styleString += 'padding-bottom: ' + component.spacing.pb + 'px;';
        }

        if (component.spacing.pl) {
            styleString += 'padding-left: ' + component.spacing.pl + 'px;';
        }

        if (component.spacing.pr) {
            styleString += 'padding-right: ' + component.spacing.pr + 'px;';
        }

        if (component.spacing.mt) {
            styleString += 'margin-top: ' + component.spacing.mt + 'px;';
        }

        if (component.spacing.mb) {
            styleString += 'margin-bottom: ' + component.spacing.mb + 'px;';
        }

        if (component.spacing.ml) {
            styleString += component.spacing.ml == 'auto' ? 'margin-left: ' + component.spacing.ml + ';float: none;' : 'margin-left: ' + component.spacing.ml + 'px;';
        }

        if (component.spacing.mr) {
            styleString += (component.spacing.mr == 'auto') ? 'margin-right: ' + component.spacing.mr + ';float: none;' : 'margin-right: ' + component.spacing.mr + 'px;';
        }

        if (component.spacing.mw) {
            styleString += (component.spacing.mw == '100%') ?
                'max-width: ' + component.spacing.mw + ';' :
                'max-width: ' + component.spacing.mw  + 'px;margin:0 auto!important;';
        }

        if (component.spacing.lineHeight) {
            styleString += 'line-height: ' + component.spacing.lineHeight;
        }
    }

    if (component.txtcolor) {
        styleString += 'color: ' + component.txtcolor + ';';
    }

    if (component.visibility === false) {
        styleString += 'display: none!important;';
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


    function setFixedPosition(state) {

        var mainEl = vm.element.parents('.ssb-main:first');
        var elementHeight = vm.element.height();

        if (state === 'on') {

            mainEl.css({
                'padding-top': elementHeight
            });

        } else {
            mainEl.css({
                'padding-top': ''
            });
        }

    }

    function sectionHasFooter(section) {
        return _.findWhere(section.components, { type: 'footer' });
    }

    function init(element) {
        vm.element = element;
    }

}


})();
