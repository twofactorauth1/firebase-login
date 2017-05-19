! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof module && module.exports ? module.exports = function(b, c) {
        return void 0 === c && (c = "undefined" != typeof window ? require("jquery") : require("jquery")(b)), a(c), c
    } : a(jQuery)
}(function(a) {
    "use strict";
    var spacingOptions={},spacingIndex=10;
    for(var op=0;op<30;op++){
        spacingOptions[op]=op-spacingIndex;
    }
    a.FroalaEditor.DefineIcon('letterSpacingControl', {NAME: 'arrows-h'});
    a.FroalaEditor.RegisterCommand('letterSpacingControl', {
      title: 'Letter Spacing',
      type: 'dropdown',
      focus: false,
      undo: true,
      refreshAfterCallback: true,
      options:spacingOptions,
      callback: function (cmd, val) {
        this.format.applyStyle('letter-spacing',(val-spacingIndex)+"px");
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
