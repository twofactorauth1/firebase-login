app.directive('integerTouchSpin', function(){
    return {
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl){
        	elem.TouchSpin({
                min: parseInt(attr.min),
                max: parseInt(attr.max),
                step: attr.step ? parseInt(attr.step) : 1
			});
        }
    };
});

//Settings:
// initval ""  Applied when no explicit value is set on the input with the value attribute. Empty string means that the value remains empty on initialization.
// min 0   Minimum value.
// max 100 Maximum value.
// step    1   Incremental/decremental step on up/down change.
// forcestepdivisibility   'round' How to force the value to be divisible by step value: 'none' | 'round' | 'floor' | 'ceil'
// decimals    0   Number of decimal points.
// stepinterval    100 Refresh rate of the spinner in milliseconds.
// stepintervaldelay   500 Time in milliseconds before the spinner starts to spin.
// verticalbuttons false   Enables the traditional up/down buttons.
// verticalupclass 'glyphicon glyphicon-chevron-up'    Class of the up button with vertical buttons mode enabled.
// verticaldownclass   'glyphicon glyphicon-chevron-down'  Class of the down button with vertical buttons mode enabled.
// prefix  ""  Text before the input.
// postfix ""  Text after the input.
// prefix_extraclass   ""  Extra class(es) for prefix.
// postfix_extraclass  ""  Extra class(es) for postfix.
// booster true    If enabled, the the spinner is continually becoming faster as holding the button.
// boostat 10  Boost at every nth step.
// maxboostedstep  false   Maximum step when boosted.
// mousewheel  true    Enables the mouse wheel to change the value of the input.
// buttondown_class    'btn btn-default'   Class(es) of down button.
// buttonup_class  'btn btn-default'   Class(es) of up button.
