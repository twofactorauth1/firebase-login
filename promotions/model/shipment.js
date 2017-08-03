/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var shipment = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            cardCode: null,
            companyName: null,
            customer: null,
            promotionId: null,
            attachment: null,
            products: null,
            shipDate: null,
            configDate: null,
            deployDate: null,
            endDate: null,
            status: null,
            accountId: null,
            userId : null,
            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: null,
                by: null
            },
            _v:"0.1"
        }
    },

    getProducts: function() {
        return _.pluck(this.get("products"), 'itemName').join(", ");
    },

    getProductsWithSerialNumber: function(){
        var products = _.map(this.get("products"),
            function(product) {                 
                return { 
                    itemName: product.serial ? product.itemName + "(" + product.serial + ")" : product.itemName 
                };
            }
        );
        if(products){
            return _.pluck(products, 'itemName').join(", ");
        }
        else{
            return "";
        }
    },

    getStatus: function(){
        var statusOptions = {
            TRY: "Try",
            BUY: "Buy",
            RMA: 'RMA'
        }
        return statusOptions[this.get("status")];
    },
    getFormattedDate: function(dateField){
        return this.get(dateField) ? moment(this.get(dateField)).format("MM/DD/YYYY") : '';
        //return this.get(dateField) ? this.get(dateField) : '';
    },

    getCustomerDetails: function(separator) {
        var _firstRow = "";
        var _middleRow = "";
        var _bottomRow = "";
        var details = this.get("customerDetails");
        if(!separator){
           separator = ", ";
        }
        
        if (details) {
            if(details.customerName){
                _firstRow += details.customerName + separator;

            }
            if(details.address1 || details.address2)
            {
                if(details.address1){
                    _middleRow +=  details.address1 + " ";     
                }
                if(details.address2){
                    _middleRow += details.address2;    
                }
                if(_middleRow.length){
                    _middleRow += separator;
                }
            }
            if(details.city || details.state || details.zip)
            {
                if(details.city){
                    _bottomRow +=  details.city + ", ";     
                }
                if(details.state){
                    _bottomRow +=  details.state + " ";  
                }
                if(details.zip){
                    _bottomRow +=  details.zip;  
                }
            }
        }
        return _firstRow + _middleRow + _bottomRow;
    },

    getCustomerProject: function(){
        var details = this.get("customerDetails");
        if(details){
            return details.projectName || "";
        }
        else{
            return "";
        }
    },

    getCustomerPartner: function(){
        var details = this.get("customerDetails");
        if(details){
            return details.partnerSalesRep || "";
        }
        else{
            return "";
        }
    },

    getCustomerJuniperRep: function(){
        var details = this.get("customerDetails");
        if(details){
            return details.juniperRep || "";
        }
        else{
            return "";
        }
    },

    getShipmentPrice: function(){
        var totalPrice = 0; 
        if(this.get("actualPrice")){
            totalPrice = parseFloat(this.get("actualPrice"));
        }
        else{
            totalPrice = _.reduce(this.get("products"), function(m, product) { 
                return m + parseFloat(product.itemPrice || 0) ; }, 0);
        }
        return totalPrice || 0;
    },

    getCustomerName: function(){
        var details = this.get("customerDetails");
        if(details){
            return details.customerName ? details.customerName.trim().toLowerCase() : "";
        }
        else{
            return "";
        }
    },

    getShipmentVar: function(){
        return this.get("companyName") ? this.get("companyName").toLowerCase() : ""; 
    },

    initialize: function(options) {
        var details = this.get("customerDetails");
    }

}, {
    db: {
        storage: "mongo",
        table: "shipments",
        idStrategy: "uuid"
    }
});

$$.m.Shipment = shipment;

module.exports = shipment;
