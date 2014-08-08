define([
    'views/account/charts/chart'
], function(Chart) {
    // Mail Statics
    // ===========

    $$.Charts.Marketing_MailStatics = new Chart({
        id: 'Marketing_MailStatics'
        , url: '/marketing/{{id}}/mailStatics'
        , testData: [
                { year: "2009", opened: 100, not_opened: 50 },
                { year: "2010", opened: 150, not_opened: 50 },
                { year: "2011", opened: 200, not_opened: 100 },
                { year: "2012", opened: 250, not_opened: 150 },
                { year: "2013", opened: 300, not_opened: 100 },
                { year: "2014", opened: 350, not_opened: 150 }
            ]
        , render: function (data, options) {
            var parseYear = d3.time.format("%Y").parse;
            // Normalize data.
            data = data.map(function(year){
                var opened    = $$.u.numberutils.toNumber(year.opened, 0)
                    , not_opened   = $$.u.numberutils.toNumber(year.not_opened, 0);

                return {
                    year            : parseYear(year.year)
                    , opened        : opened
                    , not_opened    : not_opened
                    , total         : opened + not_opened
                }
            });

            this.process(options);

            // svg graph
            // Base layer
            var root = this.createSVG('graph-mail-statics');
            var w = this.w,
                h = this.h,
                p = this.padding;

            var max = d3.max(data, function(d){ return d.total })
                , barWidth = Math.floor((w - p.r) / data.length) - 3;
            max = Math.floor(max * 1.55);
            // Scales
            var x = d3.time.scale()
                .range([p.l, w - p.r - barWidth]) // ends at X origin of the last bar, not the whole area
                .domain(d3.extent(data, function(d){ return d.year }));
            var y = d3.scale.linear()
                .rangeRound([0, h - p.b])
                .domain([max, 0]);
            var color = d3.scale.ordinal()
                .range(["#7f7", "#99f"]);

            color.domain(_.without(d3.keys(data[0]), 'year', 'total').reverse());

            data.forEach(function(d) {
                var y0 = 0;
                // offset bar position by value/height
                d.values = color.domain().map(function(key) {
                    return { key: key, y0: y0, y1: y0 += +d[key] }
                });
                // total height for this data point
                d.total = d.values[d.values.length - 1].y1
            });

            var xYears = data.length
                , xInterval =  data.length
                , xFormat =  '%Y';
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(xInterval)
                .tickFormat(d3.time.format(xFormat));
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .tickFormat(d3.format('d'));
            var yAxisG = root.append("g")
                .attr("transform", _.template("translate({{x}},0)", { x: p.l/2 }))
                .attr("class", "y-axis")
                .call(yAxis);

            root.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(" + [Math.floor(barWidth / 4), h - p.b] + ")")
                .call(xAxis);
            var years = root.selectAll(".year")
                .data(data)
                .enter().append("g")
                .attr("class", "g")
                .attr("data-x", function(d){ return Math.floor(x(d.year)) })
                .attr("transform", function(d) { return "translate(" + x(d.year) + ",0)" });

            years.selectAll("rect")
                .data(function(d) { return d.values; })
                .enter().append("rect")
                .attr("width", barWidth/2)
                .attr("y", function(d) { return y(d.y0) })
                .attr('height', 0)
                .style("fill", function(d) { return color(d.key) })
                .transition(200)
                .delay(function(d, i){ return i * 200 })
                .attr("height", function(d) { return y(d.y0) - y(d.y1) })
                .attr("y", function(d) { return y(d.y1) });
        }
    });
});