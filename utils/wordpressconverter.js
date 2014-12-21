
var fs = require('fs'),
    xml2js = require('xml2js'),
    _ = require('underscore'),
    ns = require('../utils/namespaces'),
    BlogPost = require('../cms/model/blogpost'),
    app = require('../app'),
    async = require('async'),
    cmsManager = require('../cms/cms_manager');

var wordpressConverter = {

    convertBlog: function(filename, accountId, websiteId, pageId, cb) {
        var self = this;
        var parser = new xml2js.Parser();

        fs.readFile('./katyameyers.wordpress.2014-12-02.xml', function(err, data) {
            parser.parseString(data, function (err, result) {

                var authorMap = self._buildAuthorMap(result.rss.channel[0]['wp:author']);

                var pages = [];
                _.each(result.rss.channel[0].item, function(post, index, list){
                    console.log('processing post ' + index + ' of ' + list.length);
                    var blogpost = self._convertWPItemToBlogpost(post, authorMap);
                    blogpost.set('accountId', accountId);
                    blogpost.set('websiteId', websiteId);
                    blogpost.set('pageId', pageId);
                    //console.dir(blogpost);
                    pages.push(blogpost);
                    if(index === list.length-1) {
                        console.log('pages.length: ' + pages.length);
                        async.each(pages, function(page, callback){
                            cmsManager.createBlogPost(accountId, page, function(err, value){
                                if(err) {
                                    console.log('error saving page: ' + err);
                                    callback(err);
                                } else {
                                    console.log('saved');
                                }
                                callback();
                            });
                        }, function(err){
                            cb();
                        });
                        //cb();
                    }
                });
                //cb();
            });
        });
    },

    _convertWPItemToBlogpost: function(post, authormap) {
        var self = this;
        /*
         post_author: null, dc:creator

         post_title: null, title[0]

         post_content: null, content:encoded[0]

         post_excerpt: null, excerpt:encoded[0]

         post_status: null, wp:status

         post_category: null, _getCategoryValue(category)

         post_tags: [], _getTagValue(category)

         comment_status: null, 'Publish'

         comment_count: null, 'wp:comment'.length

         comments: []  'wp:comment'

         post_url:null, post_name[0]
         */
        //console.dir(post);
        var commentAry = post['wp:comment'] || [];
        var blogpost = new BlogPost({
            post_author : post['dc:creator'][0],
            post_title: post.title[0],
            post_content: post['content:encoded'][0],
            post_excerpt: post['excerpt:encoded'][0],
            post_status: post['wp:status'],
            post_category: self._getCategoryValue(post['category']),
            post_tags: self._getTagArray(post['category']),
            comment_status: 'Publish',
            comment_count: commentAry.length,
            comments: commentAry,
            post_url: post['wp:post_name'][0],
            created: {
                date: post['wp:post_date'][0],
                by: post['dc:creator'][0]
            }
        });
        return blogpost;
    },

    _getCategoryValue: function(wpCategoryObj) {
        var category = _.filter(wpCategoryObj, function(obj) {
            if(obj['$'].domain === 'category') {
                return true;
            }

            //console.dir(obj['$']);
            //console.log(obj['$'].domain);
            //console.dir(_.where(obj['$'], { domain: 'category', nicename: 'blog' }));
            //return _.where(obj['$'], {domain: 'category'}).length > 0;
        });
        //console.dir(_.findWhere(categoryAry, {'$':{domain:'category'}}) );
        var val = '';
        if(category[0]) {
            val = category[0]['_'];
        }
        return val;
    },

    _getTagArray: function(wpCategoryObj) {
        var tag = _.filter(wpCategoryObj, function(obj){
            if(obj['$'].domain === 'post_tag') {
                return true;
            }
        });
        var val = [];
        if(tag[0]) {
            val = [tag[0]['_']];
        }
        return val;
    },

    _buildAuthorMap: function(obj) {
        var authorAry = [];
        _.each(obj, function(authorObj, index, ary){
            /*
             { 'wp:author_id': [ '1' ],
             'wp:author_login': [ 'admin' ],
             'wp:author_email': [ 'jay@notworking.com' ],
             'wp:author_display_name': [ 'admin' ],
             'wp:author_first_name': [ '' ],
             'wp:author_last_name': [ '' ] },
             */

            var author = {};
            author.id = authorObj['wp:author_id'][0];
            author.post_author = authorObj['wp:author_display_name'][0];
            author.login = authorObj['wp:author_login'][0];
            author.email = authorObj['wp:author_email'][0];
            author.firstName = authorObj['wp:author_first_name'][0];
            author.lastName = authorObj['wp:author_last_name'][0];
            authorAry.push(author);
        });
        return authorAry;
    }




};

module.exports = wordpressConverter;