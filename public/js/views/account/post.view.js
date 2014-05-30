/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'models/user',
    'models/account',
    'models/post',
    'collections/posts',

], function(User, Account, Post, Posts) {

    var view = Backbone.View.extend({

        templateKey: "account/contacts",

        userId: null,
        user: null,
        accounts: null,
        currentLetter: "a",

        events: {
        },


        initialize: function() {
            console.log('initialize posts');
        },


        render: function() {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser()
                , p3 = this.getPosts();

            $.when(p1, p2, p3)
                .done(function() {
                    self.renderPosts();
                });
        },


        renderPosts: function() {
            var self = this;
            var data = {
                account: self.account.toJSON(),
                user: self.user.toJSON(),
                posts: self.posts.toJSON()
            };

            console.log('Posts Data: '+JSON.stringify(data));

            // var tmpl = $$.templateManager.get("contacts-main", self.templateKey);
            // var html = tmpl(data);

            // self.show(html);
        },


        createPost: function() {
            $$.r.account.ContactRouter.navigateToCreateContact(this.currentLetter);
        },


        importPosts: function(event) {
            this._importContacts($$.constants.social.types.GOOGLE);
        },


        getUser: function() {
            if (this.userId == null) {
                this.userId = $$.server.get($$.constants.server_props.USER_ID);
            }

            this.user = new $$.m.User({
                _id: this.userId
            });

            return this.user.fetch();
        },


        getAccount: function() {
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }

            this.account = new $$.m.Account({
                _id: this.accountId
            });

            return this.account.fetch();
        },


        getPosts: function() {
            if (this.accountId == null) {
                this.accountId = $$.server.get($$.constants.server_props.ACCOUNT_ID);
            }
            this.posts = new $$.c.Posts();

            return this.posts.getContactsById(this.accountId);
        }


    });

    $$.v.account = $$.v.account || {};
    $$.v.account.PostView = view;

    return view;
});