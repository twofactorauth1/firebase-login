/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

/**
 * @class Component
 */
var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            _id: null,
            title: '',//'Top Bar',
            type: '',//'top-bar',
            icon: '',//'fa fa-info',
            preview: '',// 'https://s3-us-west-2.amazonaws.com/indigenous-admin/top-bar.png',
            filter: '',//'contact',
            description: '',//'Show your social networks, phone number, business hours, or email right on top that provides visitors important info quickly.',
            enabled: true,
            content:'',


            created: {
                date: new Date(),
                by: null
            },

            modified: {
                date: new Date(),
                by: null
            }
        }
    },

    initialize: function(options) {

    }


}, {
    db: {
        storage: "mongo",
        table: "components",
        idStrategy: "uuid"
    }
});

$$.m.ssb = $$.m.ssb || {};
$$.m.ssb.Component = component;

module.exports = component;
