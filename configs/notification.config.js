/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var notificationFromEmail = 'admin@indigenous.io';
var notificaitonToEmail = 'operations@indigenous.io';

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
  TO_EMAIL: notificaitonToEmail
};
