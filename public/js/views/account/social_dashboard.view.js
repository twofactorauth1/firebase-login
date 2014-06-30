/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view'
], function(BaseView) {

    var view = BaseView.extend({

        templateKey: "account/social_dashboard",

        events: {
            'dragstart .module'        : "dragStart"
            , 'click     .module'        : "cancel"
            , 'change .ds-fb-source'     : "fbsourceChanged"
            , 'change .ds-tw-source'     : "twsourceChanged"
            , 'change #use-test-data'    : "toggleTestData"
            , 'click .header.accordion'  : "collapse"
            , 'change .ds-frequency-day' : "changeWeekDay"
            , 'click .dashboard-delete'  : 'deleteDashboard'
        },

        fbsourceChanged: function (e) {
            var source = $(e.target).val()
            source && this.model.set('fb_source', source)
            $$.trigger('updateGrid')
        },

        twsourceChanged: function (e) {
            var source = $(e.target).val()
            source && this.model.set('tw_source', source)
            $$.trigger('updateGrid')
        },

        toggleTestData: function (e) {
            if (!window.localStorage) return
            localStorage.testData = !!e.target.checked
            $$.trigger('updateGrid')
        },

        dragStart: function(e){
            var element = $(e.target)
                , type    = element.data('type')
                , name    = element.data('name')
                , width   = element.data('width')

            $$.log('Drag started:', type, name, width)

            $$.DragData.set(e, {
                action : 'new'
                , type   : type
                , name   : name
                , width  : width
            })
        },

        cancel: function (e) {
            e.preventDefault()
            e.stopPropagation()
        },

        getSettings: function(){
            var data = {
                title       : this.$('.ds-title').val()
                , description : this.$('.ds-description').val()
                , fb_source   : this.$('.ds-fb-source').val()
                , tw_source   : this.$('.ds-tw-source').val()
                , frequency   : this.$('[name=ds-frequency]:checked').val()
                , recipients  : this.$('.ds-recipients').val().replace(/[,;]/g, '').split(/[\n\r]+/)
            }

            if (!data.title){
                var d     = new Date
                    , day   = d.getDate()
                    , month = d.getMonth() + 1
                    , year  = d.getFullYear()
                data.title = 'dashboard-' + month + '-' + day + '-' + year
                this.$('.ds-title').val(data.title)
            }

            return data
        },

        collapse: function (e) {
            var self = $(e.target)

            self.next().toggleClass('open')
            self.find('.arrow').toggleClass('open closed')
        },

        changeWeekDay: function (e) {
            var value = $(e.target).val()
                , day = this.getWeekDay(value)

            this.model.set('frequency', value)
            this.$('#frequency-weekday').val(value).prop('checked', true)
            this.$('.frequency-selected').text(day)
        },

        getWeekDay: function (day) {
            var wshort = moment.weekdaysShort.map(function(s){ return s.toLowerCase() })
                , dayIndex = _.indexOf(wshort, day)

            if (dayIndex < 0) dayIndex = 1 // Monday
            return moment.weekdays[dayIndex].toLowerCase()
        },

        deleteDashboard: function(e){
            e.preventDefault()
            var modal = $('#modal-delete-dashboard')
            if (modal.length == 0) {
                $(document.body).append(Handlebars.templates['modal-delete-dashboard']())
                modal = $('#modal-delete-dashboard')
            }
            modal.modal()
            // the modal button will SR.trigger('deleteDashboard')
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