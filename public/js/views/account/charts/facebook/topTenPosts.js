/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/charts/chart'
], function(Chart) {
    // Top ten posts
    // ======================

    $$.Charts.FB_topTenPosts = new Chart({
        id: 'FB_topTenPosts'
        , url: '/facebook/{{id}}/topTenPosts'
        , gridWidth: 2
        , templateKey: 'account/charts/facebook/top_ten_posts'
        , testData: [
            { id: '1-1', date: '2014-06-20', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 40087 }
            , { id: '1-1', date: '2014-06-29', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 30087 }
            , { id: '1-1', date: '2014-06-28', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 20087 }
            , { id: '1-1', date: '2014-06-27', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 9087 }
            , { id: '1-1', date: '2014-06-26', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 887 }
            , { id: '1-1', date: '2014-06-25', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 787 }
            , { id: '1-1', date: '2014-06-24', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 687 }
            , { id: '1-1', date: '2014-06-23', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 587 }
            , { id: '1-1', date: '2014-06-22', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 487 }
            , { id: '1-1', date: '2014-06-21', type: 'post', message: 'Hello World', reach: 71213, engaged: 1347, talking: 387 }
        ]
        , render: function (data, options) {

            console.log("Rendering %s", this.id, data, options);

            var parseDate = d3.time.format("%Y-%m-%d").parse;

            // Normalize data.
            // Make sure you don't modify the original data object,
            // otherwise this might fail on subsequent renders
            data = data.slice(0, 10).map(function(post){

                var reach   = $$.u.numberutils.toNumber(post.reach, 0)
                    , engaged = $$.u.numberutils.toNumber(post.engaged, 0)
                    , talking = $$.u.numberutils.toNumber(post.talking, 0)
                    , textLength = 30
                    , message = post.link ? (post.message + ' ' + post.link) : post.message;

                if (message.length > textLength) message = message.substring(0, textLength) + '...';

                return {
                    date     : parseDate(post.date.split('T')[0]).toString('MM/dd')
                    , type     : post.type
                    , text     : message
                    , reach    : $$.u.formatutils.formatInteger(reach)
                    , engaged  : $$.u.formatutils.formatInteger(engaged)
                    , talking  : $$.u.formatutils.formatInteger(talking)
                    , virality : ((talking / reach * 100) || 0).toFixed(2) + '%'
                    , vwidth   : Math.ceil(talking / reach * 130)
                    , url      : 'http://facebook.com/' + post.id.split('_').join('/posts/')
                }
            });

            this.process(options);

            this.addTitle('Top posts');
            this.addRangeSelector(options.range);

            if (data.length === 0) {
                this.module.addClass('no-data');
                return;
            }

            var tmpl = $$.templateManager.get("fb-top-ten-posts", this.templateKey);
            var html = tmpl({posts: data});

            this.module.html(html);
        }
    });
});