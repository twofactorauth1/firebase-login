/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('../base.dao');
var request = require('request');
var crypto = require('crypto');
var facebookConfig = require('../../configs/facebook.config');
var paging = require('../../utils/paging');
var contactDao = require('../contact.dao');
var userDao = require('../user.dao');
var async = require('async');
var querystring = require('querystring');

var Contact = require('../../models/contact');
var Message = require('../../models/message');
var Post = require('../../models/post');

/*-- for facebook api--*/
var FB       = require('fb');
var moment   = require('moment');

var dao = {

    options: {
        name: "social.facebook.dao",
        defaultModel: null
    },


    GRAPH_API_URL: "https://graph.facebook.com/",


    //region ACCESS TOKEN
    getAppSecretProof: function (accessToken) {
        var proof = crypto.createHmac('sha256', facebookConfig.CLIENT_SECRET).update(accessToken).digest('hex');
        return "app_secret=" + proof;
    },


    refreshAccessToken: function (user, fn) {
        var creds = user.getCredentials($$.constants.user.credential_types.FACEBOOK);
        if (creds != null) {
            if (creds.expires != null && creds.expires < new Date().getTime()) {
                //We are already expired!
                return fn($$.u.errors._401_INVALID_CREDENTIALS, "Invalid Credentials");
            }
            else if (creds.expires == null || (creds.expires - new Date().getTime()) < ($$.u.dateutils.DAY * 30)) {
                //lets try to refresh the token

                var url = this.GRAPH_API_URL + "oauth/access_token?" +
                    "grant_type=fb_exchange_token&" +
                    "client_id=" + facebookConfig.CLIENT_ID + "&" +
                    "client_secret=" + facebookConfig.CLIENT_SECRET + "&" +
                    "fb_exchange_token=" + creds.accessToken;

                request(url, function (err, resp, body) {
                    if (err) {
                        var error = _.clone($$.u.errors._401_INVALID_CREDENTIALS);
                        error.raw = err;
                        return fn(error, "Invalid Credentials")
                    }

                    body = querystring.parse(body);
                    var accessToken = body.access_token;
                    var expires = body.expires;

                    if (accessToken != null) {
                        creds.accessToken = accessToken;
                    }

                    if (expires != null) {
                        creds.expires = new Date().getTime() + (expires * 1000);
                    }

                    userDao.saveOrUpdate(user, fn);
                });
            } else {
                return fn(null, null);
            }
        } else {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "No Facebook credentials found");
        }
    },


    checkAccessToken: function (user, fn) {
        var self = this;
        this.refreshAccessToken(user, function (err, value) {
            if (err) {
                return fn(err, value);
            }

            return self.getProfileForUser(user, fn);
        });
    },
    //endregion


    //region PERMISSIONS
    getPermissions: function (user, fn) {
        var accessToken = this._getAccessToken(user);
        var socialId = this._getFacebookId(user);
        if (accessToken == null || socialId == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "No Facebook credentials found");
        }

        var path = socialId + "/permissions";
        var url = this._generateUrl(path, accessToken);
        this._makeRequest(url, fn);
    },
    //endregion


    //region PROFILE
    getProfileForUser: function (user, fn) {
        var accessToken = this._getAccessToken(user);
        var socialId = this._getFacebookId(user);
        if (accessToken == null || socialId == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "No Facebook credentials found");
        }

        return this.getProfile(socialId, accessToken, fn);
    },


    getProfile: function (accessToken, profileId, fn) {
        var self = this;
        var fields = "email,picture,first_name,last_name,middle_name,name";

        var path = profileId + "?fields=" + fields;
        var url = this._generateUrl(path, accessToken);
        this._makeRequest(url, fn);
    },


    refreshUserFromProfile: function (user, defaultPhoto, fn) {
        if (_.isFunction(defaultPhoto)) {
            fn = defaultPhoto;
            defaultPhoto = false;
        }

        this.getProfileForUser(user, function (err, value) {
            if (!err) {
                var obj = {
                    first: value.first_name,
                    last: value.last_name,
                    middle: value.middle_name
                };

                user.set(obj);

                if (value.picture != null && value.picture.data != null) {
                    user.addOrUpdatePhoto($$.constants.social.types.FACEBOOK, value.picture.data.url, defaultPhoto);
                }

                fn(null, user);
            } else {
                fn(err, value);
            }
        });
    },
    //endregion

    getPages: function(user, fn) {
        var self = this;
        self.log.info("getPages >>> ");
        var socialId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (socialId == null || accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }
        var key = 'accounts';
        return this._getStreamPart(null, accessToken, socialId, key, null, null, null, fn);
    },

    getPageInfo: function(user, pageId, fn) {
        var self = this;
        self.log.info("getPageInfo >>> ");
        var socialId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (socialId == null || accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }
        var key = '';
        return this._getStreamPart(null, accessToken, pageId, key, null, null, null, fn);
    },

    getTokenPageInfo: function(accessToken, socialId, pageId, fn) {
        var key = '?fields=id,about,country_page_likes,cover,description,likes,link,name,picture,talking_about_count,website,new_like_count,unread_message_count,unread_notif_count,unseen_message_count';
        return this._getStreamPart(null, accessToken, pageId, key, null, null, null, fn);
    },

    getPageProfilePic: function(user, pageId, fn) {
        var self = this;
        self.log.info("getPageProfilePic >>> ");
        var socialId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (socialId == null || accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }
        var key = 'picture';
        var path = pageId + "/" + key;
        return fn(null, self._generateUrl(path, accessToken));
    },


    //region FRIENDS & IMPORT
    getFriendsForUser: function (user, fn) {
        var socialId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (socialId == null || accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }

        //var path = socialId + "/friends";
        var query = "SELECT uid, name, first_name, last_name, email, pic, pic_big, pic_square, website, birthday FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = " + socialId + ") ORDER BY name";
        var path = "fql?q=" + query;
        var url = this._generateUrl(path, accessToken);
        this._makeRequest(url, fn);
    },


    importFriendsAsContactsForUser: function (accountId, user, fn) {
        var self = this, totalImported = 0;

        this.getFriendsForUser(user, function (err, value) {
            if (err) {
                return fn(err, value);
            }

            var facebookId = self._getFacebookId(user);
            var _friends = value.data;

            var updateContactFromFacebookFriend = function (contact, facebookFriend) {
                contact.updateContactInfo(facebookFriend.first_name, null, facebookFriend.last_name, facebookFriend.pic_big || facebookFriend.pic, facebookFriend.pic_square, facebookFriend.birthday);

                var websites;
                if (!String.isNullOrEmpty(facebookFriend.website)) {
                    websites = facebookFriend.website.replace(" ", "").split(",");
                }
                //Update contact details
                contact.createOrUpdateDetails($$.constants.social.types.FACEBOOK, facebookId, facebookFriend.uid, facebookFriend.pic, facebookFriend.pic_big, facebookFriend.pic_square, facebookFriend.email, websites);
            };


            (function importFriends(friends, page) {
                if (friends != null) {
                    var numPerPage = 50, socialType = $$.constants.social.types.FACEBOOK;

                    var pagingInfo = paging.getPagingInfo(friends.length, numPerPage, page);

                    var items = paging.getItemsForCurrentPage(friends, page, numPerPage);
                    var socialIds = _.pluck(items, "uid");

                    contactDao.getContactsBySocialIds(accountId, socialType, socialIds, function (err, value) {
                        if (err) {
                            return fn(err, value);
                        }

                        var contactValues = value;
                        async.series([
                            function (callback) {
                                if (contactValues != null && contactValues.length > 0) {
                                    async.eachSeries(contactValues, function (contact, cb) {

                                        //Get reference to current friend
                                        var facebookFriend = _.findWhere(items, {uid: contact.getSocialId(socialType)});

                                        if (facebookFriend == null) {
                                            console.log("facebook friend is null");
                                        }

                                        //remove the contact from the items array so we don't process again
                                        items = _.without(items, facebookFriend);

                                        updateContactFromFacebookFriend(contact, facebookFriend);

                                        contactDao.saveOrUpdateContact(contact, function (err, value) {
                                            if (err) {
                                                self.log.error("An error occurred updating contact during Facebook import", err);
                                                ;
                                            }
                                            totalImported++;
                                            cb();
                                        });

                                    }, function (err) {
                                        callback(err);
                                    });
                                } else {
                                    callback(null);
                                }
                            },

                            function (callback) {
                                //Iterate through remaining items
                                if (items != null && items.length > 0) {
                                    async.eachSeries(items, function (facebookFriend, cb) {

                                        var contact = new Contact({
                                            accountId: accountId,
                                            type: $$.constants.contact.contact_types.FRIEND
                                        });

                                        contact.createdBy(user.id(), socialType, facebookId);
                                        updateContactFromFacebookFriend(contact, facebookFriend);
                                        contactDao.saveOrMerge(contact, function (err, value) {
                                            if (err) {
                                                self.log.error("An error occurred saving contact during Facebook import", err);
                                            }
                                            totalImported++;
                                            cb();
                                        });

                                    }, function (err) {
                                        callback(err);
                                    })
                                } else {
                                    callback(null);
                                }
                            }

                        ], function (err, results) {
                            if (pagingInfo.nextPage > page) {
                                process.nextTick(function () {
                                    importFriends(friends, pagingInfo.nextPage);
                                });
                            } else {
                                self.log.info("Facebook friend import succeed. " + totalImported + " imports. Now merging duplicates.");
                                contactDao.mergeDuplicates(null, accountId, function(err, value){
                                    if(err) {
                                        self.log.error('Error occurred during duplicate merge: ' + err);
                                        fn(null);
                                    } else {
                                        self.log.info('Duplicate merge successful.');
                                        fn(null);
                                    }
                                });
                            }
                        });
                    });
                }
            })(_friends, 1);
        });
    },
    //endregion


    //region STREAM
    getUserStream: function (user, socialId, fn) {
        var key = "feed";
        return this._getStreamPart(user, null, socialId, key, null, null, null, fn);
    },

    getTokenStream: function(accessToken, socialId, since, until, limit, fn) {
        var key = 'feed?fields=id,from,message,story,story_tags,picture,link,icon,actions,privacy,type,status_type,object_id,created_time,updated_time,likes,comments{id,attachment,comment_count,created_time,like_count,message,user_likes,from{id,name,picture}}';
        //var key = 'feed';
        return this._getStreamPart(null, accessToken, socialId, key, since, until, limit, fn);
    },

    getLikedPages: function(accessToken, socialId, since, until, limit, fn) {
        var key = 'likes';
        return this._getStreamPart(null, accessToken, socialId, key, since, until, limit, fn);
    },

    getTokenAdminPages: function(accessToken, socialId, since, until, limit, fn) {
        var key = "accounts?fields=id,about,country_page_likes,cover,description,likes,link,name,picture,talking_about_count,website,new_like_count,unread_message_count,unread_notif_count,unseen_message_count";
        return this._getStreamPart(null, accessToken, socialId, key, since, until, limit, fn);
    },

    getUserPosts: function (user, socialId, fn) {
        var self = this;
        self.log.info("facebook dao: getUserPosts >>> ");
        self.log.info("facebook dao: user >>> ", user);
        self.log.info("facebook dao: socialId >>> ", socialId);
        var key = "posts";
        return this._getStreamPart(user, null, socialId, key, null, null, null, fn);
    },

    getPostComments: function (accessToken, socialId, postId, fn) {
        var self = this;
        self.log.info("facebook dao: getPostComments >>> ");
        var key = postId + "/comments";
        var url = this._generateUrl(key, accessToken);
        self.log.info("facebook dao: url >>> ", url);
        return this._makeRequest(url, function (err, value) {
            self.log.info("_getStreamPart: fb value >>> ", value);
            self.log.info("_getStreamPart: key >>> ", key);
            if (err) {
                return fn(err, value);
            }

            if (value && value.data && value.data.length > 0 && key.length > 0) {
                var result = [];

                var processPost = function (_post, cb) {
                    result.push(new Post().convertFromFacebookPost(_post));
                    cb();
                };

                async.eachLimit(value.data, 10, processPost, function (cb) {
                    return fn(null, result);
                });
            } else {
                var thisval = value.data || value;
                return fn(null, thisval);
            }
        });
    },

    getTokenPosts: function(accessToken, socialId, fn) {
        var self = this;
        var key = "posts";
        return self._getStreamPart(null, accessToken, socialId, key, null, null, null, fn);
    },

    getUserStatuses: function (user, socialId, fn) {
        var key = "statuses";
        return this._getStreamPart(user, null, socialId, key, null, null, null, fn);
    },


    getUserTagged: function (user, socialId, fn) {
        var key = "tagged";
        return this._getStreamPart(user, null, socialId, key, null, null, null, fn);
    },

    getTokenSearch: function(accessToken, socialId, searchType, term, since, until, limit, fn) {
        var self = this;
        var url = this.GRAPH_API_URL +'search?q=' + term + '&type=' + searchType + '&access_token=' + accessToken;

        if(since) {
            url += '&since=' + since;
        }
        if(until) {
            url+= '&until=' + until;
        }
        if(limit) {
            url += '&limit=' + limit;
        } else {
            url += '&limit=500';
        }


        return this._makeRequest(url, function (err, value) {
            self.log.info("_getStreamPart: fb value >>> ", value);
            if (err) {
                return fn(err, value);
            }

            if (value && value.data && value.data.length > 0) {
                var result = [];

                var processPost = function (_post, cb) {
                    result.push(new Post().convertFromFacebookPost(_post));
                    cb();
                };

                async.eachLimit(value.data, 10, processPost, function (cb) {
                    return fn(null, result);
                });
            } else {
                return fn(null, value.data);
            }
        });
    },


    _getStreamPart: function (user, _accessToken, socialId, key, since, until, limit, fn) {
        var self = this;
        self.log.info("facebook dao: _getStreamPart >>> " + _accessToken);
        var accessToken = _accessToken;

        if(user) {
            var accessToken = this._getAccessToken(user);
        }


        if (accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }

        var path = socialId + "/" + key;

        var url = this._generateUrl(path, accessToken);

        if(since) {
            url += '&since=' + since;
        }
        if(until) {
            url+= '&until=' + until;
        }
        if(limit) {
            url += '&limit=' + limit;
        } else {
            url += '&limit=500';
        }

        self.log.info("_getStreamPart: path >>> ", path);
        self.log.info("_getStreamPart: url >>> ", url);

        return this._makeRequest(url, function (err, value) {
            self.log.info("_getStreamPart: fb value >>> ", value);
            self.log.info("_getStreamPart: key >>> ", key);
            if (err) {
                return fn(err, value);
            }

            if (value && value.data && value.data.length > 0 && key.length > 0) {
                var result = [];

                var processPost = function (_post, cb) {
                    result.push(new Post().convertFromFacebookPost(_post));
                    cb();
                };

                async.eachLimit(value.data, 10, processPost, function (cb) {
                    return fn(null, result);
                });
            } else {
                var thisval = value.data || value;
                return fn(null, thisval);
            }
        });
    },


    getMessagesWithFriend: function (user, socialId, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }

        var query1 = "SELECT author_id, thread_id, body, created_time FROM message WHERE thread_id IN (SELECT thread_id FROM thread WHERE folder_id = 1 AND (" + socialId + " IN (recipients) OR originator = " + socialId + ")) ORDER BY created_time DESC";
        var query2 = "SELECT first_name, middle_name, last_name, uid from user where uid in (select author_id from message where thread_id IN (SELECT thread_id FROM thread WHERE folder_id = 1 AND (" + socialId + " IN (recipients) OR originator = " + socialId + ")))";

        var path1 = "fql?q=" + query1;
        var path2 = "fql?q=" + query2;

        var url1 = this._generateUrl(path1, accessToken);
        var url2 = this._generateUrl(path2, accessToken);

        var async = require("async");

        async.parallel([
            function (cb) {
                self._makeRequest(url1, function (err, value) {
                    cb(err, value);
                });
            },

            function (cb) {
                self._makeRequest(url2, function (err, value) {
                    cb(err, value);
                });
            }
        ], function (err, results) {
            if (err) {
                return fn(err);
            }

            var messages = results[0].data;
            var userNames = results[1].data;

            var getName = function (uid) {
                var obj = _.findWhere(userNames, {uid: uid});
                if (obj != null) {
                    return obj.first_name + " " + obj.last_name;
                }
                return "";
            };

            var _messages = [];
            messages.forEach(function (message) {
                message.name = getName(message.author_id);
                _messages.push(new Message().convertFromFacebookMessage(message));
            });

            fn(null, _messages);
        });
    },

    //region
    getLikesPerDay: function (user, options, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }

        // default == last 7 days
        var since = +new Date(options.since) || moment().utc().subtract('days', 7).startOf('day').toDate()
            , until = +new Date(options.until) || moment().utc().startOf('day').toDate();
        var url = '/' + myFacebookId + '/insights/page_fan_adds/day';
        // make a call the facebook api through our fb package
        FB.api(url, 'get', {
            access_token: accessToken
            , since: since / 1000
            , until: until / 1000
            , limit: options.limit || 90
        }, function(res){
            var data = res.data[0] && res.data[0].values;
            // no results
            if (!data) return fn(null, []);

            data = data.map(function(day, i){
                var obj = { date: day.end_time.split('T')[0] };
                obj[metric] = day.value;
                return obj;
            });

            fn(null, data);
        })
    },

    getUnlikesPerDay:  function (user, options, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }
        // default == last 7 days
        var since = +new Date(options.since) || moment().utc().subtract('days', 7).startOf('day').toDate()
            , until = +new Date(options.until) || moment().utc().startOf('day').toDate()

        var url = '/' + myFacebookId + '/insights/page_fan_removes/day'

        // make a call the facebook api through our fb package
        FB.api(url, 'get', {
            access_token: accessToken
            , since: since / 1000
            , until: until / 1000
            , limit: options.limit || 90
        }, function(res){
            var data = res.data[0] && res.data[0].values
            // no results
            if (!data) return fn([])

            data = data.map(function(day, i){
                var obj = { date: day.end_time.split('T')[0] }
                obj[metric] = day.value
                return obj
            })

            fn(data)
        })
    },

    getLikesUnlikesPerDay: function (user, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);
    },

    getPosts: function (user, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        var url = '/' + myFacebookId + '/feed'
            , apiOptions = {
                access_token: accessToken
                , limit: 15
            }

        // Only include since && until parameters if they have been set;
        // the `FB.api` call fails if they are `null` or `undefined`
        if (options.since && options.until) {
            // default == last 7 days
            var since = +new Date() || moment().subtract('days', 7).startOf('day').toDate()
                , until = +new Date() || moment().startOf('day').toDate()
            apiOptions.since = since / 1000
            apiOptions.until = until / 1000
        }

        var defaultFields = 'id,message,story,link,picture,type,created_time,comments,shares,likes'
        apiOptions.fields = defaultFields

        logger.info('Requesting posts data', { method: 'getPosts', id: this.myFacebookId })

        FB.api(url, 'get', apiOptions, function(res){
            logger.info('Received posts data')
            fn(res.error, res.data || [])
        })
    },

    getPostInteractions: function (user, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        this.getPosts(user, function(err, posts){
            if (!Array.isArray(posts)) return fn(null, [])

            var posts = posts.map(function(post){
                post.message = (post.message || post.story || '')
                    .replace(/\t/g, " ")
                    .replace(/[\n\r]+/g, ' ')

                return {
                    id       : post.id
                    , date     : post.created_time.split('T')[0]
                    , title    : post.message  ? post.message        : ' '
                    , likes    : post.likes    ? post.likes.count    : 0
                    , shares   : post.shares   ? post.shares.count   : 0
                    , comments : post.comments ? post.comments.count : 0
                }
            })

            fn(null, posts);
        })
    },

    getTopTenPosts: function (user, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        this.getPosts(options, function(err, posts){
            if (err || !Array.isArray(posts) || posts.length == 0) return fn(err, [])

            var urls = posts.map(function(post){
                return post.id + '/insights/post_storytellers'
            })

            self._batchRequest('topTenPosts storytellers', {
                token : myFacebookId
                , urls  : urls
                , since : moment().subtract('days', 90).startOf('day').toDate() / 1000
            }, function(err, storytellers){
                var st = storytellers
                Object.keys(st).forEach(function(key){
                    storytellers[key] = st[key] && st[key][0] && st[key][0].value || 0
                })
                if (err || !storytellers) return callback(err, [])

                var top = posts.map(function(post, i){
                    post.talking = storytellers[i] || 0
                    return post
                }).sort(function(a, b){
                        if (b.talking > a.talking) return  1
                        if (b.talking < a.talking) return -1
                        a = a.likes + a.comments * 2
                        b = b.likes + b.comments * 2
                        return b - a
                    }).slice(0, 10)

                var urls = top.reduce(function(urls, post, i){
                    urls['p'+i+'_reach']   = post.id + '/insights/post_impressions_unique'
                    urls['p'+i+'_engaged'] = post.id + '/insights/post_engaged_users'
                    return urls
                }, {})

                self._batchRequest('topTenPosts reach/engaged', {
                    token : myFacebookId
                    , urls  : urls
                }, function(err, data){
                    if (err || !data) return fn(err, [])

                    var results = top.map(function(post, i){
                        var reach   = (data['p'+i+'_reach'  ] || [])[0]
                            , engaged = (data['p'+i+'_engaged'] || [])[0]

                        // Fallback to likes & comments if insights data is empty
                        var likes    = post.likes    && post.likes.count    || 0
                            , comments = post.comments && post.comments.count || 0

                        return {
                            id       : post.id
                            , date     : post.created_time
                            , type     : post.type
                            , message  : post.message || post.story
                            , link     : post.link
                            , reach    : reach && reach.value || 0
                            , talking  : post.talking || comments || 0
                            , engaged  : engaged && engaged.value || (likes + comments) || 0
                            , likes    : likes
                            , comments : comments
                        }
                    })

                    fn(null, results)
                })
            })
        })
    },

    getReachPerDay: function (user, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        var since = +new Date() || moment().subtract('days', 7).startOf('day').toDate()
            , until = +new Date() || moment().startOf('day').toDate()

        self._batchRequest('reachPerday', {
            token : accessToken
            , since : since
            , until : until
            , id    : myFacebookId
            , urls  : {
                paid    : '/insights/page_impressions_paid_unique'
                , organic : '/insights/page_impressions_organic_unique'
                , viral   : '/insights/page_impressions_viral_unique'
            }
            , merge: true
        }, callback)
    },

    getEngagedDemographics: function (user, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);
    },

    getTopFiveFans: function (user, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);
    },

    getAppInsights: function (user, urlOptions, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);
        var apiOptions = {access_token: accessToken};
        var url = [facebookConfig.CLIENT_ID, 'insights'];
        if (urlOptions.metric) {
            url.push(urlOptions.metric);
            url.push(urlOptions.period);
            url.push(urlOptions.breakdown);
        }
        url = url.join('/');
        console.info('Fetch App Insights : ' + url);
        FB.api(url, 'get', apiOptions, function (res) {
            console.info('Received insight data');
            console.log(res);
            fn(res.error, res.data || [])
        });
    },

    //region feed

    createPostWithToken: function(accessToken, socialId, content, objectId, fn) {
        var self = this;
        self.log.debug('>> createPostWithToken');

        var urlOptions = {access_token:accessToken, message:content};

        if(objectId) {
            urlOptions.object_attachment = objectId;
        }

        FB.api(socialId + '/feed', 'post', urlOptions, function(res){
            if(!res || res.error) {
                self.log.error('Error sharing post: ' + JSON.stringify(res.error));
                fn(res.error, null);
            } else {
                self.log.debug('<< createPostWithToken', res);
                fn(null, res.id);
            }
        });
    },

    postCommentWithToken: function(accessToken, socialId, comment, fn) {
        var self = this;
        self.log.debug('>> postCommentWithToken');

        var urlOptions = {access_token:accessToken, message:comment};

        FB.api(socialId + '/comments', 'post', urlOptions, function(res){
            if(!res || res.error) {
                self.log.error('Error sharing post: ' + JSON.stringify(res.error));
                fn(res.error, null);
            } else {
                self.log.debug('<< postCommentWithToken', res);
                fn(null, res.id);
            }
        });
    },

    postLikeWithToken: function(accessToken, socialId, fn) {
        var self = this;
        self.log.debug('>> postLikeWithToken');

        var urlOptions = {access_token:accessToken};

        FB.api(socialId + '/likes', 'post', urlOptions, function(res){
            if(!res || res.error) {
                self.log.error('Error sharing like: ' + JSON.stringify(res.error));
                fn(res.error, null);
            } else {
                self.log.debug('<< postLikeWithToken', res);
                fn(null, res.id);
            }
        });
    },

    deleteLikeWithToken: function(accessToken, socialId, fn) {
        var self = this;
        self.log.debug('>> deleteLikeWithToken');

        var urlOptions = {access_token:accessToken};

        FB.api(socialId + '/likes', 'delete', urlOptions, function(res){
            if(!res || res.error) {
                self.log.error('Error sharing like: ' + JSON.stringify(res.error));
                fn(res.error, null);
            } else {
                self.log.debug('<< deleteLikeWithToken', res);
                fn(null, res.id);
            }
        });
    },

    shareLink: function(user, url, picture, name, caption, description, fn) {

        var self = this;
        self.log.debug('>> shareLink');
        //var facebookID = self._getFacebookId(user);
        var accessToken = self._getAccessToken(user);

        var urlOptions = {access_token: accessToken, link:url};
        if(picture && picture.length > 0) {
            urlOptions.picture = picture;
        }
        if(name && name.length > 0) {
            urlOptions.name = name;
        }
        if(caption && caption.length > 0) {
            urlOptions.caption = caption;
        }
        if(description && description.length > 0) {
            urlOptions.description = description;
        }

        FB.api('me/feed', 'post', urlOptions, function(res){
            if(!res || res.error) {
                self.log.error('Error sharing post: ' + JSON.stringify(res.error));
                fn(res.error, null);
            } else {
                self.log.debug('<< shareLink', res);
                fn(null, res.id);
            }
        });
    },

    //needs permission read_mailbox
    getMessages: function(accessToken, socialId, fn) {
        var self = this;
        self.log.debug('>> getMessages');
        var urlOptions = {access_token: accessToken};
        FB.api('/me/inbox', urlOptions, function(res) {
            if(!res || res.error) {
                self.log.error('Error sharing post: ' + JSON.stringify(res.error));
                fn(res.error, null);
            } else {
                self.log.debug('<< getMessages', res);
                fn(null, res);
            }
        });
    },

    savePhoto: function(accessToken, socialId, url, fn) {
        var self = this;
        self.log.debug('>> savePhoto');
        var urlOptions = {access_token: accessToken, url: url};
        FB.api('/' + socialId + '/photos', urlOptions, function(res) {
            if(!res || res.error) {
                self.log.error('Error saving photo: ' + JSON.stringify(res.error));
                fn(res.error, null);
            } else {
                self.log.debug('<< savePhoto', res);
                fn(null, res);
            }
        });
    },

    deletePostWithToken: function(accessToken, socialId, postId, fn) {
        var self = this;
        self.log.debug('>> deletePostWithToken');
        var urlOptions = {access_token: accessToken};
        FB.api('/' + postId, 'DELETE', urlOptions, function(err, value){
            if(!res || res.error) {
                self.log.error('Error deleting post: ' + JSON.stringify(res.error));
                return fn(res.error, null);
            } else {
                self.log.debug('<< deletePostWithToken', res);
                return fn(null, res);
            }
        });
    },

    //region PRIVATE
    _batchRequest: function(batchName, options, fn){
        // default == last 7 days
        var since = +new Date(options.since) || moment().subtract('days', 7).startOf('day').toDate()
            , until = +new Date(options.until) || 0

        var keys = Object.keys(options.urls)
            , basePath = '/' + (options.id || '')
            , batch = []
            , batches = []
            , params = _.extend({
                since: since / 1000
                , until: until / 1000
            }, options.params)

        keys.forEach(function(key){
            var url   = path.join(basePath, options.urls[key])
                , query = _.extend({}, params, URL.parse(url, true).query)

            batch.push({ method: 'get', relative_url: url + '?' + qs.stringify(query) })
        })

        // Overcome FB 50 data points per request limit if necessary
        var batchLimit = 50
        while (batch.length > batchLimit) {
            batches.push(batch.splice(0, batchLimit))
        }
        if (batch.length > 0) batches.push(batch)

        var total   = batches.length
            , results = options.array ? [] : {}
            , raw     = options.array ? [] : {}
            , errors  = []

        logger.info('Requesting data', { method: batchName, id: options.id, batches: total })

        batches.forEach(function(batch){
            FB.api('', 'post', {
                access_token: options.token
                , batch: batch
            }, function(res) {
                logger.info('Response received', { method: batchName, id: options.id, batch: total - batches.length })
                addResults(res)

                if (--batches.length <= 0) {
                    if (errors.length) return fn(errors[0])
                    logger.info('Batch finished', { method: batchName, id: options.id })
                    if (options.merge) {
                        results = mergeValues(results)
                    }
                    fn(null, results, raw)
                }
            })
        })

        function addResults (res) {
            if (res.error || res.code >= 400) {
                try {
                    var error = JSON.parse(res.body)
                    error && (error = error.error)
                } catch (e) {} finally {
                    logger.error(batchName + ' failed', error || res.error)
                }
                errors.push(new Error(batchName + ' failed'))
                return
            }

            ;(res || []).forEach(function(item, i){
                try {
                    item = JSON.parse(item.body)
                } catch (e) {
                    item = null
                }

                // Allow Graph API requests with plain object responses
                var values = item && Array.isArray(item.data)
                    ? getDataValues(item)
                    : item

                if (options.array) {
                    raw.push(item)
                    results.push(values)
                } else {
                    raw[keys[i]] = item
                    results[keys[i]] = values
                }
            })
        }
    },

    _getAccessToken: function (user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.FACEBOOK);
        if (credentials == null) {
            return null;
        }
        return credentials.accessToken;
    },


    _getFacebookId: function (user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.FACEBOOK);
        if (credentials == null) {
            return null;
        }
        return credentials.socialId;
    },


    _generateUrl: function (path, accessToken) {
        var url = this.GRAPH_API_URL + path;
        if (url.indexOf("?") > -1) {
            url += "&";
        } else {
            url += "?";
        }

        url += "access_token=" + accessToken;
        return url;
    },


    _makeRequest: function (url, fn) {
        var self = this;
        request(url, function (err, resp, body) {
            if (!err) {
                self.log.debug('>> body ', body);
                var result = JSON.parse(body);
                self._isAuthenticationError(result, fn);
            } else {
                fn(err, resp);
            }
        });
    }
    //endregion
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.social = $$.dao.social || {};
$$.dao.social.FacebookDao = dao;

module.exports = dao;
