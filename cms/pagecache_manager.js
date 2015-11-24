/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var s3dao = require('../dao/integrations/s3.dao');
var COMPILED_PAGE_BUCKET = 'indigenous-account-websites';
var knox = require('knox');
var s3config = require('../configs/aws.config');
var fs = require('fs');

var s3Client = knox.createClient({
    key:s3config.AWS_ACCESS_KEY,
    secret: s3config.AWS_SECRET_ACCESS_KEY,
    bucket: COMPILED_PAGE_BUCKET
});

module.exports = {
    log: $$.g.getLogger("pagecache_manager"),

    cachePage: function() {

    },

    getLocalCachedPageForTesting: function(accountId, pageName, resp) {
        var self = this;
        fs.readFile('./test/' + pageName, 'utf-8', function(err, html){
            if(err) {
                self.log.error("Error getting file:", err);
                resp.send("<p>Error</p>");

            } else {
                resp.send(html);
            }
        });
    },

    getCachedPage: function(accountId, pageName, resp) {
        var self = this;
        //check if it's there.
        s3Client.get('acct_' + accountId + '/' + pageName).on('response', function(res){
            //self.log.debug('response: ', res);
            //check the status code

            if(res.statusCode === 200) {
                //pipe it
                resp.setHeader('Content-Length', res.headers['content-length'])
                resp.setHeader('Content-Type', res.headers['content-type'])

                // cache-control?
                // etag?
                // last-modified?
                // expires?

                res.pipe(resp);
            } else {
                self.log.debug('statusCode:' + res.statusCode);
                resp.send('Nothing found?');
            }
        }).end();

    }
};