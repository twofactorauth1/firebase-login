/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/charts/chart'
], function(Chart) {
    // Engaged users by age/gender
    // ===========================

    $$.Charts.FB_engagedDemographics = new Chart({
        id: 'FB_engagedDemographics'
        , url: '/facebook/{{id}}/engagedDemographics'
        , testData: [
            { gender: 'F', range: '25-34', frequency: 16 }
            , { gender: 'M', range: '25-34', frequency: 14 }
            , { gender: 'M', range: '18-24', frequency: 8 }
            , { gender: 'M', range: '35-44', frequency: 4 }
            , { gender: 'F', range: '45-54', frequency: 3 }
            , { gender: 'M', range: '45-54', frequency: 3 }
            , { gender: 'F', range: '35-44', frequency: 3 }
            , { gender: 'F', range: '18-24', frequency: 2 }
            , { gender: 'U', range: '45-54', frequency: 2 }
            , { gender: 'F', range: '55-64', frequency: 2 }
            , { gender: 'M', range: '65+'  , frequency: 1 }
            , { gender: 'M', range: '55-64', frequency: 1 }
        ]
        , render: function (data, options) {

            console.log("Rendering %s", this.id, data, options);

            // Group data by range:
            //   {
            //     '18-24': { F: 10, M: 20, U: 5 }
            //     ...
            //   }
            data = data.slice(0).sort(function(a,b){
                // by age
                if (a.range > b.range)   return  1
                if (a.range < b.range)   return -1
                // then by gender
                if (a.gender > b.gender) return  1
                if (a.gender < b.gender) return -1
                return 0
            });

            var ranges = {};
            data.forEach(function(item){
                var range = ranges[item.range] || (ranges[item.range] = {
                    range: item.range
                    , M: 0, F: 0, U: 0, total: 0
                })
                range[item.gender] = $$.u.numberutils.toNumber(item.frequency, 0);
                range.total += range[item.gender]
            });

            data = Object.keys(ranges).map(function(key){
                return ranges[key]
            });

            this.process(options);

            var w = this.w
                , h = this.h
                , p = this.padding;

            // Base layer
            var root = this.createSVG('graph-engaged-age-gender');

            // Title
            this.addTitle("Engaged users by age/gender");
            //this.addRangeSelector(options.range)

            if (data.length === 0) {
                this.module.addClass('no-data');

                return
            }

            // Flag for preview graph
            var preview = h < 200;

            var max = d3.max(data, function(d){ return d.total });

            max = Math.floor(max * 1.55) // never allow bars to reach full height

            // Scales
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, w], .1)
                .domain(data.map(function(d){ return d.range }));

            var y = d3.scale.linear()
                .range([0, h - p.b])
                .domain([max, 0])

            var color = d3.scale.ordinal()
                .range(["#77f", "#f77", "#aab"]);

            color.domain(['M', 'F', 'U'])

            data.forEach(function(d) {
                var y0 = 0
                // offset bar position by value/height
                d.values = color.domain().map(function(key) {
                    return { key: key, y0: y0, y1: y0 += +d[key] }
                })
                // total height for this data point
                d.total = d.values[d.values.length - 1].y1
            });

            // X axis (age ranges)
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickValues(data.map(function(d){ return d.range }));

            root.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(" + [0, h - p.b] + ")")
                .call(xAxis);

            var groups = root.selectAll(".age-range")
                .data(data)
                .enter().append("g")
                .attr("class", "g")
                .attr("data-x", function(d){ return Math.floor(x(d.range)) })
                .attr("transform", function(d) { return "translate(" + x(d.range) + ",0)" });

            groups.selectAll("rect")
                .data(function(d) { return d.values })
                .enter().append("rect")
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.y0) })
                .attr('height', 0)
                .style("fill", function(d) { return color(d.key) })
                .transition(200)
                .delay(function(d, i){ return i * 200 })
                .attr("height", function(d) { return y(d.y0) - y(d.y1) })
                .attr("y", function(d) { return y(d.y1) });

            var legend = root.selectAll(".legend")
                .data(color.domain().slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(" + [0, i * 14] + ")" });

            legend.append("rect")
                .attr("x", w - p.r - 15)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", color);

            legend.append("text")
                .attr("x", w - p.r)
                .attr("y", 9)
                .style("text-anchor", "start")
                .text(function(d) { return d });

            // pop-overs
            var chart = this;
            groups.each(function(d){

                var title = d.range + " years"
                    , content = []
                    , tpl = _.template(
                            '<span class="color-index" style="border-left-color:{{color}};">'
                            + '{{n}}% {{text}}'
                            + '</span>'
                    );

                if (d.U > 0) content.push(tpl({ n: d.U, color: color('U'), text: 'unspecified' }));
                if (d.F > 0) content.push(tpl({ n: d.F, color: color('F'), text: 'female' }));
                if (d.M > 0) content.push(tpl({ n: d.M, color: color('M'), text: 'male' }));

                content.push('<hr/><strong>' + d.total + '%</strong>');

                content = content.join("<br/>");

//                var pop = chart.createPopover('left', title, content);
//
//                pop.css({
//                    width : 120
//                    , left  : Math.floor(+this.getAttribute('data-x') - 120)
//                    , top   : Math.floor(y(d.total))
//                });
//
//                $(this)
//                    .on('mouseenter', $.proxy(pop.show, pop, 0))
//                    .on('mouseleave', $.proxy(pop.hide, pop, 0))
            })

        }
    });
});