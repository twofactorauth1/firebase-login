(function(){

app.directive('ssbBlogEditor', ssbBlogEditor);

function ssbBlogEditor() {

    return {
        restrict: 'E',
        scope: {
            state: '=',
            uiState: '='
        },
        templateUrl: 'assets/js/ssb-site-builder/ssb-controls/ssb-blog-editor/ssb-blog-editor.component.html',
        controller: 'SiteBuilderBlogEditorController',
        controllerAs: 'vm',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element);
        }
    };

}

})();
