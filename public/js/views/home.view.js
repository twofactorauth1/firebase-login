/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    'models/user',
    'collections/accounts'
], function(BaseView, User, AccountCollection) {

    var view = BaseView.extend({

        templateKey: "home",

        accounts: null,

        events: {

        },

        render: function() {
            var self = this
                , p1 = this.getAccounts()
                , p2 = this.getUser();

            $.when(p1, p2)
                .done(function() {
                    var data = {
                        accounts: self.accounts.toJSON(),
                        user: self.user.toJSON()
                    };

                    var tmpl = $$.templateManager.get("home-main", self.templateKey);
                    var html = tmpl(data);

                    self.show(html);
                    self.contactMap();
                });
        },


        getAccounts: function() {
            this.accounts = new $$.c.AccountCollection();
            return this.accounts.getAccountsForUser(this.getUserId());
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

        }


    });

    $$.v.HomeView = view;

    return view;
});