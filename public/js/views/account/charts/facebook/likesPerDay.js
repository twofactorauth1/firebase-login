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

    $$.Charts.FB_likesPerDay = new Chart({
        id: 'FB_likesPerDay'
        , url: '/facebook/{{id}}/likesUnlikesPerDay'
        , testData: [
            { date: '2014-06-20', likes: '2', unlikes: '0' }
            , { date: '2014-06-21', likes: '4', unlikes: '1' }
            , { date: '2014-06-22', likes: '7', unlikes: '2' }
            , { date: '2014-06-24', likes: '5', unlikes: '2' }
            , { date: '2014-06-25', likes: '6', unlikes: '1' }
        ]
        , render: function (data, options) {

            console.log("Rendering %s", this.id, data, options);

            var parseDate = d3.time.format("%Y-%m-%d").parse;

            // Normalize data.
            // Make sure you don't modify the original data object,
            // otherwise this might fail on subsequent renders
            data = data.map(function(item){
                return {
                    date    : parseDate(item.date)
                    , likes   : $$.u.numberutils.toNumber(item.likes, 0)
                    , unlikes : $$.u.numberutils.toNumber(item.unlikes, 0)
                }
            });

            this.process(options);

            var w = this.w
                , h = this.h
                , p = this.padding;

            // Base layer
            var root = this.createSVG('graph-likes');

            // Title
            this.addTitle("Likes / Unlikes")
            this.addRangeSelector(options.range);

            if (data.length === 0) {
                this.module.addClass('no-data');

                return
            }

            // Flag for preview graph
            var preview = h < 200

            var maxLikes = d3.max(data, function(d){ return d.likes })
                , maxUnlikes = d3.max(data, function(d){ return d.unlikes })
                , max = Math.max(maxLikes, maxUnlikes) + 1

            // Scales
            var x = d3.time.scale()
                .range([p.l, w - p.r])
                .nice(d3.time.day)
                .clamp(true)
                .domain(d3.extent(data, function(d){ return d.date }))

            var y = d3.scale.linear()
                .range([h - p.b, 0])
                .domain([0, max])

            // Y axis (likes/unlikes)
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .tickFormat(d3.format('d'))

            var yAxisG = root.append("g")
                .attr("transform", _.template("translate({{x}},0)", { x: p.l/2 }))
                .attr("class", "y-axis")
                .call(yAxis)

            // Don't draw label text for preview graph
            if (!preview){
                yAxisG.append("text")
                    .attr("class", "axis-label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 8)
                    .attr("dx", -15)
                    .style("text-anchor", "end")
                    .text("Likes / Unlikes per day")
            }

            // Add tick groups
            var ticks = root.selectAll('.tick-y')
                .data(y.ticks(maxLikes))
                .enter().append('svg:g')
                .attr('transform', function(d){ return _.template("translate(0,{{y}})", { y: y(d) }) })
                .attr('class', 'tick-y');

            // Add y axis tick marks
            // ticks.filter(":nth-child(odd)").append('svg:line')
            //     .attr('y1', 0)
            //     .attr('y2', 0)
            //     .attr('x1', 0)
            //     .attr('x2', w)

            // X axis (date)
            var xInterval = data.length < 8 ? 1 : data.length < 30 ? 2 : 5
                , xFormat   = data.length < 8 ? '%a %d' : '%d'

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(d3.time.days, xInterval)
                .tickFormat(d3.time.format(xFormat))

            var xg = root.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + (h - 10) + ")")
                .call(xAxis)

            if (data.length > 7) {
                xg.selectAll('text')
                    .style("font-size", "10")
            }

            // Add a line path
            function addLine(which) {
                var line = root.selectAll('path.line')
                    .data([data])
                    .enter().append("svg:path")
                    .attr("class", which)
                    .attr("d", d3.svg.line()
                        .interpolate('cardinal')
                        .x(function(d,i){ return x(d.date) })
                        .y(function(d){ return y(d[which]) })
                )

                var totalLength = line.node().getTotalLength()

                // animate line
                line
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(500)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0)

                var area = d3.svg.area()
                    .interpolate('cardinal')
                    .x(function(d) { return x(d.date) })
                    .y0(h - p.b)
                    .y1(function(d) { return y(d[which]) })

                root.append("path")
                    .datum(data)
                    .attr("class", "area " + which)
                    .attr("d", area)
            }

            // Add data points
            var pointSize = preview ? 4 : 6

            function addPoints(which) {
                root.selectAll('.' + which + '-point')
                    .data(data)
                    .enter().append("svg:circle")
                    .attr("title", function(d,i){ return d[which] + ' ' + which })
                    .attr("class", function(d,i) { return 'point ' + which + (d == max ? ' max' : '') })
                    .attr("cx", function(d,i){ return x(d.date) })
                    .attr("cy", function(d){ return y(d[which]) })
                    .attr("r", 0)
                    .on('mouseover', function(){ d3.select(this).transition(200).attr('r', pointSize * 1.5) })
                    .on('mouseout',  function(){ d3.select(this).transition(100).attr('r', pointSize) })
                    .transition(2000)
                    .delay(function(d, i){ return i * (600/data.length) })
                    .attr("r", pointSize)
            }

            // Add paths + points
            ;['likes', 'unlikes'].forEach(function(metric){
                addLine(metric)
                addPoints(metric)
            })

        }
    });
});