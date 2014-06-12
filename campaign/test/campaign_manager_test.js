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

var campaignId;

exports.campaign_manager_test = {
    testAddNonExistingCampaign: function(test) {
        test.expect(2);
        CampaignManager.addContactToMandrillCampaign("123", "123", [], function(err, value) {
            console.log(err.message);
            test.notEqual(err, null);
            test.equal(value, null);
            test.done();
        })
    },

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
};