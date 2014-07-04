/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'views/account/charts/chart',
    'views/account/charts/facebook/engagedByAgeGender',
    'views/account/charts/facebook/likesPerDay',
    'views/account/charts/facebook/overview',
    'views/account/charts/facebook/postInteractionsPerDay',
    'views/account/charts/facebook/postTimeline',
    'views/account/charts/facebook/reachPerDay',
    'views/account/charts/facebook/topFans',
    'views/account/charts/facebook/topTenPosts'
], function(BaseView) {
    var view = BaseView.extend({

        initialize: function (options) {
            $$.modules[this.cid] = this;
            this.options = options;
            this.setDateRange(options.since, options.until, options.selectedRange);
            this.source = this.options.name.substring(0,2).toLowerCase() + '_source';
        },

        events: {
            'rangeChange': 'changeDates'
        },

        setupElement: function(){
            this.$el.empty()
                .addClass('grid' + this.options.gridWidth)
                .addClass('module')
                .addClass('chart-item')
                .attr({
                    draggable: 'true'
                    , id: this.cid
                    , 'data-width': this.options.gridWidth
                })
        },

        setDateRange: function(since, until, rangeText) {
            _.extend(this.options, {
                since : since
                , until : until
                , selectedRange : rangeText
            })
        },

        changeDates: function(e, dates){
            console.log('Date range for', this.options.name, 'changed:', dates.start, dates.end);
            this.setDateRange(dates.start, dates.end, dates.selected);
            this.render();
        },

        render: function(){

            this.setupElement();
            this.$el.data('chart', this.options.name);

            var height = this.$el.height()
                , width  = this.$el.width();
            var chart = $$.Charts[this.options.name];

            console.log("Render chart", this.options.name, this.options);

            function renderChart (data, selectedRange) {
                if (!data || data.length < 1) {
                    data = [];
                }

                chart.render(data, {
                    target : this.el
                    , width  : width || this.options.width
                    , height : height || this.options.height
                    , range  : this.options.selectedRange || [this.options.since, this.options.until]
                })
            }

            if ((window.localStorage && localStorage.testData === 'true')) {
                renderChart.call(this, chart.testData)
            } else {
                var self  = this
                    , since = this.options.since || Date.today().add({ days: -6 })
                    , until = this.options.until || Date.today()

                self.$el.addClass('loading');

                data_url = _.template(chart.url, { id: this.model.get(this.source) });

                data_url = SR.util.url([SR.settings.baseURL, data_url], {
                    since : since.toString('yyyy-MM-dd')
                    , until : until.toString('yyyy-MM-dd')
                })

                d3.json(data_url, function(data){
                    self.$el.removeClass('loading');
                    renderChart.call(self, data)
                })
            }

            return this
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ChartView = view;

    return view;
});