/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014-2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');
var RSS = require('rss');
var async = require('async');
var accountDao = require('../dao/account.dao');
var ssbManager = require('../ssb/ssb_manager');
var appConfig = require('../configs/app.config');

var view = function (req, resp, options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    log: $$.g.getLogger('rss.server.view'),

    renderBlogFeed: function(accountId) {
        var self = this;
        self.log.debug(accountId, null, '>> renderBlogFeed');

        async.waterfall([
            function getAccount(cb) {
                accountDao.getAccountByID(accountId, cb);
            },
            function getBlogPage(account, cb) {
                var websiteId = null;
                if(account.get('website')) {
                    websiteId = account.get('website').websiteId;
                }
                ssbManager.getPublishedPage(accountId, websiteId, 'blog-list', function(err, blogPage) {
                    if(err || !blogPage) {
                        self.log.error(accountId, null, 'Error getting blog page:', err);
                        cb(err);
                    } else {
                        cb(null, account, blogPage);
                    }
                });
            },
            function getMostRecentPosts(account, blogPage, cb) {
                ssbManager.getPublishedPosts(accountId, null, 20, function(err, posts){
                    if(err) {
                        self.log.error(accountId, null, 'Error getting published posts:', err);
                        cb(err);
                    } else {
                        cb(null, account, blogPage, posts);
                    }
                });
            },
            function buildTheFeed(account, blogPage, posts, cb) {
                var image_url = null;
                //console.log('originalURL:', self.req.originalUrl);
                var protocol = self.req.protocol;
                var secure = self.req.secure;                
                var xfp = self.req.get('X-Forwarded-Proto');//XFP:http or XFP:https
                //self.log.debug('protocol:' + protocol + ', secure:' + secure + ', XFP:' + xfp);
                var url = appConfig.getRequestDomainUrl(self.req.host, xfp) + self.req.originalUrl;
                //console.log('Url', url);
                var blogUrl = url.replace('/feed/rss', '');
                if(account.get('business')) {
                    var business = account.get('business');
                    if(business.logo) {
                        image_url = business.logo;
                    }

                }
                var feedOptions = {
                    title: blogPage.get('title'),
                    description: blogPage.get('description'),
                    feed_url: url,
                    site_url: blogUrl,

                    //docs: 'http://example.com/rss/docs.html',
                    //managingEditor: 'Dylan Greene',
                    //webMaster: 'Dylan Greene',
                    //copyright: '2013 Dylan Greene',
                    language: 'en',
                    //categories: ['Category 1','Category 2','Category 3'],
                    // pubDate: 'May 20, 2012 04:00:00 GMT',
                    ttl: '60'
                };
                if(image_url) {
                    feedOptions.image_url = self._getImageUrl(image_url, xfp);
                }
                var feed = new RSS(feedOptions);
                _.each(posts, function(post){
                    feed.item({
                        title: post.get('post_title'),
                        description: post.get('post_excerpt'),
                        url: blogUrl + '/' + post.get('post_url'), // link to the item
                        guid: post.id(), // optional - defaults to url
                        //categories: ['Category 1','Category 2','Category 3','Category 4'], // optional - array of item categories
                        author: post.get('post_author'), // optional - defaults to feed author property
                        date: post.get('publish_date') // any format that js Date can parse.
                        //lat: 33.417974, //optional latitude field for GeoRSS
                        //long: -111.933231, //optional longitude field for GeoRSS

                    });
                });
                var xml = feed.xml({indent: true});
                self.resp.type('rss');
                self.resp.send(xml);
                self.log.debug(accountId, null, '<< renderBlogFeed');
                cb();
            }
        ], function done(err){
            if(err) {
                self.log.error('Error in render:', err);
                app.render('404.html', {}, function(err, html){
                    if(err) {
                        self.log.error('Error during render:', err);
                    }
                    self.resp.status(404).send(html);
                });
            }
        });

    },

    _getImageUrl: function(url, protocol){        
        if (url && !/http[s]?/.test(url)) {
            url = protocol || 'http' + ':' + url;
        }
        return url;
    }


});

$$.v.RSSView = view;

module.exports = view;