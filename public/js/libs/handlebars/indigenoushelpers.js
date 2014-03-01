define([], function() {

    Handlebars.registerHelper("iconFromType", function(type) {
        var p = $$.constants.social.types;
        switch(type) {
            case p.LOCAL: return "";
            case p.FACEBOOK: return "fa fa-facebook";
            case p.TWITTER: return "fa fa-twitter";
            case p.LINKDIN: return "fa fa-linkedin";
            case p.GOOGLE: return "fa fa-google-plus";
        }
        return "";
    });
});
