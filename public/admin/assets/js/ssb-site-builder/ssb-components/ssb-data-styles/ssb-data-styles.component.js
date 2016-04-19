(function(){

app.directive('ssbDataStyles', ssbDataStyles);

ssbDataStyles.$inject = ['$timeout'];
/* @ngInject */
function ssbDataStyles($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs, ctrl) {

        enabledynamicStyles(element);

        function enabledynamicStyles(ssbContainer) {

            angular.element(document).ready(function() {

                var unbindWatcher = scope.$watch(function() {
                    return angular.element('.ssb-theme-btn').length;
                }, function(newValue, oldValue) {
                    if (newValue) {
                        unbindWatcher();
                        $timeout(function() {
                            var elements = angular.element('.ssb-theme-btn');
                            elements.each(function() {
                                var element = $(this);

                                var data = {
                                    hover: {
                                        bg: {
                                            color: null
                                        }
                                    },
                                    pressed: {
                                        bg: {
                                            color: null
                                        }
                                    }
                                };

                                var originalData = {
                                    bg: {
                                        color: element.css('background-color')
                                    },
                                    txtcolor: element.css('color')
                                };

                                var ssbHoverStyle = element.attr('data-ssb-hover-style');
                                var ssbActiveStyle = element.attr('data-ssb-active-style');



                                if (ssbHoverStyle) {
                                    var hoverStyleEl = $('<div style="' + ssbHoverStyle + '"></div>');
                                    var hoverStyle = hoverStyleEl.get(0).style;
                                    var hoverbgcolor = hoverStyle.backgroundColor;
                                    var hovertxtcolor = hoverStyle.color;

                                    data.hover.bg.color = hoverbgcolor;
                                    data.hover.txtcolor = hovertxtcolor;
                                }

                                if (ssbActiveStyle) {
                                    var activeStyleEl = $('<div style="' + ssbActiveStyle + '"></div>');
                                    var activeStyle = activeStyleEl.get(0).style;
                                    var activebgcolor = activeStyle.backgroundColor;
                                    var activetxtcolor = activeStyle.color;

                                    data.pressed.bg.color = activebgcolor;
                                    data.pressed.txtcolor = activetxtcolor;
                                }

                                // bind hover and active events to button
                                element.hover(function(){
                                    this.style.setProperty( 'background-color', data.hover.bg.color, 'important' );
                                    this.style.setProperty( 'color', data.hover.txtcolor, 'important' );

                                }, function(){
                                    this.style.setProperty( 'background-color', originalData.bg.color, 'important' );
                                    this.style.setProperty( 'color', originalData.txtcolor, 'important' );
                                });

                                element.on("mousedown touchstart", function(){
                                    this.style.setProperty( 'background-color', data.pressed.bg.color, 'important' );
                                    this.style.setProperty( 'color', data.pressed.txtcolor, 'important' );
                                })

                            });

                        }, 1500);
                    }
                });
            });
        }

    }
  }

}


})();
