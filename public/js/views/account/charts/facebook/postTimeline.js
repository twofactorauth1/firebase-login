/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
define([
], function() {
    // Facebook likes per day
    // ======================

    $$.Charts.FB_postTimeline = new $$.Chart({
        id: 'FB_postTimeline'
        , url: '/facebook/{{id}}/postInteractions'
        , testData: [
            { date: '2014-06-21', likes: '2', shares: '2', comments: '1', title: 'Post title' }
            , { date: '2014-06-22', likes: '4', shares: '1', comments: '1', title: 'Post title' }
            , { date: '2014-06-23', likes: '7', shares: '2', comments: '1', title: 'Post title' }
            , { date: '2014-06-24', likes: '5', shares: '3', comments: '1', title: 'Post title' }
            , { date: '2014-06-25', likes: '1', shares: '1', comments: '1', title: 'Post title' }
        ]
        , render: function (data, options) {

            $$.log("Rendering %s", this.id, options)

            var parseDate = d3.time.format("%Y-%m-%d").parse

            // Calculate post engagement
            var posts = data.map(function(post){

                var likes    = SR.util.toNumber(post.likes, 0)
                    , shares   = SR.util.toNumber(post.shares, 0)
                    , comments = SR.util.toNumber(post.comments, 0)
                    , impact = likes + shares + comments

                return {
                    title    : post.title
                    , date     : parseDate(post.date)
                    , impact   : impact
                    , likes    : likes
                    , shares   : shares
                    , comments : comments
                }
            })

            this.process(options)

            var w = this.w
                , h = this.h
                , p = this.padding

            // Flag for preview graph
            var preview = h < 200

            // Base layer
            var root = this.createSVG('graph-post-timeline')

            // Title
            this.addTitle("All post activity")
            this.addRangeSelector(options.range)

            if (data.length === 0) {
                this.module.addClass('no-data')
                return
            }

            var max = +d3.max(posts, function(d){ return d.impact }) + 1
                , maxRadius = 30

            // Scales
            var x = d3.time.scale()
                .range([p.l, w - p.r])
                .domain(d3.extent(posts, function(d){ return d.date }))

            var y = d3.scale.linear()
                .range([h - p.t, p.b])
                .domain([0, max])

            var impact = d3.scale.linear()
                .range([5, maxRadius])
                .domain([0, max])

            // Middle line
            root.append('svg:line')
                .attr('y1', h/2 - 10)
                .attr('y2', h/2 - 10)
                .attr('x1', 0)
                .attr('x2', w)
                .attr('class', 'divider')

            var xDays = data.length
                , xInterval = xDays <= 7 ? 1 : xDays <= 30 ? 2 : 5
                , xFormat = xDays <= 7 ? '%a %d' : '%d'

            // X axis (date)
            var xAxis = d3.svg.axis()
                .scale(x)
                .ticks(d3.time.days, xInterval)
                .tickFormat(d3.time.format(xFormat))
                .orient("bottom")

            root.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + h + ")")
                .call(xAxis)

            // Posts. Larger circles = more impact
            var circles = root.selectAll('.post-circle')
                .data(posts)
                .enter().append("svg:circle")
                .attr("title", function(d, i){ return d.title })
                .attr("class", "post")
                .attr("cx", function(d, i){ return x(d.date) })
                .attr("cy", function(d, i){ return i%2 ? h/2 - maxRadius - 10 : h/2 + maxRadius - 10 })
                .attr("r", 0) // will be animated to impact value

            circles.transition()
                .delay(function(d, i) { return i * 100 })
                .duration(600)
                .attr("r", function(d) { return impact(d.impact) })

            var modulePosition = $(this.root.node()).offset()
                , chart = this

            circles.each(function(post){

                var title = d3.time.format('[%d/%m/%y] ')(post.date) + SR.util.ellipsis(post.title, 80)
                    , content = [
                        SR.util.plural(post.likes, "like")
                        , SR.util.plural(post.shares, "share")
                        , SR.util.plural(post.comments, "comment")
                    ].join("<br/>")
                    , radius = impact(post.impact)

                var pop = chart.createPopover('top', title, content)

                pop.css({
                    width : 300
                    , left  : Math.floor(+this.getAttribute('cx') - 152 + radius * 0.8)
                    , top   : Math.floor(+this.getAttribute('cy') - pop.height())
                })

                $(this)
                    .on('mouseenter', $.proxy(pop.show, pop, 0))
                    .on('mouseleave', $.proxy(pop.hide, pop, 0))
            })

        }
    });
});