/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    //Posts
    'backboneAssoc',
    'collections/posts'
], function (backboneAssoc, Posts) {

    var model = Backbone.Model.extend({

        defaults: function() {
            return {
                _id: null,

                post_author: null,

                post_date: null,

                post_title: null,

                post_content: null,

                post_excerpt: null,

                post_status: null,

                comment_status: null,

                post_modified: null,

                comment_count: null
            }
        },


        parse: function(attrs) {
            var posts = attrs.posts || [];
            var typedPosts = new Posts(posts);
            attrs.posts = typedPosts;
            return attrs;
        },


        toJSON: function() {
            var json = _.clone(this.attributes);
            var collection = json.posts;
            json.posts = json.posts.toJSON()
            return json;
        },


        getPostById: function(id) {
            console.log('ID: '+id);
            var posts = this.get("posts");
            return posts.get(id);
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    console.log('getting');
                    if (this.id == null) {
                        return $$.api.getApiUrl("cms", "website/" + this.get("websiteId") + "/post/" + this.get("handle"));
                    }
                    return $$.api.getApiUrl("cms", "post/" + this.id);
                case "PUT":
                case "POST":
                    return $$.api.getApiUrl("cms", "post");
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