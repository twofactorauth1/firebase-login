'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService',
    function ($scope, pagesService) {

        var account, theme, website, pages, that = this;
        console.log('i m layout controller');
        $scope.componentUrls=[];
        $scope.pages=[];
        pagesService(function(err,data){
            $scope.pages=data;

            $scope.pages[0].components.forEach(function (cName) {
                cName.url=('components/' + cName.type + '_v' + cName.version + '.html');
            });
        });
        var componentName = ['masthead','feature-block','feature-list','[meet-team]','[testimonials]','blog-teaser','signup-form','social'];
    }]);
