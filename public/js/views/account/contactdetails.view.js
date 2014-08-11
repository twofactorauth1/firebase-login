/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'models/contact',
    'services/geocode.service'
], function(BaseView, Contact, GeocodeService) {
    /*var showDetails = function(type, typePlural){
            return function () {
                $('.li-' + type).show();
                $('.li-' + type + '.first .btn-more-' + typePlural + ' i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
                $('.li-' + type + '.first .btn-more-' + typePlural + ' span').text(($('.li-' + type).length - 1) + ' Less ');
                $('.li-' + type + '.first .btn-more-' + typePlural).removeClass('btn-more-' + typePlural).addClass('btn-less-' + typePlural);
            }
        },
        hideDetails =  function(type, typePlural) {
            return function () {
                $('.li-' + type + ':not(:first)').hide();
                $('.li-' + type + '.first .btn-less-' + typePlural + ' i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
                $('.li-' + type + '.first .btn-less-' + typePlural + ' span').text(($('.li-' + type).length - 1) + ' More');
                $('.li-' + type + '.first .btn-less-' + typePlural).removeClass('btn-less-' + typePlural).addClass('btn-more-' + typePlural);
            }
        };*/

    var view = BaseView.extend({

        templateKey: "account/contacts",

        contactId: null,
        currentLetter: null,

        events: {
            "click #btn-back-to-contacts":"goBack",
            "click .btn-edit-contact":"editContact",
            "click .btn-more-emails":"showEmails",
            "click .btn-less-emails":"hideEmails",
            "click .btn-more-phones":"showPhones",
            "click .btn-less-phones":"hidePhones",
            "click .btn-more-address":"showAddress",
            "click .btn-less-address":"hideAddress"
        },


        render: function() {
            var self = this;
            this.getContact()
                .done(function() {
                    var data = {
                        contact:self.contact.toJSON(),
                        currentTime: moment().format('h:mm a')
                    };
                    var tmpl = $$.templateManager.get("contact-details-main", self.templateKey);
                    var html = tmpl(data);
                    self.show(html);
                    self.contactMap(data['contact']['address']);
                    self.adjustWindowSize();
                    $(window).on("resize", self.adjustWindowSize);
                })
                .fail(function(resp) {
                    $$.viewManager.showAlert("There was an error retrieving this contact");
                    self.goBack();
                });

            this.getReadings();
        },

        adjustWindowSize: function() {
            console.log('resizing');
            $('#main-viewport').css('overflow', 'none');
            var headerBar = $('#headerbar').outerHeight();
            var pageHeader = $('.pageheader').outerHeight();
            var mainViewportHeight = $(window).height() - headerBar - pageHeader-10;
            console.log('adjusting window size to '+$(window).height()+' Headerbar: '+headerBar+' Page Herder: '+pageHeader);
            $('#contact-details-container').css('min-height', $(window).height());
        },


        getContact: function() {
            this.contact = new Contact({
                _id:this.contactId
            });

            return this.contact.fetch();
        },


        editContact: function() {
            $$.r.account.ContactRouter.navigateToEditContact(this.contactId, this.currentLetter);
        },


        goBack: function() {
            $$.r.account.ContactRouter.navigateToShowContactsForLetter(this.currentLetter, true);
        },

        contactMap: function(address) {
            console.log('initializing map '+address);

            var zoom = 13;

            if (!address) {
                address = 'United States';
                zoom = 2;
            }

            $$.svc.GeocodeService.addresstolatlng(address).done(function(value){
                var map = L.map('map-marker', {
                    center: [ value[0]['lat'], value[0]['lon']],
                    zoom: zoom,
                    zoomControl:false,
                    autoPan: false,
                    dragging: false,
                    zooming: false,
                    scrollWheelZoom: false
                });
                var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                var osmAttrib = '';

                L.tileLayer(osmUrl, {
                    maxZoom: 18,
                    attribution: osmAttrib
                }).addTo(map);

                L.marker([value[0]['lat'], value[0]['lon']]).addTo(map);
            });

        },

        showEmails: function (){
            this.showDetails("email","emails");
        },

        hideEmails: function () {
            this.hideDetails("email", "emails");
        },

        showPhones : function () {
            this.showDetails("phone", "phones")
        },
        hidePhones: function (){
            this.hideDetails("phone","phones");
        },
        showAddress: function () {
            this.showDetails("address", "addresses");
        },
        hideAddress : function (){
            this.hideDetails("address", "addresses");
        },

        getReadings: function() {
            var self = this;
             var url = $$.api.getApiUrl("biometrics", "readings?contactId="+this.contactId);
             $.getJSON(url)
                .done(function(result) {
                    for (var i = 0; i < result.length; i++) {
                        console.log(JSON.stringify(result[i].readingTypeId));
                        //TODO variable templates based on type
                        var template = 'contact-activity-2net_weight';
                        var tmpl = $$.templateManager.get(template, self.templateKey);
                        var html = tmpl(result[i]);
                        $('.activity-section ul').append(html);
                    }
                })
                .fail(function(resp) {
                    console.log('Fail: '+JSON.stringify(result));
                });
        },


        showDetails : function(type, typePlural){
            $('.li-' + type).show();
            $('.li-' + type + '.first .btn-more-' + typePlural + ' i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
            $('.li-' + type + '.first .btn-more-' + typePlural + ' span').text(($('.li-' + type).length - 1) + ' Less ');
            $('.li-' + type + '.first .btn-more-' + typePlural).removeClass('btn-more-' + typePlural).addClass('btn-less-' + typePlural);

        },
        hideDetails : function(type, typePlural) {
            $('.li-' + type + ':not(:first)').hide();
            $('.li-' + type + '.first .btn-less-' + typePlural + ' i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            $('.li-' + type + '.first .btn-less-' + typePlural + ' span').text(($('.li-' + type).length - 1) + ' More');
            $('.li-' + type + '.first .btn-less-' + typePlural).removeClass('btn-less-' + typePlural).addClass('btn-more-' + typePlural);
        }

    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactDetails = view;

    return view;
});

