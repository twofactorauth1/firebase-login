(function(){

app.directive('ssbNavigationComponentLoader', ssbNavigationComponentLoader);

ssbNavigationComponentLoader.$inject = ['$compile'];
/* @ngInject */
function ssbNavigationComponentLoader($compile) {
  return {
    restrict: 'E',
    templateUrl: function(element, attrs, scope) {
      return '/admin/assets/js/ssb-site-builder/ssb-components/shared/link_2.html';
    },
    replace: true
  }
}

})();
