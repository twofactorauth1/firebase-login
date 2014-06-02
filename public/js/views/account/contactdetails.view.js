/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

define([
    'views/base.view',
    'models/contact',
    'services/geocode.service'
], function(BaseView, Contact, GeocodeService) {

    var view = BaseView.extend({

        templateKey: "account/contacts",

        contactId: null,
        currentLetter: null,

        events: {
            "click #btn-back-to-contacts":"goBack",
            "click .btn-edit-contact":"editContact",
            "click .btn-more-emails":"showEmails",
            "click .btn-less-emails":"hideEmails"
        },


        render: function() {
            var self = this;
            this.getContact()
                .done(function() {
                    var data = {
                        contact:self.contact.toJSON()
                    };

                    var tmpl = $$.templateManager.get("contact-details-main", self.templateKey);
                    var html = tmpl(data);
                    self.show(html);
                    self.contactMap(data['contact']['address']);
                })
                .fail(function(resp) {
                    $$.viewManager.showAlert("There was an error retrieving this contact");
                    self.goBack();
                });

            this.getReadings();
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
                    scrollWheelZoom: false,
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

        showEmails: function() {
            console.log('show phones');
            $('.li-email').show();
            $('.li-email.first .btn-more-emails i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
            $('.li-email.first .btn-more-emails span').text('less');
            $('.li-email.first .btn-more-emails').removeClass('btn-more-emails').addClass('btn-less-emails');
        },

        hideEmails: function() {
            console.log('hide phones');
            $('.li-email:not(:first)').hide();
            $('.li-email.first .btn-less-emails i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            $('.li-email.first .btn-less-emails span').text('more');
            $('.li-email.first .btn-less-emails').removeClass('btn-less-emails').addClass('btn-more-emails');
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
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactDetails = view;

    return view;
});

