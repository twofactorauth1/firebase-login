(function(){

app.directive('ssbCheckFixed', ssbCheckFixed);

ssbCheckFixed.$inject = ['$timeout'];
/* @ngInject */
function ssbCheckFixed($timeout) {
  return {
    restrict: 'C',
    link: function( scope, elem, attrs ) {    

        $timeout(function() {
            scope.$watch
            (
                function () {
                    return elem.height();
                },
                function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        if(elem.hasClass("ssb-fixed")){
                            var elemId = elem.attr("id").replace("section_", "");
                            var clonedElem =  angular.element("#clone_of_" + elemId);
                            if(clonedElem.length && clonedElem.hasClass("ssb-fixed-clone-element")){
                                clonedElem.height(newValue);
                            }
                        }
                    }
                }
            );
        }, 200)    
        
    }
  }

}


})();

