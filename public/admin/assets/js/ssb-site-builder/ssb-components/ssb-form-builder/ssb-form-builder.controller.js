(function(){

app.controller('SiteBuilderFormBuilderComponentController', ssbFormBuilderComponentController);

ssbFormBuilderComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude'];
/* @ngInject */
function ssbFormBuilderComponentController($scope, $attrs, $filter, $transclude) {

	console.info('ssb-form-builder directive init...')

	var vm = this;

	vm.init = init;

	vm.formBuilder = {};

	vm.fieldClass = fieldClass;
	
	vm.fieldStyle = fieldStyle;
	vm.inputStyle = inputStyle;
	vm.buttonStyle = buttonStyle;
	vm.formStyle = formStyle;
	function fieldClass(field){
		var classString = 'col-sm-12';

		if(vm.component.formSettings && vm.component.formSettings.fieldsPerRow){
		classString = "col-sm-" + Math.floor(12/vm.component.formSettings.fieldsPerRow);
		if(vm.component.formSettings.spacing && vm.component.formSettings.spacing.pr)
			vm.nthRow = 'nthRow' + vm.component.formSettings.fieldsPerRow;
		}
		return classString;
	};


	function fieldStyle(field){
	var styleString = ' ';
	if (field && field.spacing) {
	    if (field.spacing.mb) {
	        styleString += 'margin-bottom: ' + field.spacing.mb + 'px;';
	    }
	}
	return styleString;
	};

	function inputStyle(field){
		var styleString = ' ';
		if (field && field.align) {
		    styleString += 'text-align: ' + field.align + ";";         
		}
		if (field && field.inputTextSize) {
		  styleString += 'font-size: ' + field.inputTextSize  + 'px !important;';
		}
		if (field && field.inputFontFamily) {
		  styleString += 'font-family: ' + field.inputFontFamily + ";";
		}
		return styleString;
	};

	function buttonStyle(btn){ 
		var styleString = '';
		if(vm.component.formSettings && vm.component.formSettings.fieldsPerRow){
		    styleString = "width:" + 100/vm.component.formSettings.fieldsPerRow + "%;";
		}
		if (btn && btn.align) {           
		    if(btn.align === 'left' || btn.align === 'right')
		      styleString += 'float: ' + btn.align + ";";
		    
		    if(btn.align === 'center'){
		      styleString += 'margin: 0 auto;';
		    }
		}
		return styleString;
	};      

	function formStyle(form){ 
		var styleString = '';        
		if (form && form.formFontFamily) {
		  styleString += 'font-family: ' + form.formFontFamily;
		}
		return styleString;
	};

	function init(element) {
		vm.element = element;
	}

}


})();
