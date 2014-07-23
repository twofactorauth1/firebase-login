/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    //Components
    'backboneAssoc',
    'collections/cms/components'
], function (backboneAssoc, Components) {

    var model = Backbone.Model.extend({

        defaults: function() {
            return {
                _id: null,

                accountId: null,

                websiteId: null,

                handle: null,

                title: null,

                seo: null,

                visibility: {
                    visible: true, //true | false
                    asOf: null,     //Timestamp, tracks the last time the visible flag was modified
                    displayOn: null //Timestamp, determines when this page becomes visible.  If null, it's ignored
                },

                components: null,

                created: null,

                modified: null
            }
        },


        parse: function(attrs) {
            var components = attrs.components || [];
            var typedComponents = new Components(components);
            attrs.components = typedComponents;
            return attrs;
        },


        toJSON: function() {
            var json = _.clone(this.attributes);
            var collection = json.components;
            json.components = json.components.toJSON()
            return json;
        },


        getComponentById: function(id) {
            var components = this.get("components");
            return components.get(id);
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    if (this.get("pageId") == null) {
                        return $$.api.getApiUrl("cms", "page/" + this.get("pageId") + "/page/" + this.get("handle"));
                    }
                    return $$.api.getApiUrl("cms", "page/" + this.id);
                case "PUT":
                case "POST":
                    return $$.api.getApiUrl("cms", "page");
                    break;
                case "DELETE":
                    return $$.api.getApiUrl("cms", "page/" + this.id);
                    break;
            }
        }
    });

    $$.m.cms = $$.m.cms || {};
    $$.m.cms.Page = model;

    return model;
});