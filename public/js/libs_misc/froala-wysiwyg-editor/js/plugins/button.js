! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof module && module.exports ? module.exports = function(b, c) {
        return void 0 === c && (c = "undefined" != typeof window ? require("jquery") : require("jquery")(b)), a(c), c
    } : a(jQuery)
}(function(a) {
    "use strict";
    a.FroalaEditor.DefineIcon("insertButton", {
        NAME: "plus"
    }), a.FroalaEditor.RegisterCommand('insertButton', {
        title: 'Insert Button',
        focus: true,
        undo: true,
        refreshAfterCallback: true,
        callback: function () {
            var buttonHTML = '<span>&nbsp;</span>' +
                                '<a class="btn btn-primary ssb-theme-btn"><span>' +
                                    'Button Text' +
                                '</span/></a>' +
                             '<span>&nbsp;</span>';

            this.selection.restore();
            this.html.insert(buttonHTML);
            this.undo.saveStep();
        },
        refresh: function(a) {
            var l = this.link.remove;
        }
    });



      $.FE.DefineIcon('linkRemoveBtn', { NAME: 'unlink' });
      $.FE.RegisterCommand('linkRemoveBtn', {
        title: 'Unlink',
        callback: function () {
          if(this.link && this.link.get() && this.link.get().href)
            this.link.get().href = "";
        },
        refresh: function ($btn) {
            this.popups.onShow('link.edit', function () {
                var rmLink = this.popups.get("link.edit").find("button[data-cmd='linkRemove']");
                var rmLinkButton = this.popups.get("link.edit").find("button[data-cmd='linkRemoveBtn']");
                if($(this.link.get()).hasClass("ssb-theme-btn")){
                    rmLink.hide();
                    rmLinkButton.show();
                    if(this.link.get().href == ""){
                        rmLinkButton.hide();
                    }
                } else{
                    rmLink.show();
                    rmLinkButton.hide();
                }
            })
        }
      })

    a.FroalaEditor.DefineIcon("deleteButton", {
        NAME: "trash"
    }), a.FroalaEditor.RegisterCommand('deleteButton', {
        title: 'Delete',
        callback: function () {
            if(this.link && this.link.get("a")) {
                this.link.get("a").remove();
            }
            this.link.remove();

        }
    });
});
