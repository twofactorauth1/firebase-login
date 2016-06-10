/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014-2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var jsonldbuilder = {

    log: $$.g.getLogger('jsonldbuilder'),

    buildForBlogPost: function(post, url, orgName, logoUrl) {
        var JSONLD = {
            "@context": "http://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": url
            },
            "headline": post.get('post_title'),
            "image": {
                "@type": "ImageObject",
                "url": post.get('featured_image')
                // "height": 800,
                // "width": 800
            },
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

        return JSONLD;
    }


};

module.exports = jsonldbuilder;
