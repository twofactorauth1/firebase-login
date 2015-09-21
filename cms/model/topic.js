/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var topic = $$.m.ModelBase.extend({

  defaults: function () {
    return {

      /**
       * The Id of this instance,
       *
       * @property _id
       * @type {Guid}
       * @default ""
       */
      _id: "",

      isPublic: false,

      previewUrl: '',

      title: '',

      category: '',

      components: [],

      statistics: {
        helpful: 0,
        nothelpful: 0,
        views: 0
      },

      /**
       * Created by data
       *
       * @property created
       * @type {Object}
       * @default {}
       */
      created: {
        date: new Date(),
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
        date: null,
        by: null
      }
    }
  },

  serializers: {

  },


  initialize: function (options) {

  },


  validate: function () {
    return true;
  }

}, {
  db: {
    storage: "mongo",
    table: "help_topics",
    idStrategy: "uuid"
  }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.Topic = topic;

module.exports = topic;
