/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
define([
], function() {
    // Daily Reach
    // ===========

    $$.Charts.FB_reachPerDay = new $$.Chart({
        id: 'FB_reachPerDay'
        , url: '/facebook/{{id}}/reachPerDay'
        , testData: [
            { date: '2014-06-21', paid: 5000, organic: 2000, viral: 1000 }
            , { date: '2014-06-22', paid: 8000, organic: 1000, viral: 200 }
            , { date: '2014-06-23', paid: 4000, organic: 2000, viral: 300 }
            , { date: '2014-06-24', paid: 5000, organic: 3000, viral: 100 }
            , { date: '2014-06-25', paid: 3000, organic: 4000, viral: 200 }
            , { date: '2014-06-26', paid: 2000, organic: 5000, viral: 200 }
            , { date: '2014-06-27', paid: 8000, organic: 6000, viral: 400 }
            , { date: '2014-06-28', paid: 4000, organic: 5000, viral: 700 }
            , { date: '2014-06-29', paid: 4000, organic: 7000, viral: 6000 }
            , { date: '2014-06-10', paid: 6000, organic: 6000, viral: 1500 }
            , { date: '2014-06-11', paid: 5000, organic: 7000, viral: 1600 }
            , { date: '2014-06-12', paid: 7000, organic: 8000, viral: 1700 }
            , { date: '2014-06-13', paid: 2000, organic: 9000, viral: 1800 }
        ]
        , render: function (data, options) {

            // paid / organic / viral

            $$.log("Rendering %s", this.id, data, options)

            var parseDate = d3.time.format("%Y-%m-%d").parse

            // Normalize data.
            // Make sure you don't modify the original data object,
            // otherwise this might fail on subsequent renders
            data = data.map(function(day){

                var paid    = $$.util.toNumber(day.paid, 0)
                    , organic = S$.util.toNumber(day.organic, 0)
                    , viral   = $$.util.toNumber(day.viral, 0)

                return {
                    date    : parseDate(day.date)
                    , paid    : paid
                    , organic : organic
                    , viral   : viral
                    , total   : paid + organic + viral
                }
            })

            this.process(options)

            var w = this.w
                , h = this.h
                , p = this.padding

            // Base layer
            var root = this.createSVG('graph-daily-reach')

            // Title
            this.addTitle("Daily reach")
            this.addRangeSelector(options.range)

            if (data.length === 0) {
                this.module.addClass('no-data')
                return
            }

            // Flag for preview graph
            var preview = h < 200

            var max = d3.max(data, function(d){ return d.total })
                , barWidth = Math.floor((w - p.r) / data.length) - 3

            max = Math.floor(max * 1.55) // never allow bars to reach full height

            // Scales
            var x = d3.time.scale()
                .range([p.l, w - p.r - barWidth]) // ends at X origin of the last bar, not the whole area
                .domain(d3.extent(data, function(d){ return d.date }))

            var y = d3.scale.linear()
                .rangeRound([0, h - p.b])
                .domain([max, 0])

            var color = d3.scale.ordinal()
                .range(["#7f7", "#99f", "#77f"])

            color.domain(_.without(d3.keys(data[0]), 'date', 'total').reverse())

            data.forEach(function(d) {
                var y0 = 0
                // offset bar position by value/height
                d.values = color.domain().map(function(key) {
                    return { key: key, y0: y0, y1: y0 += +d[key] }
                })
                // total height for this data point
                d.total = d.values[d.values.length - 1].y1
            })

            // Y axis (likes/unlikes)
            // var yAxis = d3.svg.axis()
            //     .scale(y)
            //     .orient('left')
            //     .tickFormat(d3.format('d'))

            // var yAxisG = root.append("g")
            //     .attr("transform", _.template("translate({{x}},0)", { x: p.l/2 }))
            //     .attr("class", "y-axis")
            //     .call(yAxis)

            // X axis (date)
            var xFormat = (data.length <= 7) ? "%a %d" : "%d"
                , xInterval = (data.length <= 7) ? 1 : (data.length <= 30) ? 2 : 5

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(d3.time.days, xInterval)
                .tickFormat(d3.time.format(xFormat))

            root.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(" + [Math.floor(barWidth / 2), h - p.b] + ")")
                .call(xAxis)

            var days = root.selectAll(".day")
                .data(data)
                .enter().append("g")
                .attr("class", "g")
                .attr("data-x", function(d){ return Math.floor(x(d.date)) })
                .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)" })

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
                .attr("y", function(d) { return y(d.y1) })

            var chart = this

            days.each(function(d){

                var textline = _.template(
                        '<span class="color-index" style="border-left-color:{{color}};">'
                        + '{{n}} {{text}}'
                        + '</span>'
                )

                var title = d.date.toLocaleDateString()
                    , content = [
                        textline({ n: SR.util.format(d.paid)   , color: color('paid'), text: 'paid' })
                        , textline({ n: SR.util.format(d.organic), color: color('organic'), text: 'organic' })
                        , textline({ n: SR.util.format(d.viral)  , color: color('viral'), text: 'viral' })
                    ].join("<br/>")

                var pop = chart.createPopover('left', title, content)

                pop.css({
                    width : 120
                    , left  : Math.floor(+this.getAttribute('data-x') - 120)
                    , top   : Math.floor(y(d.total))
                })

                $(this)
                    .on('mouseenter', $.proxy(pop.show, pop, 0))
                    .on('mouseleave', $.proxy(pop.hide, pop, 0))
            })

            // legend
            var legend = root.selectAll(".legend")
                .data(color.domain().slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(" + [0, 10 + i * 14] + ")" })

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