'use strict';
app.directive('stExport', ['$http', '$timeout', 'OrderService', function($http, $timeout, OrderService){
  return {
    require:'^stTable',
    link:function(scope, element, attr,ctrl){
		element.bind('click',function(){
		    //OrderService.exportToCSV();
		    JSONToCSVConvertor(ctrl.getFilteredCollection(), "", true);
		})
	    function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
		    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
		    var arrData = !angular.isObject(JSONData) ? JSON.parse(JSONData) : JSONData;



		    
		    var CSV = '';    
		    //Set Report title in first row or line
		    if(ReportTitle.length)
		    	CSV += ReportTitle + '\r\n\n';
		    var showColumns = ["customer",
			      "contact_email",
			      "order_id",
			      "completed_at",
			      "updated_at",
			      "created_at",
			      "status",
			      "total",
			      "total_discount",
			      "tax_rate",
			      "total_tax",
			      "subtotal",
			      "shipping_tax",
			      "cart_tax",
			      "currency",			      
			      "line_items",			      
			      "total_line_items_quantity",
			      "billing_address",
			      "shipping_address",
			      "notes"
		       ];
		    var mappingColumns = {
		    	"customer": "Contact",
		    	"contact_email": "Email",
		    	"order_id": "Order Id",
		    	"completed_at": "Completed At",
		    	"updated_at": "Updated At",
		    	"created_at": "Created At",
		    	"status": "Status",
		    	"total": "Total",
		    	"total_discount": "Total Discount",
		    	"tax_rate": "Tax Rate",
		    	"total_tax": "Total Tax",
		    	"subtotal": "Subtotal",
		    	"shipping_tax": "Shipping Tax",
		    	"cart_tax": "Cart Tax",
		    	"currency": "Currency",		    	
		    	"line_items": "Line Items",		    	
		    	"total_line_items_quantity": "Total Line Items Quantity",
		    	"billing_address": "Billing Details",
		    	"shipping_address": "Shipping Details",
		    	"notes": "Notes"
		    }
		    


		    var displayOrder = _.invert(showColumns);
			
		    //This condition will generate the Label/Header
		    if (ShowLabel) {
		        var row = "";		        
		        //This loop will extract the label from 1st index of on array
		        _.each(mappingColumns, function (value, index) {		        	
		            row += value + ',';
		        });
		        row = row.slice(0, -1);		        
		        //append Label row with line break
		        CSV += row + '\r\n';
		    }		    
		    //1st loop is to extract each row
		    _.each(arrData, function (value, i) {

		    	var allKeys = _.allKeys(mappingColumns);
		    	var newValue = {};
		    	 _.each(allKeys, function (val, index) {
		    	 	newValue[val] = value[val];
		    	 })
		    	 value = newValue;
		        var row = "";
		        _.each(value, function (val, index) {
		        	if(showColumns.indexOf(index) !== -1){
		        		if(index == "line_items"){
		        			var li_name = "";
							var li_sku = "";
							var li_qty = "";
							row += '"';

		        			for (var li in val) {
								li_name = val[li].name;
								li_sku = val[li].product ? val[li].product.sku : val[li].sku;
								li_qty = val[li].quantity;

								if (li_qty) {
									row += li_qty + ' ea. ';
								}

								row += li_name;

								if (li_sku && (li_sku != 'null')) {
									row += ' (' + li_sku + ')';
								}

								if (val.length - 1 != li) {
									row += '\r';
								}
							}
							row += '",';
		        		}
		        		else if(index == "customer"){
		        			row += '"' + (val ? val._full : '') + '",';			
		        		}
		        		else if(index == "notes"){
		        			var notes = "";  
		        			for (var nt in val) {
		        				if(val.length - 1 == nt){
		        					notes +=  val[nt].note;
		        				}
		        				else
		        					notes +=  val[nt].note + '\r\n';
		        			}
		        			row += '"' + notes + '",';			
		        		}
		        		else if(index == "billing_address"){
		        			var _addressBilling = getAddress(val);
		        			row += '"' + _addressBilling + '",';
		        		}
		        		else if(index == "shipping_address"){
		        			var _addressShipping = getAddress(val)
		        			row += '"' + _addressShipping + '",';
		        		}
		        		else
		        			row += '"' + val + '",';
		        	} 	
		        });
		        row.slice(0, row.length - 1);		        
		        //add a line break after each row
		        CSV += row + '\r\n';
		    });
		    if (CSV == '') {        
		        alert("Invalid data");
		        return;
		    } 
		    //Generate a file name
		    var fileName = "Orders";
		    //this will remove the blank-spaces from the title and replace it with an underscore
		    fileName += ReportTitle.replace(/ /g,"_");   
		    
		    var charset = scope.charset || "utf-8";
			var blob = new Blob([CSV], {
				type: "text/csv;charset="+ charset + ";"
			});
			if (window.navigator.msSaveOrOpenBlob) 
	        	window.navigator.msSaveBlob(blob, fileName + ".csv");
	        else{
	        	//Initialize file format you want csv or xls
			    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);			    
			    var link = document.createElement("a");    
			    link.href = uri;
			    
			    //set the visibility hidden so it will not effect on your web-layout
			    $(link).css("visibility", 'hidden');
			    link.download = fileName + ".csv";
			    
			    //this part will append the anchor tag and remove it after automatic click
			    document.body.appendChild(link);
			    link.click();
			    document.body.removeChild(link);
	        }
		}

		function getAddress(obj){
			var _address = "";
			if(Object.keys(obj).length){
				if(obj.company){
					_address+= obj.company || "" + '\r\n';
				}
				if(obj.address_1 && !obj.address_2){
					_address+= obj.address_1 || "" + '\r\n';
				}
				else if(obj.address_1 && obj.address_2){
					_address+= (obj.address_1 || "") + ", " + (obj.address_2 || "") + '\r\n';
				}
				else if(!obj.address_1 && obj.address_2){
					_address+= obj.address_2 || "" + '\r\n';
				}
				if(obj.city){
					_address+= obj.city || "";
				}
				if(obj.city && (obj.state || obj.postcode)){
					_address+= ', ' + (obj.state || "") + " " + (obj.postcode || "");
				}
				else if(!obj.city && (obj.state || obj.postcode)){
					_address+= (obj.state || "") + " " + (obj.postcode || "");
				}

				if(obj.phone){
					_address+= '\r\n' + obj.phone || "";
				}

				if(obj.first_name || obj.last_name){
					_address+= '\r\n' + '\r\n' + ((obj.first_name || "") + " " + (obj.last_name || "")).trim();
				}


				if(obj.email){
					_address+= '\r\n' + obj.email || "";
				}		
				          
			}
			return _address.trim();  
		}
    }
  }  
}]);