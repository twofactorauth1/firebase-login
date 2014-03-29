/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([
    'models/cms/components/freeform',
    'models/cms/components/contact-us'
], function(Freeform, ContactUs) {

    var components = {
        "freeform": Freeform,
        "contact-us": ContactUs
    };

    var collection = Backbone.Collection.extend({

        model: function(attr, options) {
            var type = attr.type;
            var component = components[type];

            return new component(attr, options);
        },


        url: function() {
            return "";
        }
    });

    $$.c.cms = $$.c.cms || {};
    $$.c.cms.Components = collection;

    return collection
});
