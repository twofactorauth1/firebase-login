define(['app', 'ngProgress'], function(app) {
    app.register.controller('DashboardCtrl', ['$scope', 'ngProgress', function ($scope, ngProgress) {
        ngProgress.start();

        var client = new Keen({
            projectId: "54528c1380a7bd6a92e17d29",       // String (required)
            writeKey: "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a", // String (required for sending data)
            readKey: "bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b",   // String (required for querying data)
            protocol: "https",                  // String (optional: https | http | auto)
            host: "api.keen.io/3.0",            // String (optional)
            requestType: "jsonp"                // String (optional: jsonp, xhr, beacon)
        });

        Keen.ready(function(){


          // ----------------------------------------
          // Pageviews Area Chart
          // ----------------------------------------
          var pageviews_timeline = new Keen.Query("count", {
            eventCollection: "pageviews",
            interval: "hourly",
            groupBy: "user.device_info.browser.family",
            timeframe: {
              start: "2014-05-04T00:00:00.000Z",
              end: "2014-05-05T00:00:00.000Z"
            }
          });
          client.draw(pageviews_timeline, document.getElementById("chart-01"), {
            chartType: "areachart",
            title: false,
            height: 250,
            width: "auto",
            chartOptions: {
              chartArea: {
                height: "85%",
                left: "5%",
                top: "5%",
                width: "80%"
              },
              isStacked: true
            }
          });


          // ----------------------------------------
          // Pageviews Pie Chart
          // ----------------------------------------
          var pageviews_static = new Keen.Query("count", {
            eventCollection: "pageviews",
            groupBy: "user.device_info.browser.family",
            timeframe: {
              start: "2014-05-01T00:00:00.000Z",
              end: "2014-05-05T00:00:00.000Z"
            }
          });
          client.draw(pageviews_static, document.getElementById("chart-02"), {
            chartType: "piechart",
            title: false,
            height: 250,
            width: "auto",
            chartOptions: {
              chartArea: {
                height: "85%",
                left: "5%",
                top: "5%",
                width: "100%"
              }
            }
          });


          // ----------------------------------------
          // Impressions timeline
          // ----------------------------------------
          var impressions_timeline = new Keen.Query("count", {
            eventCollection: "impressions",
            groupBy: "ad.advertiser",
            interval: "hourly",
            timeframe: {
              start: "2014-05-04T00:00:00.000Z",
              end: "2014-05-05T00:00:00.000Z"
            }
          });
          client.draw(impressions_timeline, document.getElementById("chart-03"), {
            chartType: "columnchart",
            title: false,
            height: 250,
            width: "auto",
            chartOptions: {
              chartArea: {
                height: "75%",
                left: "10%",
                top: "5%",
                width: "60%"
              },
              bar: {
                groupWidth: "85%"
              },
              isStacked: true
            }
          });


          // ----------------------------------------
          // Impressions timeline (device)
          // ----------------------------------------
          var impressions_timeline_by_device = new Keen.Query("count", {
            eventCollection: "impressions",
            groupBy: "user.device_info.device.family",
            interval: "hourly",
            timeframe: {
              start: "2014-05-04T00:00:00.000Z",
              end: "2014-05-05T00:00:00.000Z"
            }
          });
          client.draw(impressions_timeline_by_device, document.getElementById("chart-04"), {
            chartType: "columnchart",
            title: false,
            height: 250,
            width: "auto",
            chartOptions: {
              chartArea: {
                height: "75%",
                left: "10%",
                top: "5%",
                width: "60%"
              },
              bar: {
                groupWidth: "85%"
              },
              isStacked: true
            }
          });


          // ----------------------------------------
          // Impressions timeline (country)
          // ----------------------------------------
          var impressions_timeline_by_country = new Keen.Query("count", {
            eventCollection: "impressions",
            groupBy: "user.geo_info.country",
            interval: "hourly",
            timeframe: {
              start: "2014-05-04T00:00:00.000Z",
              end: "2014-05-05T00:00:00.000Z"
            }
          });
          client.draw(impressions_timeline_by_country, document.getElementById("chart-05"), {
            chartType: "columnchart",
            title: false,
            height: 250,
            width: "auto",
            chartOptions: {
              chartArea: {
                height: "75%",
                left: "10%",
                top: "5%",
                width: "60%"
              },
              bar: {
                groupWidth: "85%"
              },
              isStacked: true
            }
          });
        });

        // Create a data object with the properties you want to send
        $scope.addPurchase = function() {
            var purchase = {
              item: "golden gadget",  
              price: 25.50,
              referrer: document.referrer,
              keen: {
                timestamp: new Date().toISOString()
              }
            };

            // Send it to the "purchases" collection
            client.addEvent("purchases", purchase);
            console.log('added event', purchase);
        };

        $scope.addVisit = function() {
            var testing = {
                 page: {
                  title: document.title,
                  host: document.location.host,
                  href: document.location.href,
                  path: document.location.pathname,
                  protocol: document.location.protocol.replace(/:/g, ""),
                  query: document.location.search
                },
                visitor: {
                  referrer: document.referrer,
                  ip_address: "${keen.ip}",
                  // tech: {} //^ created by ip_to_geo add-on
                  user_agent: "${keen.user_agent}"
                  // visitor: {} //^ created by ua_parser add-on
                },
                keen: {
                  timestamp: new Date().toISOString(),
                  addons: [
                    { name:"keen:ip_to_geo", input: { ip:"visitor.ip_address" }, output:"visitor.geo" },
                    { name:"keen:ua_parser", input: { ua_string:"visitor.user_agent" }, output:"visitor.tech" }
                  ]
                }
            };
            console.log('testing >>> ', testing);
        };

    }]);
});