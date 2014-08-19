/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    //Posts
    'backboneAssoc',
    'collections/cms/post'
], function (backboneAssoc, Post) {

    var model = Backbone.Model.extend({

        defaults: function() {
            return {
                _id: null,

                accountId: null,

                websiteId: null,

                pageId: null,

                post_author: null,

                post_date: null,

                post_title: null,

                post_content: null,

                post_excerpt: null,

                post_status: null,

                post_category:null,

                comment_status: null,

                comment_count: null,

                created: {
                    date: "",
                    by: null,
                },

                modified: {
                    date: "",
                    by: null,
                },

            }
        },


        getPostById: function(id) {
            console.log('ID: '+id);
            var post = this.get("post");
            return post.get(id);
        },

        parse: function(attrs) {
            return attrs;
        },

        url: function(method) {
            console.log('Method: '+method);
            switch(method) {
                case "GET":
                    if (this.get("pageId") != null) {
                        console.log('Page ID: '+this.get("pageId")+' Blog Post ID: '+this.get("_id"));
                        return $$.api.getApiUrl("cms", "page/" + this.get("pageId") + "/blog/" + this.get("_id"));
                    }
                    return $$.api.getApiUrl("cms", "post/" + this.id);
                case "PUT":
                    if (this.get("_id") != null) {
                        return $$.api.getApiUrl("cms", "page/"+ this.get("pageId") +"/blog/"+this.get("_id"));
                    }
                    break;
                case "POST":
                console.log('posting '+this.get("pageId"));
                    if (this.get("_id") != null) {
                        return $$.api.getApiUrl("cms", "page/"+ this.get("pageId") +"/blog/"+this.get("_id"));
                    } else {
                        return $$.api.getApiUrl("cms", "page/"+ this.get("pageId") +"/blog");
                    }
                    break;
                case "DELETE":
                    return $$.api.getApiUrl("cms", "post/" + this.id);
                    break;
            }
        }
    });

    $$.m.cms = $$.m.cms || {};
    $$.m.cms.Post = model;

    return model;
});