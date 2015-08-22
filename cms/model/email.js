/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

/**
 * @class Email
 */
var email = $$.m.ModelBase.extend({

  defaults: function () {
    return {

      /**
       * The ID property of the Email class instance
       *
       * @property _id
       * @type {String}
       * @defeault null
       */
      _id: null,

      /**
       * The account Id to whom this email belongs
       *
       * @property accountId
       * @type {Number}
       * @default 0
       */
      accountId: null,


      /**
       * The page title that appears in the tab name
       *
       * @property title
       * @type {String}
       * @default ""
       */
      title: null,

      /**
       * The unique-per-account reference to an email.
       *
       * @property handle
       * @type {String}
       * @default ""
       */
      handle: null,

      /**
       * The subject that appears the email
       *
       * @property subject
       * @type {String}
       * @default ""
       */
      subject: null,

       /**
       * The from name that appears the email
       *
       * @property fromName
       * @type {String}
       * @default ""
       */
      fromName: null,

      /**
       * The from email that appears the email
       *
       * @property fromEmail
       * @type {String}
       * @default ""
       */
      fromEmail: null,

      /**
       * The reply to that appears the email
       *
       * @property replyTo
       * @type {String}
       * @default ""
       */
      replyTo: null,


      /**
       * The components that make up the email
       * [
       *      array of data from each component
       * ]
       */
      components: [],

      /**
       * Screenshot of the email.  Updated after an edit.
       */
      screenshot: null,


      /**
       * Version of the email.  Auto incremented.  Cannot be modified externally.
       */
      version: 0,
      latest: true,

      /**
       * Created by data
       *
       * @property created
       * @type {Object}
       * @default {}
       */
      created: {
        date: "",
        by: null
      },

      /**
       * Modified by data
       *
       * @property modified
       * @type {Object}
       * @default {}
       */
      modified: {
        date: "",
        by: null
      }
    };
  },

  initialize: function (options) {

  },


  isVisible: function () {
    var visibility = this.get("visibility");
    if (visibility.visible === true) {
      return true;
    }

    return (visibility.displayOn !== null && visibility.displayOn < new Date().getTime());
  }

}, {
  db: {
    storage: "mongo",
    table: "emails",
    idStrategy: "uuid"
  }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.Email = email;

module.exports = email;
