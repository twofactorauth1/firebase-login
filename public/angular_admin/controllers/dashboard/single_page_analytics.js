define(['app', 'ngProgress', 'formatCurrency', 'highcharts', 'highcharts-ng', 'websiteService', 'userService', 'keenService', 'heatmapjs', 'checkImageDirective'], function(app) {
    app.register.controller('SinglePageAnalyticsCtrl', ['$scope', '$location', 'ngProgress', 'WebsiteService', 'UserService', 'keenService', function($scope, $location, ngProgress, WebsiteService, UserService, keenService) {
        ngProgress.start();

        $scope.$back = function() {
            window.history.back();
        };

        console.log('$route.current.params.postname >>> ', $location.$$search['pageurl']);
        var pageurl = $location.$$search['pageurl'];
        if (pageurl.indexOf('/page/') != -1  && pageurl.indexOf('blog') == -1) {
        	var handle = pageurl.replace('/page/', '');
        }
        if (pageurl === '/') {
            var handle = 'index';
        }

        //determine if page or post
        //get single page object
        UserService.getAccount(function(account) {
	        WebsiteService.getSinglePage(account.website.websiteId, handle, function(data) {
	        	console.log('data >>> ', data);
	        	$scope.page = data;
	        	ngProgress.complete();

                //get single page analytics
                var params = {
                    event_collection: 'page_data',
                    filters: [
                        {
                            "property_name": "url.domain",
                            "operator": "eq",
                            "property_value": "main.indigenous.local"
                        },
                        {
                            "property_name": "url.path",
                            "operator": "eq",
                            "property_value": pageurl
                        }
                    ]
                };

                $scope.heatmapData = [];

                keenService.singleExtraction(params, function(data) {
                      for (var i = 0; i < data.result.length; i++) {
                         var actions = data.result[i].pageActions;
                          if (actions.length > 0 && actions != 'undefined') {
                                for (var j = 0; j < actions.length; j++) {
                                    for (var k = 0; k < actions[j].length; k++) {
                                        if (actions[j][k].type === 'mm') {
                                            $scope.heatmapData.push(actions[j][k]);
                                        }
                                    };
                                };
                          }
                      };
                      console.log('heatmapData >>> ', $scope.heatmapData);
                      $scope.initializeHeatmap();
                });

                //show heatmap

                $scope.initializeHeatmap = function() {
                    // create instance
                    // console.log('h337 >>', h337);
                    // var heatmapInstance = h337.create({
                    //   container: document.querySelectorAll('.heatmap'),
                    //   radius: 90
                    // });
                    // document.querySelectorAll('.heatmap').onclick = function(ev) {
                    //   heatmapInstance.addData({
                    //     x: ev.layerX,
                    //     y: ev.layerY,
                    //     value: 1
                    //   });
                    // };
                    $( document ).ready(function() {
                        // Get on screen image
                        var screenImage = $(".img-thumbnail");

                        // Create new offscreen image to test
                        var theImage = new Image();
                        theImage.src = screenImage.attr("src");

                        // Get accurate measurements from that.
                        var imageWidth = theImage.width;
                        var imageHeight = theImage.height;

                        // $('#heatmapArea').height = height;
                        // $('#heatmapArea').width = width;
                        console.log('imageWidth ', imageWidth);
                        console.log('imageHeight ', imageHeight);

                        var xx = h337.create({"element":document.getElementById("heatmapArea"), "radius":25, "visible":true});
                        console.log('heatmapData >>> ', $scope.heatmapData);
                        for (var i = 0; i < $scope.heatmapData.length && i < 1000; i++) {
                            xx.store.addDataPoint($scope.heatmapData[i].x, $scope.heatmapData[i].y);
                        };

                        // xx.get("canvas").onclick = function(ev){
                        //     var pos = h337.util.mousePosition(ev);
                        //     xx.store.addDataPoint(pos[0],pos[1]);
                        // };
                    });
                };

            });
        });

    }]);
});
