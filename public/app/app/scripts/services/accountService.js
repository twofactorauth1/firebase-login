/*
 * Verifying Account According to Subdomain
 * */

'use strict';

mainApp.factory('accountService', function () {

    //TODO Fetch Data AccountDB

    return function (domainURL) {
        console.log(domainURL);
        var account = {
            "_id": 11,
            "company": {
                "name": "sunny",
                "type": 2,
                "size": 0
            },
            "subdomain": "sunny",
            "domain": "",
            "token": "003c6a16-ee93-47cb-8119-6dd1bf8822ba",
            "website": {
                "websiteId": "e3e39555-2c1c-45d7-bdc5-b7a0d7df9cfe",
                "themeId": "indimain"    //change here to apply theme indimain,default,fitstop
            },
            "business": {
                "logo": "",
                "name": "",
                "description": "",
                "category": "",
                "size": "",
                "phones": [ ],
                "addresses": [ ],
                "type": ""
            },
            "_v": "0.1",
            "updateType": "",
            "accountUrl": "http://.indigenous.local:3000"
        };

        return account;
    };

});