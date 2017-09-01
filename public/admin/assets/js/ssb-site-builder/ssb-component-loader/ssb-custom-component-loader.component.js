(function(){

app.directive('ssbCustomComponentLoader', ssbCustomComponentLoader);

ssbCustomComponentLoader.$inject = ['$compile'];
/* @ngInject */
function ssbCustomComponentLoader($compile) {
  return {
    restrict: 'E',
    templateUrl: function(element, attrs, scope) {
      return '/admin/assets/js/ssb-site-builder/ssb-components/ssb-nav-hero/ssb-nav-hero.layout.v1.html';
    }
  }
}

})();