define([
    'libs/misc/date.format'
], function(){

    Handlebars.registerHelper("testEmail", function(obj) {
        return obj.toString();
    });


    //region Layout
    Handlebars.registerHelper( 'isMobile', function(options){
        if ($$.u.viewutils.isMobileLayout()){
            return options.fn(this);
        }else{
            return options.inverse(this);
        }
    });


    Handlebars.registerHelper( 'unlessMobile', function(options){
        if ($$.u.viewutils.isMobileLayout()){
            return options.inverse(this);
        }else{
            return options.fn(this);
        }
    });



    Handlebars.registerHelper( 'isTablet', function(options){
        if ($$.u.viewutils.isTabletLayout()){
            return options.fn(this);
        } else{
            return options.inverse(this);
        }
    });
    //endregion

    //region If/Unless
    Handlebars.registerHelper( 'superIf', function(){
        var operator = arguments[0];
        var options = arguments[arguments.length-1];
        if (operator == "or"){
            for (var i = 1; i < arguments.length-1;i++){
                if (arguments[i] == true || (_.isArray(arguments[i]) && arguments[i].length > 0)){
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        }else if(operator == "and"){
            for (var i = 1; i < arguments.length-1; i++){
                if (arguments[i] != true){
                    return options.inverse(this);
                }
            }
            return options.fn(this);
        }
    });


    Handlebars.registerHelper("superUnless", function(){
        var options = arguments[arguments.length-1];
        var _options = { fn : options.inverse, inverse : options.fn };
        arguments[arguments.length-1] = _options;

        return Handlebars.helpers['superIf'].apply(this, arguments);
    });
    //endregion

    //region Formatters
    Handlebars.registerHelper("formatMoney", function(value, places){
        return $$.u.formatutils.formatMoney(value, places, "$", ",", ".");
    });


    Handlebars.registerHelper("formatDate", function(date, mask, utc, useTodayAsDefault){
        if (_.isString(date)) {
            date = Date.parse(date);
            if (_.isNaN(date) == false) {
                date = new Date(date);
            } else {
                return "";
            }
        }
        if (useTodayAsDefault == true && date == null) {
            date = new Date();
        }

        if (date == null){
            return "";
        }
        if (mask == null || typeof(mask) != "string"){
            mask = "fullDate";
        }
        return date.format(mask, utc);
    });


    Handlebars.registerHelper("formatName", function(user, includeUsername) {
        var str = "";
        if (user.First != null || user.Last != null){
            str = user.First + " " + user.Last;

            if (includeUsername){
                str += " (";
                str += user.Email;
                str += ")";
            }
        }else{
            if (user.Email){
                str = user.Email;
            }
        }
        return str;
    });


    Handlebars.registerHelper("formatTimeRemaining", function(date){
        if (date == null){
            return "";
        }

        var num, str, modifier;

        var days = Math.round($$.u.dateutils.dateDiff(null, date, 'day'));
        var hours = Math.round($$.u.dateutils.dateDiff(null, date, 'hour'));

        if (days > 29) {
            num = Math.round(days/30);
            str = 'months';
            modifier = 'approximately';
        }
        else if (days > 2) {
            num = days;
            str = 'days';
        }
        else {
            num = hours;
            str = 'hours';
        }

        if (num == 1) str = str.replace(/e?s$/, '');
        return [modifier, num, str].join(' ');
    });


    Handlebars.registerHelper("formatDuration", function(seconds){
        return $$.u.formatutils.formatSecondsToHHMMSS(seconds);
    });
    //endregion

    Handlebars.registerHelper("dateIsBetween", function(date, numDaysPast, numDaysFuture, options){
        if (date != null){
            if (isNaN(numDaysPast) == true){
                numDaysPast = -999999999;
            }
            if (isNaN(numDaysFuture) == true){
                numDaysFuture = 999999999;
            }

            var days = $$.u.dateutils.dateDiff(new Date(), date, "day");

            if (days >= numDaysPast && days <= numDaysFuture){
                return options.fn(this);
            }
        }
        return options.inverse(this);
    });


    Handlebars.registerHelper("add", function(value, valueToAdd){
        return value + valueToAdd;
    });


    //region Text Formatting
    Handlebars.registerHelper("uppercase", function(firstOnly, str) {
        if (_.isString(firstOnly && firstOnly != "true" && firstOnly != "false")) {
            return str.toUpperCase();
        } else {
            if (firstOnly === 'true') {
                firstOnly = true;
            } else if (firstOnly === 'false') {
                firstOnly = false;
            }
        }

        if (firstOnly) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return str.toUpperCase();
        }
    });


    Handlebars.registerHelper("stripHtml", function ( str ) {
        return str.replace(/(<([^>]+)>)/ig,"");
    });


    Handlebars.registerHelper("truncate", function ( str, len, stripFormatting ) {
        if (stripFormatting == true){
            if ( str && str != undefined ) {
                var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
                    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi,
                    allowed = '';

                if ( str.replace ){

                    str = str.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
                    });
                }
            }
        }


        if (str && str.length > len) {
            var new_str = str.substr ( 0, len+1 );

            while ( new_str.length )
            {
                var ch = new_str.substr ( -1 );
                new_str = new_str.substr ( 0, -1 );

                if ( ch == ' ' )
                {
                    break;
                }
            }

            if ( new_str == '' )
            {
                new_str = str.substr ( 0, len );
            }

            return new Handlebars.SafeString ( new_str +'...' );
        }
        if (str){
            return new Handlebars.SafeString( str );
        }else{
            return "";
        }
    });


    Handlebars.registerHelper('removeText', function(value, textToRemove) {
        var newStr = value.replace(new RegExp(textToRemove, "g"), "");
        return newStr;
    });
    //endregion


    Handlebars.registerHelper ( 'check', function(arg1, arg2, options) {
        if ( arg1 == arg2 )
        {
            return options.fn(this);
        }
        else
        {
            return options.inverse(this);
        }
    });


    Handlebars.registerHelper ('checknot', function(arg1, arg2, options) {
        return Handlebars.helpers['check'].call(this, arg1, arg2, { fn: options.inverse, inverse: options.fn });
    });


    Handlebars.registerHelper ( 'stringContains', function(string, contains, options) {
        if (string != undefined && contains != undefined && string != "" && contains != "" && string.indexOf(contains) > -1) {
            return options.fn(this);
        }
        return options.inverse(this);
    });


    Handlebars.registerHelper( 'arrayContains', function(array, contains, options) {
        if (_.isArray(array)) {
            if (array.indexOf(contains) > -1) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        } else {
            return options.inverse(this);
        }
    });


    Handlebars.registerHelper( 'arrayContainsAny', function(array, contains, options) {
        if (!_.isArray(contains)) {
            contains = contains.split(',');
        }

        if (_.isArray(array)) {
            for(var i = 0; i < contains.length; i++) {
                var str = contains[i];
                if (array.indexOf(str) > -1) {
                    return options.fn(this);
                }
            }
        }
        return options.inverse(this);
    });


    Handlebars.registerHelper("anyEqual", function() {
        var options = arguments[arguments.length-1];
        var equalTo = arguments[0];

        for (var i = 1; i < arguments.length-1; i++){
            if (arguments[i] == equalTo){
                return options.fn(this);
            }
        }
        return options.inverse(this);
    });


    Handlebars.registerHelper("unlessAnyEqual", function() {
        var options = arguments[arguments.length-1];
        var _options = { fn : options.inverse, inverse : options.fn };
        arguments[arguments.length-1] = _options;

        return Handlebars.helpers['anyEqual'].apply(this, arguments);
    });


    Handlebars.registerHelper("foreach",function(arr,options) {
        if(options.inverse && !arr.length)
            return options.inverse(this);

        return arr.map(function(item,index) {
            item.$index = index+1;
            item.$first = index === 0;
            item.$last  = index === arr.length-1;
            return options.fn(item);
        }).join('');
    });


    Handlebars.registerHelper("iterate", function(count, options){
        var ret = "";
        for(var i = 0; i < count; i++){
            this.$index = i+1;
            ret += options.fn(this);
        }
        return ret;
    });


    Handlebars.registerHelper("iterateDifference", function(count, minus, useIndexOffset, options){
        var num = count;
        if (minus != undefined){
            num = count - minus;
        }

        var indexOffset = 1;
        if (useIndexOffset == true){
            indexOffset = 1 + minus;
        }
        var ret = "";
        for(var i = 0; i < num; i++){
            this.$index = i+indexOffset;
            this.$last = i == num-1;

            ret += options.fn(this);
        }
        return ret;
    });


    Handlebars.registerHelper('eachEvery', function(context, every, options) {
        var fn = options.fn, inverse = options.inverse;
        var ret = "";

        if(context && context.length > 0) {
            for(var i=0, j=context.length; i<j; i++) {
                if ((i+1)%every == 0){
                    ret = ret + inverse(this);
                }
                ret = ret + fn(context[i]);
            }
        } else {
            ret = inverse(this);
        }
        return ret;
    });


    Handlebars.registerHelper('withFind', function(arr, value, property, options) {
        if (arr != null && value != null){
            for (var i = 0; i < arr.length; i++){
                if (arr[i][property] && arr[i][property] == value){
                    return options.fn(arr[i]);
                }
            }
        }
        if (options.inverse){
            return options.inverse();
        }else{
            return "";
        }
    });


    Handlebars.registerHelper('eachUnlessIn', function(arr, arr2, prop, prop2, options) {
        var fn = options.fn, inverse = options.inverse;
        var i;
        var ret = "";
        var hasAtLeastOne = false;

        if (arr == null || arr.length == 0) {
            return inverse(this);
        }

        if (arr2 == null || arr2.length == 0) {
            for (i = 0; i < arr.length; i++) {
                ret = ret + fn(arr[i]);
            }
            return ret;
        }

        for (i = 0; i < arr.length; i++) {
            var value = arr[i][prop];
            var found = false;
            for (var j = 0; j < arr2.length; j++) {
                if (arr2[j][prop2] == value) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                hasAtLeastOne = true;
                ret = ret + fn(arr[i]);
            }
        }

        if (hasAtLeastOne == false) {
            return inverse(this);
        }
        return ret;
    });


    Handlebars.registerHelper('count', function(arr){
        if (arr == null){
            return "0";
        }
        return arr.length;
    });


    Handlebars.registerHelper( 'versionInfo', function(){
        return BUILDTIME;
    });
});