/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

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


        showInfo: function(message) {
            $("#info-msg").removeClass("hidden").alert().find("span.message").html(message);
        },

        showError: function(message) {
            $("#error-msg").removeClass("hidden").alert().find("span.message").html(message);
        },

        setUpListeners: function() {
            $("#info-msg, #error-msg").find("button.close").on("click", function(event) {
                $(event.currentTarget).parents(".alert").eq(0).addClass("hidden");
            });
        }(),

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

            var templ = $$.templateManager.get("alert", "alert");
            var html = templ(data);

            if (selector == null || selector === ""){
                selector = "#container-alert";
            }

            $(selector).html(html).show().removeClass("hidden");

            if (alertType == "alert-success"){
                if (self.alertTimerId != null){
                    clearTimeout(this.alertTimerId);
                }

                self.alertTimerId = setTimeout(function(){
                    $(selector).fadeOut();
                }, 3000);
            }
        },


        showProgressAlert : function(heading, alertType, selector) {
            var data = {};
            if ($$.u.stringutils.isNullOrEmpty(heading) === false){
                data.heading = heading;
            }
            if ($$.u.stringutils.isNullOrEmpty(alertType) === true) {
                alertType = "alert-success";
            }
            data.alertType = alertType;

            var templ = $$.templateManager.get("alert-progress", "alert");
            var html = templ(data);

            if (selector == null || selector === ""){
                selector = "#container-alert";
            }
            $(selector).html(html);
            $(selector).show();
        },


        hideAlert:function (selector) {
            if (selector == null || selector === ""){
                selector = "#container-alert";
            }
            $(selector).fadeOut();
        },


        onAllRender: function() {
            if ($("#preloader").css("display") === "none") {
                return;
            }
            $('#preloader').delay(500).fadeOut(function(){
                $('body').delay(350).css({'overflow':'visible'});
            });
        },


        showProcessing: function() {
            if ($("#preloader").css("display") !== "none") {
                return;
            }

            $("#preloader").addClass("processing").fadeIn('fast');
        },


        hideProcessing: function() {
            $("#preloader").fadeOut();
        }
    });

    if (typeof $$ === 'undefined') {
        $$ = {};
    }

    if ($$.viewManager != null) {
        window.alert("View Manager Instance already exists!");
    }
    $$.viewManager = new vm();
    return $$.viewManager;
});