/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./base.model.js');

var post = $$.m.ModelBase.extend({

    /**
     * _id:""
     * type: "",
     * sourceId: "",
     * postType: "",            //status|location|photo|link|tweet
     *
     * from: {
     *      sourceId: "",
     *      name: "",
     *      username: ""
     * },
     * to: [
     *      sourceId: "",
     *      name: "",
     *      type: ""        //user|page
     * }
     * name: "",
     * message: "",
     * caption: "",
     * description: "",
     * picture: "",
     * link: "",
     * date: ""  //created
     *
     * tagged: [{
     *      sourceId: ""
     *      name: "",
     *      type: "",   //user|page
     * }],
     *
     * comments: [{
     *      sourceId: "",
     *      name: "",
     *      comment: ""
     * }]
     *
     * likes: [{
     *      sourceId: "",
     *      name: ""
     * }]
     */
    defaults: {

    },


    initialize: function(options) {

    },


    convertFromFacebookPost: function(post) {
        var obj = {
            _id: $$.u.idutils.generateUniqueAlphaNumeric(16),
            type: $$.constants.social.types.FACEBOOK,
            sourceId: post.id,
            postType: post.type
        };

        if(post.from) {
            obj.from = {
                sourceId: post.from.id,
                name: post.from.name
            };
        }

        if (post.created_time) {
            obj.date = new Date(post.created_time).getTime();
        }

        if (post.to && post.to.data && post.to.data.length > 0 && post.to.forEach) {
            obj.to = [];
            post.to.forEach(function(toObj) {
                obj.to.push({
                    sourceId: toObj.id,
                    name: toObj.name
                });
            })
        }

        if (post.story) {
            obj.message = post.story;
        }
        if (post.name) {
            obj.name = post.name;
        }
        if (post.picture) {
            obj.picture = post.picture;
        }
        if (post.link) {
            obj.link = post.link;
        }
        if (post.caption) {
            obj.caption = post.caption;
        }
        if (post.description) {
            obj.description = post.description;
        }

        if (post.comments && post.comments.data && post.comments.data.length > 0) {
            obj.comments = [];

            post.comments.data.forEach(function(comment) {
                obj.comments.push({
                    sourceId: comment.from.id,
                    name: comment.from.name,
                    comment: comment.message
                })
            });
        }

        if (post.likes && post.likes.data && post.likes.data.length > 0) {
            obj.likes = [];
            post.likes.data.forEach(function(like) {
                obj.likes.push({
                    sourceId: like.id,
                    name: like.name
                });
            })
        }

        var i = null;
        obj.tagged = [];
        if (post.story_tags != null) {
            for (var key in post.story_tags) {
                var tags = post.story_tags[key];
                if (tags && tags.length > 0) {
                    for (i = 0; i < tags.length; i++) {
                        obj.tagged.push({
                            sourceId: tags[i].id,
                            name: tags[i].name,
                            type: tags[i].type
                        });
                    }
                }
            }
        }

        this.set(obj);
        return this;
    },


    convertFromTwitterTweet: function(tweet) {
        var obj = {
            _id: $$.u.idutils.generateUniqueAlphaNumeric(16),
            type: $$.constants.social.types.TWITTER,
            sourceId: tweet.id_str,
            postType: "tweet"
        };

        if(tweet.user) {
            obj.from = {
                sourceId: tweet.user.id,
                name: tweet.user.name
            };
        } else if(tweet.sender) {
            obj.from = {
                sourceId: tweet.sender.id,
                name: tweet.sender.name
            };
        }

        if (tweet.created_at) {
            obj.date = new Date(tweet.created_at).getTime();
        };

        obj.message = tweet.text;
        if (tweet.hashtags && tweet.hashtags.length > 0) {
            obj.tagged = [];
            tweet.hashtags.forEach(function(hashtag) {
               obj.tagged.push({
                   sourceId: "",
                   name: hashtag.text
               });
            });
        }

        this.set(obj);
        return this;
    },

    convertFromTwitterFollower: function(follower) {
        var obj = {
            _id: $$.u.idutils.generateUniqueAlphaNumeric(16),
            type: $$.constants.social.types.TWITTER,
            sourceId: follower.id_str,
            postType: "follower",
            from: {
                name: follower.screen_name,
                description: follower.description,
                profileimg: follower.profile_background_image_url_https
            }
        };

        if (follower.created_at) {
            obj.date = new Date(follower.created_at).getTime();
        };

        this.set(obj);
        return this;
    }


}, {
    db: {
        storage: "mongo",
        table: "post"
    }
});

$$.m.Post = post;

module.exports = post;
