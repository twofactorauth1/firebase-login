define([
    'models/contact'
], function(Contact) {

    var view = Backbone.View.extend({

        templateKey: "account/contacts",

        contactId: null,
        currentLetter: null,

        events: {
            "keyup #input-fullname":"fullnameChanged",
            "change #input-fullname":"fullnameChanged",

            "click .btn-edit-photo":"changePhoto",
            "click .btn-upload-photo":"uploadPhoto",
            "click .btn-remove-photo":"removePhoto"
        },


        render: function() {
            var self = this;
            this.getContact()
                .done(function() {
                    var data = {
                        contact:self.contact.toJSON()
                    };

                    var tmpl = $$.templateManager.get("contact-edit-main", self.templateKey);
                    var html = tmpl(data);
                    self.show(html);
                })
                .fail(function(resp) {
                    $$.v.viewManager.showAlert("There was an error retrieving this contact");
                });
        },


        fullnameChanged: function(event) {
            var fullname = $(event.currentTarget).val();
            var nameParts = this.splitFullname(fullname);

            $("#hint-first", this.el).html(nameParts[0]);
            $("#hint-middle", this.el).html(nameParts[1]);
            $("#hint-last", this.el).html(nameParts[2]);
        },


        changePhoto: function(event) {
            $("#modal-change-photo").modal();
        },


        uploadPhoto: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();
        },


        removePhoto: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();
        },


        splitFullname: function(fullname) {
            var names = fullname.split(" "), first = "", last = "", middle = "";
            first = names[0];

            names.splice(0,1);
            if (names.length > 1) {
                middle = names[0];
                names.splice(0,1);
            }
            last = names.join(" ");

            return [first,middle,last];
        },


        getContact: function() {
            this.contact = new Contact({
                _id:this.contactId
            });

            return this.contact.fetch();
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.ContactEdit = view;

    return view;
});

