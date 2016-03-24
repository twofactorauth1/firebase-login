(function(){

app.controller('SiteBuilderEditWrapController', ssbSiteBuilderEditWrapController);

ssbSiteBuilderEditWrapController.$inject = ['$scope', '$attrs', '$filter', '$timeout', '$q', 'SimpleSiteBuilderService', 'SweetAlert'];
/* @ngInject */
function ssbSiteBuilderEditWrapController($scope, $attrs, $filter, $timeout, $q, SimpleSiteBuilderService, SweetAlert) {

    var vm = this;

    vm.init = init;

    function init(element) {
    	vm.element = element;
    }

}

})();
