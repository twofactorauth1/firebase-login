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

    getCustomerState: function(){
        var details = this.get("customerDetails");
        if(details){
            return details.state ? this.stateToAbbr(details.state.trim()) : "";
        }
        else{
            return "";
        }
    },

    getShipmentVar: function(){
        return this.get("cardCode") ? this.get("cardCode").toLowerCase() : ""; 
    },

    stateToAbbr: function (strInput) {
        var strOutput;
        if (strInput) {
            var _state = strInput.toLowerCase();
            var arrStates = [
                {
                    "name": "Alabama",
                    "abbreviation": "AL"
                },
                {
                    "name": "Alaska",
                    "abbreviation": "AK"
                },
                {
                    "name": "American Samoa",
                    "abbreviation": "AS"
                },
                {
                    "name": "Arizona",
                    "abbreviation": "AZ"
                },
                {
                    "name": "Arkansas",
                    "abbreviation": "AR"
                },
                {
                    "name": "California",
                    "abbreviation": "CA"
                },
                {
                    "name": "Colorado",
                    "abbreviation": "CO"
                },
                {
                    "name": "Connecticut",
                    "abbreviation": "CT"
                },
                {
                    "name": "Delaware",
                    "abbreviation": "DE"
                },
                {
                    "name": "District Of Columbia",
                    "abbreviation": "DC"
                },
                {
                    "name": "Federated States Of Micronesia",
                    "abbreviation": "FM"
                },
                {
                    "name": "Florida",
                    "abbreviation": "FL"
                },
                {
                    "name": "Georgia",
                    "abbreviation": "GA"
                },
                {
                    "name": "Guam",
                    "abbreviation": "GU"
                },
                {
                    "name": "Hawaii",
                    "abbreviation": "HI"
                },
                {
                    "name": "Idaho",
                    "abbreviation": "ID"
                },
                {
                    "name": "Illinois",
                    "abbreviation": "IL"
                },
                {
                    "name": "Indiana",
                    "abbreviation": "IN"
                },
                {
                    "name": "Iowa",
                    "abbreviation": "IA"
                },
                {
                    "name": "Kansas",
                    "abbreviation": "KS"
                },
                {
                    "name": "Kentucky",
                    "abbreviation": "KY"
                },
                {
                    "name": "Louisiana",
                    "abbreviation": "LA"
                },
                {
                    "name": "Maine",
                    "abbreviation": "ME"
                },
                {
                    "name": "Marshall Islands",
                    "abbreviation": "MH"
                },
                {
                    "name": "Maryland",
                    "abbreviation": "MD"
                },
                {
                    "name": "Massachusetts",
                    "abbreviation": "MA"
                },
                {
                    "name": "Michigan",
                    "abbreviation": "MI"
                },
                {
                    "name": "Minnesota",
                    "abbreviation": "MN"
                },
                {
                    "name": "Mississippi",
                    "abbreviation": "MS"
                },
                {
                    "name": "Missouri",
                    "abbreviation": "MO"
                },
                {
                    "name": "Montana",
                    "abbreviation": "MT"
                },
                {
                    "name": "Nebraska",
                    "abbreviation": "NE"
                },
                {
                    "name": "Nevada",
                    "abbreviation": "NV"
                },
                {
                    "name": "New Hampshire",
                    "abbreviation": "NH"
                },
                {
                    "name": "New Jersey",
                    "abbreviation": "NJ"
                },
                {
                    "name": "New Mexico",
                    "abbreviation": "NM"
                },
                {
                    "name": "New York",
                    "abbreviation": "NY"
                },
                {
                    "name": "North Carolina",
                    "abbreviation": "NC"
                },
                {
                    "name": "North Dakota",
                    "abbreviation": "ND"
                },
                {
                    "name": "Northern Mariana Islands",
                    "abbreviation": "MP"
                },
                {
                    "name": "Ohio",
                    "abbreviation": "OH"
                },
                {
                    "name": "Oklahoma",
                    "abbreviation": "OK"
                },
                {
                    "name": "Oregon",
                    "abbreviation": "OR"
                },
                {
                    "name": "Palau",
                    "abbreviation": "PW"
                },
                {
                    "name": "Pennsylvania",
                    "abbreviation": "PA"
                },
                {
                    "name": "Puerto Rico",
                    "abbreviation": "PR"
                },
                {
                    "name": "Rhode Island",
                    "abbreviation": "RI"
                },
                {
                    "name": "South Carolina",
                    "abbreviation": "SC"
                },
                {
                    "name": "South Dakota",
                    "abbreviation": "SD"
                },
                {
                    "name": "Tennessee",
                    "abbreviation": "TN"
                },
                {
                    "name": "Texas",
                    "abbreviation": "TX"
                },
                {
                    "name": "Utah",
                    "abbreviation": "UT"
                },
                {
                    "name": "Vermont",
                    "abbreviation": "VT"
                },
                {
                    "name": "Virgin Islands",
                    "abbreviation": "VI"
                },
                {
                    "name": "Virginia",
                    "abbreviation": "VA"
                },
                {
                    "name": "Washington",
                    "abbreviation": "WA"
                },
                {
                    "name": "West Virginia",
                    "abbreviation": "WV"
                },
                {
                    "name": "Wisconsin",
                    "abbreviation": "WI"
                },
                {
                    "name": "Wyoming",
                    "abbreviation": "WY"
                }
            ];
            var _stateAbbr =  _.find(arrStates, function(data){ return data.name.toLowerCase() == _state || data.abbreviation.toLowerCase() == _state });
            if(_stateAbbr){
                strOutput = _stateAbbr.abbreviation;
            }
        }

        return strOutput || "";
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
