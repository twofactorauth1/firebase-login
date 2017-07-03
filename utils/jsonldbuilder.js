/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014-2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var jsonldbuilder = {

    log: $$.g.getLogger('jsonldbuilder'),

    buildForBlogPost: function(post, url, orgName, logoUrl) {
        if(logoUrl && logoUrl.indexOf('//') === 0) {
            logoUrl = 'http:' + logoUrl;
        } 
        var JSONLD = {
            "@context": "http://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": url
            },
            "headline": post.get('post_title'),

            "datePublished": post.get('publish_date'),
            "dateModified": post.get('modified').date,
            "author": {
                "@type": "Person",
                "name": post.get('post_author')
            },
            "publisher": {
                "@type": "Organization",
                "name": orgName,
                "logo": {
                    "@type": "ImageObject",
                    "url": logoUrl,
                    "width": 276,
                    "height": 57
                }
            },
            "description": post.get('post_excerpt')
        };
        if(post.get('featured_image')) {
            JSONLD.image = {
                "@type": "ImageObject",
                    "url": post.get('featured_image'),
                    "height": 800,
                    "width": 800
            };
        }
        return JSONLD;
    },

    sendWebhookData: function(cb) {
        var ary = [];

        var request = require('request');
        var options = {
            method: 'post',
            body: ary,
            json: true,
            url: 'http://main.indigenous.local:3000/api/1.0/analytics/sendgrid/event'
        };
        request(options, function (err, res, body) {
            if (err) {
                console.error('error posting json: ', err);
                throw err
            }
            var headers = res.headers;
            var statusCode = res.statusCode;
            console.log('headers: ', headers);
            console.log('statusCode: ', statusCode);
            console.log('body: ', body);
        });
    }


};

module.exports = jsonldbuilder;
