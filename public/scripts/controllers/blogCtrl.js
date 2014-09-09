'use strict';

mainApp.controller('BlogCtrl', ['$scope', 'postsService',
    function ($scope, postsService) {

        var account, pages, website, that = this;
        var blogposts = {};

        postsService(function(err, data){
            if(err) {
                console.log('BlogCtrl Error: ' + err);
            } else {
                console.log('got the data from postsService:');
                console.dir(data);
                blogposts = data;
                that.blogposts = data;
            }
        });


    }]);
