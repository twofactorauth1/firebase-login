! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof module && module.exports ? module.exports = function(b, c) {
        return void 0 === c && (c = "undefined" != typeof window ? require("jquery") : require("jquery")(b)), a(c), c
    } : a(jQuery)
}(function(a) {
    "use strict";
    a.FroalaEditor.DefineIcon('fontWeight', {NAME: 'text-width'});
    a.FroalaEditor.RegisterCommand('fontWeight', {
      title: 'Font Weight',
      type: 'dropdown',
      focus: false,
      undo: true,
      refreshAfterCallback: true,
      options: {
            "200":"Light",
            "400":"Normal",
            "700":"Bold",
      },
      callback: function (cmd, val) {
        this.format.applyStyle('font-weight',val)
      },
      // Callback on refresh.
      refresh: function ($btn) {
        //console.log ('do refresh');
      },
      // Callback on dropdown show.
      refreshOnShow: function ($btn, $dropdown) {
       // console.log ('do refresh when show');
      }
    });

});
