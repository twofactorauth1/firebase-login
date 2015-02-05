define(['app', 'ngProgress', 'formatCurrency', 'highcharts', 'highcharts-ng', 'websiteService', 'userService', 'keenService', 'heatmapjs', 'checkImageDirective'], function(app) {
    app.register.controller('SinglePageAnalyticsCtrl', ['$scope', '$location', 'ngProgress', 'WebsiteService', 'UserService', 'keenService', '$window', function($scope, $location, ngProgress, WebsiteService, UserService, keenService, $window) {
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
                          if (actions  && actions.length > 0) {
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
                    $(document ).ready(function() {
                        // Get on screen image
                        var screenImage = $("#heatmapArea img");
                        var heatmapArea = $("#heatmapArea");
                            if(document.getElementById("heatmapArea"))
                            {
                                var xx = h337.create({container:document.getElementById("heatmapArea"), radius:25, visible:true});
                                xx._renderer.setDimensions(heatmapArea.width(), heatmapArea.height());
                                for (var i = 0; i < $scope.heatmapData.length && i < 1000; i++) {
                                    xx.addData({ x: Math.floor($scope.heatmapData[i].x), y: Math.floor($scope.heatmapData[i].y), value: 1});
                                }; 
                            }
                            

                        function resetData() {
                            console.log('xx ', xx);
                            var screenImage = $("#heatmapArea img");
                            console.log('width ', screenImage.width());
                            console.log('height ', screenImage.height());
                            xx._renderer.setDimensions(screenImage.width(), screenImage.height());

                            xx.repaint();
                        };

                        $(window).resize(function () {
                            waitForFinalEvent(function(){
                              console.log('Resize...');
                              if(document.getElementById("heatmapArea"))
                                 resetData();
                            }, 500, $scope.heatmapData.length);
                        });


                    });
                };

                var waitForFinalEvent = (function () {
                  var timers = {};
                  return function (callback, ms, uniqueId) {
                    if (!uniqueId) {
                      uniqueId = "Don't call this twice without a uniqueId";
                    }
                    if (timers[uniqueId]) {
                      clearTimeout (timers[uniqueId]);
                    }
                    timers[uniqueId] = setTimeout(callback, ms);
                  };
                })();

            });
        });

    }]);
});
