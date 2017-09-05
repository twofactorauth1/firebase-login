(function(){

app.directive('ssbCustomComponentLoader', ssbCustomComponentLoader);

ssbCustomComponentLoader.$inject = ['$compile'];
/* @ngInject */
function ssbCustomComponentLoader($compile) {
  return {
    restrict: 'EA',
	link: function(scope, element, attrs) {
        contentUrl = attrs.template;
    }
  }
}

})();
