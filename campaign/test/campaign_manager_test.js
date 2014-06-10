process.env.NODE_ENV = "testing";
var app = require('../../app');

var CampaignManager = require('../campaign_manager.js');
var Contact = require('../../models/contact');
var contactDao = require('../../dao/contact.dao');

var campaignId;

exports.campaign_manager_test = {
//    testAddNonExistingCampaign: function(test) {
//        test.expect(2);
//        CampaignManager.addContactToMandrillCampaign("123", "123", [], function(err, value) {
//            console.log(err.message);
//            test.notEqual(err, null);
//            test.equal(value, null);
//            test.done();
//        })
//    },
//
//    testAddCampaignBadTemplate: function(test) {
//        CampaignManager.createMandrillCampaign(
//            "testCampaign",
//            "Dummy Campaign",
//            1,
//            "bad_template_name",
//            3,
//            CampaignManager.EVERY_OTHER_DAY,
//            function(err, campaign) {
//                test.notEqual(err, null);
//                test.equal(campaign, null);
//                console.error(err.message);
//                test.done();
//            })
//    },
//
//    testAddCampaign: function(test) {
//        CampaignManager.createMandrillCampaign(
//            "testCampaign",
//            "Dummy Campaign",
//            "1.0",
//            "test1template",
//            3,
//            CampaignManager.EVERY_OTHER_DAY,
//            function(err, campaign) {
//                if (err) {
//                    test.ok(false, err.message);
//                }
//                test.ok(campaign);
//                console.log(JSON.stringify(campaign));
//                campaignId = campaign.attributes._id;
//                test.done();
//            })
//    },

    testAddContactToMandrillCampaign: function(test) {

        var contact = new Contact({
            first: "Hannibal",
            last: "Lecter"
        })

        contact.createOrUpdateDetails(null, null, null, null, null, null, ["cmelean@yahoo.com"], null);

        contactDao.saveOrMerge(contact, function (err, contact) {
            if (err) {
                test.ok(false, err.message);
                return test.done();
            }

            console.log("Created contact " + JSON.stringify(contact, null, 2));

            //TODO: remove
            campaignId = "50cf9b8c-ea36-452a-a66e-52a27fd6df74";

            CampaignManager.addContactToMandrillCampaign(campaignId, contact.attributes._id, null, function (err, value) {
                if (err) {
                    test.ok(false, err.message);
                    return test.done();
                }

                console.log(JSON.stringify(value, null, 2));
            })
        })
    }
};