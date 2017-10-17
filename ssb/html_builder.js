var logger = $$.g.getLogger("html_builder");
var async = require('async');
var appConfig = require('../configs/app.config');
var knox = require('knox');
var s3config = require('../configs/aws.config');
var COMPILED_PAGE_BUCKET = 'indigenous-account-websites';

var s3Client = knox.createClient({
    key:s3config.AWS_ACCESS_KEY,
    secret: s3config.AWS_SECRET_ACCESS_KEY,
    bucket: COMPILED_PAGE_BUCKET
});

var builder = {

    log:logger,

    buildPage:function(accountId, userId, orgId, publishedPage, template, website, defaultAccountUrl, accountHost, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> buildPage');
        var sections = publishedPage.get('sections');
        var isModifiedTemplate = false;
        var html = '';
        var index = 0;
        async.eachSeries(sections, function(section, cb){
            if(section.components.length === 1 && section.components[0].type === 'footer') {
                self._buildFooter(accountId, userId, orgId, publishedPage, section, template, website, defaultAccountUrl, accountHost, function(err, _template){
                    html += _template;
                    index++;
                    cb();
                });
            } else {
                html = html + '<ssb-page-section section="sections_' + index + '" index="' + index + '" class="ssb-page-section"></ssb-page-section>';
                index++;
                cb();
            }
        }, function(err){
            self._updateTemplate(accountId, publishedPage.id(), publishedPage.get('handle'), html, fn);
        });
    },

    _updateTemplate: function(accountId, pageId, pageName, html, fn) {
        var self = this;
        self.log.debug('Storing to s3', html);
        self.log.debug('pageId', pageId);
        self.log.debug('pageName', pageName);
        var environmentName = 'prod';
        if(appConfig.nonProduction === true) {
            environmentName = 'test';
        }
        var path = environmentName + '/acct_' + accountId + '/' + pageName;
        var req = s3Client.put(path, {
            'Content-Length': Buffer.byteLength(html),
            'Content-Type': 'text/html'
        });
        req.on('response', function(res){
            if (200 == res.statusCode) {
                self.log.debug('Success!');
                fn();
            }
        });
        req.end(html);
    },

    _buildFooter: function(accountId, userId, orgId, page, section, template, website, defaultAccountUrl, accountHost, fn){
        var self = this;
        var component = section.components[0];
        var isOrg1 = false;
        var isReverse = false;
        var year = moment().year();
        var isFooterLink = website.get('settings').footerlink;
        var hasFooterLinkText = false;
        if(website.get('settings').footerLinkText) {
            hasFooterLinkText = true;
        }
        var footerLinkUrl = defaultAccountUrl + "?utm_source=" + accountHost + "&utm_medium=footer_link";
        if(!isFooterLink && website.get('settings').footerLinkText) {
            footerLinkUrl = website.get('settings').footerLinkText;
        }

        //!website.settings.footerlink && website.settings.footerLinkText != '' ? website.settings.footerLinkURL : footerLinkUrl
        var copyrightText = component.text || 'Copyright © ' + year + '. All Rights reserved.';
        var footerClass = "footer-logo";
        var footerImage = '/images/footer-logo.png';
        if(orgId === 1) {
            isOrg1 = true;
            footerClass = 'footer-logo rvlvr-logo';
            footerImage = '/images/rvlvr/footer-logo.png';
        }
        var html = '<div id="footer" class="footer-container ';
        if(isOrg1) {
            html += 'rvlvrfooter ';
        }
        html += 'footer-v1"> <div class="footer-after section">';
        if(!isReverse && !isOrg1) {
            html += '<div class="container">';
            html += '<p class="col-xs-12 col-sm-8 copyright">' + copyrightText + '</p>';
            html += '<p class="col-xs-12 col-sm-4 powered-by ';
            if(!isFooterLink) {
                html +='text-right';
            }
            html +='">';
            if(isFooterLink) {
                html += '<a class="footer-link"  href="' + footerLinkUrl + '"><img class="' + footerClass + '" src="' + footerImage + '"></a>';
            }
            if(hasFooterLinkText) {
                html += '<a class="footer-link padding-bottom-15" href="' + footerLinkUrl + '" rel="nofollow">' + website.get('settings').footerLinkText + '</a>';
            }
            if(isFooterLink) {
                html += '<a class="footer-link" href="' + footerLinkUrl + '" rel="nofollow">Powered by  Indigenous</a>';
            }
            html +='</p></div>';
        } else if(isReverse && !isOrg1){
            html += '<div class="container reverse-footer"';
            html += '<p class="col-xs-12 col-sm-4 powered-by ';
            if(!isFooterLink) {
                html +='text-right';
            }
            html +='">';
            if(isFooterLink) {
                html += '<a class="footer-link"  href="' + footerLinkUrl + '"><img class="' + footerClass + '" src="' + footerImage + '"></a>';
            }
            if(hasFooterLinkText) {
                html += '<a class="footer-link padding-bottom-15" href="' + footerLinkUrl + '" rel="nofollow">' + website.get('settings').footerLinkText + '</a>';
            }
            if(isFooterLink) {
                html += '<a class="footer-link" href="' + footerLinkUrl + '" rel="nofollow">Powered by  Indigenous</a>';
            }
            html += '</p>';
            html += '<p class="col-xs-12 col-sm-8 copyright">' + copyrightText + '</p>';
            html += '</div>';
        }
        fn(null, html);

    }

};

module.exports = builder;