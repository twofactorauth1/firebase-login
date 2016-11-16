(function(){

app.directive('ssbWaitPageContentLoad', ssbWaitPageContentLoad);

ssbWaitPageContentLoad.$inject = ['$timeout'];
/* @ngInject */
function ssbWaitPageContentLoad($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs, ctrl) {

        displayPageConent(element);

        function displayPageConent(ssbContainer) {
            angular.element(document).ready(function() {
                $timeout(function(){
                    element.removeClass("ssb-page-wait-data-include");
                },1000)
            });
        }

    }
  }

}


})();
