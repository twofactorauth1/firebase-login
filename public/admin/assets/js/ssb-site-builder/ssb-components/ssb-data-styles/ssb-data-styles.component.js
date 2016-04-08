(function(){

app.directive('ssbDataStyles', ssbDataStyles);

ssbDataStyles.$inject = ['$timeout'];
/* @ngInject */
function ssbDataStyles($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs, ctrl) {

        // enabledynamicStyles(element);

        function enabledynamicStyles(ssbContainer) {

            angular.element(document).ready(function() {

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
                                bg: null
                            },
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
                            element.css({
                                'background-color': data.hover.bg.color,
                                'color': data.hover.txtcolor
                            })
                        }, function(){
                            element.css({
                                'background-color': originalData.bg.color,
                                'color': originalData.txtcolor
                            })
                        });

                        element.on("mousedown touchstart", function(){
                            element.css({
                                'background-color': data.hover.bg.color,
                                'color': data.hover.txtcolor
                            })
                        })

                    });

                }, 1000);

            });

        }

    }
  }

}


})();
