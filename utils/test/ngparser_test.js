process.env.NODE_ENV = "testing";

var fs = require('fs');
var ngparser = require('../ngparser');
var _ = require('underscore');
exports.ngparser_test = {

    testParse: function(test) {
        var self = this;
        test.expect(1);
        fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-card/ssb-blog-post-card.component.html', 'utf-8', function(err, html){
            if(err) {
                console.log(err);
                test.ok(false, err);
                test.done();
            } else {
                var context = {vm:{
                    post:{
                        featured_image:'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
                        display_titleX: 'The title of the blog',
                        post_title: 'The post title of the blog',
                        post_author: 'Testy McTesterson',
                        publish_date: '06/08/2016'
                    }
                }};
                ngparser.parseHtml(html, context, null, function(err, value){
                    console.log('output:\n', value);
                    test.ok(true, 'true?');
                    test.done();
                });
            }
        });
    },

    testParseListComponent: function(test) {
        var self = this;
        fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-list/ssb-blog-post-list.component.html', 'utf-8', function(err, html){
            if(err) {
                console.log(err);
                test.ok(false, err);
                test.done();
            } else {
                fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-card/ssb-blog-post-card.component.html', 'utf-8', function(err, cardHtml){
                    var context = {
                        vm:{
                            component:{
                                type: 'ssb-blog-post-list',
                                version:1
                            },
                            blog: {
                                posts: [
                                    {
                                        featured_image:'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
                                        display_titleX: 'The title of the blog',
                                        post_title: 'The post title of the blog',
                                        post_author: 'Testy McTesterson',
                                        publish_date: '06/08/2016'
                                    },
                                    {
                                        featured_image:'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
                                        display_title: 'The title of the blog',
                                        post_titleX: 'The post title of the blog',
                                        post_author: 'Testy McTesterson',
                                        publish_date: '06/09/2016',
                                        featured: true
                                    }

                                ]
                            }

                        }
                    };
                    var substitions = [{name:'ssb-blog-post-card-component', value:cardHtml, prefix:'vm'}];
                    ngparser.parseHtml(html, context, substitions, function(err, value){
                        console.log('output:\n', value);
                        test.ok(true, 'true?');
                        test.done();
                    });
                });

            }
        });
    }

};
