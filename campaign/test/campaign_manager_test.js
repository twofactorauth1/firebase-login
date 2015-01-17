/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

process.env.NODE_ENV = "testing";
var app = require('../../app');

var CampaignManager = require('../campaign_manager.js');
var Contact = require('../../models/contact');
var contactDao = require('../../dao/contact.dao');
var courseDao = require('../../dao/course.dao');
var accountDao = require('../../dao/account.dao');

var testContext = {};

var campaignId;

exports.campaign_manager_test = {

    testAddSubscriberToCourse: function(test) {
        var self = this;
        console.log('\n\n\n testAddSubscriberToCourse\n\n\n');
        test.expect(1);

        var courseData = {
            "_id" : 14,
            "title" : "Herp de Derp",
            "template" : {
                "name" : "minimalist"
            },
            "subdomain" : "herpdederp",
            "subtitle" : "Herp de Derp",
            "body" : "Thanks a million for joining Minimalist.",
            "description" : "",
            "price" : 0,
            "showExitIntentModal" : false,
            "videos" : [
                {
                    "videoId" : "-pr-xzajQo0",
                    "subject" : "",
                    "videoUrl" : "http://youtube.com/watch?v=-pr-xzajQo0",
                    "videoTitle" : "Herp de Derp",
                    "videoSubtitle" : "Subtitle",
                    "videoBody" : "body",
                    "videoPreviewUrl" : "https://i.ytimg.com/vi/-pr-xzajQo0/mqdefault.jpg",
                    "videoBigPreviewUrl" : "https://i.ytimg.com/vi/-pr-xzajQo0/sddefault.jpg",
                    "scheduledHour" : 8,
                    "scheduledMinute" : 0,
                    "scheduledDay" : 0,
                    "_id" : null
                },
                {
                    "videoId" : "kC-S4gh4Wt0",
                    "subject" : "",
                    "videoUrl" : "http://youtube.com/watch?v=kC-S4gh4Wt0",
                    "videoTitle" : "Herp De Derp (Music Video Only)",
                    "videoSubtitle" : "Subtitle",
                    "videoBody" : "body",
                    "videoPreviewUrl" : "https://i.ytimg.com/vi/kC-S4gh4Wt0/mqdefault.jpg",
                    "videoBigPreviewUrl" : "https://i.ytimg.com/vi/kC-S4gh4Wt0/sddefault.jpg",
                    "scheduledHour" : 8,
                    "scheduledMinute" : 0,
                    "scheduledDay" : 1,
                    "_id" : null
                }
            ],
            "userId" : 4,
            "accountId" : 4
        };
        var userId = 4;
        var accountId = 4;
        var toEmail = 'millkyl+test@gmail.com';


        var timezoneOffset = 5;
        var account = new $$.m.Account({
            "_id" : 4,
            "company" : {
                "name" : "kyletesting",
                "type" : 1,
                "size" : 0
            },
            "subdomain" : "kyletesting",
            "domain" : "",
            "token" : "5081b557-8312-4657-89b4-242e0cd70eb3",
            "website" : {
                "themeId" : "default",
                "websiteId" : "0c0d1ab0-9a45-4d4a-92f7-eddf0f64fc9f"
            },
            "business" : {
                "logo" : "",
                "name" : "",
                "description" : "",
                "category" : "",
                "size" : "",
                "phones" : [],
                "addresses" : [],
                "type" : ""
            },
            "billing" : {
                "stripeCustomerId" : "cus_50ScrDbuljnShG",
                "cardToken" : "tok_52iZu6ZKYNrjaH",
                "userId" : 4,
                "subscriptionId" : "sub_53qp4DpZmKaMqc",
                "lastVerified" : "2014-10-31T17:00:47.505Z"
            },
            "_v" : "0.1",
            "accountUrl" : "http://kyletesting.indigenous.io"
        });

        accountDao.saveOrUpdate(account, function(err, savedAccount){
            console.log('returned from saveOrUpdate');
            if(err) {
                test.ok(false, err.toString());
                return test.done();
            }
            courseDao.createCourse(courseData, userId, accountId, function(err, course){
                console.log('returned from createCourse');
                if(err) {
                    test.ok(false, err.toString());
                    return test.done();
                }
                testContext.course = course;
                testContext.userId = userId;
                testContext.accountId = accountId;
                CampaignManager.subscribeToCourse(toEmail, course, accountId, timezoneOffset, function(err, value){
                    console.log('returned from subscribeToCourse');
                    if(err) {
                        test.ok(false, err.toString());
                        return test.done();
                    }
                    console.log('subscribed');
                    test.ok(true);
                    console.log('\n\n\n testAddSubscriberToCourse\n\n\n');
                    test.done();
                });
            });
        });



    },

    testBulkSubscribe: function(test) {
        console.log('\n\n\n testBulkSubscribe\n\n\n');
        test.expect(1);
        /*
         testContext.course = course;
         testContext.userId = userId;
         testContext.accountId = accountId;
         */
        var ary = [{"email":"test@test.com","courseId":testContext.course.id(),"subscribeTime":"2014-12-23T18:25:19.014Z"}];
        console.dir(ary);
        var userId = testContext.userId;
        var accountId = testContext.accountId;
        CampaignManager.bulkSubscribeToCourse(ary, userId, accountId, function(err, value){
            if(err) {
                test.ok(false, "Error: " + err);
                test.done();
            } else {
                test.ok(true);
                console.log('\n\n\n testBulkSubscribe\n\n\n');
                test.done();
            }
        });
    },


    testAddNonExistingCampaign: function(test) {
        test.expect(2);
        CampaignManager.addContactToMandrillCampaign("123", "123", [], function(err, value) {
            console.log(err.message);
            test.notEqual(err, null);
            test.equal(value, null);
            test.done();
        })
    }/*,

    testAddCampaignBadTemplate: function(test) {
        CampaignManager.createMandrillCampaign(
            "testCampaign",
            "Dummy Campaign",
            1,
            "bad_template_name",
            3,
            CampaignManager.EVERY_OTHER_DAY,
            function(err, campaign) {
                test.notEqual(err, null);
                test.equal(campaign, null);
                console.error(err.message);
                test.done();
            })
    },

    testAddCampaign: function(test) {
        CampaignManager.createMandrillCampaign(
            "testCampaign",
            "Dummy Campaign",
            "1.0",
            "test1template",
            2,
            CampaignManager.EVERY_OTHER_DAY,
            function(err, campaign) {
                if (err) {
                    test.ok(false, err.message);
                }
                test.ok(campaign.attributes._id);
                console.log("Created campaign: " + JSON.stringify(campaign, null, 2));
                campaignId = campaign.attributes._id;
                test.done();
            })
    },

    testAddContactToMandrillCampaign: function(test) {

        var contact = new Contact({
            first: "Hannibal",
            last: "Lecter"
        })

        contact.createOrUpdateDetails(null, null, null, null, null, null, ["kyle.miller@commitworks.com"], null);

        contactDao.saveOrMerge(contact, function (err, contact) {
            if (err) {
                test.ok(false, err.message);
                return test.done();
            }

            test.ok(contact);

            console.log("Created contact " + JSON.stringify(contact, null, 2));

            var mergeVars = [
                [ // first message
                    {
                        "name": "balance",
                        "content": "100"
                    },
                    {
                        "name" : "dueDate",
                        "content" : "01/01/2014"
                    }
                ],
                [ // second message
                    {
                        "name": "balance",
                        "content": "200"
                    },
                    {
                        "name" : "dueDate",
                        "content" : "02/01/2014"
                    }
                ]
            ];

            CampaignManager.addContactToMandrillCampaign(campaignId, contact.attributes._id, mergeVars, function (err, messages) {
                if (err) {
                    test.ok(false, err.message);
                    return test.done();
                }

                test.equal(messages.length, 2);
                console.log("Messages returned by addContactToMandrillCampaign: " + JSON.stringify(messages, null, 2));

                CampaignManager.addContactToMandrillCampaign(campaignId, contact.attributes._id, mergeVars, function (err, messages) {
                    if (!err) {
                        test.ok(false, "should have failed because contact was already in campaign");
                        return test.done();
                    }

                    console.log(err.message);
                    CampaignManager.cancelContactMandrillCampaign(campaignId, contact.attributes._id, function (err, response) {
                        if (err) {
                            test.ok(false, err.message);
                        }
                        return test.done();
                    })
                })
            })
        })
    }
    */
};