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
		    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
		    
		    var CSV = '';    
		    //Set Report title in first row or line
		    if(ReportTitle.length)
		    	CSV += ReportTitle + '\r\n\n';
		    var showColumns = ["customer","order_id","completed_at","updated_at","created_at","status","total","total_discount","tax_rate","total_tax","subtotal","shipping_tax","cart_tax","currency","line_items","total_line_items_quantity","notes"];  

		    //This condition will generate the Label/Header
		    if (ShowLabel) {
		        var row = "";		        
		        //This loop will extract the label from 1st index of on array
		        for (var index in arrData[0]) {
		            if(showColumns.indexOf(index) !== -1)
		            //Now convert each value to string and comma-seprated
		            	row += index + ',';
		        }
		        row = row.slice(0, -1);		        
		        //append Label row with line break
		        CSV += row + '\r\n';
		    }		    
		    //1st loop is to extract each row
		    for (var i = 0; i < arrData.length; i++) {
		        var row = "";
		        //2nd loop will extract each column and convert it in string comma-seprated
		        for (var index in arrData[i]) {	
		        	if(showColumns.indexOf(index) !== -1){
		        		if(index == "line_items"){
		        			var li_name = "";  
		        			for (var li in arrData[i][index]) {
		        				if(arrData[i][index].length - 1 == li){
		        					li_name +=  arrData[i][index][li].name;
		        				}
		        				else
		        					li_name +=  arrData[i][index][li].name + '\r\n';
		        			}
		        			row += '"' + li_name + '",';			
		        		}
		        		else if(index == "customer"){
		        			row += '"' + (arrData[i][index] ? arrData[i][index]._full : '') + '",';			
		        		}
		        		else if(index == "notes"){
		        			var notes = "";  
		        			for (var nt in arrData[i][index]) {
		        				if(arrData[i][index].length - 1 == nt){
		        					notes +=  arrData[i][index][nt].note;
		        				}
		        				else
		        					notes +=  arrData[i][index][nt].note + '\r\n';
		        			}
		        			row += '"' + notes + '",';			
		        		}
		        		else
		        			row += '"' + arrData[i][index] + '",';
		        	} 	
		        }
		        row.slice(0, row.length - 1);		        
		        //add a line break after each row
		        CSV += row + '\r\n';
		    }
		    if (CSV == '') {        
		        alert("Invalid data");
		        return;
		    } 
		    //Generate a file name
		    var fileName = "OrderReport";
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
    }
  }  
}]);