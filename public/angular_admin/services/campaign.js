define(['app', 'toasterService'], function(app) {
    app.register.service('CampaignService', ['$http', 'ToasterService', function($http, ToasterService) {
          var baseUrl = '/api/1.0/';

            var singleCampaign = {
              "_id": "000000-0000-000000-00000000",
              "accountId": 00,
              "title": "My New Campaign",
              "type": "autoresponder",
              "status": "active",
              "contacts": 100,
              "visibility": 1, //boolean
              "startDate": "2014-11-24T22:05:53.708Z",
              "steps": [
                {
                  "type": "email",
                  "settings" : {
                      "templateId" : "000000-0000-000000-00000000",
                      "offset" : "320000", //in seconds
                      "from" : "john@indigenous.io",
                      "scheduled" : {
                        "minute":1,
                        "hour": 2,
                        "day":1
                      }
                  }
                }
              ],
              "created": {
                  "date": "2014-11-24T22:05:53.708Z",
                  "by": null
              },
              "modified": {
                  "date": "2014-11-24T22:05:53.708Z",
                  "by": null
              },
              "_v": "0.1"
            };

            this.postCampaign = function(campaign, fn) {

                //temp fake return
                var data = singleCampaign;
                data.title = campaign.name;
                data.type = campaign.type;
                fn(data);

                // var apiUrl = baseUrl + ['campaigns'].join('/');
                // $http({
                //     url: apiUrl,
                //     method: "POST",
                //     data: angular.toJson(campaign)
                //   })
                //   .success(function(data, status, headers, config) {
                //     fn(data);
                //   })
                //   .error(function(error) {
                //     console.error('ProductService: postProduct error >>> ', error);
                //   });
            };

            this.getCampaign = function(campaignId, fn) {

                fn(singleCampaign);

                // var apiUrl = baseUrl + ['campaigns', campaignId].join('/');
                // $http({
                //     url: apiUrl,
                //     method: "GET"
                //   })
                //   .success(function(data, status, headers, config) {
                //     fn(data);
                //   })
                //   .error(function(error) {
                //     console.error('ProductService: postProduct error >>> ', error);
                //   });
            };

    }]);
});
