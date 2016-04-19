/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.service('campaignService', function ($http) {
    var baseUrl = '/api/1.0/';

    //campaign/:id/contact/:contactid
    this.addContactToCampaign = function (campaignId, contactId, fn) {
        //TODO this is frontend code that WILL fail.
        var apiUrl = baseUrl + ['campaigns', campaignId, 'contact', contactId].join('/');
        $http({
            url: apiUrl,
            method: "POST"
        })
        .success(function (data, status, headers, config) {
            fn(data);
        })
        .error(function (err) {
            console.log('END:addContactToCampaign with ERROR ', err);
        });
    };

    this.getCampaign = function (campaignId, fn) {
        //TODO this is frontend code that WILL fail.
        var apiUrl = baseUrl + ['campaigns', campaignId].join('/');
        $http({
            url: apiUrl,
            method: "GET"
        })
        .success(function (data, status, headers, config) {
            fn(data);
        })
        .error(function (err) {
            console.log('END:getCampaign with ERROR ', err);
        });
    };
});
