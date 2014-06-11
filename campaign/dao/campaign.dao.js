/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/campaign');

var dao = {

    options: {
        name:"campaign.dao",
        defaultModel: $$.m.Campaign
    },

    createCampaign: function(
        name,
        description,
        revision,
        templateName,
        subject,
        fromName,
        fromEmail,
        numberOfMessages,
        messageDeliveryFrequency,
        type,
        fn) {

        var self = this;

        if ($$.u.stringutils.isNullOrEmpty(name)) {
            return fn(new Error("Campaign name was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(description)) {
            return fn(new Error("Campaign description was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(subject)) {
            return fn(new Error("Campaign subject was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(fromName)) {
            return fn(new Error("Campaign 'From Name' was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(fromEmail)) {
            return fn(new Error("Campaign 'From Email' was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(messageDeliveryFrequency)) {
            return fn(new Error("Campaign message delivery frequency was not specified"), null);
        }

        if (!numberOfMessages) {
            return fn(new Error("Campaign number of messages was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(revision)) {
            return fn(new Error("Campaign revision was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(templateName)) {
            return fn(new Error("Campaign template name was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(type)) {
            return fn(new Error("Campaign type was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(messageDeliveryFrequency)) {
            return fn(new Error("Campaign interval was not specified"), null);
        }

        var campaign = new $$.m.Campaign({
            name: name,
            description: description,
            type: type,
            revision: revision,
            templateName: templateName,
            subject: subject,
            fromName: fromName,
            fromEmail: fromEmail,
            numberOfMessages: numberOfMessages,
            messageDeliveryFrequency: messageDeliveryFrequency
        });

        self.saveOrUpdate(campaign, fn);
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.CampaignDao = dao;

module.exports = dao;
