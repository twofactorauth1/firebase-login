/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

/**
 * @class BlogPost
 */
var blogpost = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The ID property of the Page class instance
             *
             * @property _id
             * @type {String}
             * @default null
             */
            _id: null,

            /**
             * The account Id to whom this page belongs
             *
             * @property accountId
             * @type {Number}
             * @default 0
             */
            accountId:null,

            /**
             * The website Id to whom this page belongs
             *
             * @property websiteId
             * @type {Number}
             * @default 0
             */
            websiteId:null,

            pageId: null,

            post_author: null,

            post_title: null,

            post_content: null,

            post_excerpt: null,

            post_status: 'DRAFT',

            created_date: new Date(),

            publish_date: null,

            post_category: null,

            post_tags: [],

            comment_status: null,

            comment_count: null,

            post_url:null,

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
        }
    },

    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "posts",
        idStrategy: "uuid"
    },

    status: {
        PUBLISHED: 'PUBLISHED',
        DRAFT: 'DRAFT',
        FUTURE: 'FUTURE',
        PRIVATE: 'PRIVATE'
    },

    allStatus: ['PUBLISHED', 'DRAFT', 'FUTURE', 'PRIVATE']
});

$$.m.BlogPost = blogpost;

module.exports = blogpost;
