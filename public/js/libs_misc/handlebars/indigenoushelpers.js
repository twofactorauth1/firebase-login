define(function() {

    Handlebars.registerHelper("labelFromSocialType", function(type) {
        var p = $$.constants.social.types;
        switch(type) {
            case p.LOCAL: return "local";
            case p.FACEBOOK: return "Facebook";
            case p.TWITTER: return "Twitter";
            case p.LINKEDIN: return "LinkedIn";
            case p.GOOGLE: return "Google+";
        }
        return "";
    });


    Handlebars.registerHelper("iconFromSocialType", function(type) {
        var p = $$.constants.social.types;
        switch(type) {
            case p.LOCAL: return "";
            case p.FACEBOOK: return "fa fa-facebook";
            case p.TWITTER: return "fa fa-twitter";
            case p.LINKEDIN: return "fa fa-linkedin";
            case p.GOOGLE: return "fa fa-google-plus";
        }
        return "";
    });

    Handlebars.registerHelper('lengthMinusOne', function(length, option) {
        return length - 1;
    });

    Handlebars.registerHelper('plusOne', function(length) {
        return length + 1;
    });

    Handlebars.registerHelper('moreThenOne', function(length, options) {
        if(length > 1) {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('currencySymbol', function(currency) {
        switch(currency) {
            case "us/dollar":
                return "$";
        }
    });
});
