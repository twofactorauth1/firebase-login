/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
], function() {
    // Charts constructor
    // ------------------
    function Chart(options){
        this.id = options.id;
        this.url = options.url;
        this.render = options.render;
        this.testData = options.testData;
        this.templateKey = options.templateKey;
        this.templateWrapper = options.templateWrapper;
        this.targetIndicator = options.targetIndicator;
    }

    Chart.prototype.process = function (options) {
        this.setSize(options);
        this.target = $(options.target);
        this.module = this.target.closest('.module').removeClass('no-data');
    };

    Chart.prototype.setSize = function (options) {
        var w = options.width
            , h = options.height
            , p = options.padding || {}
            , size = {};

        // get dimensions from target element if not given
        w = isNaN(w) ? $(options.target).width() : +w;
        h = isNaN(h) ? $(options.target).height() : +h;

        p = {
            t: $$.u.numberutils.toNumber(p.t, 40)
            , r: $$.u.numberutils.toNumber(p.r, 20)
            , b: $$.u.numberutils.toNumber(p.b, 20)
            , l: $$.u.numberutils.toNumber(p.l, 20)
        };

        p.w = p.l + p.r;// sides
        p.h = p.t + p.b; // top + bottom

        size.padding = p;

        // subtract padding
        size.w = w - p.w;
        size.h = h - p.h;

        _.extend(this, size);
        return size
    };

    Chart.prototype.createSVG = function(className){

        if(typeof this.module != 'undefined') {
            this.module.addClass(className);
        }

        return this.root = d3.select(this.target.get(0)).append('svg:svg')
            .attr('width', this.w + this.padding.l + this.padding.r)
            .attr('height', this.h + this.padding.t + this.padding.b)
            .append('svg:g')
            .attr('transform', 'translate('+[this.padding.l, this.padding.t]+')')
    };

    Chart.prototype.addTitle = function(text){
        // Title
        this.module
            .append('<h2 class="graph-title">' + text + '</h2>')
    };

    Chart.prototype.addRangeSelector = function (defaultRange) {

        // do not add range selector in view mode
        if (location.pathname.indexOf('/view') > 0) return;

        var ranges = {
                'Last 7 Days': [Date.today().add({ days: -6 }), Date.today()]
                , 'Last 30 Days': [Date.today().add({ days: -29 }), Date.today()]
                , 'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()]
                , 'Last Month': [Date.today().moveToFirstDayOfMonth().add({ months: -1 }), Date.today().moveToFirstDayOfMonth().add({ days: -1 })]
            }
            , rangeText;

        if (typeof defaultRange === 'string') {
            rangeText = defaultRange;
            defaultRange = ranges[defaultRange]
        } else if (defaultRange[0] && defaultRange[1]) {
            var start = new Date(defaultRange[0])
                , end   = new Date(defaultRange[1]);
            if (isFinite(start) && isFinite(end)) {
                defaultRange = [start, end];
                rangeText = 'Custom'
            }
        }

        if (!rangeText) {
            rangeText = 'Last 7 Days';
            defaultRange = ranges[rangeText]
        }

        var rangeSelector = ''
            + '<div class="date-range" class="pull-right">'
            + '    <i class="icon-calendar icon-large"></i>'
            + '    <span>' + rangeText + '</span> <b class="caret"></b>'
            + '</div>'

        var picker = $(rangeSelector);

        picker.data('selectedRange', defaultRange);

        picker.appendTo(this.module).daterangepicker({
            ranges    : ranges
            , opens     : 'left'
            , startDate : defaultRange[0]
            , endDate   : defaultRange[1]
        }, function(start, end) {
            var text = null
                , joined = [start, end].join()

            for (var range in ranges) {
                if (ranges[range].join() == joined){
                    text = range
                }
            }

            if (picker.data('selectedRange').join() !== joined) {
                picker.trigger('rangeChange', { start: start, end: end, selected: text });
                picker.find('span').text(text || (start.toString('MM/dd/yyyy') + ' - ' + end.toString('MM/dd/yyyy')))
            }
        })
    };

    Chart.prototype.createPopover = function(position, title, content) {
//        return $(Handlebars.templates.popover({
//            title: title
//            , content: content
//        })).appendTo(this.target).addClass(position)
//        var tmpl = $$.templateManager.get("popover", 'account/charts/facebook/popover');
//        var html = tmpl({
//            title: title
//            , content: content
//        });
//
//        html.appendTo(this.target).addClass(position);
//        this.module.html(html);

        return null;
    };

    $$.Chart = Chart;

    return Chart;
});