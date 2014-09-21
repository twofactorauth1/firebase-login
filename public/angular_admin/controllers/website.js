define(['app', 'websiteService'], function(app) {
    app.register.controller('WebsiteCtrl', ['$scope', '$window', 'WebsiteService', function ($scope, $window, WebsiteService) {
        var iFrame = document.getElementById("iframe-website");
        console.log('iFrame: ', iFrame);

        $scope.resfeshIframe = function() {
            iFrame.attr("src",iFrame.attr("src"));
        };

        var iframe_contents = iFrame.contentWindow.document.body.innerHTML;
        console.log('iFrame Contents: ', iframe_contents);

         WebsiteService.getWebsite(function (website) {
            console.log('website service: ', website);
            // $scope.user = user;
            // $scope.fullName = [user.first, user.middle, user.last].join(' ');
            // if (!$scope.user.details[0].phones.length)
            //     $scope.user.details[0].phones.push({_id: $$.u.idutils.generateUniqueAlphaNumericShort(), number: '', default: false, type: 'm'});
            // $scope.user.details[0].phones.forEach(function (value, index) {
            //     $scope.userPhoneWatchFn(index);
            // });
        });

    }]);
});
