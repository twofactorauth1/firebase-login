/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/charts/chart'
], function(Chart) {
    // Facebook likes per day
    // ======================

    $$.Charts.FB_postInteractionsPerDay = new Chart({
        id: 'FB_postInteractionsPerDay'
        , url: '/facebook/{{id}}/postInteractions'
        , templateKey: 'account/charts/facebook/post_interactions_per_day'
        , templateWrapper: 'fb-post-interactions-per-day'
        , targetIndicator: '.graph-post-interactions-per-day'
        , testData: [
            { date: '2014-06-21', likes: 2, shares: 2, comments: 1 }
            , { date: '2014-06-22', likes: 4, shares: 1, comments: 2 }
            , { date: '2014-06-23', likes: 7, shares: 2, comments: 3 }
            , { date: '2014-06-24', likes: 5, shares: 3, comments: 1 }
            , { date: '2014-06-25', likes: 3, shares: 4, comments: 2 }
            , { date: '2014-06-26', likes: 2, shares: 5, comments: 2 }
            , { date: '2014-06-27', likes: 5, shares: 6, comments: 4 }
            , { date: '2014-06-28', likes: 8, shares: 5, comments: 3 }
            , { date: '2014-06-29', likes: 4, shares: 5, comments: 4 }
            , { date: '2014-06-10', likes: 5, shares: 6, comments: 5 }
            , { date: '2014-06-11', likes: 6, shares: 7, comments: 6 }
            , { date: '2014-06-12', likes: 7, shares: 8, comments: 7 }
            , { date: '2014-06-13', likes: 8, shares: 9, comments: 8 }
        ]
        , render: function (data, options) {

            console.log("Rendering %s", this.id, data, options);

            var parseDate = d3.time.format("%Y-%m-%d").parse;

            // Normalize data.
            // Make sure you don't modify the original data object,
            // otherwise this might fail on subsequent renders
            data = data.map(function(day){

                var likes    = $$.u.numberutils.toNumber(day.likes, 0)
                    , shares   = $$.u.numberutils.toNumber(day.shares, 0)
                    , comments = $$.u.numberutils.toNumber(day.comments, 0);

                return {
                    date        : parseDate(day.date)
                    , likes     : likes
                    , shares    : shares
                    , comments  : comments
                    , total     : likes + shares+ comments
                }
            });

            this.process(options);

            var w = this.w
                , h = this.h
                , p = this.padding;

            // Base layer
            var root = this.createSVG('graph-post-interactions');

            // Title
            this.addTitle("Post interactions / day");
            this.addRangeSelector(options.range);

            if (data.length === 0) {
                this.module.addClass('no-data');
                return
            }

            // Flag for preview graph
            var preview = h < 200;

            var max = d3.max(data, function(d){ return d.total })
                , barWidth = Math.floor((w - p.r) / data.length) - 3;

            max = Math.floor(max * 1.55); // never allow bars to reach full height

            // Scales
            var x = d3.time.scale()
                .range([p.l, w - p.r - barWidth]) // ends at X origin of the last bar, not the whole area
                .domain(d3.extent(data, function(d){ return d.date }));

            var xPath = x.copy().range([p.l, w - p.r]);

            var y = d3.scale.linear()
                .rangeRound([0, h - p.b])
                .domain([max, 0]);

            var color = d3.scale.ordinal()
                .range(["#bbf", "#99f", "#77f"]);

            color.domain(_.without(d3.keys(data[0]), 'date', 'total').reverse());

            data.forEach(function(d) {
                var y0 = 0;
                // offset bar position by value/height
                d.values = color.domain().map(function(key) {
                    return { key: key, y0: y0, y1: y0 += +d[key] }
                });
                // total height for this data point
                d.total = d.values[d.values.length - 1].y1
            });

            // Y axis (likes/unlikes)
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .tickFormat(d3.format('d'));

            var yAxisG = root.append("g")
                .attr("transform", _.template("translate({{x}},0)", { x: p.l/2 }))
                .attr("class", "y-axis")
                .call(yAxis);

            // X axis (date)
            var isWeek = data.length < 8;
            var xx = {
                format: isWeek ? '%a %d' : '%d/%m'
                , ticks: isWeek ? d3.time.days : 7
            };

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(xx.ticks)
                .tickFormat(d3.time.format(xx.format));

            root.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(" + [Math.floor(barWidth / 2), h - p.b] + ")")
                .call(xAxis);

            var days = root.selectAll(".day")
                .data(data)
                .enter().append("g")
                .attr("class", "g")
                .attr("data-x", function(d){ return Math.floor(x(d.date)) })
                .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)" });

            days.selectAll("rect")
                .data(function(d) { return d.values })
                .enter().append("rect")
                .attr("width", barWidth)
                .attr("y", function(d) { return y(d.y0) })
                .attr('height', 0)
                .style("fill", function(d) { return color(d.key) })
                .transition(200)
                .delay(function(d, i){ return i * 200 })
                .attr("height", function(d) { return y(d.y0) - y(d.y1) })
                .attr("y", function(d) { return y(d.y1) });

            // Add a line path
            var line = root.selectAll('path.line')
                .data([data])
                .enter().append("svg:path")
                .attr("class", 'total')
                .attr("d", d3.svg.line()
                    .interpolate('bundle')
                    .x(function(d,i){ return xPath(d.date) })
                    .y(function(d){ return y(d.total) })
            )

            var chart = this;

            days.each(function(d){

                var title = d.date.toLocaleDateString()
                    , content = [
                            d.likes + " likes"
                        , d.shares + " shares"
                        , d.comments + " comments"
                    ].join("<br/>")

                var pop = chart.createPopover('left', title, content)

//                pop.css({
//                    width : 120
//                    , left  : Math.floor(+this.getAttribute('data-x') - 120)
//                    , top   : Math.floor(y(d.total))
//                })
//
//                $(this)
//                    .on('mouseenter', $.proxy(pop.show, pop, 0))
//                    .on('mouseleave', $.proxy(pop.hide, pop, 0))
            })

            // legend
            var legend = root.selectAll(".legend")
                .data(color.domain().slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(" + [0, i * 14] + ")" })

            legend.append("rect")
                .attr("x", 20)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", color)

            legend.append("text")
                .attr("x", 36)
                .attr("y", 4)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .text(function(d) { return d })
        }
    });
});