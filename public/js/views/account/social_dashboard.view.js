/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'views/account/chart.view'
], function(BaseView, ChartView) {

    var view = BaseView.extend({

        templateKey: "account/social_dashboard",

        dragData_uid:  0,

        dragData: [],

        events: {
            'dragstart      .module_sidebar'        : "dragStart"
            , 'click        .module_sidebar'        : "cancel"
            , 'change       .ds-fb-source'          : "fbsourceChanged"
            , 'change       .ds-tw-source'          : "twsourceChanged"
            , 'change       #use-test-data'         : "toggleTestData"
            , 'click        .header.accordion'      : "collapse"
            , 'change       .ds-frequency-day'      : "changeWeekDay"
            , 'click        .dashboard-delete'      : 'deleteDashboard'
            , 'dragover     .grid-placeholder'      : 'highlight'
            , 'dragenter    .grid-placeholder'      : 'highlight'
            , 'dragleave    .grid-placeholder'      : 'unhighlight'
            , 'drop         .grid-placeholder'      : 'dropChart'
            , 'dragstart    .chart-item'            : 'dragChart'
            , 'dragleave    .chart-item'            : 'unhighlightChart'
            , 'dragover     .grid-new'              : 'dragOverNew'
            , 'dragleave    .grid-new'              : 'unhighlight'
            , 'drop         .grid-new'              : 'dropNew'
            , 'mouseenter   .module'                : 'showRemoveButton'
            , 'mouseleave   .module'                : 'hideRemoveButton'
            , 'click        .delete-module'         : 'deleteModule'
        },

        initialize: function () {
            this.removeButton = $('<div class="delete-module">X</div>');
        },

        dragdata_set: function (e, data) {
            var dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer
                , uid = this.dragData_uid++;
            dataTransfer.setData('text', uid);
            this.dragData[uid] = data;
        },

        dragdata_get: function (e) {
            var dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer
                , uid = dataTransfer.getData('text')
                , data = this.dragData[uid];
            delete this.dragData[uid];

            return data;
        },

        fbsourceChanged: function (e) {
            var source = $(e.target).val();
            source && this.model.set('fb_source', source);
            $$.trigger('updateGrid')
        },

        twsourceChanged: function (e) {
            var source = $(e.target).val();
            source && this.model.set('tw_source', source);
            $$.trigger('updateGrid')
        },

        toggleTestData: function (e) {
            if (!window.localStorage) return;
            localStorage.testData = !!e.target.checked;
            $$.trigger('updateGrid')
        },

        dragStart: function(e){
            var element = $(e.target)
                , type    = element.data('type')
                , name    = element.data('name')
                , width   = element.data('width');

            console.log('Drag started:', type, name, width);

            this.dragdata_set(e, {
                action : 'new'
                , type   : type
                , name   : name
                , width  : width
            })
        },

        cancel: function (e) {
            e.preventDefault();
            e.stopPropagation();
        },

        getSettings: function(){
            var data = {
                title       : this.$('.ds-title').val()
                , description : this.$('.ds-description').val()
                , fb_source   : this.$('.ds-fb-source').val()
                , tw_source   : this.$('.ds-tw-source').val()
                , frequency   : this.$('[name=ds-frequency]:checked').val()
                , recipients  : this.$('.ds-recipients').val().replace(/[,;]/g, '').split(/[\n\r]+/)
            };

            if (!data.title){
                var d     = new Date
                    , day   = d.getDate()
                    , month = d.getMonth() + 1
                    , year  = d.getFullYear()
                data.title = 'dashboard-' + month + '-' + day + '-' + year;
                this.$('.ds-title').val(data.title)
            }

            return data
        },

        collapse: function (e) {
            var self = $(e.target);

            self.next().toggleClass('open');
            self.find('.arrow').toggleClass('open closed')
        },

        changeWeekDay: function (e) {
            var value = $(e.target).val()
                , day = this.getWeekDay(value);


            this.model.set('frequency', value)
            this.$('#frequency-weekday').val(value).prop('checked', true);
            this.$('.frequency-selected').text(day)
        },

        getWeekDay: function (day) {
            var wshort = moment.weekdaysShort.map(function(s){ return s.toLowerCase() })
                , dayIndex = _.indexOf(wshort, day);

            if (dayIndex < 0) dayIndex = 1; // Monday
            return moment.weekdays[dayIndex].toLowerCase()
        },

        deleteDashboard: function(e){
            e.preventDefault();
            var modal = $('#modal-delete-dashboard');
            if (modal.length == 0) {
                $(document.body).append(Handlebars.templates['modal-delete-dashboard']());
                modal = $('#modal-delete-dashboard')
            }
            modal.modal();
            // the modal button will SR.trigger('deleteDashboard')
        },

        highlight: function(e){
            e.preventDefault();
            $(e.target).addClass('dragover')
        },

        unhighlight: function(e){
            $(e.target).removeClass('dragover')
        },

        highlightChart: function(e){
            var module = this.dragging || $()
                , target = $(e.currentTarget).closest('.module')

            if (module[0] != target[0]) {
                target.addClass('highlight')
            }
        },

        unhighlightChart: function(e){
            $(e.target).removeClass('highlight')
        },

        dragChart: function(e){
            var element = $(e.target)
                , type    = element.data('type')
                , name    = element.data('name')
                , width   = element.data('width');

            this.dragging = element;

            SR.log('Dragging module:', type, name, width);

            SR.DragData.set(e, {
                action : 'move'
                , type   : type
                , name   : name
                , width  : width
                , id     : e.target.id
            })
        },

        dropChart: function(e){
            e.preventDefault();
            e.stopPropagation();

            var self = $(e.target)
                , data = SR.DragData.get(e);

            self.removeClass('dragover');

            SR.log('Drop ['+data.action+']:', data.chart);

            switch (data.action) {
                case 'move':
                    var chart = $('#'+data.id)
                        , temp = $('<div/>')
                        , chart_data = chart.data()
                        , self_data = self.data();

                    if (data.width == 1) {
                        // the old elements switch-a-roo
                        temp.replaceWith( self.replaceWith( chart.replaceWith(temp)));
                        // remove empty lines
                        if (self.siblings().is('.grid-placeholder')) {
                            self.parent().remove();
                            return
                        }
                        // recover jQuery data()
                        chart.data(chart_data).redraw();
                        self.data(self_data).redraw()

                    } else {
                        var row1 = self.parent(), row2 = chart.parent();

                        if (row1.index() > row2.index())
                            row1.after(row2);
                        else
                            row1.before(row2)
                    }
                    break;
                case 'new':
                    if (data.width > 1) return; // TODO: handle inserting wide module in placeholder
                    this.createModule(self, {
                        type : data.type
                        , name : data.name
                    });
                    break;
            }
        },

        dragOverNew: function(e){
            e.preventDefault();
            $(e.target).addClass('dragover')
        },

        dropNew: function(e){
            e.preventDefault();
            this.unhighlight(e);

            var data = this.dragdata_get(e);
            if (data.action === 'new') {
                this.addModule(data);
            }
        },

        addModule: function(data){
            var newRow = $('<div class="row" />');
            if (data.width == 2) {
                newRow.append('<div class="grid-placeholder grid2" data-width="2" />');
            } else {
                newRow.append('<div class="grid-placeholder grid1" data-width="1" />');
                newRow.append('<div class="grid-placeholder grid1" data-width="1" />');
            }

            this.$('.row-new').before(newRow);
            this.createModule(newRow.children().eq(0), {
                type : data.type
                , name : data.name
            });
        },

        createModule: function (target, module) {
            console.log('Creating module', module);

            if (module.type === 'chart') this.createChart(target, module);
        },

        createChart: function (target, chart) {
            target = $(target);

            var range = chart.range || [];
            var chart = new ChartView({
                type   : 'chart'
                , name   : chart.name
                , width  : target.width()
                , height : target.height()
                , gridWidth : target.data('width')
                , model  : this.model
                , since  : range[0]
                , until  : range[1]
            });

            target.replaceWith(chart.el);
            chart.render();
        },

        // Grid data is derived directly from the DOM tree. This is simpler than maintaining
        // a separate representation of the grid; it's easy to modify without re-rendering
        // the whole grid, without keeping track of changes and positions.
        gridData: function () {
            var grid = [];
            this.$('.row:not(.row-new)').each(function(i){
                var row = [];
                $(this).children().each(function(i){
                    var module = SR.Modules[this.id];
                    row[i] = module && module.toJSON()
                });
                grid[i] = row
            });
            return grid
        },

        redraw: function () {
            this.$('.module').removeClass('no-data').redraw()
        },

        // Draw existing modules, if any
        drawModules: function (target) {
            var self = this
                , frag = $(document.createDocumentFragment());

            // Create row
            _.each(this.model.get('rows'), function(row){
                var newRow = $('<div class="row" />').appendTo(frag);
                // Create modules
                _.each(row, function(module){
                    var w = module && module.gridWidth || 1;
                    var temp = $('<div class="grid-placeholder grid'+w+'" data-width="'+w+'" />').appendTo(newRow)
                    // Defer module drawing
                    if (module) {
                        _.defer(function(){ self.createModule(temp, module) })
                    }
                })
            });
            $(target).prepend(frag)
        },

        showRemoveButton: function (e) {
            var module = $(e.target).closest('.module');
            this.removeButton.appendTo(module);
        },

        hideRemoveButton: function (e) {
            this.removeButton.detach()
        },

        deleteModule: function (e) {
            var module = $(e.target).closest('.module')
                , id     = module.attr('id')
                , module = $$.modules[id]
                , w      = module.options.gridWidth;

            // Remove entire row
            if (w == 2 || module.$el.siblings('.module').length < 1) {
                module.$el.closest('.row').remove();
                // Replace with placeholder
            } else if (w == 1) {
                module.$el.replaceWith($('<div class="grid-placeholder grid'+w+'" data-width="'+w+'" />'))
            }
            module.remove();
        },

        moveSidebar: function() {
            console.log('Main Viewport: '+$('#main-viewport').length+' Right Panel: '+$('#rightpanel').length+' Dashboard: '+$('.rightpanel-dashboard').length);
            var moveIt = $("#main-viewport .rightpanel-dashboard").remove();
            $('#rightPanel').append(moveIt);
        },

        render: function() {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser();

            var tmpl = $$.templateManager.get("social-dashboard-main", self.templateKey);
            var html = tmpl;

            self.show(html);

        }
    });


    $$.v.account = $$.v.account || {};
    $$.v.account.SocialDashboardView = view;

    return view;
});