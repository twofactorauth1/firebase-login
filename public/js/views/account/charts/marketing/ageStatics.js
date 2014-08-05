define([
    'views/account/charts/chart'
], function(Chart) {
    // Mail Statics
    // ===========

    $$.Charts.Marketing_AgeStatics = new Chart({
        id: 'Marketing_AgeStatics'
        , url: '/marketing/{{id}}/ageStatics'
        , testData: [
            { label: "18-25", percent: 10 },
            { label: "26-30", percent: 20 },
            { label: "31-35", percent: 20 },
            { label: "36-45", percent: 30 },
            { label: "46-60", percent: 20 }

        ]
        , render: function (data, options) {

            // get percents
            percents = new Array;
            data.map(function(age) {
                percents.push(age.percent);
            });

            this.process(options);

            // svg graph
            var root = this.createSVG('graph-age-statics');
            var w = this.w,
                h = this.h,
                p = this.padding,
                r = Math.min(w, h) / 2,        // arc radius
                dur     = 750,                     // duration, in milliseconds
                color   = d3.scale.category10(),
                donut   = d3.layout.pie().sort(null),
                arc     = d3.svg.arc().innerRadius(r - 40).outerRadius(r - 10);

            var arc_grp = root.append("svg:g")
                .attr("class", "arcGrp")
                .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

            var label_group = root.append("svg:g")
                .attr("class", "lblGroup")
                .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

            // GROUP FOR CENTER TEXT
            var center_group = root.append("svg:g")
                .attr("class", "ctrGroup")
                .attr("transform", "translate(" + (w / 2) + "," + (h / 2) + ")");

            // CENTER LABEL
            var pieLabel = center_group.append("svg:text")
                .attr("dy", ".35em").attr("class", "chartLabel")
                .attr("text-anchor", "middle")
                .text('TEST');

            // DRAW ARC PATHS
            var arcs = arc_grp.selectAll("path")
                .data(donut(percents));
            arcs.enter().append("svg:path")
                .attr("stroke", "white")
                .attr("stroke-width", 0.5)
                .attr("fill", function(d, i) {return color(i);})
                .attr("d", arc)
                .each(function(d) {this._current = d});

            // DRAW SLICE LABELS
//            var sliceLabel = label_group.selectAll("text")
//                .data(donut(data.pct));
//            sliceLabel.enter().append("svg:text")
//                .attr("class", "arcLabel")
//                .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
//                .attr("text-anchor", "middle")
//                .text(function(d, i) {return labels[i]; });

            // Store the currently-displayed angles in this._current.
            // Then, interpolate from this._current to the new angles.
            function arcTween(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function(t) {
                    return arc(i(t));
                };
            }

            // update chart
            function updateChart(model) {
                data = eval(model); // which model?

                arcs.data(donut(data.pct)); // recompute angles, rebind data
                arcs.transition().ease("elastic").duration(dur).attrTween("d", arcTween);

                sliceLabel.data(donut(data.pct));
                sliceLabel.transition().ease("elastic").duration(dur)
                    .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
                    .style("fill-opacity", function(d) {return d.value==0 ? 1e-6 : 1;});

                pieLabel.text(data.label);
            }

            // click handler
            $("#objectives a").click(function() {
                updateChart(this.href.slice(this.href.indexOf('#') + 1));
            });
        }
    });
});