/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');

var notificationFromEmail = 'admin@indigenous.io';
var notificaitonToEmail = 'test_operations@indigenous.io';

var welcomeFromEmail = process.env.WELCOME_FROM_EMAIL || 'hello@indigenous.io';
var welcomeFromName =  process.env.WELCOME_FROM_NAME || 'Indigenous';
var welcomeHTML = process.env.WELCOME_HTML || 'public/templates/emails/welcome-aboard.html';
var thanksForInterest = process.env.INTEREST_HTML || 'public/templates/emails/thanks-for-interest.html';
var welcomeEmailSubject = process.env.WELCOME_EMAIL_SUBJECT || 'Welcome to Indigenous!';
var newCustomerEmailSubject = process.env.NEW_CUSTOMER_EMAIL_SUBJECT || 'New contact created';
var newPurchaseOrderEmailSubject = process.env.NEW_PURCHASE_ORDER_EMAIL_SUBJECT || 'New purchase order created';
var newPurchaseNoteEmailSubject = "New purchase order note created";
var newNoteEmailSubject = "New note created";
var notificationPurchaseOrderToEmail = process.env.NEW_PURCHASE_ORDER_EMAIL_TO || 'smaticsdemo-portal@indigenous.io';
var notificationPurchaseOrderBccEmail = process.env.NEW_PURCHASE_ORDER_EMAIL_BCC || '';
var defaulSenderAddress = process.env.DEFAULT_SENDER_ADDRESS || 'messages-noreply-bounce@indigenous.io';
var accountActivateEmailToDevSubject = process.env.ACTIVATE_ACCOUNT_EMAIL_SUBJECT || 'LeadSource Javascript Listener';
var activateAccountFromEmail = process.env.ACTIVATE_ACCOUNT_FROM_EMAIL || 'admin@indigenous.io';
var activateAccountFromName =  process.env.ACTIVATE_ACCOUNT_FROM_Name || 'LeadSource';
/*
 * Override the connection string with an environment variable
 */
if (process.env.NOTIFICATION_FROM_EMAIL != null) {
    notificationFromEmail = process.env.NOTIFICATION_FROM_EMAIL;
}
/*
 * Override the connection string with an environment variable
 */
if (process.env.NOTIFICATION_TO_EMAIL != null) {
    notificaitonToEmail = process.env.NOTIFICATION_TO_EMAIL;
}

if(appConfig.nonProduction === false) {
    notificationPurchaseOrderToEmail = process.env.NEW_PURCHASE_ORDER_EMAIL_TO || 'portal-om@securematics.com';
    notificationPurchaseOrderBccEmail = process.env.NEW_PURCHASE_ORDER_EMAIL_BCC || 'smaticsdemo-portal@indigenous.io';
}

module.exports = {
  /**
   * System mailer configuration
   */
    FROM_EMAIL: notificationFromEmail,
    TO_EMAIL: notificaitonToEmail,
    WELCOME_FROM_EMAIL: welcomeFromEmail,
    WELCOME_FROM_NAME: welcomeFromName,
    WELCOME_HTML: welcomeHTML,
    WELCOME_EMAIL_SUBJECT: welcomeEmailSubject,
    NEW_CUSTOMER_EMAIL_SUBJECT: newCustomerEmailSubject,
    NEW_PURCHASE_ORDER_EMAIL_SUBJECT: newPurchaseOrderEmailSubject,
    NEW_PURCHASE_NOTE_EMAIL_SUBJECT: newPurchaseNoteEmailSubject,
    NEW_NOTE_SUBJECT: newNoteEmailSubject,
    NEW_PURCHASE_ORDER_EMAIL_TO : notificationPurchaseOrderToEmail,
    NEW_PURCHASE_ORDER_EMAIL_BCC : notificationPurchaseOrderBccEmail,
    THANKS_HTML: thanksForInterest,
    DEFAULT_SENDER_ADDRESS: defaulSenderAddress,
    ACTIVATE_ACCOUNT_EMAIL_SUBJECT: accountActivateEmailToDevSubject,
    ACTIVATE_ACCOUNT_FROM_EMAIL: activateAccountFromEmail,
    ACTIVATE_ACCOUNT_FROM_Name: activateAccountFromName
};
