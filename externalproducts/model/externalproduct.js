require('../../models/base.model.js');

var product = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId: null,
            productid:null,
            lastmodified:null,
            dateadded:null,
            productnumber:null,
            categoryid:null,
            subcategoryid:null,
            vendor:null,
            producttitle:null,
            productdescription:null,
            youtubeid:null,
            discontinued:null,
            inactive:null,
            categorytitle:null,
            imageid:null,
            imagepath:null,
            imageorder:null,
            industryid:null,
            tagid:null,

            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: new Date(),
                by: null
            },
            _v: "0.1"

        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "externalproducts",
        idStrategy: "uuid"
    }
});

$$.m.ExternalProduct = product;

module.exports = product;