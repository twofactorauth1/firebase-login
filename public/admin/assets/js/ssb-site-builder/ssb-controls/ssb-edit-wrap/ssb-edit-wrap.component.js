(function(){

app.directive('ssbEditWrap', ssbEditWrap);

function ssbEditWrap() {

    return {
        restrict: 'C',
        // controller: 'SiteBuilderEditWrapController',
        // controllerAs: 'vm',
        // bindToController: true,
        link: function(scope, element, attrs, ctrl) {

            element.on('mouseenter', function() {

                angular.element('.ssb-edit-wrap').removeClass('on');
                element.toggleClass('on');

                angular.element('.editable-title').removeClass('on');
                element.find('> .editable-title:first').toggleClass('on');

                console.log(element.find('> .editable-title:first'))

            });

            element.on('mouseleave', function() {

                element.toggleClass('on');
                element.find('.editable-title:first').toggleClass('on');
                console.log(element.find('> .editable-title:first'))

            });

            element.on('click', function() {

                console.log(element);

                //show pen


            })


        }
    };

}

})();
