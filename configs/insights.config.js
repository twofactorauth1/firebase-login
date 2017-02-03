/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var fromAddress = 'insights@indigenous.io';
var fromName = 'Indigenous Insights';
var emailId = process.env.INSIGHTS_EMAIL_ID || 'bfa86581-c8e4-444e-bf0f-15519eff2bc8';
var subject = 'Insight Report';
var ccAry = ['test_account_managers@indigenous.io'];
var replyToAddress='account_managers@indigenous.io';
var replyToName = 'Account Managers';
var accountExclusions = [];
if(process.env.INSIGHTS_ACCOUNT_EXCLUSIONS) {
    accountExclusions = [];
    _.each(process.env.INSIGHTS_ACCOUNT_EXCLUSIONS.split(','), function(id){
        accountExclusions.push(parseInt(id));
    });
}
if(process.env.INSIGHTS_CC) {
    ccAry = [];
    _.each(process.env.INSIGHTS_CC.split(','), function(address){
        ccAry.push(address);
    });
}
module.exports = {
    fromAddress: fromAddress,
    fromName : fromName,
    emailId : emailId,
    subject : subject,
    ccAry : ccAry,
    replyToAddress : replyToAddress,
    replyToName : replyToName,
    accountExclusions:accountExclusions
};