app.directive('integerTouchSpin', function(){
    return {
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl){       
        	elem.TouchSpin({
			    min: parseInt(attr.min),
			    max: parseInt(attr.max)
			});
        }
    };
});