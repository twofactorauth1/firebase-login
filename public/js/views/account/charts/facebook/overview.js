/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/charts/chart'
], function(Chart) {
    // Overview / FB at a glance
    // =========================

    $$.Charts.FB_overview = new Chart({
        id: 'FB_overview'
        , url: '/facebook/{{id}}/overview'
        , templateKey: 'account/charts/facebook/overview'
        , templateWrapper: 'fb-overview'
        , targetIndicator: '.graph-overview'
        , testData: {
            fofs: 1231234
            , likes: 517
            , engaged: 1024
        }
        , render: function (data, options) {

            console.log("Rendering %s", this.id, data, options);

            // Last data point = most recent day
            data = {
                likes   : $$.u.formatutils.formatInteger($$.u.numberutils.toNumber(data.likes, 0))
                , engaged : $$.u.formatutils.formatInteger($$.u.numberutils.toNumber(data.engaged, 0))
                , fofs    :$$.u.formatutils.formatInteger($$.u.numberutils.toNumber(data.fofs, 0))
            };

            this.process(options);
            this.addRangeSelector(options.range);

            if (data.length === 0) {
                this.module.addClass('no-data');

                return;
            }

            // this.module.html(Handlebars.templates['overview'](data));

            var tmpl = $$.templateManager.get("fb-overview", this.templateKey);
            var html = tmpl(data);

            this.module.html(html);
        }
    });
});