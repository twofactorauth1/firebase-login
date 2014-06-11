/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/campaign_message');

var dao = {

    options: {
        name:"campaign_message.dao",
        defaultModel: $$.m.CampaignMessage
    },

    createCampaignMessage: function(
        campaign,
        contactId,
        contactName,
        contactEmail,
        sendAt,
        mergeVarsArray,
        messageStatus,
        externalId,
        fn) {

        var self = this;

        if (!campaign) {
            return fn(new Error("A campaign was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(campaign.attributes._id)) {
            return fn(new Error("A campaign id was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(campaign.attributes.subject)) {
            return fn(new Error("An email subject was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(campaign.attributes.fromEmail)) {
            return fn(new Error("A fromEmail was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(campaign.attributes.fromName)) {
            return fn(new Error("A fromName was not specified"), null);
        }

        if (!contactId) {
            return fn(new Error("A contact id was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(contactName)) {
            return fn(new Error("A contact name was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(contactEmail)) {
            return fn(new Error("An email address was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(sendAt)) {
            return fn(new Error("A sendAt was not specified"), null);
        }

        var campaignMessage = new $$.m.CampaignMessage({
            campaignId: campaign.attributes._id,
            subject: campaign.attributes.subject,
            fromEmail: campaign.attributes.fromEmail,
            fromName: campaign.attributes.fromName,
            contactId: contactId,
            contactName: contactName,
            contactEmail: contactEmail,
            sendAt: sendAt,
            mergeVarsArray: mergeVarsArray,
            messageStatus: messageStatus,
            externalId: externalId
        });

        self.saveOrUpdate(campaignMessage, fn);
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.CampaignMessageDao = dao;

module.exports = dao;
