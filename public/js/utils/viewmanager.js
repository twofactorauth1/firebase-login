define([
    'backboneExtended',
    'templateManager'
], function () {

    var vm = Backbone.ViewManager.extend({

        replaceMain : function(view) {
            this.show(view, "#main-viewport");
        },

        replaceMainHtml : function(html){
            this.showHtml(html, "#main-viewport");
        },

        hideMain : function(){
            $("#main-viewport").hide();
        },

        showMain : function(){
            $("#main-viewport").show();
        },

        hasUnsavedInMain : function() {
            var view = this.views["#main-viewport"];
            if (view != null && _.isFunction(view.hasUnsaved)) {
                try{
                    if (view.subviews != null) {
                        for (var i = 0; i < view.subviews.length; i++) {
                            var _hasUnsaved = view.subviews[i].hasUnsaved();
                            if (_hasUnsaved != null && _hasUnsaved !== false) {
                                return _hasUnsaved;
                            }
                        }
                    }

                    return view.hasUnsaved();
                }catch(Exception){
                    return false;
                }
            } else {
                return false;
            }
        },

        showProgress : function(title, label){
            $("#common-progress").modal({
                show : true, keyboard:false, backdrop:"static"
            });

            if (label == null){
                label = "";
            }

            if (title == null){
                title = "Processing...";
            }

            $("#common-progress-title").html(title);
            $("#common-progress-label").html(label);
        },


        hideProgress : function(){
            $("#common-progress").modal('hide');
        },


        showModal : function(html) {
            $("#common-modal").html(html).modal();
        },


        hideModal : function() {
            $("#common-modal").html("").modal('hide');
        },


        alertTimerId : null,
        showAlert : function(content, heading, alertType, selector) {
            var self = this;
            var data = {};
            data.content = content;
            if ($$.u.stringutils.isNullOrEmpty(heading) === false){
                data.heading = heading;
            }
            if ($$.u.stringutils.isNullOrEmpty(alertType) === true) {
                alertType = "alert-success";
            }

            data.alertType = alertType;

            var templ = $$.templateManager.get("alert", "Alert");
            var html = templ(data);

            if (selector == null || selector === ""){
                selector = "#container-alert";
            }
            $(selector).html(html);
            $(selector).show();

            if (alertType == "alert-success"){
                if (self.alertTimerId != null){
                    clearTimeout(this.alertTimerId);
                }

                self.alertTimerId = setTimeout(function(){
                    $(selector).fadeOut();
                }, 5000);
            }
        },


        showProgressAlert : function(heading, alertType, selector) {
            require(['text!templates/Alert.html'], function(template){
                $$.templateManager.setFile(template, "Alert");

                var data = {};
                if ($$.u.stringutils.isNullOrEmpty(heading) === false){
                    data.heading = heading;
                }
                if ($$.u.stringutils.isNullOrEmpty(alertType) === true) {
                    alertType = "alert-success";
                }
                data.alertType = alertType;

                var templ = $$.templateManager.get("alert-progress", "Alert");
                var html = templ(data);

                if (selector == null || selector === ""){
                    selector = "#container-alert";
                }
                $(selector).html(html);
                $(selector).show();
            });
        },


        hideAlert:function (selector) {
            if (selector == null || selector === ""){
                selector = "#container-alert";
            }
            $(selector).fadeOut();
        }
    });

    $$ = $$ || {};

    if ($$.viewManager != null) {
        window.alert("View Manager Instance already exists!");
    }
    $$.viewManager = new vm();
    return $$.viewManager;
});