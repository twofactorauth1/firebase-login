define(['./account'], function (AccountService) {
  describe('account service', function () {
    var $httpBackend;

    var perfectAccountObj = {
      "_id": 6,
      "company": {
        "name": "Main",
        "type": 2,
        "size": 0
      },
      "subdomain": "main",
      "domain": "",
      "customDomain": "",
      "token": "440c2731-8237-4b99-9ba2-8c1f3c52400e",
      "website": {
        "websiteId": "4d45e818-b797-4758-b4d6-0af3378457f4",
        "themeId": "af9d744c-9659-423f-bb8c-c7125e1b4f09"
      },
      "business": {
        "logo": "//s3.amazonaws.com/indigenous-digital-assets/account_6/logo_1438321580539.png",
        "name": "Indigenous",
        "description": "",
        "category": "test manik category",
        "size": 4,
        "phones": [{
          "_id": "plv0fet16u",
          "number": "5555555555",
          "default": false
        }],
        "addresses": [{
          "_id": "juf0xoutbg",
          "address": "",
          "address2": "",
          "city": "",
          "state": "",
          "country": "",
          "zip": ""
        }],
        "type": 2,
        "nonProfit": false,
        "emails": [{
          "_id": "mja2igt2ju",
          "email": "bradrisse@gmail.com"
        }],
        "splitHours": true,
        "hours": [{
          "day": "Mon",
          "start": "5:30 am",
          "end": "10:30 pm",
          "start2": "11:00 pm",
          "end2": "12:00 am",
          "closed": false,
          "split": false,
          "wholeday": false
        }, {
          "day": "Tue",
          "start": "9:00 am",
          "end": "12:30 pm",
          "start2": "9:30 pm",
          "end2": "12:00 am",
          "closed": false,
          "split": true,
          "wholeday": false
        }, {
          "day": "Wed",
          "start": "9:00 am",
          "end": "5:00 pm",
          "start2": "9:00 am",
          "end2": "5:00 pm",
          "closed": true,
          "split": false,
          "wholeday": false
        }, {
          "day": "Thu",
          "start": "9:00 am",
          "end": "4:00 pm",
          "start2": "9:00 am",
          "end2": "5:00 pm",
          "closed": true,
          "split": false,
          "wholeday": false
        }, {
          "day": "Fri",
          "start": "9:00 am",
          "end": "5:00 pm",
          "start2": "9:00 am",
          "end2": "5:00 pm",
          "closed": true,
          "split": false,
          "wholeday": false
        }, {
          "day": "Sat",
          "start": "9:00 am",
          "end": "5:00 pm",
          "start2": "9:00 am",
          "end2": "9:00 am",
          "closed": true,
          "split": false,
          "wholeday": false
        }, {
          "day": "Sun",
          "start": "12:00 am",
          "end": "12:00 am",
          "start2": "9:00 am",
          "end2": "9:00 am",
          "closed": true,
          "split": false,
          "wholeday": false
        }]
      },
      "billing": {
        "stripeCustomerId": "cus_5bT2vydau8AkUu",
        "userId": 6,
        "cardToken": "tok_6r15OawOhHN1Rj",
        "subscriptionId": "sub_6jvEf4ZhqWeXeP",
        "signupDate": "2015-07-10T02:42:41.032Z"
      },
      "credentials": [{
        "type": "stripe",
        "accessToken": "sk_test_OvXwUHRTdAAZLvw8ztjC2GKk",
        "refreshToken": "rt_6iOny6VZGRoPfiGYVnVbruZhWhux8oBVn2tR9eiFLh7jsvgm",
        "username": null,
        "image": null,
        "expires": null
      }],
      "firstLogin": false,
      "showhide": {
        "blog": true
      },
      "email_preferences": {
        "new_contacts": false,
        "no_notifications": false,
        "new_orders": true,
        "helpful_tips": true
      },
      "commerceSettings": {
        "taxes": true,
        "taxbased": "customer_shipping"
      },
      "created": {
        "date": "2015-07-10T02:42:41.032Z",
        "by": null
      },
      "modified": {
        "date": "2015-08-31T06:29:27.463Z",
        "by": 6
      },
      "_v": "0.1",
      "locked": false,
      "locked_sub": false,
      "accountUrl": "http://main.test.indigenous.io",
      "displaysettings": {
        "display_type": "first"
      },
      "settings": "lastActiviy",
      "trialDaysRemaining": 0
    };

    beforeEach(inject(function (AccountService, _$httpBackend_) {
      AccountService = AccountService;
      $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {});

    it('should return an account', function () {
      $httpBackend.expectGET('/api/1.0/account/').respond(perfectAccountObj);
      expect(AccountService.getAccount()).toBeDefined();
    })
  });
});
