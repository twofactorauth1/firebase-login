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
            if (collection) {
                json.components = json.components.toJSON();
            }
            return json;
        },


        getComponentById: function(id) {
            var components = this.get("components");
            console.log('Components: '+JSON.stringify(components));
            return components.get(id);
        },


        url: function(method) {
            console.log('Method: '+method);
            switch(method) {
                case "GET":
                console.log('Website ID: '+this.get("websiteId")+' Handle: '+this.get("handle"));
                    if (this.get("websiteId") != null) {
                        return $$.api.getApiUrl("cms", "website/" + this.get("websiteId") + "/page/" + this.get("handle"));
                    }
                    return $$.api.getApiUrl("cms", "page/" + this.id);
                case "PUT":
                    return $$.api.getApiUrl("cms", "page");
                    // console.log('Page Id: '+this.get("pageId")+' ComponentId: '+this.get("componentId"));
                    // if (this.get("pageId") != null && this.get('componentId') != null) {
                    //     //return $$.api.getApiUrl("cms", "page/"+ this.get("pageId") + "/components/"+ this.get("componentId"));
                    //     return $$.api.getApiUrl("cms", "page");
                    // }
                    break;
                case "POST":
                    //website/:websiteId/page
                    console.log('Website ID: '+this.get("websiteId"));
                    if (this.get("websiteId") != null) {
                        return $$.api.getApiUrl("cms", "website/" + this.get("websiteId") + "/page");
                    }

                    //page/:id/components/:componentId/order/:newOrder
                    if (this.get("newOrder") != null ) {
                        return $$.api.getApiUrl("cms", "page/" + this.get("pageId") + "/components/" + this.get("componentId") + "/order/" + this.get("newOrder"));
                    }

                    //page/:id/components
                    if (this.get("pageId") != null) {
                        return $$.api.getApiUrl("cms", "page/" + this.get("pageId") + "/components");
                    }


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