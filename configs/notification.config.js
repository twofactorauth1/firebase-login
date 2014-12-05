/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var notificationFromEmail = 'admin@indigenous.io';
var notificaitonToEmail = 'test_operations@indigenous.io';

var welcomeFromEmail = process.env.WELCOME_FROM_EMAIL || 'info@indigenous.io';
var welcomeFromName =  process.env.WELCOME_FROM_NAME || 'Indigenous';
var welcomeHTML = process.env.WELCOME_HTML || 'templates/emails/welcome-aboard.html';
var welcomeEmailSubject = process.env.WELCOME_EMAIL_SUBJECT || 'Welcome to Indigenous!';

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

module.exports = {
  /**
   * System mailer configuration
   */
    FROM_EMAIL: notificationFromEmail,
    TO_EMAIL: notificaitonToEmail,
    WELCOME_FROM_EMAIL: welcomeFromEmail,
    WELCOME_FROM_NAME: welcomeFromName,
    WELCOME_HTML: welcomeHTML,
    WELCOME_EMAIL_SUBJECT: welcomeEmailSubject
};
