(function(){

app.directive('ssbEditWrap', ssbEditWrap);

function ssbEditWrap() {

    return {
        restrict: 'C',
        // controller: 'SiteBuilderEditWrapController',
        // controllerAs: 'vm',
        // bindToController: true,
        link: function(scope, element, attrs, ctrl) {

            // element.on('mouseenter', function() {

            //     element.children().find('.editable-title:first').toggleClass('on');

            // });

            // element.on('mouseleave', function() {

            //     element.children().find('.editable-title:first').toggleClass('on');

            // });

            // element.on('click', function() {

            //     console.log('click');

            // })


        }
    };

}

})();
