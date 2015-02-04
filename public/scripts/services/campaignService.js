/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.service('campaignService', function ($http) {
    var baseUrl = '/api/1.0/';

    //campaign/:id/contact/:contactid
    this.addContactToCampaign = function (campaignId, contactId, fn) {
        var apiUrl = baseUrl + ['campaign', 'campaign', campaignId, 'contact', contactId].join('/');
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
});