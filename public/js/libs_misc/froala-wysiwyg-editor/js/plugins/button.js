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
            var buttonHTML = '<a class="btn btn-primary ssb-theme-btn">' +
                                'Button Text' +
                             '</a>';

            this.html.insert(buttonHTML);
            this.undo.saveStep();
        }
    });

    a.FroalaEditor.DefineIcon("deleteButton", {
        NAME: "trash"
    }), a.FroalaEditor.RegisterCommand('deleteButton', {
        title: 'Delete',
        callback: function () {
           this.link.get("a").remove();
        }
    });
});
