(function() {

    app.controller('EmailBuilderComponentLoaderController', emailbComponentLoaderController);

    emailbComponentLoaderController.$inject = ['$rootScope', '$scope', '$attrs', '$filter', '$timeout'];
    /* @ngInject */
    function emailbComponentLoaderController($rootScope, $scope, $attrs, $filter, $timeout) {

        console.info('component-loader directive init...');

        var vm = this;
        var pVm = $scope.$parent.vm;

        vm.ssbEditor = true;
        vm.components = pVm.state.email.components;

        $scope.component = vm.component;
        $scope.isEditing = true;
        $scope.website = vm.state.website;

        vm.init = init;
        vm.componentStyleFn = componentStyleFn;
        vm.isPx = isPx;
        function isPx(value){
            value = value.toString();
           return (value.indexOf('px') === -1) ? 'px;' : ';';
        }
        function componentStyleFn(component) {

            var styleString = ' ';

            if (component.bg) {

                if (component.bg.color) {
                    styleString += 'background-color: ' + component.bg.color + ';';
                }

                if (component.bg.img && component.bg.img.show && component.bg.img.url !== '') {
                    styleString += 'background-image: url("' + component.bg.img.url + '");';
                }

            }

            if (component && component.spacing) {

                if (component.spacing.pt) {

                    if (component.spacing.pt.indexOf("%") > -1) {
                        styleString += 'padding-top: ' + component.spacing.pt + ';';
                    } else {
                        styleString += 'padding-top: ' + component.spacing.pt + vm.isPx(component.spacing.pt);
                    }

                }

                if (component.spacing.pb) {
                    if (component.spacing.pb.indexOf("%") > -1) {
                        styleString += 'padding-bottom: ' + component.spacing.pb + ';';
                    } else {
                        styleString += 'padding-bottom: ' + component.spacing.pb + vm.isPx(component.spacing.pb);
                    }

                }

                if (component.spacing.pl) {
                    if (component.spacing.pl.indexOf("%") > -1) {
                        styleString += 'padding-left: ' + component.spacing.pl + ';';
                    } else {
                        styleString += 'padding-left: ' + component.spacing.pl +  vm.isPx(component.spacing.pl);
                    }

                }

                if (component.spacing.pr) {
                    if (component.spacing.pr.indexOf("%") > -1) {
                        styleString += 'padding-right: ' + component.spacing.pr + ';';
                    } else {
                        styleString += 'padding-right: ' + component.spacing.pr +  vm.isPx(component.spacing.pr);
                    }

                }

                if (component.spacing.mt) {

                    if (component.spacing.mt.indexOf("%") > -1) {
                        styleString += 'margin-top: ' + component.spacing.mt + ';';
                    } else {
                        styleString += 'margin-top: ' + component.spacing.mt +  vm.isPx(component.spacing.mt);
                    }
                }

                if (component.spacing.mb) {

                    if (component.spacing.mb.indexOf("%") > -1) {
                        styleString += 'margin-bottom: ' + component.spacing.mb + ';';
                    } else {
                        styleString += 'margin-bottom: ' + component.spacing.mb + vm.isPx(component.spacing.mb);
                    }

                }

                if (component.spacing.ml) {
                    styleString += component.spacing.ml == 'auto' ? 'margin-left: ' + component.spacing.ml + ';' : 'margin-left: ' + component.spacing.ml + vm.isPx(component.spacing.ml);
                }

                if (component.spacing.mr) {
                    styleString += (component.spacing.mr == 'auto') ? 'margin-right: ' + component.spacing.mr + ';' : 'margin-right: ' + component.spacing.mr + vm.isPx(component.spacing.mr);
                }


                styleString += "float:left;";

                if (component.spacing.mw) {

                       //apply max-width base on the px or %
                       component.spacing.mw = component.spacing.mw.toString();
                        if(component.spacing.mw == '100%' || component.spacing.mw == 'auto') {
                          styleString +=   'max-width: ' + component.spacing.mw + ';' ;
                        }
                        else{

                            var margin_custom = "";
                            if(component.spacing.ml === "auto" && component.spacing.mr === "auto"){
                                 var margin_custom = "margin-left:auto!important;margin-right:auto!important;";
                            }

                            if(component.spacing.mw && component.spacing.mw !== "" && component.spacing.mw.indexOf("%") === -1){
                               var isPx = "";
                               (component.spacing.mw.toLowerCase().indexOf('px') === -1) ? isPx="px" : isPx = "";
                               styleString +=  'max-width: ' + component.spacing.mw + isPx +';' + margin_custom;
                            }
                            else
                            {
                               styleString +=  'max-width: ' + component.spacing.mw + ';' + margin_custom;
                            }

                       }
                }

                if (component.spacing.lineHeight) {
                    styleString += 'line-height: ' + component.spacing.lineHeight;
                }

            }

            return styleString;

        }


        function init(element) {
            vm.element = element;
        }

    }

})();
