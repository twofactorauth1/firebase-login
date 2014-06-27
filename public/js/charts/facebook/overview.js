
// Overview / FB at a glance
// =========================

$$.Charts.FB_overview = new $$.Chart({
    id: 'FB_overview'
    , url: '/facebook/{{id}}/overview'
    , testData: {
        fofs: 1231234
        , likes: 517
        , engaged: 1024
    }
    , render: function (data, options) {

        $$.log("Rendering %s", this.id, data, options)

        // Last data point = most recent day
        data = {
            likes   : $$.util.format($$.util.toNumber(data.likes, 0))
            , engaged : $$.util.format($$.util.toNumber(data.engaged, 0))
            , fofs    : $$.util.format($$.util.toNumber(data.fofs, 0))
        }

        this.process(options)
        this.addRangeSelector(options.range)

        if (data.length === 0) {
            this.module.addClass('no-data')
            return
        }

        this.module.html(Handlebars.templates['overview'](data));

    }
})
