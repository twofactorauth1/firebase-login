'use strict';

mainApp.controller('MainCtrl', ['$scope', 'accountService', 'themeService', 'pagesService', 'ENV', '$location', '$document', '$anchorScroll', '$window',
    function ($scope, accountService, themeService, pagesService, ENV, $location, $document, $anchorScroll, $window) {

        var account, pages, website, that = this;
        that.segmentIOWriteKey = ENV.segmentKey;

        var body = document.body,
        html = document.documentElement;

        var height = Math.max(body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight);
        $scope.minHeight = height;

        $scope.isSection = function(value) {
            if (value == 'section') {
              return true;
            } else {
              return false;
            }
        };

        accountService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
            } else {
                account = data;

                //Include Layout For Theme
                // that.themeUrl = 'components/layout/layout_' + account.website.themeId + '.html';
            }
        });

       // pagesService(function (err, data) {
         //   if (err) {
           //     console.log('Controller:MainCtrl -> Method:pageService Error: ' + err);
       //     } else {
       //         pages = data;
       //
       //         //Set Page Title
       //         that.pageName = pages.title;
       //     }
       // });

        
        //  window.updateWebsite = function(data) {
        //     console.log('data recieved >>> ', data);
        //     $scope.account.website = data;
        //     $scope.$apply(function() {
        //         $scope.primaryColor = data.settings.primary_color;
        //         $scope.primaryHighlight = data.settings.primary_highlight;
        //         $scope.secondaryColor = data.settings.secondary_color;
        //         $scope.navHover = data.settings.nav_hover;
        //         $scope.primaryTextColor = data.settings.primary_text_color;
        //         $scope.fontFamily = data.settings.font_family;
        //         $scope.fontFamily2 = data.settings.font_family_2;
        //     });
        // };

        $scope.course = {"_id":1,"title":"7 Day Podcasting Quick Start with Pat Flynn","template":{"name":"minimalist"},"subdomain":"podcasting","subtitle":"Get started on the right foot","body":"This mini course was created in less than 5 minutes using the video auto responder functionality built into the Indigenous Software platform. We hope you enjoy the content and look forward to showing how can can produce your own mini courses just as quickly!","description":"","price":50,"showExitIntentModal":false,"videos":[{"videoId":"xu2QNUY5iyk","subject":"","videoUrl":"http://youtube.com/watch?v=xu2QNUY5iyk","videoTitle":"Podcasting Tutorial - Video 1: Equipment and Software","videoSubtitle":"Subtitle","videoBody":"body","videoPreviewUrl":"https://i.ytimg.com/vi/xu2QNUY5iyk/mqdefault.jpg","videoBigPreviewUrl":"https://i.ytimg.com/vi/xu2QNUY5iyk/sddefault.jpg","scheduledHour":8,"scheduledMinute":0,"scheduledDay":0,"_id":null},{"videoId":"n2PvnsnEzqE","subject":"","videoUrl":"http://youtube.com/watch?v=n2PvnsnEzqE","videoTitle":"Podcasting Tutorial - Video 2: My Top 10 Recording Tips","videoSubtitle":"Subtitle","videoBody":"body","videoPreviewUrl":"https://i.ytimg.com/vi/n2PvnsnEzqE/mqdefault.jpg","videoBigPreviewUrl":"https://i.ytimg.com/vi/n2PvnsnEzqE/sddefault.jpg","scheduledHour":8,"scheduledMinute":0,"scheduledDay":1,"_id":null},{"videoId":"u-pc8aX_ie8","subject":"","videoUrl":"http://youtube.com/watch?v=u-pc8aX_ie8","videoTitle":"Podcasting Tutorial - Video 3: Exporting and Tagging","videoSubtitle":"Subtitle","videoBody":"body","videoPreviewUrl":"https://i.ytimg.com/vi/u-pc8aX_ie8/mqdefault.jpg","videoBigPreviewUrl":"https://i.ytimg.com/vi/u-pc8aX_ie8/sddefault.jpg","scheduledHour":8,"scheduledMinute":0,"scheduledDay":2,"_id":null},{"videoId":"lQvftgRnuC8","subject":"","videoUrl":"http://youtube.com/watch?v=lQvftgRnuC8","videoTitle":"Podcasting Tutorial - Video 4: Web and Media Hosting","videoSubtitle":"Subtitle","videoBody":"body","videoPreviewUrl":"https://i.ytimg.com/vi/lQvftgRnuC8/mqdefault.jpg","videoBigPreviewUrl":"https://i.ytimg.com/vi/lQvftgRnuC8/sddefault.jpg","scheduledHour":8,"scheduledMinute":0,"scheduledDay":3,"_id":null},{"videoId":"Ei67QMWD4MA","subject":"","videoUrl":"http://youtube.com/watch?v=Ei67QMWD4MA","videoTitle":"Podcasting Tutorial - Video 5: Setting Up Your Podcast Feed and Publishing Your 1st Episode","videoSubtitle":"Subtitle","videoBody":"body","videoPreviewUrl":"https://i.ytimg.com/vi/Ei67QMWD4MA/mqdefault.jpg","videoBigPreviewUrl":"https://i.ytimg.com/vi/Ei67QMWD4MA/sddefault.jpg","scheduledHour":8,"scheduledMinute":0,"scheduledDay":4,"_id":null},{"videoId":"HwlRTYNp36U","subject":"","videoUrl":"http://youtube.com/watch?v=HwlRTYNp36U","videoTitle":"Podcasting Tutorial - Video 6: Submitting Your Feed to iTunes and Other Directories","videoSubtitle":"Subtitle","videoBody":"body","videoPreviewUrl":"https://i.ytimg.com/vi/HwlRTYNp36U/mqdefault.jpg","videoBigPreviewUrl":"https://i.ytimg.com/vi/HwlRTYNp36U/sddefault.jpg","scheduledHour":8,"scheduledMinute":0,"scheduledDay":5,"_id":null},{"videoId":"-8_DMQPIwYs","subject":"","videoUrl":"http://youtube.com/watch?v=-8_DMQPIwYs","videoTitle":"Podcasters' Roundtable - Round 10 - Podcasting \"Success\" with Pat Flynn","videoSubtitle":"Subtitle","videoBody":"body","videoPreviewUrl":"https://i.ytimg.com/vi/-8_DMQPIwYs/mqdefault.jpg","videoBigPreviewUrl":"https://i.ytimg.com/vi/-8_DMQPIwYs/sddefault.jpg","scheduledHour":8,"scheduledMinute":0,"scheduledDay":6,"_id":null},{"videoId":"UYw51wdwh28","subject":"","videoUrl":"http://youtube.com/watch?v=UYw51wdwh28","videoTitle":"How To Build A Successful Podcast ( Interview with Pat Flynn of Smart Passive Income and Ask Pat)","videoSubtitle":"Subtitle","videoBody":"body","videoPreviewUrl":"https://i.ytimg.com/vi/UYw51wdwh28/mqdefault.jpg","videoBigPreviewUrl":"https://i.ytimg.com/vi/UYw51wdwh28/sddefault.jpg","scheduledHour":8,"scheduledMinute":0,"scheduledDay":7,"_id":null}],"userId":6,"accountId":null};
    }]);
